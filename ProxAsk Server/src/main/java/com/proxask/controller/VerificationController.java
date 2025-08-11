package com.proxask.controller;

import com.proxask.dto.auth.OtpRequest;
import com.proxask.service.auth.OtpService;
import com.proxask.service.auth.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/verify-otp")
@RequiredArgsConstructor
public class OtpController {

    private final VerificationService verificationService;

    @PostMapping
    public boolean verifyOtpRequest(@RequestBody OtpRequest otpRequest){
        verificationService.verify(otpRequest.getEmail(), otpRequest.getOtp());
        return true;
    }

    @GetMapping
    public boolean verifyTokenRequest(@RequestParam String token){
        verificationService.verify(token);
        return true;
    }
}
