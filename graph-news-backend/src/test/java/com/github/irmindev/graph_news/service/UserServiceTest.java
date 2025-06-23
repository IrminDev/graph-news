package com.github.irmindev.graph_news.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

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
import org.springframework.security.crypto.password.PasswordEncoder;

import com.github.irmindev.graph_news.model.dto.UserDTO;
import com.github.irmindev.graph_news.model.entity.User;
import com.github.irmindev.graph_news.model.enums.Role;
import com.github.irmindev.graph_news.model.exception.EntityNotFoundException;
import com.github.irmindev.graph_news.model.exception.user.AlreadyUsedEmailException;
import com.github.irmindev.graph_news.model.exception.user.IncorrectCredentialsException;
import com.github.irmindev.graph_news.model.request.auth.SignUpRequest;
import com.github.irmindev.graph_news.repository.UserRepository;

import java.util.Arrays;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);

        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setRole(Role.USER);
        testUser.setIsActive(true);
    }

    @Test
    @DisplayName("Should login successfully with correct credentials")
    void shouldLoginSuccessfullyWithCorrectCredentials() throws EntityNotFoundException, IncorrectCredentialsException {
        // Given
        String email = "test@example.com";
        String password = "password123";
        
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(password, testUser.getPassword())).thenReturn(true);

        // When
        UserDTO result = userService.login(email, password);

        // Then
        assertNotNull(result);
        assertEquals("Test User", result.getName());
        assertEquals(email, result.getEmail());
        verify(userRepository).findByEmail(email);
        verify(passwordEncoder).matches(password, testUser.getPassword());
    }

    @Test
    @DisplayName("Should throw IncorrectCredentialsException for wrong email")
    void shouldThrowIncorrectCredentialsExceptionForWrongEmail() {
        // Given
        String email = "wrong@example.com";
        String password = "password123";
        
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(IncorrectCredentialsException.class, () -> {
            userService.login(email, password);
        });
        
        verify(userRepository).findByEmail(email);
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    @DisplayName("Should throw IncorrectCredentialsException for wrong password")
    void shouldThrowIncorrectCredentialsExceptionForWrongPassword() {
        // Given
        String email = "test@example.com";
        String password = "wrongPassword";
        
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(password, testUser.getPassword())).thenReturn(false);

        // When & Then
        assertThrows(IncorrectCredentialsException.class, () -> {
            userService.login(email, password);
        });
        
        verify(userRepository).findByEmail(email);
        verify(passwordEncoder).matches(password, testUser.getPassword());
    }

    @Test
    @DisplayName("Should get user by ID successfully")
    void shouldGetUserByIdSuccessfully() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When
        UserDTO result = userService.getUser(1L);

        // Then
        assertNotNull(result);
        assertEquals("Test User", result.getName());
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when user not found")
    void shouldThrowEntityNotFoundExceptionWhenUserNotFound() {
        // Given
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(EntityNotFoundException.class, () -> {
            userService.getUser(999L);
        });
        
        verify(userRepository).findById(999L);
    }

    @Test
    @DisplayName("Should create user successfully")
    void shouldCreateUserSuccessfully() throws AlreadyUsedEmailException {
        // Given
        SignUpRequest request = new SignUpRequest();
        request.setName("New User");
        request.setEmail("new@example.com");
        request.setPassword("password123");
        
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        UserDTO result = userService.createUser(request);

        // Then
        assertNotNull(result);
        verify(userRepository).findByEmail(request.getEmail());
        verify(passwordEncoder).encode(request.getPassword());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw AlreadyUsedEmailException when email exists")
    void shouldThrowAlreadyUsedEmailExceptionWhenEmailExists() {
        // Given
        SignUpRequest request = new SignUpRequest();
        request.setName("New User");
        request.setEmail("test@example.com");
        request.setPassword("password123");
        
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));

        // When & Then
        assertThrows(AlreadyUsedEmailException.class, () -> {
            userService.createUser(request);
        });
        
        verify(userRepository).findByEmail(request.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should get all users with pagination")
    void shouldGetAllUsersWithPagination() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> userPage = new PageImpl<>(Arrays.asList(testUser), pageable, 1);
        
        when(userRepository.findAll(pageable)).thenReturn(userPage);

        // When
        Page<UserDTO> result = userService.getAllUsers(pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Test User", result.getContent().get(0).getName());
        verify(userRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should delete user (soft delete)")
    void shouldDeleteUserSoftDelete() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        UserDTO result = userService.deleteUser(1L);

        // Then
        assertNotNull(result);
        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
        assertFalse(testUser.getIsActive()); // Should be soft deleted
    }
}