package com.github.irmindev.graph_news.model.graph;

import java.util.List;


public class NewsGraph {
    private NewsNode news;
    private List<EntityNode> entities;
    private List<EntityRelationship> relationships;

    public NewsGraph() {
    }

    public NewsGraph(NewsNode news, List<EntityNode> entities, List<EntityRelationship> relationships) {
        this.news = news;
        this.entities = entities;
        this.relationships = relationships;
    }

    public NewsNode getNews() {
        return news;
    }

    public void setNews(NewsNode news) {
        this.news = news;
    }

    public List<EntityNode> getEntities() {
        return entities;
    }

    public void setEntities(List<EntityNode> entities) {
        this.entities = entities;
    }

    public List<EntityRelationship> getRelationships() {
        return relationships;
    }

    public void setRelationships(List<EntityRelationship> relationships) {
        this.relationships = relationships;
    }
}