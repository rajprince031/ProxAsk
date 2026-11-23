package com.proxask.controller;

import com.proxask.dto.UserDTO;
import com.proxask.dto.auth.AuthResponse;
import com.proxask.dto.auth.LoginRequest;
import com.proxask.dto.auth.RegisterRequest;
import com.proxask.dto.auth.SessionResponseDTO;
import com.proxask.dto.response.ApiResponse;
import com.proxask.entity.User;
import com.proxask.mapper.UserMapper;
import com.proxask.service.auth.AccountSecurityService;
import com.proxask.service.auth.AuthService;
import com.proxask.service.auth.SessionService;
import com.proxask.service.jwt.JWTService;
import com.proxask.service.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    private final UserMapper userMapper;
    private final AccountSecurityService accountSecurityService;
    private final SessionService sessionService;
    private final JWTService jwtService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @PostMapping({"/register", "/auth/register", "/api/auth/register"})
    public ResponseEntity<ApiResponse<UserDTO>> registerUser(@RequestBody RegisterRequest registerRequest) {
        UserDTO userDTO = authService.registerUser(registerRequest);
        return ResponseEntity.status(201).body(
                new ApiResponse<>(true, "Verification code sent to your email", userDTO)
        );
    }

    @PostMapping({"/login", "/auth/login", "/api/auth/login"})
    public ResponseEntity<AuthResponse> loginUser(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        SessionService.SessionTokens sessionTokens = authService.loginUser(loginRequest, request);
        User user = sessionTokens.getUserSession().getUser();
        UserDTO userDTO = userMapper.toDTO(user);

        ResponseCookie refreshCookie = createRefreshCookie(sessionTokens.getRawRefreshToken(), 7 * 24 * 60 * 60);

        AuthResponse authResponse = AuthResponse.builder()
                .authToken(sessionTokens.getAccessToken())
                .token(sessionTokens.getAccessToken())
                .refreshToken(sessionTokens.getRawRefreshToken())
                .sessionId(sessionTokens.getSessionId())
                .username(user.getUsername())
                .user(userDTO)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(authResponse);
    }

    @PostMapping({"/auth/refresh-token", "/api/auth/refresh-token", "/auth/refresh", "/api/auth/refresh"})
    public ResponseEntity<AuthResponse> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request) {

        String rawToken = cookieRefreshToken;
        if ((rawToken == null || rawToken.trim().isEmpty()) && body != null) {
            rawToken = body.get("refreshToken");
        }

        if (rawToken == null || rawToken.trim().isEmpty()) {
            return ResponseEntity.status(401).body(null);
        }

        SessionService.SessionTokens rotatedTokens = sessionService.rotateRefreshToken(rawToken, request);
        User user = rotatedTokens.getUserSession().getUser();
        UserDTO userDTO = userMapper.toDTO(user);

        ResponseCookie refreshCookie = createRefreshCookie(rotatedTokens.getRawRefreshToken(), 7 * 24 * 60 * 60);

        AuthResponse authResponse = AuthResponse.builder()
                .authToken(rotatedTokens.getAccessToken())
                .token(rotatedTokens.getAccessToken())
                .refreshToken(rotatedTokens.getRawRefreshToken())
                .sessionId(rotatedTokens.getSessionId())
                .username(user.getUsername())
                .user(userDTO)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(authResponse);
    }

    @GetMapping({"/validate", "/auth/validate", "/api/auth/validate"})
    public ResponseEntity<Map<String, Object>> validateToken(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthenticated"));
        }
        User user = userService.getUserByUsername(authentication.getName());
        UserDTO userDTO = userMapper.toDTO(user);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Token is valid",
                "user", userDTO,
                "data", userDTO
        ));
    }

    @PostMapping({"/logout", "/auth/logout", "/api/auth/logout"})
    public ResponseEntity<ApiResponse<Void>> logoutUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String sessionId = jwtService.extractSessionId(token);
            if (sessionId != null) {
                try {
                    User user = userService.getCurrentAuthenticatedUser();
                    if (user != null) {
                        sessionService.revokeSession(sessionId, user);
                    }
                } catch (Exception e) {
                    log.debug("Session revoke on logout skipped: {}", e.getMessage());
                }
            }
        }

        ResponseCookie clearCookie = createRefreshCookie("", 0);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body(new ApiResponse<>(true, "Logged out successfully", null));
    }

    @GetMapping({"/auth/sessions", "/api/auth/sessions"})
    public ResponseEntity<ApiResponse<List<SessionResponseDTO>>> getActiveSessions(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = userService.getCurrentAuthenticatedUser();
        String currentSessionId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            currentSessionId = jwtService.extractSessionId(authHeader.substring(7));
        }

        List<SessionResponseDTO> sessions = sessionService.getActiveSessionsForUser(user, currentSessionId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Active sessions retrieved successfully", sessions));
    }

    @DeleteMapping({"/auth/sessions/{sessionId}", "/api/auth/sessions/{sessionId}"})
    public ResponseEntity<ApiResponse<Void>> revokeSession(@PathVariable String sessionId) {
        User user = userService.getCurrentAuthenticatedUser();
        sessionService.revokeSession(sessionId, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Session revoked successfully", null));
    }

    @DeleteMapping({"/auth/sessions/other", "/api/auth/sessions/other"})
    public ResponseEntity<ApiResponse<Void>> revokeAllOtherSessions(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = userService.getCurrentAuthenticatedUser();
        String currentSessionId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            currentSessionId = jwtService.extractSessionId(authHeader.substring(7));
        }

        sessionService.revokeAllOtherSessions(user, currentSessionId);
        return ResponseEntity.ok(new ApiResponse<>(true, "All other sessions revoked successfully", null));
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

    private ResponseCookie createRefreshCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from("refreshToken", value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
    }
}
