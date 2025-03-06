package com.github.irmindev.graph_news.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.github.irmindev.graph_news.model.dto.UserDTO;
import com.github.irmindev.graph_news.model.entity.User;
import com.github.irmindev.graph_news.model.enums.Role;
import com.github.irmindev.graph_news.model.exception.AlreadyUsedEmailException;
import com.github.irmindev.graph_news.model.exception.EntityNotFoundException;
import com.github.irmindev.graph_news.model.exception.IncorrectCredentialsException;
import com.github.irmindev.graph_news.model.mapper.UserMapper;
import com.github.irmindev.graph_news.model.request.SignUpRequest;
import com.github.irmindev.graph_news.model.request.UpdateUserRequest;
import com.github.irmindev.graph_news.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDTO login(String email, String password) throws IncorrectCredentialsException,
        EntityNotFoundException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IncorrectCredentialsException());
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IncorrectCredentialsException();
        }

        if(!user.getIsActive()){
            throw new EntityNotFoundException();
        }

        return UserMapper.toDto(user);
    }

    public UserDTO getUser(Long id) throws EntityNotFoundException {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException());
        if(!user.getIsActive()){
            throw new EntityNotFoundException();
        }
        return UserMapper.toDto(user);
    }

    public UserDTO createUser(SignUpRequest request) throws AlreadyUsedEmailException {
        if (userRepository.findByEmail(request.getEmail()).orElse(null) != null) {
            throw new AlreadyUsedEmailException();
        }

        User user = new User(request.getName(), request.getEmail(), passwordEncoder.encode(request.getPassword()), Role.USER);
        userRepository.save(user);
        return UserMapper.toDto(user);
    }

    public UserDTO updateUser(Long id, UpdateUserRequest request) throws EntityNotFoundException,
        AlreadyUsedEmailException {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException());
        if(!user.getIsActive()){
            throw new EntityNotFoundException();
        }

        if (user.getEmail().equals(request.getEmail()) && user.getId() != id) {
            throw new AlreadyUsedEmailException();
        }

        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        userRepository.save(user);
        return UserMapper.toDto(user);
    }

    public UserDTO deleteUser(Long id) throws EntityNotFoundException {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException());
        if(!user.getIsActive()){
            throw new EntityNotFoundException();
        }
        user.setIsActive(false);
        userRepository.save(user);

        return UserMapper.toDto(user);
    }

    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return UserMapper.toDto(users.stream().filter(user -> user.getIsActive()).toList());
    }
}
