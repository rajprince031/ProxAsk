package com.proxask.controller;

import com.proxask.dto.response.ApiResponse;
import com.proxask.dto.UserDTO;
import com.proxask.dto.auth.AuthResponse;
import com.proxask.dto.auth.LoginRequest;
import com.proxask.dto.auth.RegisterRequest;
import com.proxask.service.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDTO>> registerUser(@RequestBody RegisterRequest registerRequest){
        UserDTO userDTO = authService.registerUser(registerRequest);
        return ResponseEntity
                .status(201)
                .body(
                new ApiResponse<UserDTO>(
                        true,
                        "User registered",
                        userDTO)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@RequestBody LoginRequest loginRequest){
        return authService.loginUser(loginRequest);
    }



}
