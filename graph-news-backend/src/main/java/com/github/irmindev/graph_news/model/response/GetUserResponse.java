package com.github.irmindev.graph_news.model.response;

import com.github.irmindev.graph_news.model.dto.UserDTO;

public sealed abstract class GetUserResponse permits 
    GetUserResponse.Success,
    GetUserResponse.UnallowedMethod
{
    private String message;
    
    public GetUserResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public static final class Success extends GetUserResponse {
        private UserDTO user;

        public Success(UserDTO user) {
            super("Successfully retrieved user");
            this.user = user;
        }

        public UserDTO getUser() {
            return user;
        }
    }

    public static final class UnallowedMethod extends GetUserResponse {
        public UnallowedMethod() {
            super("Unallowed method");
        }
    }
}
