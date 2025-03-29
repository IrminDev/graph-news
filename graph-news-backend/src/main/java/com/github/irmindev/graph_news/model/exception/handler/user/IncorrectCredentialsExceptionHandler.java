package com.github.irmindev.graph_news.model.exception.handler.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.github.irmindev.graph_news.model.exception.user.IncorrectCredentialsException;
import com.github.irmindev.graph_news.model.response.auth.LoginResponse;

@RestControllerAdvice
public class IncorrectCredentialsExceptionHandler {
    @ExceptionHandler(IncorrectCredentialsException.class)
    public ResponseEntity<LoginResponse.InvalidCredentials> handleIncorrectCredentialsException(IncorrectCredentialsException e) {
        return ResponseEntity.badRequest().body(new LoginResponse.InvalidCredentials());
    }
}
