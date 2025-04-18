package com.github.irmindev.graph_news.service;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.neo4j.driver.types.Node;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.irmindev.graph_news.model.exception.EntityNotFoundException;
import com.github.irmindev.graph_news.model.graph.EntityNode;
import com.github.irmindev.graph_news.model.graph.EntityRelationship;
import com.github.irmindev.graph_news.model.graph.NewsGraph;
import com.github.irmindev.graph_news.model.graph.NewsNode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class GraphService {
    private final Driver neo4jDriver;
    private final Logger logger = LoggerFactory.getLogger(GraphService.class);

    @Autowired
    public GraphService(Driver neo4jDriver) {
        this.neo4jDriver = neo4jDriver;
    }

    public NewsGraph getNewsGraph(Long newsId) {
        try (Session session = neo4jDriver.session()) {
            // First, check if the news exists in Neo4j
            String checkQuery = "MATCH (n:News {sourceId: $sourceId}) RETURN n";
            Result checkResult = session.run(checkQuery, Map.of("sourceId", newsId.toString()));
            
            if (!checkResult.hasNext()) {
                throw new EntityNotFoundException();
            }
            
            // Get the news node
            Record newsRecord = checkResult.single();
            Node newsNode = newsRecord.get("n").asNode();
            NewsNode news = mapNewsNode(newsNode);
            
            // Get all entities connected to this news
            String entityQuery = "MATCH (e:Entity)-[r:MENTIONED_IN]->(n:News {sourceId: $sourceId}) " +
                                "RETURN e, r.count as mentionCount";
            Result entityResult = session.run(entityQuery, Map.of("sourceId", newsId.toString()));
            
            List<EntityNode> entities = new ArrayList<>();
            Map<String, EntityNode> entityMap = new HashMap<>();
            
            while (entityResult.hasNext()) {
                Record record = entityResult.next();
                Node entityNode = record.get("e").asNode();
                int mentionCount = record.get("mentionCount").asInt();
                
                EntityNode entity = mapEntityNode(entityNode, mentionCount);
                entities.add(entity);
                entityMap.put(entity.getId(), entity);
            }
            
            // Get all relationships between these entities
            String relationshipQuery = 
                "MATCH (n:News {sourceId: $sourceId}) " +
                "MATCH (e1:Entity)-[:MENTIONED_IN]->(n) " +
                "MATCH (e2:Entity)-[:MENTIONED_IN]->(n) " +
                "MATCH (e1)-[r]->(e2) " +
                "WHERE type(r) <> 'MENTIONED_IN' " +
                "RETURN e1.id as sourceId, e2.id as targetId, type(r) as type, " +
                "r.type as originalType, r.confidence as confidence";
            
            Result relationshipResult = session.run(relationshipQuery, Map.of("sourceId", newsId.toString()));
            
            List<EntityRelationship> relationships = new ArrayList<>();
            Set<String> relationshipSet = new HashSet<>(); // To avoid duplicates
            
            while (relationshipResult.hasNext()) {
                Record record = relationshipResult.next();
                String sourceId = record.get("sourceId").asString();
                String targetId = record.get("targetId").asString();
                String type = record.get("type").asString();
                String originalType = record.get("originalType").asString();
                double confidence = record.get("confidence").asDouble();
                
                // Create a unique key to avoid duplicate relationships
                String relationshipKey = sourceId + "|" + type + "|" + targetId;
                if (!relationshipSet.contains(relationshipKey)) {
                    EntityRelationship relationship = new EntityRelationship();
                    relationship.setSourceId(sourceId);
                    relationship.setTargetId(targetId);
                    relationship.setType(type);
                    relationship.setOriginalType(originalType);
                    relationship.setConfidence(confidence);
                    
                    relationships.add(relationship);
                    relationshipSet.add(relationshipKey);
                }
            }
            
            return new NewsGraph(news, entities, relationships);
        } catch (Exception e) {
            logger.error("Error retrieving news graph from Neo4j", e);
            throw e;
        }
    }
    
    private NewsNode mapNewsNode(Node node) {
        NewsNode newsNode = new NewsNode();
        newsNode.setId(node.get("id").asString());
        newsNode.setTitle(node.get("title").asString());
        newsNode.setText(node.get("text").asString());
        newsNode.setSourceId(Long.parseLong(node.get("sourceId").asString()));
        newsNode.setCreatedAt(node.get("createdAt").asString());
        return newsNode;
    }
    
    private EntityNode mapEntityNode(Node node, int mentionCount) {
        EntityNode entityNode = new EntityNode();
        entityNode.setId(node.get("id").asString());
        entityNode.setName(node.get("name").asString());
        entityNode.setType(node.get("type").asString());
        entityNode.setMentionCount(mentionCount);
        return entityNode;
    }
}