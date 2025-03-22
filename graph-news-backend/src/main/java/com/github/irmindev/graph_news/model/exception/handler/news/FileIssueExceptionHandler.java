package com.github.irmindev.graph_news.model.exception.handler.news;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.github.irmindev.graph_news.model.exception.news.FileIssueException;
import com.github.irmindev.graph_news.model.response.news.NewsUpload;

@RestControllerAdvice
public class FileIssueExceptionHandler {
    @ExceptionHandler(FileIssueException.class)
    public ResponseEntity<NewsUpload.InvalidFile> handleFileIssueException(FileIssueException e) {
        return ResponseEntity.badRequest().body(new NewsUpload.InvalidFile(e.getMessage()));
    }
}
