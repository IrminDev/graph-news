package com.github.irmindev.graph_news.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.DeleteMapping;

import com.github.irmindev.graph_news.model.dto.NewsDTO;
import com.github.irmindev.graph_news.model.request.news.CreateNews;
import com.github.irmindev.graph_news.model.response.news.NewsUpload;
import com.github.irmindev.graph_news.model.response.news.NewsResponse;
import com.github.irmindev.graph_news.service.NewsService;
import com.github.irmindev.graph_news.utils.JwtUtil;
import com.github.irmindev.graph_news.model.exception.EntityNotFoundException;
import com.github.irmindev.graph_news.model.exception.UnallowedMethodException;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

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
            newsService.createNews(
                createNewsWithContent.getTitle(), 
                createNewsWithContent.getContent(), 
                id
            )
        ));
    }

    /**
     * Obtiene todas las noticias con paginación
     */
    @GetMapping
    public ResponseEntity<?> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("asc") ? 
                Sort.by(sortBy).ascending() : 
                Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<NewsDTO> newsPage = newsService.getAllNews(pageable);
        
        return ResponseEntity.ok(
            new NewsResponse.SuccessList(
                newsPage.getContent(),
                newsPage.getTotalElements()
            )
        );
    }
    
    /**
     * Obtiene una noticia específica por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getNewsById(@PathVariable Long id) {
        try {
            NewsDTO news = newsService.getNewsById(id);
            return ResponseEntity.ok(new NewsResponse.Success(news));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new NewsResponse.Failure("News not found"));
        }
    }
    
    /**
     * Obtiene noticias de un usuario específico
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getNewsByUser(@PathVariable Long userId) {
        try {
            List<NewsDTO> news = newsService.getNewsByAuthor(userId);
            return ResponseEntity.ok(new NewsResponse.SuccessList(news));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new NewsResponse.Failure("User not found"));
        }
    }
    
    /**
     * Obtiene noticias de un usuario con paginación
     */
    @GetMapping("/user/{userId}/paged")
    public ResponseEntity<?> getNewsByUserPaged(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<NewsDTO> newsPage = newsService.getNewsByAuthor(userId, pageable);
            
            return ResponseEntity.ok(
                new NewsResponse.SuccessList(
                    newsPage.getContent(),
                    newsPage.getTotalElements()
                )
            );
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new NewsResponse.Failure("User not found"));
        }
    }
    
   /**
     * Search for news articles containing the specified query in title or content
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchNews(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new NewsResponse.Failure("Search query cannot be empty"));
            }
            
            Page<NewsDTO> newsPage = newsService.searchNews(query, page, size);
            
            // Create response with paginated results
            List<NewsDTO> newsList = newsPage.getContent();
            return ResponseEntity.ok(
                new NewsResponse.SuccessList(
                    newsList,
                    newsPage.getTotalElements()
                )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new NewsResponse.Failure("Error searching news: " + e.getMessage()));
        }
    }
    
    /**
     * Obtiene noticias por rango de fechas
     */
    @GetMapping("/date-range")
    public ResponseEntity<?> getNewsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        if (page >= 0 && size > 0) {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<NewsDTO> newsPage = newsService.getNewsByDateRange(startDate, endDate, pageable);
            
            return ResponseEntity.ok(
                new NewsResponse.SuccessList(
                    newsPage.getContent(),
                    newsPage.getTotalElements()
                )
            );
        } else {
            List<NewsDTO> news = newsService.getNewsByDateRange(startDate, endDate);
            return ResponseEntity.ok(new NewsResponse.SuccessList(news));
        }
    }
    
    /**
     * Obtiene las noticias más recientes
     */
    @GetMapping("/latest")
    public ResponseEntity<?> getLatestNews(
            @RequestParam(defaultValue = "5") int limit) {
        
        List<NewsDTO> news = newsService.getLatestNews(limit);
        return ResponseEntity.ok(new NewsResponse.SuccessList(news));
    }
    
    /**
     * Elimina una noticia por su ID, verificando que el usuario sea el autor o un administrador
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNews(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        
        // Extraer ID y rol del usuario desde el token
        Long userId = jwtUtil.extractClaim(token.replace("Bearer ", ""), 
            claims -> claims.get("id", Long.class));
        
        String userRole = jwtUtil.extractClaim(token.replace("Bearer ", ""), 
            claims -> claims.get("role", String.class));
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new NewsResponse.Failure("Invalid authentication"));
        }
        
        try {
            // Ahora recibimos la noticia eliminada
            NewsDTO deletedNews = newsService.deleteNews(id, userId, userRole);
            
            // Usamos la información en la respuesta
            return ResponseEntity.ok(new NewsResponse.Success(deletedNews));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new NewsResponse.Failure("News not found"));
        } catch (UnallowedMethodException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new NewsResponse.Failure(e.getMessage()));
        }
    }

    /**
     * Gets news articles related to the specified news ID based on shared entities
     */
    @GetMapping("/{id}/related")
    public ResponseEntity<?> getRelatedNews(
            @PathVariable Long id,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<NewsDTO> relatedNews = newsService.getRelatedNews(id, limit);
            return ResponseEntity.ok(new NewsResponse.SuccessList(relatedNews));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new NewsResponse.Failure("News not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new NewsResponse.Failure("Error retrieving related news: " + e.getMessage()));
        }
    }
}
