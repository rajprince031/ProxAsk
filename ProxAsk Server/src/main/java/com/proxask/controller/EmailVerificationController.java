package com.proxask.controller;


import com.proxask.dto.auth.VerificationRequest;
import com.proxask.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
public class EmailVerificationController {

    private EmailService emailService;

//    @PostMapping("/send-verification")
//    public ResponseEntity<String> sendVerificationEmail(@RequestBody VerificationRequest verificationRequest){
//        emailService.sendVerificationEmail();
//    }
}
