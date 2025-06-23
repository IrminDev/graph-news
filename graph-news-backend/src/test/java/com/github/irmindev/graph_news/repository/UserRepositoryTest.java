package com.github.irmindev.graph_news.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import com.github.irmindev.graph_news.model.entity.User;
import com.github.irmindev.graph_news.model.enums.Role;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("UserRepository Tests")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Create user using constructor that sets all required fields
        testUser = new User("Test User", "test@example.com", "encodedPassword", Role.USER);
        testUser = entityManager.persistAndFlush(testUser);
        entityManager.clear(); // Clear persistence context
    }

    @Test
    @DisplayName("Should find user by email")
    void shouldFindUserByEmail() {
        // When
        Optional<User> result = userRepository.findByEmail("test@example.com");

        // Then
        assertTrue(result.isPresent());
        assertEquals("Test User", result.get().getName());
        assertEquals("test@example.com", result.get().getEmail());
    }

    @Test
    @DisplayName("Should return empty when user not found by email")
    void shouldReturnEmptyWhenUserNotFoundByEmail() {
        // When
        Optional<User> result = userRepository.findByEmail("nonexistent@example.com");

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    @DisplayName("Should save and find user by ID")
    void shouldSaveAndFindUserById() {
        // Given
        User newUser = new User("New User", "new@example.com", "encodedPassword", Role.USER);

        // When
        User saved = userRepository.save(newUser);
        Optional<User> found = userRepository.findById(saved.getId());

        // Then
        assertTrue(found.isPresent());
        assertEquals("New User", found.get().getName());
        assertEquals("new@example.com", found.get().getEmail());
        assertEquals(Role.USER, found.get().getRole());
        assertTrue(found.get().getIsActive());
        assertNotNull(found.get().getCreatedAt());
    }

    @Test
    @DisplayName("Should find all users")
    void shouldFindAllUsers() {
        // Given - testUser already created in setUp
        User secondUser = new User("Second User", "second@example.com", "password", Role.ADMIN);
        userRepository.save(secondUser);

        // When
        List<User> result = userRepository.findAll();

        // Then
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Should save user with all roles")
    void shouldSaveUserWithAllRoles() {
        // Given
        User adminUser = new User("Admin User", "admin@example.com", "password", Role.ADMIN);
        User regularUser = new User("Regular User", "regular@example.com", "password", Role.USER);

        // When
        User savedAdmin = userRepository.save(adminUser);
        User savedRegular = userRepository.save(regularUser);

        // Then
        assertEquals(Role.ADMIN, savedAdmin.getRole());
        assertEquals(Role.USER, savedRegular.getRole());
        assertTrue(savedAdmin.getIsActive());
        assertTrue(savedRegular.getIsActive());
    }

    @Test
    @DisplayName("Should check UserDetails methods")
    void shouldCheckUserDetailsMethods() {
        // When
        Optional<User> result = userRepository.findByEmail("test@example.com");

        // Then
        assertTrue(result.isPresent());
        User user = result.get();
        
        // Test UserDetails interface methods
        assertEquals("test@example.com", user.getUsername());
        assertTrue(user.isAccountNonExpired());
        assertTrue(user.isAccountNonLocked());
        assertTrue(user.isCredentialsNonExpired());
        assertTrue(user.isEnabled());
        assertFalse(user.getAuthorities().isEmpty());
        assertEquals("USER", user.getAuthorities().iterator().next().getAuthority());
    }
}