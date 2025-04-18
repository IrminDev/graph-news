package com.github.irmindev.graph_news.model.response.news;

import java.util.List;
import java.util.Map;

import com.github.irmindev.graph_news.model.graph.NewsGraph;

public abstract sealed class GraphResponse permits 
    GraphResponse.Success,
    GraphResponse.Failure
{
    private String message;

    public GraphResponse() {
    }

    public GraphResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public static final class Success extends GraphResponse {
        private NewsGraph graph;
        
        public Success(String message, NewsGraph graph) {
            super(message);
            this.graph = graph;
        }

        public Success(NewsGraph graph) {
            super("Graph retrieved successfully");
            this.graph = graph;
        }

        public NewsGraph getGraph() {
            return graph;
        }
    }

    public static final class Failure extends GraphResponse {
        public Failure() {
            super("Failed to retrieve graph");
        }

        public Failure(String message) {
            super(message);
        }
    }
}