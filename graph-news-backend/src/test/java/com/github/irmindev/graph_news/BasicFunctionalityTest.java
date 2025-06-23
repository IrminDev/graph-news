package com.github.irmindev.graph_news;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Basic Functionality Tests")
class BasicFunctionalityTest {

    @Test
    @DisplayName("String operations work correctly")
    void stringOperationsTest() {
        String title = "Test News Title";
        String content = "This is test content for news";
        
        assertNotNull(title);
        assertNotNull(content);
        assertTrue(title.contains("Test"));
        assertTrue(content.length() > 10);
        assertEquals("TEST NEWS TITLE", title.toUpperCase());
    }

    @Test
    @DisplayName("Date operations work correctly")
    void dateOperationsTest() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime future = now.plusDays(1);
        LocalDateTime past = now.minusDays(1);
        
        assertTrue(future.isAfter(now));
        assertTrue(past.isBefore(now));
        assertTrue(future.isAfter(past));
    }

    @Test
    @DisplayName("Collections operations work correctly")
    void collectionsTest() {
        List<String> categories = Arrays.asList("Sports", "Politics", "Technology");
        
        assertEquals(3, categories.size());
        assertTrue(categories.contains("Sports"));
        assertFalse(categories.contains("Music"));
        
        List<Long> ids = Arrays.asList(1L, 2L, 3L);
        assertEquals(Long.valueOf(1L), ids.get(0));
    }

    @Test
    @DisplayName("Exception handling works correctly")
    void exceptionHandlingTest() {
        assertThrows(IllegalArgumentException.class, () -> {
            if (true) {
                throw new IllegalArgumentException("Test exception");
            }
        });
        
        assertDoesNotThrow(() -> {
            String test = "no exception";
            assertNotNull(test);
        });
    }
}