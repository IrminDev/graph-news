package com.github.irmindev.graph_news.model.dto;

import com.github.irmindev.graph_news.model.enums.Role;

public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;

    public UserDTO() {
    }

    public UserDTO(Long id, String name, String email, Role role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }    
}
