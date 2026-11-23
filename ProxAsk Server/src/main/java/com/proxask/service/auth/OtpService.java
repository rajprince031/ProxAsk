package com.proxask.service.auth;

import com.proxask.entity.EmailVerification;
import com.proxask.entity.User;
import com.proxask.repository.EmailVerificationRepository;
import com.proxask.repository.UserRepository;
import com.proxask.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private static final SecureRandom RANDOM = new SecureRandom();

    public int generateOtp() {
        return 100000 + RANDOM.nextInt(900000);
    }

    public void sendOtp(User user) {
        int rawOtp = generateOtp();
        String hashedOtp = SessionService.hashToken(String.valueOf(rawOtp));
        String verificationToken = generateVerificationToken();

        user.setOtpCode(hashedOtp);
        user.setOtpExpiry(Instant.now().plus(10, ChronoUnit.MINUTES));
        user.setOtpAttempts(0);
        userRepository.save(user);

        emailVerificationRepository.findByUser(user).ifPresent(emailVerificationRepository::delete);

        EmailVerification emailVerification = EmailVerification.builder()
                .user(user)
                .otp(rawOtp)
                .hashedOtp(hashedOtp)
                .verificationToken(verificationToken)
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .build();

        emailVerificationRepository.save(emailVerification);
        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), rawOtp, verificationToken);
    }

    private String generateVerificationToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
