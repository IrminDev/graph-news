package com.github.irmindev.graph_news.model.request;

import com.github.irmindev.graph_news.model.enums.Role;

public class UpdateUserRequest {
    private String email;
    private String name;
    private String password;
    private Role role;

    public UpdateUserRequest() {
    }

    public UpdateUserRequest(String email, String name, String password, Role role) {
        this.email = email;
        this.name = name;
        this.password = password;
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getPassword() {
        return password;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
