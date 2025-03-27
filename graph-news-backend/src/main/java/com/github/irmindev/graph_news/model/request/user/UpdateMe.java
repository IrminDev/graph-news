package com.github.irmindev.graph_news.model.request.user;

public class UpdateMe {
    private String email;
    private String name;

    public UpdateMe() {
    }

    public UpdateMe(String email, String name) {
        this.email = email;
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setName(String name) {
        this.name = name;
    }
}
