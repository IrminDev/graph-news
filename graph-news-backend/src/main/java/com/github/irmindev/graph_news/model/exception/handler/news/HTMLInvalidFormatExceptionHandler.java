package com.github.irmindev.graph_news.model.exception.handler.news;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.github.irmindev.graph_news.model.exception.news.HTMLInvalidFormatException;
import com.github.irmindev.graph_news.model.response.news.NewsUpload;

@RestControllerAdvice
public class HTMLInvalidFormatExceptionHandler {
    @ExceptionHandler(HTMLInvalidFormatException.class)
    public ResponseEntity<NewsUpload.InvalidHTML> handleHTMLInvalidFormatException(HTMLInvalidFormatException e) {
        return ResponseEntity.badRequest().body(new NewsUpload.InvalidHTML());
    }
}
