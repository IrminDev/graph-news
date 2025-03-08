package com.github.irmindev.graph_news.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URLConnection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.irmindev.graph_news.model.dto.URLContentDTO;
import com.github.irmindev.graph_news.model.exception.ResourceNotFoundException;
import com.github.irmindev.graph_news.utils.HTMLSanitizer;

@Service
public class URLService {
    private final HTMLSanitizer htmlSanitizer;

    @Autowired
    public URLService(HTMLSanitizer htmlSanitizer) {
        this.htmlSanitizer = htmlSanitizer;
    }

    public URLContentDTO getURLContent(String url) throws ResourceNotFoundException {
        StringBuilder source = new StringBuilder();
        URLConnection connection = null;
        try {
            connection = new URI(url).toURL().openConnection();
            BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                source.append(inputLine);
            }
            in.close();
        } catch (Exception e) {
            throw new ResourceNotFoundException("Resource not found");
        }

        return htmlSanitizer.sanitize(source.toString());
    }
}
