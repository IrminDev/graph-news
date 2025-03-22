package com.github.irmindev.graph_news.model.request.news;

public abstract sealed class CreateNews permits
        CreateNews.CreateNewsWithURL,
        CreateNews.CreateNewsWithFile,
        CreateNews.CreateNewsWithContent
{
    private String title;

    public CreateNews(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
    }

    public static final class CreateNewsWithContent extends CreateNews {
        private String content;

        public CreateNewsWithContent(String title, String content) {
            super(title);
            this.content = content;
        }

        public String getContent() {
            return content;
        }
    }

    public static final class CreateNewsWithURL extends CreateNews {
        private String url;

        public CreateNewsWithURL(String title, String url) {
            super(title);
            this.url = url;
        }

        public String getUrl() {
            return url;
        }
    }

    public static final class CreateNewsWithFile extends CreateNews {
        public CreateNewsWithFile(String title) {
            super(title);
        }
    }
}
