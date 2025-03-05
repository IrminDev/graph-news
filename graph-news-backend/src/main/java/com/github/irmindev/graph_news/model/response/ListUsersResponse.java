package com.github.irmindev.graph_news.model.response;

import java.util.List;

import com.github.irmindev.graph_news.model.dto.UserDTO;

public sealed abstract class ListUsersResponse permits 
    ListUsersResponse.Success,
    ListUsersResponse.UnallowedMethod
{
    private String message;
    
    public ListUsersResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public static final class Success extends ListUsersResponse {
        private List<UserDTO> users;

        public Success(List<UserDTO> users) {
            super("Successfully retrieved users");
            this.users = users;
        }

        public List<UserDTO> getUsers() {
            return users;
        }
    }

    public static final class UnallowedMethod extends ListUsersResponse {
        public UnallowedMethod() {
            super("Unallowed method");
        }
    }
}
