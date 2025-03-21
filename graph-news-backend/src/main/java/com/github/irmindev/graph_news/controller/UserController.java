package com.github.irmindev.graph_news.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.irmindev.graph_news.model.dto.UserDTO;
import com.github.irmindev.graph_news.model.enums.Role;
import com.github.irmindev.graph_news.model.exception.AlreadyUsedEmailException;
import com.github.irmindev.graph_news.model.exception.EntityNotFoundException;
import com.github.irmindev.graph_news.model.exception.IncorrectCredentialsException;
import com.github.irmindev.graph_news.model.exception.UnallowedMethodException;
import com.github.irmindev.graph_news.model.request.LoginRequest;
import com.github.irmindev.graph_news.model.request.SignUpRequest;
import com.github.irmindev.graph_news.model.request.UpdateUserRequest;
import com.github.irmindev.graph_news.model.response.GetUserResponse;
import com.github.irmindev.graph_news.model.response.ListUsersResponse;
import com.github.irmindev.graph_news.model.response.LoginResponse;
import com.github.irmindev.graph_news.model.response.SignUpResponse;
import com.github.irmindev.graph_news.model.response.UpdateResponse;
import com.github.irmindev.graph_news.service.UserService;
import com.github.irmindev.graph_news.utils.JwtUtil;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Autowired
    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) throws EntityNotFoundException, IncorrectCredentialsException {
        UserDTO user = userService.login(loginRequest.getEmail(), loginRequest.getPassword());
        Map<String, Object> payload = Map.of("id", user.getId(), "email", user.getEmail(), "role", user.getRole().name());
        String token = jwtUtil.generateToken(payload, user.getEmail());
        return ResponseEntity.ok(new LoginResponse.Success(token, user));
    }

    @PostMapping("/signup")
    public ResponseEntity<SignUpResponse> signUp(@RequestBody SignUpRequest signUpRequest) throws AlreadyUsedEmailException {
        UserDTO user = userService.createUser(signUpRequest);
        Map<String, Object> payload = Map.of("id", user.getId(), "email", user.getEmail(), "role", user.getRole());
        String token = jwtUtil.generateToken(payload, user.getEmail());

        return ResponseEntity.ok(new SignUpResponse.Success(user, token));
    }

    @GetMapping("/me")
    public ResponseEntity<GetUserResponse> me(@RequestHeader("Authorization") String token) {
        Long id = jwtUtil.extractClaim(
            token.replace("Bearer ", ""),
            claims -> claims.get("id", Long.class)
        );

        UserDTO user = userService.getUser(id);

        return ResponseEntity.ok(new GetUserResponse.Success(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GetUserResponse> getUser(@RequestHeader("Authorization") String token, @PathVariable Long id)
    throws EntityNotFoundException, UnallowedMethodException {
        UserDTO user = userService.getUser(id);
        Long idUser = jwtUtil.extractClaim(
            token.replace("Bearer ", ""),
            claims -> claims.get("id", Long.class)
        );

        Role role = jwtUtil.extractClaim(
            token.replace("Bearer ", ""),
            claims -> Role.valueOf(claims.get("role", String.class))
        );
        
        if (user.getId() != idUser && role != Role.ADMIN) {
            throw new UnallowedMethodException("You are not allowed to access this resource");
        }

        return ResponseEntity.ok(new GetUserResponse.Success(user));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ListUsersResponse> getAllUsers() {
        return ResponseEntity.ok(new ListUsersResponse.Success(userService.getAllUsers()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UpdateResponse> deleteUser(@PathVariable Long id) throws EntityNotFoundException {
        UserDTO user = userService.deleteUser(id);
        return ResponseEntity.ok(new UpdateResponse.Success(user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UpdateResponse> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request)
    throws EntityNotFoundException, AlreadyUsedEmailException {
        UserDTO user = userService.updateUser(id, request);
        return ResponseEntity.ok(new UpdateResponse.Success(user));
    }

    @GetMapping("/debug")
    public ResponseEntity<String> debug() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok("Current user: " + authentication.getName() + ", Authorities: " + authentication.getAuthorities());
    }
}
