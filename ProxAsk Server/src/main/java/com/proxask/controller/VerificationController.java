package com.proxask.controller;

import com.proxask.dto.auth.OtpRequest;
import com.proxask.dto.response.ApiResponse;
import com.proxask.entity.User;
import com.proxask.repository.jpa.UserRepository;
import com.proxask.service.auth.VerificationService;
import com.proxask.service.auth.VerificationSupportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
public class VerificationController {

    private final VerificationService verificationService;
    private final UserRepository userRepository;
    private final VerificationSupportService verificationSupportService;

    @Autowired
    public VerificationController(VerificationService verificationService, 
                                  UserRepository userRepository, 
                                  @Autowired(required = false) VerificationSupportService verificationSupportService) {
        this.verificationService = verificationService;
        this.userRepository = userRepository;
        this.verificationSupportService = verificationSupportService;
    }

    public VerificationController(VerificationService verificationService, UserRepository userRepository) {
        this(verificationService, userRepository, null);
    }

    @PostMapping({"/verify", "/api/verify", "/auth/verify", "/api/auth/verify", "/auth/verify-email", "/api/auth/verify-email"})
    public ResponseEntity<ApiResponse<Map<String, String>>> verifyOtpRequest(@RequestBody OtpRequest otpRequest) {
        verificationService.verify(otpRequest.getEmail(), otpRequest.getOtp());
        return ResponseEntity.ok(new ApiResponse<>(true, "Account verified and created successfully!", Map.of("status", "VERIFIED")));
    }

    @GetMapping({"/verify", "/api/verify", "/auth/verify", "/api/auth/verify", "/auth/verify-email", "/api/auth/verify-email"})
    public ResponseEntity<ApiResponse<Map<String, String>>> verifyTokenRequest(@RequestParam String token) {
        String result = verificationService.verifyTokenWithStatus(token);
        if ("ALREADY_VERIFIED".equalsIgnoreCase(result)) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Your account is already verified. Please log in.", Map.of("status", "ALREADY_VERIFIED")));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Account verified and created successfully!", Map.of("status", "VERIFIED")));
    }

    @GetMapping({"/api/auth/verification-status", "/auth/verification-status", "/verify/status", "/api/verify/status"})
    public ResponseEntity<ApiResponse<Map<String, String>>> checkVerificationStatus(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Your verification link/OTP has expired. Please register again.", Map.of("status", "EXPIRED")));
        }
        String cleanEmail = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(cleanEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Your verification link/OTP has expired. Please register again.", Map.of("status", "EXPIRED")));
        }
        User user = userOpt.get();
        if (user.isVerified()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Your account is already verified. Please log in.", Map.of("status", "ALREADY_VERIFIED")));
        } else {
            Instant now = Instant.now();
            boolean isExpired = false;
            if (user.getOtpExpiry() != null && now.isAfter(user.getOtpExpiry())) {
                isExpired = true;
            } else if (user.getVerificationExpiresAt() != null && now.isAfter(user.getVerificationExpiresAt())) {
                isExpired = true;
            } else if (user.getCreatedAt() != null && user.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(10))) {
                isExpired = true;
            }

            if (isExpired) {
                if (verificationSupportService != null) {
                    verificationSupportService.deleteUnverifiedUser(user);
                }
                return ResponseEntity.ok(new ApiResponse<>(false, "Your verification link/OTP has expired. Please register again.", Map.of("status", "EXPIRED")));
            }
            return ResponseEntity.ok(new ApiResponse<>(true, "Your account is not verified yet. Please enter the OTP (or click the verification link) sent to your email.", Map.of("status", "PENDING")));
        }
    }

    @PostMapping({"/verify/resend-otp", "/api/verify/resend-otp", "/auth/resend-verification", "/api/auth/resend-verification"})
    public ResponseEntity<ApiResponse<Void>> resendOtp(
            @RequestParam(required = false) String email,
            @RequestBody(required = false) Map<String, String> body) {
        String targetEmail = email;
        if ((targetEmail == null || targetEmail.trim().isEmpty()) && body != null) {
            targetEmail = body.get("email");
        }
        if (targetEmail == null || targetEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required to resend verification OTP.");
        }
        verificationService.resendOtp(targetEmail.trim());
        return ResponseEntity.ok(new ApiResponse<>(true, "OTP has been resent successfully to your email.", null));
    }
}
