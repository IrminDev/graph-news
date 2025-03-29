package com.github.irmindev.graph_news.model.response.news;

import com.github.irmindev.graph_news.model.dto.NewsDTO;
import com.github.irmindev.graph_news.model.response.news.NewsUpload.InvalidHTML;

public abstract sealed class NewsUpload permits
    NewsUpload.Success,
    NewsUpload.Failure,
    NewsUpload.InvalidFile, InvalidHTML
{
    private String message;

    public NewsUpload() {
    }

    public NewsUpload(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public static final class Success extends NewsUpload {
        private NewsDTO news;

        public Success(NewsDTO news) {
            super("News uploaded successfully");
            this.news = news;
        }

        public NewsDTO getNews() {
            return news;
        }
    }

    public static final class InvalidFile extends NewsUpload {
        public InvalidFile() {
            super("Invalid file");
        }

        public InvalidFile(String message) {
            super(message);
        }
    }

    public static final class InvalidHTML extends NewsUpload {
        public InvalidHTML() {
            super("Invalid HTML");
        }

        public InvalidHTML(String message) {
            super(message);
        }
    }

    public static final class Failure extends NewsUpload {
        public Failure() {
            super("Failed to upload news");
        }

        public Failure(String message) {
            super(message);
        }
    }
}
