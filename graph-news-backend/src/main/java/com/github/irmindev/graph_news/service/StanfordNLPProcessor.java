package com.github.irmindev.graph_news.service;

import java.util.*;
import edu.stanford.nlp.pipeline.*;
import edu.stanford.nlp.ling.*;
import edu.stanford.nlp.trees.*;
import edu.stanford.nlp.semgraph.*;
import edu.stanford.nlp.ling.CoreAnnotations.KBPTriplesAnnotation;
import edu.stanford.nlp.ling.CoreAnnotations.NamedEntityTagAnnotation;
import edu.stanford.nlp.ie.util.RelationTriple;

import org.springframework.stereotype.Service;

import com.github.irmindev.graph_news.model.nlp.*;

@Service
public class StanfordNLPProcessor {
    private final StanfordCoreNLP pipeline;

    public StanfordNLPProcessor() {
        Properties props = new Properties();
        
        // Annotators (removed coref and relation, added mwt which is required for Spanish)
        props.setProperty("annotators", "tokenize,ssplit,mwt,pos,lemma,ner,depparse,kbp");
        
        // Tokenize
        props.setProperty("tokenize.language", "es");
        
        // Multi-word tokens (mwt) - required for Spanish
        props.setProperty("mwt.mappingFile", "edu/stanford/nlp/models/mwt/spanish/spanish-mwt.tsv");
        
        // POS tagger - fixed model path
        props.setProperty("pos.model", "edu/stanford/nlp/models/pos-tagger/spanish-ud.tagger");
        
        // NER settings
        props.setProperty("ner.model", "edu/stanford/nlp/models/ner/spanish.ancora.distsim.s512.crf.ser.gz");
        props.setProperty("ner.applyNumericClassifiers", "true");
        props.setProperty("ner.useSUTime", "0");
        props.setProperty("ner.language", "es");
        
        // Parse
        props.setProperty("parse.model", "edu/stanford/nlp/models/srparser/spanishSR.beam.ser.gz");
        
        // Dependency parsing
        props.setProperty("depparse.model", "edu/stanford/nlp/models/parser/nndep/UD_Spanish.gz");
        props.setProperty("depparse.language", "spanish");
        
        // RegexNER
        props.setProperty("ner.fine.regexner.mapping", "edu/stanford/nlp/models/kbp/spanish/gazetteers/kbp_regexner_mapping_sp.tag");
        props.setProperty("ner.fine.regexner.validpospattern", "^(NOUN|ADJ|PROPN).*");
        props.setProperty("ner.fine.regexner.ignorecase", "true");
        props.setProperty("ner.fine.regexner.noDefaultOverwriteLabels", "CITY,COUNTRY,STATE_OR_PROVINCE");
        
        // KBP (Knowledge Base Population)
        props.setProperty("kbp.semgrex", "edu/stanford/nlp/models/kbp/spanish/semgrex");
        props.setProperty("kbp.tokensregex", "edu/stanford/nlp/models/kbp/spanish/tokensregex");
        props.setProperty("kbp.model", "none");
        props.setProperty("kbp.language", "es");
        
        // Entity linking
        props.setProperty("entitylink.caseless", "true");
        props.setProperty("entitylink.wikidict", "edu/stanford/nlp/models/kbp/spanish/wikidict_spanish.tsv");
        
        this.pipeline = new StanfordCoreNLP(props);
    }
    public NewsProcessingResult processNewsText(String newsText, String title) {
        // Create an empty Annotation with the text
        CoreDocument document = new CoreDocument(newsText);

        // Run all the annotators on this text
        pipeline.annotate(document);

        // Initialize our result container
        NewsProcessingResult result = new NewsProcessingResult();
        result.setTitle(title);
        result.setText(newsText);

        // Extract named entities
        List<Entity> entities = extractEntities(document);
        result.setEntities(entities);

        // Extract relationships
        List<Relationship> relationships = extractRelationships(document);
        result.setRelationships(relationships);

        // Extract key phrases (using noun phrases as a proxy)
        List<String> keyPhrases = extractKeyPhrases(document);
        result.setKeyPhrases(keyPhrases);

        return result;
    }

    private List<Entity> extractEntities(CoreDocument document) {
        Map<String, Entity> entityMap = new HashMap<>();

        // Process each sentence to find named entities
        for (CoreSentence sentence : document.sentences()) {
            List<CoreLabel> tokens = sentence.tokens();

            for (int i = 0; i < tokens.size(); i++) {
                CoreLabel token = tokens.get(i);
                String ner = token.get(NamedEntityTagAnnotation.class);

                // If this token is an entity
                if (!"O".equals(ner)) {
                    String entityText = token.originalText();

                    // Look ahead to see if this is a multi-token entity
                    int j = i + 1;
                    while (j < tokens.size() && tokens.get(j).get(NamedEntityTagAnnotation.class).equals(ner)) {
                        entityText += " " + tokens.get(j).originalText();
                        j++;
                    }

                    // Skip the tokens we just processed
                    i = j - 1;

                    // Store or update this entity
                    String entityKey = entityText.toLowerCase();
                    if (!entityMap.containsKey(entityKey)) {
                        Entity entity = new Entity();
                        entity.setName(entityText);
                        entity.setType(mapNerType(ner));
                        entity.setMentionCount(1);

                        // Calculate position (sentence index)
                        entity.addPosition(document.sentences().indexOf(sentence));

                        entityMap.put(entityKey, entity);
                    } else {
                        Entity existingEntity = entityMap.get(entityKey);
                        existingEntity.setMentionCount(existingEntity.getMentionCount() + 1);
                        existingEntity.addPosition(document.sentences().indexOf(sentence));
                    }
                }
            }
        }

        return new ArrayList<>(entityMap.values());
    }

    private String mapNerType(String stanfordNerType) {
        switch (stanfordNerType) {
            case "PERSON":
                return "Person";
            case "LOCATION":
            case "CITY":
            case "COUNTRY":
            case "STATE_OR_PROVINCE":
                return "Location";
            case "ORGANIZATION":
                return "Organization";
            case "DATE":
            case "TIME":
                return "Time";
            case "MONEY":
            case "PERCENT":
            case "NUMBER":
                return "Numerical";
            case "MISC":
                return "Miscellaneous";
            default:
                return "Other";
        }
    }

    private List<Relationship> extractRelationships(CoreDocument document) {
        List<Relationship> relationships = new ArrayList<>();
        Map<String, Set<String>> existingRelations = new HashMap<>();
    
        // Process each sentence for relation triples
        for (CoreSentence sentence : document.sentences()) {
            int sentenceIndex = document.sentences().indexOf(sentence);
            
            // 1. Extract KBP relation triples (highest quality, domain-specific)
            List<RelationTriple> kbpTriples = sentence.coreMap().get(
                KBPTriplesAnnotation.class
            );
                
            if (kbpTriples != null) {
                for (RelationTriple triple : kbpTriples) {
                    addRelationship(relationships, existingRelations, 
                        triple.subjectGloss(), triple.relationGloss(), triple.objectGloss(), 
                        0.9, sentenceIndex);
                }
            }
            
            // 2. Use dependency parsing to extract subject-verb-object patterns
            SemanticGraph dependencies = sentence.dependencyParse();
            if (dependencies != null) {
                // Find subjects (who did something)
                for (SemanticGraphEdge edge : dependencies.edgeListSorted()) {
                    if (edge.getRelation().toString().equals("nsubj")) {
                        IndexedWord subject = edge.getDependent();
                        IndexedWord verb = edge.getGovernor();
                        
                        // Only consider entities and substantive words
                        if (!isSubstantiveWord(subject.originalText())) continue;
                        
                        // Look for direct objects (what they did to whom)
                        for (SemanticGraphEdge objEdge : dependencies.outgoingEdgeIterable(verb)) {
                            if (objEdge.getRelation().toString().equals("obj") || 
                                objEdge.getRelation().toString().equals("iobj")) {
                                
                                IndexedWord object = objEdge.getDependent();
                                if (!isSubstantiveWord(object.originalText())) continue;
                                
                                String relationType = verb.originalText().toUpperCase();
                                addRelationship(relationships, existingRelations,
                                    subject.originalText(), relationType, object.originalText(),
                                    0.85, sentenceIndex);
                            }
                        }
                        
                        // Look for "nmod" relations (with who/what/where)
                        for (SemanticGraphEdge modEdge : dependencies.outgoingEdgeIterable(verb)) {
                            if (modEdge.getRelation().toString().startsWith("nmod")) {
                                IndexedWord modifier = modEdge.getDependent();
                                if (!isSubstantiveWord(modifier.originalText())) continue;
                                
                                String relType = verb.originalText() + "_" + 
                                    modEdge.getRelation().toString().replace("nmod:", "");
                                
                                addRelationship(relationships, existingRelations,
                                    subject.originalText(), relType.toUpperCase(), modifier.originalText(),
                                    0.8, sentenceIndex);
                            }
                        }
                    }
                }
                
                // 3. Extract entity-to-entity direct relationships (appositions, possessives)
                for (SemanticGraphEdge edge : dependencies.edgeListSorted()) {
                    String relation = edge.getRelation().toString();
                    
                    // Handle appositions (X, the Y)
                    if (relation.equals("appos")) {
                        String source = edge.getGovernor().originalText();
                        String target = edge.getDependent().originalText();
                        
                        if (isSubstantiveWord(source) && isSubstantiveWord(target)) {
                            addRelationship(relationships, existingRelations,
                                source, "IS_DESCRIBED_AS", target, 0.85, sentenceIndex);
                        }
                    }
                    
                    // Handle possessives (X of Y, X's Y)
                    else if (relation.equals("nmod:poss") || relation.equals("nmod:de")) {
                        String source = edge.getDependent().originalText();
                        String target = edge.getGovernor().originalText();
                        
                        if (isSubstantiveWord(source) && isSubstantiveWord(target)) {
                            addRelationship(relationships, existingRelations,
                                source, "HAS_PROPERTY", target, 0.8, sentenceIndex);
                        }
                    }
                    
                    // Handle compound nouns (United States)
                    else if (relation.equals("compound")) {
                        String modifier = edge.getDependent().originalText();
                        String head = edge.getGovernor().originalText();
                        
                        if (isSubstantiveWord(modifier) && isSubstantiveWord(head)) {
                            String compoundEntity = modifier + " " + head;
                            // Add relationship from compound to its parts
                            addRelationship(relationships, existingRelations,
                                compoundEntity, "INCLUDES", modifier, 0.7, sentenceIndex);
                            addRelationship(relationships, existingRelations,
                                compoundEntity, "INCLUDES", head, 0.7, sentenceIndex);
                        }
                    }
                }
            }
        }
        
        // 4. Filter out low-quality and duplicate relationships
        return filterHighQualityRelationships(relationships);
    }

    private List<Relationship> filterHighQualityRelationships(List<Relationship> allRelationships) {
        // Sort by confidence (highest first)
        allRelationships.sort((r1, r2) -> Double.compare(r2.getConfidence(), r1.getConfidence()));
        
        // Filter out lower confidence duplicates (same source-target but different relation)
        Map<String, Relationship> bestRelationships = new HashMap<>();
        
        for (Relationship rel : allRelationships) {
            String pairKey = rel.getSourceEntity().toLowerCase() + "|" + rel.getTargetEntity().toLowerCase();
            
            if (!bestRelationships.containsKey(pairKey) || 
                bestRelationships.get(pairKey).getConfidence() < rel.getConfidence()) {
                bestRelationships.put(pairKey, rel);
            }
        }
        
        return new ArrayList<>(bestRelationships.values());
    }

    private void addRelationship(List<Relationship> relationships, 
                                Map<String, Set<String>> existingRelations,
                                String sourceEntity, String relationType, 
                                String targetEntity, double confidence, 
                                int sentenceIndex) {
        // Skip if source or target is empty or too short
        if (sourceEntity == null || targetEntity == null ||
            sourceEntity.trim().length() < 2 || targetEntity.trim().length() < 2 ||
            sourceEntity.trim().equalsIgnoreCase(targetEntity.trim())) {
            return;
        }
        
        // Create a key to track this relationship (to avoid duplicates)
        String relationKey = sourceEntity.toLowerCase() + "|" + 
                            relationType.toLowerCase() + "|" + 
                            targetEntity.toLowerCase();
        
        // Skip if we've already seen this exact relationship
        if (existingRelations.containsKey(sourceEntity.toLowerCase())) {
            if (existingRelations.get(sourceEntity.toLowerCase()).contains(relationKey)) {
                return;
            }
        } else {
            existingRelations.put(sourceEntity.toLowerCase(), new HashSet<>());
        }
        
        // Add this relation to our seen set
        existingRelations.get(sourceEntity.toLowerCase()).add(relationKey);
        
        // Create and add the relationship
        Relationship rel = new Relationship();
        rel.setSourceEntity(sourceEntity);
        rel.setTargetEntity(targetEntity);
        rel.setType(relationType);
        rel.setConfidence(confidence);
        rel.setSentenceIndex(sentenceIndex);
        
        relationships.add(rel);
    }


    private boolean isSubstantiveWord(String word) {
        // Expanded stopwords list
        List<String> stopwords = Arrays.asList(
            "el", "la", "los", "las", "un", "una", "unos", "unas", 
            "y", "o", "a", "de", "del", "en", "que", "por", "con", "para", 
            "al", "mi", "tu", "su", "este", "esta", "estos", "estas", 
            "ese", "esa", "esos", "esas", "aquel", "aquella", "aquellos", "aquellas",
            "sí", "no", "como", "cuando", "donde", "quien", "cuanto", "cuanta"
        );
        
        return !stopwords.contains(word.toLowerCase()) && 
               word.length() > 1 &&
               !word.matches("\\d+"); // not just a number
    }

    private List<String> extractKeyPhrases(CoreDocument document) {
        Set<String> phrases = new HashSet<>();

        // Use noun phrases as key phrases
        for (CoreSentence sentence : document.sentences()) {
            Tree constituencyParse = sentence.constituencyParse();
            if (constituencyParse != null) {
                List<Tree> phraseList = getNounPhrases(constituencyParse);

                for (Tree phrase : phraseList) {
                    if (phrase.getLeaves().size() > 1) { // We want multi-word phrases
                        String phraseText = phrase.spanString().replaceAll("\\s+", " ").trim();
                        phrases.add(phraseText);
                    }
                }
            }
        }

        return new ArrayList<>(phrases);
    }

    private List<Tree> getNounPhrases(Tree tree) {
        List<Tree> nounPhrases = new ArrayList<>();

        for (Tree subtree : tree) {
            if (subtree.label().value().equals("NP")) {
                nounPhrases.add(subtree);
            } else if (!subtree.isLeaf()) {
                nounPhrases.addAll(getNounPhrases(subtree));
            }
        }

        return nounPhrases;
    }
}