package com.github.irmindev.graph_news.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.github.irmindev.graph_news.model.exception.ResourceNotFoundException;
import com.github.irmindev.graph_news.model.response.HTMLContentResponse;
import com.github.irmindev.graph_news.service.URLService;

@RestController
@RequestMapping("/api/url")
public class URLController {
    private final URLService urlService;
    
    @Autowired
    public URLController(URLService urlService) {
        this.urlService = urlService;
    }

    @GetMapping
    public ResponseEntity<HTMLContentResponse> getURLContent(
        @RequestParam String url
    ) throws ResourceNotFoundException{
        return ResponseEntity.ok(new HTMLContentResponse.Success(
            urlService.getURLContent(url)
        ));
    }
}
