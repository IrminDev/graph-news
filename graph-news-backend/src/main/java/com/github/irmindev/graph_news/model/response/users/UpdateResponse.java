package com.github.irmindev.graph_news.model.response.users;

import com.github.irmindev.graph_news.model.dto.UserDTO;

public sealed abstract class UpdateResponse permits 
    UpdateResponse.Success,
    UpdateResponse.AlreadyUsedEmail
{
    private String message;

    public UpdateResponse() {
    }

    public UpdateResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
    
    public static final class Success extends UpdateResponse {
        private UserDTO user;

        public Success(UserDTO user) {
            super("Update successful");
            this.user = user;
        }

        public UserDTO getUser() {
            return user;
        }
    }

    public static final class AlreadyUsedEmail extends UpdateResponse {
        public AlreadyUsedEmail() {
            super("Email already in use");
        }
    }    
}
