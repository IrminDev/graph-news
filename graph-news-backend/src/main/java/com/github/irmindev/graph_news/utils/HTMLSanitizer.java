package com.github.irmindev.graph_news.utils;

import org.springframework.stereotype.Component;

import com.github.irmindev.graph_news.model.dto.NewsDTO;
import com.github.irmindev.graph_news.model.exception.news.HTMLInvalidFormatException;

import static java.lang.Boolean.FALSE;
import static java.lang.Boolean.TRUE;

@Component
public class HTMLSanitizer {
    //This is the first version of the HTML Sanitizer
    //It is a basic Sanitizer that doesn't validate all the possible configuration
    //It only search the h1 tag and all the p tags
    //And also doesn't consider if there is an '>' or an '<' character in the content
    //It assumes that '<' and '>' are part of a tag
    public NewsDTO sanitize(String html) throws HTMLInvalidFormatException{
        StringBuilder title = new StringBuilder();
        StringBuilder content = new StringBuilder();
        StringBuilder tag = new StringBuilder();
        boolean ontitle = FALSE;
        boolean ontag = FALSE;
        boolean oncontent = FALSE;
        int length = html.length();
        char c;
        for(int i = 0; i < length; ++ i){
            c = html.charAt(i);
            //It is a new tag
            if(c == '<'){
                ontag = TRUE;
                tag = new StringBuilder();
                continue;
            }
            if(c == '\n') continue;
            if(c == '>'){
                ontag = FALSE;
                if(tag.length() == 0) continue;
                //The tag is closed
                if(tag.charAt(0) == '/'){
                    //verifying that is the end of the title
                    if(tag.length() >= 3){
                        if(tag.charAt(1) == 'h' && tag.charAt(2) == '1'){
                            ontitle = FALSE;
                            continue;
                        }
                    }
                    //verifying that is the end of a paragraph
                    if(tag.length() >= 2){
                        if(tag.charAt(1) == 'p'){
                            if(tag.length() > 2){
                                if(tag.charAt(2) != ' ') continue;
                                oncontent = FALSE;
                            }
                            continue;
                        }
                    }
                    continue;
                }
                if(tag.length() >= 1){
                    if(tag.charAt(0) == 'p'){
                        if(tag.length() > 1){
                            if(tag.charAt(1) != ' ') continue;
                        }
                        oncontent = TRUE;
                    }
                }
                if(tag.length() >= 2){
                    if(tag.charAt(0) == 'h' && tag.charAt(1) == '1'){
                        ontitle = TRUE;
                        continue;
                    }
                }
                continue;
            }
            if(ontag){
                tag.append(c);
                continue;
            }
            if(!ontitle && !oncontent) continue;
            if(ontitle){
                title.append(c);
                continue;
            }
            content.append(c);
        }
        if(title.toString().equals("") || content.toString().equals("")){
            throw new HTMLInvalidFormatException();
        }
        return new NewsDTO(null, title.toString(), content.toString());
    }
}
