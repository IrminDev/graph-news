package com.github.irmindev.graph_news.service;

import java.util.*;
import edu.stanford.nlp.pipeline.*;
import edu.stanford.nlp.ling.*;
import edu.stanford.nlp.trees.*;
import edu.stanford.nlp.semgraph.*;
import edu.stanford.nlp.ling.CoreAnnotations.NamedEntityTagAnnotation;
import edu.stanford.nlp.coref.CorefCoreAnnotations;
import edu.stanford.nlp.coref.data.CorefChain;
import edu.stanford.nlp.ie.util.RelationTriple;
import edu.stanford.nlp.naturalli.NaturalLogicAnnotations;

import org.springframework.stereotype.Service;

import com.github.irmindev.graph_news.model.nlp.*;

@Service
public class StanfordNLPProcessor {
    private final StanfordCoreNLP pipeline;

    public StanfordNLPProcessor() {
        Properties props = new Properties();
        
        props.setProperty("annotators", "tokenize,ssplit,pos,lemma,ner,depparse,parse,natlog,openie,coref");
        
        props.setProperty("ner.applyNumericClassifiers", "true");

        props.setProperty("ner.useSUTime", "0");
        
        this.pipeline = new StanfordCoreNLP(props);
    }

    private Map<Integer, String> buildCoreferenceMap(CoreDocument document) {
        Map<Integer, String> pronounMap = new HashMap<>();
        
        Map<Integer, CorefChain> corefChains = 
            document.annotation().get(CorefCoreAnnotations.CorefChainAnnotation.class);
        
        if (corefChains == null) return pronounMap;
        
        for (CorefChain chain : corefChains.values()) {
            // Get the representative mention (usually the first and most complete reference)
            CorefChain.CorefMention representative = chain.getRepresentativeMention();
            String representativeName = representative.mentionSpan;
            
            // Skip chains where representative is a pronoun
            if (isPronoun(representativeName)) continue;
            
            // For each mention in this chain
            for (CorefChain.CorefMention mention : chain.getMentionsInTextualOrder()) {
                // If this mention is a pronoun, map it to the representative entity
                if (isPronoun(mention.mentionSpan)) {
                    // Get the sentence index and token index
                    int sentenceIndex = mention.sentNum - 1; // CoreNLP uses 1-based indexing
                    int headTokenIndex = mention.headIndex - 1;
                    
                    // Create a unique key for this mention
                    int mentionKey = sentenceIndex * 10000 + headTokenIndex;
                    pronounMap.put(mentionKey, representativeName);
                }
            }
        }
        
        return pronounMap;
    }
    
    private boolean isPronoun(String text) {
        String lower = text.toLowerCase();
        return lower.equals("he") || lower.equals("she") || lower.equals("it") || 
               lower.equals("they") || lower.equals("him") || lower.equals("her") || 
               lower.equals("them") || lower.equals("his") || lower.equals("hers") || 
               lower.equals("its") || lower.equals("their") || lower.equals("theirs");
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
        List<Entity> entities = extractAllEntities(document);
        result.setEntities(entities);

        // Extract relationships using both OpenIE and dependency parsing
        List<Relationship> relationships = extractRelationships(document);
        result.setRelationships(relationships);

        // Extract key phrases (using noun phrases as a proxy)
        List<String> keyPhrases = extractKeyPhrases(document);
        result.setKeyPhrases(keyPhrases);

        return result;
    }

    // Add this method to include OpenIE entities
    private List<Entity> extractAllEntities(CoreDocument document) {
        // First get standard NER entities
        List<Entity> entities = extractEntities(document);
        Map<String, Entity> entityMap = new HashMap<>();
        
        // Convert to map for easier updating
        for (Entity entity : entities) {
            entityMap.put(entity.getName().toLowerCase(), entity);
        }
        
        // Add entities from OpenIE triples
        for (CoreSentence sentence : document.sentences()) {
            Collection<RelationTriple> triples = sentence.coreMap().get(
                NaturalLogicAnnotations.RelationTriplesAnnotation.class);
                
            if (triples != null) {
                for (RelationTriple triple : triples) {
                    // Add subject as entity if substantive
                    String subject = triple.subjectLemmaGloss();
                    if (subject.length() > 2 && !subject.matches("\\d+") && 
                        !isCommonPronoun(subject)) {
                        addOrUpdateEntity(entityMap, subject, "Concept", 
                            document.sentences().indexOf(sentence));
                    }
                    
                    // Add object as entity if substantive
                    String object = triple.objectLemmaGloss();
                    if (object.length() > 2 && !object.matches("\\d+") && 
                        !isCommonPronoun(object)) {
                        addOrUpdateEntity(entityMap, object, "Concept", 
                            document.sentences().indexOf(sentence));
                    }
                }
            }
        }
        
        return new ArrayList<>(entityMap.values());
    }

    private void addOrUpdateEntity(Map<String, Entity> entityMap, String name, String type, int position) {
        String key = name.toLowerCase();
        if (entityMap.containsKey(key)) {
            Entity entity = entityMap.get(key);
            entity.setMentionCount(entity.getMentionCount() + 1);
            entity.addPosition(position);
        } else {
            Entity entity = new Entity();
            entity.setName(name);
            entity.setType(type);
            entity.setMentionCount(1);
            entity.addPosition(position);
            entityMap.put(key, entity);
        }
    }

    private boolean isCommonPronoun(String text) {
        String lower = text.toLowerCase();
        return lower.equals("i") || lower.equals("you") || lower.equals("he") || 
            lower.equals("she") || lower.equals("it") || lower.equals("we") || 
            lower.equals("they") || lower.equals("this") || lower.equals("that") ||
            lower.equals("these") || lower.equals("those");
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
        Map<Integer, String> pronounMap = buildCoreferenceMap(document);

        // First, identify all named entities in the document for easy lookup
        Map<String, String> entityTypes = new HashMap<>();
        for (Entity entity : extractEntities(document)) {
            entityTypes.put(entity.getName().toLowerCase(), entity.getType());
        }

        // Add this at the beginning of extractRelationships
        System.out.println("RECOGNIZED ENTITIES:");
        for (Map.Entry<String, String> entry : entityTypes.entrySet()) {
            System.out.println("  " + entry.getKey() + " (" + entry.getValue() + ")");
        }
        
        // Process each sentence for relationships
        for (CoreSentence sentence : document.sentences()) {
            int sentenceIndex = document.sentences().indexOf(sentence);
            
            // 1. First use OpenIE triples - these are high precision
            Collection<RelationTriple> triples = sentence.coreMap().get(
                NaturalLogicAnnotations.RelationTriplesAnnotation.class);
                
            if (triples != null) {
                System.out.println("Found " + triples.size() + " OpenIE triples in sentence: " + 
                      sentence.text().substring(0, Math.min(50, sentence.text().length())) + "...");
    
                for (RelationTriple triple : triples) {
                    System.out.println("  TRIPLE: " + triple.subjectGloss() + " | " + 
                                    triple.relationGloss() + " | " + triple.objectGloss() + 
                                    " (Confidence: " + triple.confidence + ")");
                    
                    // Debug entity matching
                    String subjectEntity = findMatchingEntity(triple.subjectGloss(), entityTypes);
                    String objectEntity = findMatchingEntity(triple.objectGloss(), entityTypes);
                    
                    System.out.println("    Matched to entities: " + subjectEntity + " | " + objectEntity);
                }

                for (RelationTriple triple : triples) {
                    // Get subject, relation, and object
                    String subject = triple.subjectLemmaGloss();
                    String relation = triple.relationLemmaGloss();
                    String object = triple.objectLemmaGloss();

                    // Replace these lines in the extractRelationships method where you resolve pronouns
                    // Check if the subject is a pronoun and replace it with the coreference
                    if (isPronoun(subject)) {
                        // We need to find the head token for the subject
                        // Calculating a more reliable key for pronouns
                        int sentPos = triple.subjectGloss().indexOf(subject);
                        if (sentPos >= 0) {
                            // This is a rough approximation - in a full sentence, we need to count tokens
                            // Split the subject phrase into tokens to find the position
                            String[] subjectTokens = triple.subjectGloss().split("\\s+");
                            int tokenOffset = 0;
                            for (int i = 0; i < subjectTokens.length; i++) {
                                if (subjectTokens[i].equalsIgnoreCase(subject)) {
                                    tokenOffset = i;
                                    break;
                                }
                            }
                            
                            int mentionKey = sentenceIndex * 10000 + tokenOffset;
                            System.out.println("  Looking for pronoun resolution for subject: " + subject 
                                            + " with key: " + mentionKey);
                            
                            if (pronounMap.containsKey(mentionKey)) {
                                String resolvedEntity = pronounMap.get(mentionKey);
                                System.out.println("  Resolved subject pronoun: " + subject + " -> " + resolvedEntity);
                                subject = resolvedEntity;
                            }
                        }
                    }

                    // Do the same for object
                    if (isPronoun(object)) {
                        // Similar approach for the object
                        int sentPos = triple.objectGloss().indexOf(object);
                        if (sentPos >= 0) {
                            String[] objectTokens = triple.objectGloss().split("\\s+");
                            int tokenOffset = 0;
                            for (int i = 0; i < objectTokens.length; i++) {
                                if (objectTokens[i].equalsIgnoreCase(object)) {
                                    tokenOffset = i;
                                    break;
                                }
                            }
                            
                            int mentionKey = sentenceIndex * 10000 + tokenOffset;
                            System.out.println("  Looking for pronoun resolution for object: " + object 
                                            + " with key: " + mentionKey);
                            
                            if (pronounMap.containsKey(mentionKey)) {
                                String resolvedEntity = pronounMap.get(mentionKey);
                                System.out.println("  Resolved object pronoun: " + object + " -> " + resolvedEntity);
                                object = resolvedEntity;
                            }
                        }
                    }
                    
                    // Only process if subject and object are entities of interest
                    String subjectEntity = findMatchingEntity(subject, entityTypes);
                    String objectEntity = findMatchingEntity(object, entityTypes);
                    
                    if (subjectEntity != null && objectEntity != null) {
                        // Normalize relation for Neo4j
                        String relationType = normalizeRelation(relation);
                        
                        // Add the relationship with high confidence (0.95)
                        addRelationship(relationships, existingRelations,
                            subjectEntity, relationType, objectEntity, 0.95, sentenceIndex);
                    }
                }
            }
            
            // 2. Fallback to dependency parsing for additional relationships
            SemanticGraph dependencies = sentence.dependencyParse();
            
            // Add this in your extractRelationships method to handle passive voice
            for (SemanticGraphEdge edge : dependencies.edgeListSorted()) {
                if (edge.getRelation().toString().equals("nsubjpass")) {
                    IndexedWord subject = edge.getDependent();
                    IndexedWord verb = edge.getGovernor();
                    
                    // Look for logical subject (often in "by" phrase)
                    for (SemanticGraphEdge byEdge : dependencies.outgoingEdgeIterable(verb)) {
                        if (byEdge.getRelation().toString().equals("obl:by") || 
                            byEdge.getRelation().toString().equals("agent")) {
                            
                            IndexedWord agent = byEdge.getDependent();
                            if (!isSubstantiveWord(agent.originalText())) continue;
                            
                            String sourceEntity = findFullEntity(agent, dependencies, entityTypes);
                            String targetEntity = findFullEntity(subject, dependencies, entityTypes);
                            
                            if (sourceEntity != null && targetEntity != null) {
                                String relationType = normalizeVerb(verb.originalText());
                                
                                System.out.println("PASSIVE: Found " + sourceEntity + " -[" + 
                                                relationType + "]-> " + targetEntity);
                                
                                addRelationship(relationships, existingRelations,
                                    sourceEntity, relationType, targetEntity, 0.85, sentenceIndex);
                            }
                        }
                    }
                }
            }

            if (dependencies != null) {
                // Find all verb-subject pairs (potential relationship sources)
                for (SemanticGraphEdge edge : dependencies.edgeListSorted()) {
                    if (edge.getRelation().toString().equals("nsubj")) {
                        IndexedWord subject = edge.getDependent();
                        IndexedWord verb = edge.getGovernor();
                        
                        // Check if the subject is a substantive word
                        if (!isSubstantiveWord(subject.originalText())) continue;
                        
                        String sourceEntity = findFullEntity(subject, dependencies, entityTypes);
                        if (sourceEntity == null) continue;
                        
                        // Look for direct objects (targets) of this verb
                        for (SemanticGraphEdge objEdge : dependencies.outgoingEdgeIterable(verb)) {
                            if (objEdge.getRelation().toString().equals("obj") || 
                                objEdge.getRelation().toString().equals("dobj") ||
                                objEdge.getRelation().toString().equals("iobj")) {
                                
                                IndexedWord object = objEdge.getDependent();
                                if (!isSubstantiveWord(object.originalText())) continue;
                                
                                String targetEntity = findFullEntity(object, dependencies, entityTypes);
                                if (targetEntity == null) continue;
                                
                                // Get the normalized verb form as the relationship
                                String relationType = normalizeVerb(verb.originalText());
                                
                                // Add the relationship with good confidence (0.9)
                                addRelationship(relationships, existingRelations,
                                    sourceEntity, relationType, targetEntity, 0.9, sentenceIndex);
                            }
                        }
                        
                        // Look for preposition-connected objects
                        // For sentences like "The President spoke with Congress"
                        for (SemanticGraphEdge prepEdge : dependencies.outgoingEdgeIterable(verb)) {
                            if (prepEdge.getRelation().toString().startsWith("nmod:") || 
                                prepEdge.getRelation().toString().equals("nmod")) {
                                
                                IndexedWord prepObject = prepEdge.getDependent();
                                if (!isSubstantiveWord(prepObject.originalText())) continue;
                                
                                String targetEntity = findFullEntity(prepObject, dependencies, entityTypes);
                                if (targetEntity == null) continue;
                                
                                // Get verb + preposition as relationship type
                                String prep = prepEdge.getRelation().toString().replace("nmod:", "");
                                String relationType = normalizeVerb(verb.originalText());
                                
                                // For "spoke with" -> SPOKE_WITH
                                if (!prep.equals("nmod")) {
                                    relationType = relationType + "_" + prep.toUpperCase();
                                }
                                
                                // Add the relationship
                                addRelationship(relationships, existingRelations,
                                    sourceEntity, relationType, targetEntity, 0.85, sentenceIndex);
                            }
                        }
                    }
                }
            }
        }
        
        return filterHighQualityRelationships(relationships);
    }
    
    // Helper to find the entity that matches or contains the given text
    private String findMatchingEntity(String text, Map<String, String> entityTypes) {
        // Normalize for comparison
        String normalizedText = text.toLowerCase().trim();
        
        // Exact match
        if (entityTypes.containsKey(normalizedText)) {
            // Find the original case in the map
            for (Map.Entry<String, String> entry : entityTypes.entrySet()) {
                if (entry.getKey().equalsIgnoreCase(normalizedText)) {
                    return entry.getKey();
                }
            }
        }
        
        // Check if the text is part of any entity
        for (String entity : entityTypes.keySet()) {
            if (entity.toLowerCase().contains(normalizedText) || 
                normalizedText.contains(entity.toLowerCase())) {
                // Return the longer of the two
                return entity.length() > text.length() ? entity : text;
            }
        }
        
        return null;
    }
    
    // Helper to normalize relations from OpenIE
    private String normalizeRelation(String relation) {
        // Remove extra spaces
        relation = relation.trim().replaceAll("\\s+", " ");
        
        // Replace spaces with underscores and uppercase
        relation = relation.replaceAll("\\s", "_").toUpperCase();
        
        // Remove any characters that aren't allowed in Neo4j relationship types
        relation = relation.replaceAll("[^A-Z0-9_]", "");
        
        return relation;
    }
    
    // Helper to find the full entity containing this word (handles multi-word entities)
    private String findFullEntity(IndexedWord word, SemanticGraph graph, Map<String, String> entityTypes) {
        // Start with the word itself
        String entity = word.originalText();
        
        // Check if it's part of a compound
        for (SemanticGraphEdge edge : graph.incomingEdgeIterable(word)) {
            if (edge.getRelation().toString().equals("compound")) {
                entity = edge.getGovernor().originalText() + " " + entity;
            }
        }
        for (SemanticGraphEdge edge : graph.outgoingEdgeIterable(word)) {
            if (edge.getRelation().toString().equals("compound")) {
                entity = entity + " " + edge.getDependent().originalText();
            }
        }
        
        // Check for adjective modifiers
        for (SemanticGraphEdge edge : graph.incomingEdgeIterable(word)) {
            if (edge.getRelation().toString().equals("amod")) {
                entity = edge.getGovernor().originalText() + " " + entity;
            }
        }
        
        // Case folding and normalization for lookup
        String normalizedEntity = entity.toLowerCase();
        
        // Check if this is a known entity
        if (entityTypes.containsKey(normalizedEntity)) {
            return entity;  // Return the original case
        }
        
        // If not a known entity, check if the single word is a known entity
        if (entityTypes.containsKey(word.originalText().toLowerCase())) {
            return word.originalText();
        }
        
        // Check if this entity contains a known entity
        for (String knownEntity : entityTypes.keySet()) {
            if (normalizedEntity.contains(knownEntity.toLowerCase())) {
                return entity;
            }
        }
        
        // Not a known entity, return null
        return null;
    }
    
    // Helper to normalize verbs
    private String normalizeVerb(String verb) {
        // Convert to uppercase for consistency in Neo4j relationship types
        return verb.toUpperCase().replaceAll("[^A-Z0-9_]", "");
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
        // English stopwords list
        List<String> stopwords = Arrays.asList(
            "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", 
            "be", "been", "being", "have", "has", "had", "do", "does", "did",
            "to", "at", "in", "on", "by", "for", "with", "about", "against",
            "between", "into", "through", "during", "before", "after", "above",
            "below", "from", "up", "down", "of", "off", "over", "under", "again",
            "further", "then", "once", "here", "there", "when", "where", "why",
            "how", "all", "any", "both", "each", "few", "more", "most", "other",
            "some", "such", "no", "nor", "not", "only", "own", "same", "so",
            "than", "too", "very", "s", "t", "can", "will", "just", "don", "should",
            "now", "d", "ll", "m", "o", "re", "ve", "y", "ain", "aren", "couldn",
            "didn", "doesn", "hadn", "hasn", "haven", "isn", "ma", "mightn", "mustn",
            "needn", "shan", "shouldn", "wasn", "weren", "won", "wouldn"
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

        if (tree == null) {
            return nounPhrases;
        }
    
        if (tree.label() != null && "NP".equals(tree.label().value())) {
            nounPhrases.add(tree);
        }

        for (int i = 0; i < tree.numChildren(); i++) {
            Tree child = tree.getChild(i);
            if (child != null && !child.isLeaf()) {
                nounPhrases.addAll(getNounPhrases(child));
            }
        }
    
        return nounPhrases;
    }
}