package com.github.irmindev.graph_news.model.exception;

public class AlreadyUsedEmailException extends Exception {
    public AlreadyUsedEmailException() {
        super("Email already used");
    }
}
