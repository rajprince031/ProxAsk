package com.proxask.controller;

import com.proxask.dto.auth.OtpRequest;
import com.proxask.dto.response.ApiResponse;
import com.proxask.service.auth.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/verify")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> verifyOtpRequest(@RequestBody OtpRequest otpRequest){
        verificationService.verify(otpRequest.getEmail(), otpRequest.getOtp());
        return ResponseEntity.ok(new ApiResponse<>(true,"Otp verified successfully",null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Void>> verifyTokenRequest(@RequestParam String token){
        verificationService.verify(token);
        return ResponseEntity.ok(new ApiResponse<>(true,"Token verified successfully",null));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@RequestParam String email){
        verificationService.resendOtp(email);
        return ResponseEntity.ok(new ApiResponse<>(true,"OTP has been resent successfully to your email.",null));
    }
}
