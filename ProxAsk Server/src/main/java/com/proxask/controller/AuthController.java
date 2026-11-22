package com.proxask.controller;

import com.proxask.dto.UserDTO;
import com.proxask.dto.auth.AuthResponse;
import com.proxask.dto.auth.LoginRequest;
import com.proxask.dto.auth.RegisterRequest;
import com.proxask.dto.response.ApiResponse;
import com.proxask.entity.User;
import com.proxask.service.auth.AccountSecurityService;
import com.proxask.service.auth.AuthService;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    private final ModelMapper modelMapper;
    private final AccountSecurityService accountSecurityService;

    @PostMapping({"/register", "/auth/register", "/api/auth/register"})
    public ResponseEntity<ApiResponse<UserDTO>> registerUser(@RequestBody RegisterRequest registerRequest) {
        UserDTO userDTO = authService.registerUser(registerRequest);
        return ResponseEntity.status(201).body(
                new ApiResponse<>(true, "Registration successful! Please verify your email with the OTP sent.", userDTO)
        );
    }

    @PostMapping({"/login", "/auth/login", "/api/auth/login"})
    public ResponseEntity<AuthResponse> loginUser(@RequestBody LoginRequest loginRequest) {
        return authService.loginUser(loginRequest);
    }

    @GetMapping({"/validate", "/auth/validate", "/api/auth/validate"})
    public ResponseEntity<Map<String, Object>> validateToken(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthenticated"));
        }
        User user = userService.getUserByUsername(authentication.getName());
        UserDTO userDTO = modelMapper.map(user, UserDTO.class);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Token is valid",
                "user", userDTO,
                "data", userDTO
        ));
    }

    @PostMapping({"/logout", "/auth/logout", "/api/auth/logout"})
    public ResponseEntity<ApiResponse<Void>> logoutUser() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Logged out successfully", null));
    }

    @PostMapping({"/auth/forgot-password", "/api/auth/forgot-password"})
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        accountSecurityService.requestPasswordReset(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password recovery OTP sent to your registered email.", null));
    }

    @PostMapping({"/auth/reset-password", "/api/auth/reset-password"})
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        Object otpObj = body.get("otp");
        int otp = otpObj instanceof Number ? ((Number) otpObj).intValue() : Integer.parseInt(String.valueOf(otpObj));
        String newPassword = (String) body.get("newPassword");
        accountSecurityService.resetPassword(email, otp, newPassword);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password has been reset successfully! You can now sign in.", null));
    }
}
