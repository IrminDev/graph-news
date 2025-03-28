package com.github.irmindev.graph_news.model.dto;

import java.time.LocalDateTime;

public class NewsDTO {
    private Long id;
    private String title;
    private String content;
    private UserDTO author;
    private LocalDateTime createdAt;

    public NewsDTO() {
    }

    public NewsDTO(Long id, String title, String content, UserDTO author) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.author = author;
    }
    
    public NewsDTO(Long id, String title, String content, UserDTO author, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.author = author;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public UserDTO getAuthor() {
        return author;
    }

    public void setAuthor(UserDTO author) {
        this.author = author;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
