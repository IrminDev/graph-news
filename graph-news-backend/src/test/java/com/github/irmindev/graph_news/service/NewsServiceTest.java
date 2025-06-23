package com.github.irmindev.graph_news.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.github.irmindev.graph_news.model.dto.NewsDTO;
import com.github.irmindev.graph_news.model.entity.News;
import com.github.irmindev.graph_news.model.entity.User;
import com.github.irmindev.graph_news.model.enums.Role;
import com.github.irmindev.graph_news.model.exception.EntityNotFoundException;
import com.github.irmindev.graph_news.repository.NewsRepository;
import com.github.irmindev.graph_news.repository.UserRepository;
import com.github.irmindev.graph_news.utils.HTMLSanitizer;

@ExtendWith(MockitoExtension.class)
@DisplayName("NewsService Unit Tests")
class NewsServiceTest {

    @Mock
    private NewsRepository newsRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HTMLSanitizer htmlSanitizer;

    @Mock
    private StanfordNLPProcessor stanfordNLPProcessor;

    @Mock
    private Neo4jGraphService neo4jGraphService;

    private NewsService newsService;

    private User testUser;
    private User adminUser;
    private News testNews;

    @BeforeEach
    void setUp() {
        newsService = new NewsService(htmlSanitizer, newsRepository, userRepository, 
                                    stanfordNLPProcessor, neo4jGraphService);

        // Create test user
        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setRole(Role.USER);
        testUser.setIsActive(true);

        // Create admin user
        adminUser = new User();
        adminUser.setName("Admin User");
        adminUser.setEmail("admin@example.com");
        adminUser.setRole(Role.ADMIN);
        adminUser.setIsActive(true);

        // Create test news
        testNews = new News();
        testNews.setTitle("Test News Title");
        testNews.setContent("Test news content");
        testNews.setAuthor(testUser);
        testNews.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should get news by ID successfully")
    void shouldGetNewsByIdSuccessfully() {
        // Given
        when(newsRepository.findById(1L)).thenReturn(Optional.of(testNews));

        // When
        NewsDTO result = newsService.getNewsById(1L);

        // Then
        assertNotNull(result);
        assertEquals("Test News Title", result.getTitle());
        assertEquals("Test news content", result.getContent());
        verify(newsRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when news not found")
    void shouldThrowEntityNotFoundExceptionWhenNewsNotFound() {
        // Given
        when(newsRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(EntityNotFoundException.class, () -> {
            newsService.getNewsById(999L);
        });
        
        verify(newsRepository).findById(999L);
    }

    @Test
    @DisplayName("Should get all news with pagination")
    void shouldGetAllNewsWithPagination() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<News> newsList = Arrays.asList(testNews);
        Page<News> newsPage = new PageImpl<>(newsList, pageable, 1);
        
        when(newsRepository.findAll(pageable)).thenReturn(newsPage);

        // When
        Page<NewsDTO> result = newsService.getAllNews(pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        assertEquals("Test News Title", result.getContent().get(0).getTitle());
        verify(newsRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should search news successfully")
    void shouldSearchNewsSuccessfully() {
        // Given
        String query = "test";
        List<News> newsList = Arrays.asList(testNews);
        Page<News> newsPage = new PageImpl<>(newsList, PageRequest.of(0, 10), 1);
        
        when(newsRepository.searchByTitleOrContent(eq(query), any(Pageable.class)))
            .thenReturn(newsPage);

        // When
        Page<NewsDTO> result = newsService.searchNews(query, 0, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Test News Title", result.getContent().get(0).getTitle());
        verify(newsRepository).searchByTitleOrContent(eq(query), any(Pageable.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException for empty search query")
    void shouldThrowIllegalArgumentExceptionForEmptyQuery() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            newsService.searchNews("", 0, 10);
        });
        
        assertThrows(IllegalArgumentException.class, () -> {
            newsService.searchNews(null, 0, 10);
        });
    }

    @Test
    @DisplayName("Should get news by author with pagination")
    void shouldGetNewsByAuthorWithPagination() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<News> newsList = Arrays.asList(testNews);
        Page<News> newsPage = new PageImpl<>(newsList, pageable, 1);
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(newsRepository.findByAuthor(testUser, pageable)).thenReturn(newsPage);

        // When
        Page<NewsDTO> result = newsService.getNewsByAuthor(1L, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Test News Title", result.getContent().get(0).getTitle());
        verify(userRepository).findById(1L);
        verify(newsRepository).findByAuthor(testUser, pageable);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when author not found")
    void shouldThrowEntityNotFoundExceptionWhenAuthorNotFound() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(EntityNotFoundException.class, () -> {
            newsService.getNewsByAuthor(999L, pageable);
        });
        
        verify(userRepository).findById(999L);
    }

    @Test
    @DisplayName("Should get latest news successfully")
    void shouldGetLatestNewsSuccessfully() {
        // Given
        List<News> newsList = Arrays.asList(testNews);
        when(newsRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
            .thenReturn(newsList);

        // When
        List<NewsDTO> result = newsService.getLatestNews(5);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test News Title", result.get(0).getTitle());
        verify(newsRepository).findAllByOrderByCreatedAtDesc(any(Pageable.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException for invalid limit")
    void shouldThrowIllegalArgumentExceptionForInvalidLimit() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            newsService.getLatestNews(0);
        });
        
        assertThrows(IllegalArgumentException.class, () -> {
            newsService.getLatestNews(-1);
        });
    }
}