package com.github.irmindev.graph_news.model.mapper;

import java.util.List;

import com.github.irmindev.graph_news.model.dto.UserDTO;
import com.github.irmindev.graph_news.model.entity.User;

public class UserMapper {
    public static UserDTO toDto(User user) {
        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public static List<UserDTO> toDto(List<User> users) {
        return users.stream().map(
            user -> new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getRole())
        ).toList();
    }
}
