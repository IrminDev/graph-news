package com.github.irmindev.graph_news.model.response;

import com.github.irmindev.graph_news.model.dto.URLContentDTO;
import com.github.irmindev.graph_news.model.exception.ResourceNotFoundException;

public sealed abstract class HTMLContentResponse permits 
    HTMLContentResponse.Success,
    HTMLContentResponse.Failure
{
    private String message;

    public HTMLContentResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public static final class Success extends HTMLContentResponse {
        private URLContentDTO document;

        public Success(URLContentDTO document) {
            super("Success");
            this.document = document;
        }

        public URLContentDTO getDocument() {
            return document;
        }

        public void setDocument(URLContentDTO document) {
            this.document = document;
        }
    }

    public static final class Failure extends HTMLContentResponse {
        public Failure(ResourceNotFoundException e) {
            super(e.getMessage());
        }
    }
}
