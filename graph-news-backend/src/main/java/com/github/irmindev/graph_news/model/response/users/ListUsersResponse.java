package com.github.irmindev.graph_news.model.response.users;

import java.util.List;

import org.springframework.data.domain.Page;

import com.github.irmindev.graph_news.model.dto.UserDTO;

public sealed abstract class ListUsersResponse permits 
    ListUsersResponse.Success,
    ListUsersResponse.SuccessLarge,
    ListUsersResponse.UnallowedMethod
{
    private String message;
    
    public ListUsersResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    /**
     * @deprecated
     * This class is deprecated and will be removed in future versions.
     * Use {@link ListUsersResponse.Success} or {@link ListUsersResponse.SuccessLarge} instead.
     * This class is only used for backward compatibility.
     */
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

    public static final class SuccessLarge extends ListUsersResponse {
        private Page<UserDTO> users;

        public SuccessLarge(Page<UserDTO> users) {
            super("Successfully retrieved users");
            this.users = users;
        }

        public Page<UserDTO> getUsers() {
            return users;
        }
    }
}
