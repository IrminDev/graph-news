package com.github.irmindev.graph_news.model.exception.handler;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.github.irmindev.graph_news.model.exception.ResourceNotFoundException;
import com.github.irmindev.graph_news.model.response.HTMLContentResponse;

@RestControllerAdvice
public class ResourceNotFoundExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<HTMLContentResponse> handleResourceNotFoundException(ResourceNotFoundException e) {
        return ResponseEntity.badRequest().body(new HTMLContentResponse.Failure(e));
    }
}
