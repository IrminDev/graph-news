package com.github.irmindev.graph_news.model.dto;

public class URLContentDTO {
    private String url;
    private String title;
    private String content;

    public URLContentDTO(String url, String title, String content) {
        this.url = url;
        this.title = title;
        this.content = content;
    }

    public String getUrl() {
        return url;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
