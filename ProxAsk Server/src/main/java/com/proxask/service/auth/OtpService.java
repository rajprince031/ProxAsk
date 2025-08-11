package com.proxask.service;

import com.proxask.entity.EmailVerification;
import com.proxask.entity.User;
import com.proxask.repository.EmailVerificationRepository;
import com.proxask.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final EmailService emailService;

    public int generateOtp(){
        Random random = new Random();
        return (100000 + random.nextInt(900000));
    }

    public void sendOtp(User user){
        // 6-digit
        EmailVerification emailVerification = EmailVerification.builder().
                user(user).
                otp(generateOtp()).
                verificationToken(generateVerificationToken()).
                expiryDate(LocalDateTime.now().plusMinutes(10)).
                build();
        emailVerificationRepository.save(emailVerification);
        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), emailVerification.getOtp(), emailVerification.getVerificationToken());
    }

    private String generateVerificationToken() {
        return UUID.randomUUID().toString().replaceAll("-","");
    }
}
