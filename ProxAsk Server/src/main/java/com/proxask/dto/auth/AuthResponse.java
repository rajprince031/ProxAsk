package com.proxask.dto.auth;

import com.proxask.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    private String authToken;
    private String token;
    private String refreshToken;
    private String sessionId;
    private String username;
    private UserDTO user;

    public AuthResponse(String token, String username) {
        this.authToken = token;
        this.token = token;
        this.username = username;
    }

    public AuthResponse(String token, String username, UserDTO user) {
        this.authToken = token;
        this.token = token;
        this.username = username;
        this.user = user;
    }
}
