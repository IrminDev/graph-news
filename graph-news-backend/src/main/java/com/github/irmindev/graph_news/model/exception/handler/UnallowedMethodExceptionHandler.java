package com.github.irmindev.graph_news.model.exception.handler;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.github.irmindev.graph_news.model.exception.UnallowedMethodException;
import com.github.irmindev.graph_news.model.response.GetUserResponse;

@RestControllerAdvice
public class UnallowedMethodExceptionHandler {
    @ExceptionHandler(UnallowedMethodException.class)
    public ResponseEntity<GetUserResponse.UnallowedMethod> handleUnallowedMethodException(UnallowedMethodException e) {
        return ResponseEntity.badRequest().body(new GetUserResponse.UnallowedMethod());
    }
}
