package com.github.irmindev.graph_news.model.dto;

public class NewsDTO {
    private Long id;
    private String title;
    private String content;
    private UserDTO author;

    public NewsDTO() {
    }

    public NewsDTO(Long id, String title, String content, UserDTO author) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.author = author;
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
}
