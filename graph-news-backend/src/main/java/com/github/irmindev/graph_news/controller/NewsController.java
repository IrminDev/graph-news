package com.github.irmindev.graph_news.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.github.irmindev.graph_news.model.dto.NewsDTO;
import com.github.irmindev.graph_news.model.request.news.CreateNews;
import com.github.irmindev.graph_news.model.response.news.NewsUpload;
import com.github.irmindev.graph_news.service.NewsService;
import com.github.irmindev.graph_news.utils.JwtUtil;

@RestController
@RequestMapping("/api/news")
public class NewsController {
    private final NewsService newsService;
    private final JwtUtil jwtUtil;

    public NewsController(NewsService newsService, JwtUtil jwtUtil) {
        this.newsService = newsService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/upload/url")
    public ResponseEntity<NewsUpload> createNewsFromUrl(@RequestBody CreateNews.CreateNewsWithURL createNewsWithURL, @RequestHeader("Authorization") String token) {
        Long id = jwtUtil.extractClaim(token.replace("Bearer ", ""), 
            claims -> claims.get("id", Long.class)
        );

        if(id == null) {
            return ResponseEntity.badRequest().body(new NewsUpload.Failure());
        }

        return ResponseEntity.ok(new NewsUpload.Success(
            newsService.createFromUrl(createNewsWithURL.getUrl(), id)
        ));
    }

    @PostMapping("/upload/file")
    public ResponseEntity<NewsUpload> createNewsFromFile(
        @RequestPart("file") MultipartFile file,
        @RequestPart("request") CreateNews.CreateNewsWithFile createNewsWithFile,
        @RequestHeader("Authorization") String token
    ) {
        Long id = jwtUtil.extractClaim(token.replace("Bearer ", ""), 
            claims -> claims.get("id", Long.class)
        );

        if(id == null) {
            return ResponseEntity.badRequest().body(new NewsUpload.Failure());
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        }
        
        NewsDTO result;
        
        switch (fileExtension) {
            case "doc":
            case "docx":
                result = newsService.createFromDocx(file, createNewsWithFile.getTitle(), id);
                break;
            case "pdf":
                result = newsService.createFromPdf(file, createNewsWithFile.getTitle(), id);
                break;
            default:
                // For txt files or any other file type not explicitly handled
                result = newsService.createFromTxt(file, createNewsWithFile.getTitle(), id);
                break;
        }
        
        return ResponseEntity.ok(new NewsUpload.Success(result));
    }

    @PostMapping("/upload/content")
    public ResponseEntity<NewsUpload> createNewsFromContent(
        @RequestBody CreateNews.CreateNewsWithContent createNewsWithContent,
        @RequestHeader("Authorization") String token
    ) {
        Long id = jwtUtil.extractClaim(token.replace("Bearer ", ""), 
            claims -> claims.get("id", Long.class)
        );

        if(id == null) {
            return ResponseEntity.badRequest().body(new NewsUpload.Failure());
        }

        return ResponseEntity.ok(new NewsUpload.Success(
            newsService.createNews(createNewsWithContent.getTitle(), createNewsWithContent.getContent(), id)
        ));
    }
}
