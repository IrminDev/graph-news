package com.github.irmindev.graph_news.model.exception.user;

public class IncorrectCredentialsException extends Exception {
    public IncorrectCredentialsException() {
        super("Incorrect credentials");
    }
}
