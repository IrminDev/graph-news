package com.github.irmindev.graph_news.model.response.news;

import java.util.List;

import com.github.irmindev.graph_news.model.dto.NewsDTO;

public abstract sealed class NewsResponse permits
    NewsResponse.Success,
    NewsResponse.SuccessList,
    NewsResponse.Failure
{
    private String message;

    public NewsResponse() {
    }

    public NewsResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public static final class Success extends NewsResponse {
        private NewsDTO news;
        
        public Success(String message) {
            super(message);
        }

        public Success(NewsDTO news) {
            super("Operation completed successfully");
            this.news = news;
        }

        public NewsDTO getNews() {
            return news;
        }
    }
    
    public static final class SuccessList extends NewsResponse {
        private List<NewsDTO> newsList;
        private Long total;
        
        public SuccessList(List<NewsDTO> newsList) {
            super("Operation completed successfully");
            this.newsList = newsList;
            this.total = (long) newsList.size();
        }
        
        public SuccessList(List<NewsDTO> newsList, Long total) {
            super("Operation completed successfully");
            this.newsList = newsList;
            this.total = total;
        }
        
        public List<NewsDTO> getNewsList() {
            return newsList;
        }
        
        public Long getTotal() {
            return total;
        }
    }

    public static final class Failure extends NewsResponse {
        public Failure() {
            super("Operation failed");
        }

        public Failure(String message) {
            super(message);
        }
    }
}
