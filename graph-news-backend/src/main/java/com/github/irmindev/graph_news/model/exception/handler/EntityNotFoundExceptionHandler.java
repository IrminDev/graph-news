package com.github.irmindev.graph_news.model.exception.handler;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.github.irmindev.graph_news.model.exception.EntityNotFoundException;
import com.github.irmindev.graph_news.model.response.auth.LoginResponse;

@RestControllerAdvice
public class EntityNotFoundExceptionHandler {
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<LoginResponse.EntityNotFound> handleEntityNotFoundException(EntityNotFoundException e) {
        return ResponseEntity.badRequest().body(new LoginResponse.EntityNotFound());
    }
}
