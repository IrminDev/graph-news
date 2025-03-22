package com.github.irmindev.graph_news.model.dto;

public class NewsDTO {
    private Long id;
    private String title;
    private String content;

    public NewsDTO() {
    }

    public NewsDTO(Long id, String title, String content) {
        this.id = id;
        this.title = title;
        this.content = content;
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
}
