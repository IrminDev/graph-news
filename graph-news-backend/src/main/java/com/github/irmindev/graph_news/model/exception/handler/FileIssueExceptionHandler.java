package com.github.irmindev.graph_news.model.exception.handler;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.github.irmindev.graph_news.model.exception.FileIssueException;
import com.github.irmindev.graph_news.model.response.misc.FileReaderResponse;

@RestControllerAdvice
public class FileIssueExceptionHandler {
    @ExceptionHandler(FileIssueException.class)
    public ResponseEntity<FileReaderResponse.Failure> handleFileIssueException(FileIssueException e) {
        return ResponseEntity.badRequest().body(new FileReaderResponse.Failure(e.getMessage()));
    }
}
