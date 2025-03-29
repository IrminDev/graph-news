package com.github.irmindev.graph_news.model.exception.handler;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.github.irmindev.graph_news.model.exception.ResourceNotFoundException;
import com.github.irmindev.graph_news.model.response.news.NewsUpload;

@RestControllerAdvice
public class ResourceNotFoundExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<NewsUpload.Failure> handleResourceNotFoundException(ResourceNotFoundException e) {
        return ResponseEntity.badRequest().body(new NewsUpload.Failure(e.getMessage()));
    }
}
