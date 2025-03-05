package com.github.irmindev.graph_news.model.response;

import com.github.irmindev.graph_news.model.dto.UserDTO;

public sealed abstract class SignUpResponse permits 
    SignUpResponse.Success,
    SignUpResponse.AlreadyUsedEmail
{
    private String message;

    public SignUpResponse() {
    }

    public SignUpResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public static final class Success extends SignUpResponse {
        private UserDTO user;
        private String token;
        
        public Success(UserDTO user, String token) {
            super("User created successfully");
            this.user = user;
            this.token = token;
        }
    }

    public static final class AlreadyUsedEmail extends SignUpResponse {
        public AlreadyUsedEmail() {
            super("Email already in use");
        }
    }
}
