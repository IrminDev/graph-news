package com.github.irmindev.graph_news.service;

import java.io.IOException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.github.irmindev.graph_news.model.dto.UserDTO;
import com.github.irmindev.graph_news.model.entity.User;
import com.github.irmindev.graph_news.model.enums.Role;
import com.github.irmindev.graph_news.model.exception.EntityNotFoundException;
import com.github.irmindev.graph_news.model.exception.user.AlreadyUsedEmailException;
import com.github.irmindev.graph_news.model.exception.user.IncorrectCredentialsException;
import com.github.irmindev.graph_news.model.mapper.UserMapper;
import com.github.irmindev.graph_news.model.request.admin.CreateUserRequest;
import com.github.irmindev.graph_news.model.request.auth.SignUpRequest;
import com.github.irmindev.graph_news.model.request.user.UpdateMe;
import com.github.irmindev.graph_news.model.request.user.UpdatePassword;
import com.github.irmindev.graph_news.model.request.user.UpdateUserRequest;
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

        if (request.getEmail() != null) {
            User existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);
            if (existingUser != null && !existingUser.getId().equals(id)) {
                throw new AlreadyUsedEmailException();
            }
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

    public UserDTO updateMe(UpdateMe request, Long id, MultipartFile image) throws EntityNotFoundException, IOException, AlreadyUsedEmailException {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException());
        if(!user.getIsActive()){
            throw new EntityNotFoundException();
        }

        if (request.getEmail() != null) {
            User existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);
            if (existingUser != null && !existingUser.getId().equals(id)) {
                throw new AlreadyUsedEmailException();
            }
            user.setEmail(request.getEmail());
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (image != null && !image.isEmpty()) {
            user.setImage(image.getBytes());
        }

        userRepository.save(user);
        return UserMapper.toDto(user);
    }

    public UserDTO updatePassword(UpdatePassword request, Long id)
    throws EntityNotFoundException, IncorrectCredentialsException {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException());
        if(!user.getIsActive()){
            throw new EntityNotFoundException();
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IncorrectCredentialsException();
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return UserMapper.toDto(user);
    }

    public Page<UserDTO> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return users.map(UserMapper::toDto);
    }

    public byte[] getImage(Long id) throws EntityNotFoundException {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException());
        if(!user.getIsActive()){
            throw new EntityNotFoundException();
        }
        return user.getImage();
    }

    public UserDTO createUserByAdmin(CreateUserRequest request) throws AlreadyUsedEmailException {
        if (userRepository.findByEmail(request.getEmail()).orElse(null) != null) {
            throw new AlreadyUsedEmailException();
        }

        User user = new User(request.getName(), request.getEmail(), passwordEncoder.encode(request.getPassword()), request.getRole());
        userRepository.save(user);
        return UserMapper.toDto(user);
    }
}
