package com.github.irmindev.graph_news.model.response.misc;

public abstract sealed class FileReaderResponse permits 
    FileReaderResponse.Success,
    FileReaderResponse.Failure
{
    private String message;

    public FileReaderResponse() {
    }

    public FileReaderResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public static final class Success extends FileReaderResponse {
        private String content;

        public Success(String content) {
            super("Success");
            this.content = content;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }

    public static final class Failure extends FileReaderResponse {
        public Failure(String message) {
            super(message);
        }
    }
}
