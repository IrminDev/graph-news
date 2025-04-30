package com.github.irmindev.graph_news.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.irmindev.graph_news.model.exception.EntityNotFoundException;
import com.github.irmindev.graph_news.model.response.news.GraphResponse;
import com.github.irmindev.graph_news.model.graph.NewsGraph;
import com.github.irmindev.graph_news.service.GraphService;

@RestController
@RequestMapping("/api/graph")
public class GraphController {
    private final GraphService graphService;

    @Autowired
    public GraphController(GraphService graphService) {
        this.graphService = graphService;
    }

    @GetMapping("/news/{newsId}")
    public ResponseEntity<GraphResponse> getNewsGraph(@PathVariable Long newsId) {
        try {
            NewsGraph graph = graphService.getNewsGraph(newsId);
            return ResponseEntity.ok(new GraphResponse.Success(graph));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                   .body(new GraphResponse.Failure(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body(new GraphResponse.Failure("Error retrieving graph: " + e.getMessage()));
        }
    }
}