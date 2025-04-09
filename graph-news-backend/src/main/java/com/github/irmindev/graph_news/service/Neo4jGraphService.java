package com.github.irmindev.graph_news.service;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.TransactionContext;
import org.neo4j.driver.Result;
import org.neo4j.driver.Record;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.irmindev.graph_news.model.dto.NewsDTO;
import com.github.irmindev.graph_news.model.nlp.Entity;
import com.github.irmindev.graph_news.model.nlp.NewsProcessingResult;
import com.github.irmindev.graph_news.model.nlp.Relationship;

import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@Service
public class Neo4jGraphService {
    private final Driver neo4jDriver;
    private final Logger logger = LoggerFactory.getLogger(Neo4jGraphService.class);

    @Autowired
    public Neo4jGraphService(Driver neo4jDriver) {
        this.neo4jDriver = neo4jDriver;
    }

    public void storeProcessedNews(NewsProcessingResult processingResult, NewsDTO newsDto) {
        try (Session session = neo4jDriver.session()) {
            session.executeWrite(tx -> {
                // 1. Create a node for the News article
                String newsUuid = UUID.randomUUID().toString();
                createNewsNode(tx, newsUuid, newsDto, processingResult);
                
                // 2. Create nodes for all entities
                Map<String, String> entityUuids = new HashMap<>();
                for (Entity entity : processingResult.getEntities()) {
                    String entityUuid = createEntityNode(tx, entity);
                    entityUuids.put(entity.getName(), entityUuid);
                    
                    // Connect entity to the news article
                    connectEntityToNews(tx, entityUuid, newsUuid, entity.getMentionCount());
                }
                
                // 3. Create relationships between entities
                // Modify this section to handle entity name mismatches
                for (Relationship relationship : processingResult.getRelationships()) {
                    String sourceUuid = entityUuids.get(relationship.getSourceEntity());
                    String targetUuid = entityUuids.get(relationship.getTargetEntity());
                    
                    // Debug output to identify the issue
                    if (sourceUuid == null) {
                        System.out.println("WARNING: Could not find entity UUID for source: " + relationship.getSourceEntity());
                        // Try to find a partial match
                        for (Map.Entry<String, String> entry : entityUuids.entrySet()) {
                            if (entry.getKey().toLowerCase().contains(relationship.getSourceEntity().toLowerCase()) ||
                                relationship.getSourceEntity().toLowerCase().contains(entry.getKey().toLowerCase())) {
                                sourceUuid = entry.getValue();
                                System.out.println("  Found partial match: " + entry.getKey());
                                break;
                            }
                        }
                    }
                    
                    if (targetUuid == null) {
                        System.out.println("WARNING: Could not find entity UUID for target: " + relationship.getTargetEntity());
                        // Try to find a partial match
                        for (Map.Entry<String, String> entry : entityUuids.entrySet()) {
                            if (entry.getKey().toLowerCase().contains(relationship.getTargetEntity().toLowerCase()) ||
                                relationship.getTargetEntity().toLowerCase().contains(entry.getKey().toLowerCase())) {
                                targetUuid = entry.getValue();
                                System.out.println("  Found partial match: " + entry.getKey());
                                break;
                            }
                        }
                    }
                    
                    if (sourceUuid != null && targetUuid != null) {
                        createRelationship(tx, sourceUuid, targetUuid, relationship);
                    }
                }
                
                return null;
            });
            
            logger.info("Successfully stored processed news in Neo4j: {}", newsDto.getTitle());
        } catch (Exception e) {
            logger.error("Error storing processed news in Neo4j", e);
        }
    }
    
    private String createNewsNode(TransactionContext tx, String newsUuid, NewsDTO newsDto, NewsProcessingResult processingResult) {
        String query = "CREATE (n:News {" +
                       "id: $id, " +
                       "title: $title, " +
                       "text: $text, " +
                       "sourceId: $sourceId, " +
                       "authorId: $authorId, " +
                       "createdAt: $createdAt" +
                       "}) RETURN n.id";
                       
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("id", newsUuid);
        parameters.put("title", newsDto.getTitle());
        parameters.put("text", processingResult.getText());
        parameters.put("sourceId", newsDto.getId().toString());
        parameters.put("authorId", newsDto.getAuthor().getId().toString());
        parameters.put("createdAt", newsDto.getCreatedAt().toString());
        
        Result result = tx.run(query, parameters);
        return result.single().get(0).asString();
    }
    
    private String createEntityNode(TransactionContext tx, Entity entity) {
        // Check if entity already exists (by name and type)
        String findQuery = "MATCH (e:Entity {name: $name, type: $type}) RETURN e.id";
        Map<String, Object> findParams = new HashMap<>();
        findParams.put("name", entity.getName());
        findParams.put("type", entity.getType());
        
        try {
            Result findResult = tx.run(findQuery, findParams);
            if (findResult.hasNext()) {
                // Entity exists, return its ID
                return findResult.single().get(0).asString();
            }
        } catch (Exception e) {
            // Continue to create a new entity
        }
        
        // Create new entity
        String entityUuid = UUID.randomUUID().toString();
        String createQuery = "CREATE (e:Entity {" +
                            "id: $id, " +
                            "name: $name, " +
                            "type: $type" +
                            "}) RETURN e.id";
                            
        Map<String, Object> createParams = new HashMap<>();
        createParams.put("id", entityUuid);
        createParams.put("name", entity.getName());
        createParams.put("type", entity.getType());
        
        Result createResult = tx.run(createQuery, createParams);
        return createResult.single().get(0).asString();
    }
    
    private void connectEntityToNews(TransactionContext tx, String entityUuid, String newsUuid, int mentionCount) {
        String query = "MATCH (e:Entity {id: $entityId}), (n:News {id: $newsId}) " +
                       "MERGE (e)-[r:MENTIONED_IN {count: $count}]->(n) " +
                       "RETURN r";
                       
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("entityId", entityUuid);
        parameters.put("newsId", newsUuid);
        parameters.put("count", mentionCount);
        
        tx.run(query, parameters);
    }
    
    private void createRelationship(TransactionContext tx, String sourceUuid, String targetUuid, Relationship relationship) {
        // Create a normalized relationship type
        String relType = relationship.getType()
                     .toUpperCase()
                     .replaceAll("\\s+", "_")
                     .replaceAll(":", "_");
    
        System.out.println("Creating relationship: " + relationship.getSourceEntity() + 
                          " -[" + relType + "]-> " + relationship.getTargetEntity() + 
                          " (Original type: " + relationship.getType() + ")");
        
        try {
            String query = "MATCH (source:Entity {id: $sourceId}), (target:Entity {id: $targetId}) " +
                          "MERGE (source)-[r:" + relType + " {type: $originalType, confidence: $confidence}]->(target) " +
                          "RETURN r";
                      
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("sourceId", sourceUuid);
            parameters.put("targetId", targetUuid);
            parameters.put("originalType", relationship.getType());
            parameters.put("confidence", relationship.getConfidence());
            
            tx.run(query, parameters);
            System.out.println("  Relationship created successfully");
        } catch (Exception e) {
            System.err.println("  ERROR creating relationship: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public Map<String, Object> getGraphStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try (Session session = neo4jDriver.session()) {
            // Count news articles
            Result newsCount = session.run("MATCH (n:News) RETURN count(n) as count");
            stats.put("newsCount", newsCount.single().get("count").asInt());
            
            // Count entities by type
            Result entityTypes = session.run(
                "MATCH (e:Entity) RETURN e.type as type, count(e) as count ORDER BY count DESC"
            );
            
            Map<String, Integer> entitiesByType = new HashMap<>();
            while (entityTypes.hasNext()) {
                Record record = entityTypes.next();
                entitiesByType.put(record.get("type").asString(), record.get("count").asInt());
            }
            stats.put("entitiesByType", entitiesByType);
            
            // Count total relationships
            Result relationshipCount = session.run(
                "MATCH ()-[r]->() WHERE type(r) <> 'MENTIONED_IN' RETURN count(r) as count"
            );
            stats.put("relationshipCount", relationshipCount.single().get("count").asInt());
            
            // Get most frequent relationship types
            Result relationshipTypes = session.run(
                "MATCH ()-[r]->() WHERE type(r) <> 'MENTIONED_IN' " +
                "RETURN type(r) as type, count(r) as count ORDER BY count DESC LIMIT 10"
            );
            
            Map<String, Integer> topRelationships = new HashMap<>();
            while (relationshipTypes.hasNext()) {
                Record record = relationshipTypes.next();
                topRelationships.put(record.get("type").asString(), record.get("count").asInt());
            }
            stats.put("topRelationships", topRelationships);
            
        } catch (Exception e) {
            logger.error("Error getting graph statistics from Neo4j", e);
        }
        
        return stats;
    }
}