package com.github.irmindev.graph_news.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import com.github.irmindev.graph_news.model.entity.News;
import com.github.irmindev.graph_news.model.entity.User;
import com.github.irmindev.graph_news.model.enums.Role;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("NewsRepository Tests")
class NewsRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private NewsRepository newsRepository;

    private User testUser;
    private News testNews1;
    private News testNews2;

    @BeforeEach
    void setUp() {
        // Create test user using constructor that sets required fields
        testUser = new User("Test User", "test@example.com", "encodedPassword", Role.USER);
        testUser = entityManager.persistAndFlush(testUser);

        // Create news using constructor
        testNews1 = new News("Technology News", "Content about technology trends", testUser);
        // Override createdAt for testing purposes
        testNews1.setCreatedAt(LocalDateTime.now().minusDays(1));
        testNews1 = entityManager.persistAndFlush(testNews1);

        testNews2 = new News("Sports Update", "Latest sports results and news", testUser);
        testNews2.setCreatedAt(LocalDateTime.now());
        testNews2 = entityManager.persistAndFlush(testNews2);

        entityManager.clear(); // Clear persistence context
    }

    @Test
    @DisplayName("Should find news by author")
    void shouldFindNewsByAuthor() {
        // When
        List<News> result = newsRepository.findByAuthor(testUser);

        // Then
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(news -> news.getAuthor().getId().equals(testUser.getId())));
    }

    @Test
    @DisplayName("Should find news by author with pagination")
    void shouldFindNewsByAuthorWithPagination() {
        // Given
        Pageable pageable = PageRequest.of(0, 1);

        // When
        Page<News> result = newsRepository.findByAuthor(testUser, pageable);

        // Then
        assertEquals(1, result.getContent().size());
        assertEquals(2, result.getTotalElements());
        assertEquals(2, result.getTotalPages());
    }

    @Test
    @DisplayName("Should find news by date range")
    void shouldFindNewsByDateRange() {
        // Given
        LocalDateTime startDate = LocalDateTime.now().minusDays(2);
        LocalDateTime endDate = LocalDateTime.now().plusDays(1);

        // When
        List<News> result = newsRepository.findByCreatedAtBetween(startDate, endDate);

        // Then
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Should find latest news ordered by creation date")
    void shouldFindLatestNewsOrderedByCreationDate() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        List<News> result = newsRepository.findAllByOrderByCreatedAtDesc(pageable);

        // Then
        assertEquals(2, result.size());
        assertTrue(result.get(0).getCreatedAt().isAfter(result.get(1).getCreatedAt()));
    }

    @Test
    @DisplayName("Should find all news")
    void shouldFindAllNews() {
        // When
        List<News> result = newsRepository.findAll();

        // Then
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Should save new news")
    void shouldSaveNewNews() {
        // Given
        News newNews = new News("Breaking News", "This is breaking news content", testUser);

        // When
        News saved = newsRepository.save(newNews);

        // Then
        assertNotNull(saved.getId());
        assertEquals("Breaking News", saved.getTitle());
        assertEquals("This is breaking news content", saved.getContent());
        assertEquals(testUser.getId(), saved.getAuthor().getId());
        assertNotNull(saved.getCreatedAt());
    }
}