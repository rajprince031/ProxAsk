package com.proxask.service.auth;

import com.proxask.dto.UserDTO;
import com.proxask.dto.auth.AuthResponse;
import com.proxask.dto.auth.LoginRequest;
import com.proxask.dto.auth.RegisterRequest;
import com.proxask.entity.User;
import com.proxask.exception.VerificationException;
import com.proxask.mapper.UserMapper;
import com.proxask.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final OtpService otpService;
    private final VerificationSupportService verificationSupportService;
    private final SessionService sessionService;

    @Transactional
    public UserDTO registerUser(RegisterRequest registerRequest) {
        String email = registerRequest.getEmail() != null ? registerRequest.getEmail().trim().toLowerCase() : null;
        String username = registerRequest.getUsername() != null ? registerRequest.getUsername().trim().toLowerCase() : null;

        // Duplicate check & 10-minute unverified TTL check
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
        user.setVerified(false);
        user.setIsVerified(false);
        user.setOtpAttempts(0);
        user.setOtpExpiry(Instant.now().plus(10, ChronoUnit.MINUTES));

        User newUser = userRepository.save(user);

        try {
            otpService.sendOtp(newUser);
        } catch (Exception e) {
            log.warn("OTP dispatch failed during registration for {}: {}", email, e.getMessage());
        }

        UserDTO userDTO = userMapper.toDTO(newUser);
        userDTO.setRequiresVerification(true);
        return userDTO;
    }

    public SessionService.SessionTokens loginUser(LoginRequest loginRequest, HttpServletRequest request) {
        String identifier = loginRequest.getUsername();
        if (identifier == null || identifier.trim().isEmpty()) {
            identifier = loginRequest.getEmail();
        }

        if (identifier == null || identifier.trim().isEmpty()) {
            throw new IllegalArgumentException("Username or email is required for login.");
        }

        final String searchIdentifier = identifier.trim();

        // Resolve user to ensure email verification before completing login
        User user = userRepository.findByUsername(searchIdentifier.toLowerCase())
                .or(() -> userRepository.findByEmail(searchIdentifier.toLowerCase()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!user.isVerified()) {
            boolean isExpired = false;
            if (user.getOtpExpiry() != null && Instant.now().isAfter(user.getOtpExpiry())) {
                isExpired = true;
            } else if (user.getCreatedAt() != null && user.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(10))) {
                isExpired = true;
            }

            if (isExpired) {
                verificationSupportService.deleteUnverifiedUser(user);
                throw new VerificationException("Registration has expired after 10 minutes. Your unverified registration has been deleted—please sign up again.");
            }

            throw new VerificationException("Email not verified");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), loginRequest.getPassword())
        );

        if (!authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        return sessionService.createSession(user, request);
    }
}
