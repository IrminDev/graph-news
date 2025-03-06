package com.github.irmindev.graph_news.model.response;

import com.github.irmindev.graph_news.model.dto.UserDTO;

public sealed abstract class LoginResponse permits 
    LoginResponse.Success,
    LoginResponse.InvalidCredentials,
    LoginResponse.EntityNotFound
{
    private String message;

    public LoginResponse() {
    }

    public LoginResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
    
    public static final class Success extends LoginResponse {
        private UserDTO user;
        private String token;
        
        public Success(String token, UserDTO user) {
            super("Login successful");
            this.token = token;
            this.user = user;
        }

        public UserDTO getUser() {
            return user;
        }

        public String getToken() {
            return token;
        }
    }

    public static final class InvalidCredentials extends LoginResponse {
        public InvalidCredentials() {
            super("Invalid credentials");
        }
    }

    public static final class EntityNotFound extends LoginResponse {
        public EntityNotFound() {
            super("Entity not found");
        }
    }
}
