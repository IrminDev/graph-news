package com.github.irmindev.graph_news.model.exception.handler;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.github.irmindev.graph_news.model.exception.AlreadyUsedEmailException;
import com.github.irmindev.graph_news.model.response.users.UpdateResponse;;

@RestControllerAdvice
public class AlreadyUsedEmailExceptionHandler {
    @ExceptionHandler(AlreadyUsedEmailException.class)
    public ResponseEntity<UpdateResponse.AlreadyUsedEmail> handleAlreadyUsedEmailException(AlreadyUsedEmailException e) {
        return ResponseEntity.badRequest().body(new UpdateResponse.AlreadyUsedEmail());
    }
}
