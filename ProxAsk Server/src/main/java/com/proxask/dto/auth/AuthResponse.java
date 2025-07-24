package com.proxask.dto.auth;


import com.proxask.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String authToken;
    private String username;
    private Role role;
}
