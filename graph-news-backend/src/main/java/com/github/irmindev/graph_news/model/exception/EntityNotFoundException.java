package com.github.irmindev.graph_news.model.exception;

public class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(){
        super("Entity not found");
    }
}
