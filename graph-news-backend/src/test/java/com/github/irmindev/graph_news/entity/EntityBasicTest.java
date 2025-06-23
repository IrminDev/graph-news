package com.github.irmindev.graph_news.entity;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.github.irmindev.graph_news.model.entity.News;
import com.github.irmindev.graph_news.model.entity.User;
import com.github.irmindev.graph_news.model.enums.Role;

@DisplayName("Entity Basic Tests")
class EntityBasicTest {

    @Test
    @DisplayName("Should create User entity correctly")
    void shouldCreateUserEntityCorrectly() {
        // When
        User user = new User("John Doe", "john@example.com", "password123", Role.USER);

        // Then
        assertNotNull(user);
        assertEquals("John Doe", user.getName());
        assertEquals("john@example.com", user.getEmail());
        assertEquals("password123", user.getPassword());
        assertEquals(Role.USER, user.getRole());
        assertTrue(user.getIsActive());
        assertNotNull(user.getCreatedAt());
        
        // Test UserDetails methods
        assertEquals("john@example.com", user.getUsername());
        assertTrue(user.isEnabled());
        assertTrue(user.isAccountNonLocked());
        assertFalse(user.getAuthorities().isEmpty());
    }

    @Test
    @DisplayName("Should create News entity correctly")
    void shouldCreateNewsEntityCorrectly() {
        // Given
        User author = new User("Jane Doe", "jane@example.com", "password", Role.USER);

        // When
        News news = new News("Breaking News", "This is the content of breaking news", author);

        // Then
        assertNotNull(news);
        assertEquals("Breaking News", news.getTitle());
        assertEquals("This is the content of breaking news", news.getContent());
        assertEquals(author, news.getAuthor());
        assertNotNull(news.getCreatedAt());
    }

    @Test
    @DisplayName("Should handle User setters correctly")
    void shouldHandleUserSettersCorrectly() {
        // Given
        User user = new User();

        // When
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword("newPassword");
        user.setRole(Role.ADMIN);
        user.setIsActive(false);

        // Then
        assertEquals("Test User", user.getName());
        assertEquals("test@example.com", user.getEmail());
        assertEquals("newPassword", user.getPassword());
        assertEquals(Role.ADMIN, user.getRole());
        assertFalse(user.getIsActive());
    }

    @Test
    @DisplayName("Should handle News setters correctly")
    void shouldHandleNewsSettersCorrectly() {
        // Given
        News news = new News();
        User author = new User("Author", "author@example.com", "pass", Role.USER);
        LocalDateTime testDate = LocalDateTime.now();

        // When
        news.setTitle("Updated Title");
        news.setContent("Updated content");
        news.setAuthor(author);
        news.setCreatedAt(testDate);

        // Then
        assertEquals("Updated Title", news.getTitle());
        assertEquals("Updated content", news.getContent());
        assertEquals(author, news.getAuthor());
        assertEquals(testDate, news.getCreatedAt());
    }

    @Test
    @DisplayName("Should handle Role enum correctly")
    void shouldHandleRoleEnumCorrectly() {
        // Given
        User adminUser = new User("Admin", "admin@example.com", "pass", Role.ADMIN);
        User regularUser = new User("User", "user@example.com", "pass", Role.USER);

        // Then
        assertEquals(Role.ADMIN, adminUser.getRole());
        assertEquals(Role.USER, regularUser.getRole());
        assertEquals("ADMIN", adminUser.getAuthorities().iterator().next().getAuthority());
        assertEquals("USER", regularUser.getAuthorities().iterator().next().getAuthority());
    }
}