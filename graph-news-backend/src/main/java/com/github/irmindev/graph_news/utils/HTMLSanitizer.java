package com.github.irmindev.graph_news.utils;

import org.springframework.stereotype.Component;
import com.github.irmindev.graph_news.model.dto.NewsDTO;
import com.github.irmindev.graph_news.model.exception.news.HTMLInvalidFormatException;

@Component
public class HTMLSanitizer {

    public NewsDTO sanitize(String html) throws HTMLInvalidFormatException {
        String title = extractTitle(html);
        String content = extractContent(html);

        if (title.isEmpty() || content.isEmpty()) {
            throw new HTMLInvalidFormatException();
        }

        return new NewsDTO(null, title, content, null);
    }

    private String extractTitle(String html) {
        // Extract the content of the <title> tag
        int titleStart = html.indexOf("<title>");
        int titleEnd = html.indexOf("</title>");

        if (titleStart == -1 || titleEnd == -1) {
            return ""; // No title tag found
        }

        // Extract the title content
        return html.substring(titleStart + 7, titleEnd).trim();
    }

    private String extractContent(String html) {
        StringBuilder content = new StringBuilder();
        int startIndex = 0;

        // Loop through all <p> tags
        while (true) {
            int pStart = html.indexOf("<p", startIndex);
            if (pStart == -1) {
                break; // No more <p> tags found
            }

            int pEnd = html.indexOf("</p>", pStart);
            if (pEnd == -1) {
                break; // No closing </p> tag found
            }

            // Extract the content inside the <p> tag
            String paragraph = html.substring(pStart, pEnd);
            int contentStart = paragraph.indexOf(">") + 1;
            String paragraphContent = paragraph.substring(contentStart).trim();

            // Remove all inner tags (e.g., <b>, <span>, <a>, etc.)
            String plainText = removeInnerTags(paragraphContent);

            // Append the plain text to the result
            if (!plainText.isEmpty()) {
                content.append(plainText).append("\n");
            }

            // Move the start index to the end of the current <p> tag
            startIndex = pEnd + 4;
        }

        return content.toString().trim();
    }

    private String removeInnerTags(String html) {
        StringBuilder plainText = new StringBuilder();
        boolean insideTag = false;

        for (int i = 0; i < html.length(); i++) {
            char c = html.charAt(i);

            if (c == '<') {
                insideTag = true; // Start of a tag
            } else if (c == '>') {
                insideTag = false; // End of a tag
            } else if (!insideTag) {
                plainText.append(c); // Append only text outside tags
            }
        }

        return plainText.toString().trim();
    }
}