package com.proxask.controller;

import com.proxask.dto.auth.OtpRequest;
import com.proxask.dto.response.ApiResponse;
import com.proxask.service.auth.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping({"/verify", "/api/verify", "/auth/verify", "/api/auth/verify"})
    public ResponseEntity<ApiResponse<Void>> verifyOtpRequest(@RequestBody OtpRequest otpRequest) {
        verificationService.verify(otpRequest.getEmail(), otpRequest.getOtp());
        return ResponseEntity.ok(new ApiResponse<>(true, "Email verified successfully! You can now sign in.", null));
    }

    @GetMapping({"/verify", "/api/verify", "/auth/verify", "/api/auth/verify"})
    public ResponseEntity<ApiResponse<Void>> verifyTokenRequest(@RequestParam String token) {
        verificationService.verify(token);
        return ResponseEntity.ok(new ApiResponse<>(true, "Token verified successfully! You can now sign in.", null));
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
