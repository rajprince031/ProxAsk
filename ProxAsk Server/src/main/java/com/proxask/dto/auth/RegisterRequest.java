package com.proxask.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @JsonAlias({"firstname", "firstName"})
    private String firstName;

    @JsonAlias({"lastname", "lastName"})
    private String lastName;

    private String username;
    private String password;
    private String email;
    private String bio;
    private String avatar;
}
