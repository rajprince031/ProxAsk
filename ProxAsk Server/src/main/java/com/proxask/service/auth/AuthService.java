package com.proxask.service.auth;

import com.proxask.dto.UserDTO;
import com.proxask.dto.auth.AuthResponse;
import com.proxask.dto.auth.LoginRequest;
import com.proxask.dto.auth.RegisterRequest;
import com.proxask.entity.User;
import com.proxask.exception.VerificationException;
import com.proxask.repository.UserRepository;
import com.proxask.service.jwt.JWTService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.proxask.mapper.UserMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;
    private final UserMapper userMapper;
    private final OtpService otpService;
    private final VerificationSupportService verificationSupportService;

    @Transactional
    public UserDTO registerUser(RegisterRequest registerRequest) {
        String email = registerRequest.getEmail() != null ? registerRequest.getEmail().trim().toLowerCase() : null;
        String username = registerRequest.getUsername() != null ? registerRequest.getUsername().trim().toLowerCase() : null;

        verificationSupportService.cleanupUnverifiedConflicts(email, username);

        User user = new User();
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(bCryptPasswordEncoder.encode(registerRequest.getPassword()));
        user.setBio(registerRequest.getBio());
        user.setAvatar(registerRequest.getAvatar());
        user.setIsActive(true);
        user.setIsVerified(false);

        User newUser = userRepository.save(user);
        UserDTO userDTO = userMapper.toDTO(newUser);

        try {
            otpService.sendOtp(newUser);
        } catch (Exception e) {
            log.warn("OTP dispatch failed during registration for {}: {}", email, e.getMessage());
        }

        return userDTO;
    }

    public ResponseEntity<AuthResponse> loginUser(LoginRequest loginRequest) {
        String identifier = loginRequest.getUsername();
        if (identifier == null || identifier.trim().isEmpty()) {
            identifier = loginRequest.getEmail();
        }

        if (identifier == null || identifier.trim().isEmpty()) {
            throw new IllegalArgumentException("Username or email is required for login.");
        }

        final String searchIdentifier = identifier.trim();

        // Resolve user to ensure email verification before completing login
        User user = userRepository.findByUsername(searchIdentifier)
                .or(() -> userRepository.findByEmail(searchIdentifier))
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            throw new VerificationException("Account is not verified. Please verify your email OTP before logging in.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), loginRequest.getPassword())
        );

        if (!authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new AuthResponse());
        }

        String token = jwtService.generateToken(user.getUsername());
        UserDTO userDTO = userMapper.toDTO(user);

        AuthResponse authResponse = AuthResponse.builder()
                .authToken(token)
                .token(token)
                .username(user.getUsername())
                .user(userDTO)
                .build();

        return ResponseEntity.ok(authResponse);
    }
}
