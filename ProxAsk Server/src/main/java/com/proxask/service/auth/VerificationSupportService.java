package com.proxask.service.auth;

import com.proxask.entity.EmailVerification;
import com.proxask.entity.User;
import com.proxask.exception.EmailAlreadyInUseException;
import com.proxask.exception.UsernameAlreadyInUseException;
import com.proxask.exception.VerificationException;
import com.proxask.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;

@Service
@Slf4j
public class VerificationSupportService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final UserRepository userRepository;
    private UserSessionRepository userSessionRepository;
    private PasswordResetTokenRepository passwordResetTokenRepository;
    private EmailChangeRequestRepository emailChangeRequestRepository;
    private static final int MAX_FAILED_ATTEMPTS = 3;

    public VerificationSupportService(EmailVerificationRepository emailVerificationRepository, UserRepository userRepository) {
        this.emailVerificationRepository = emailVerificationRepository;
        this.userRepository = userRepository;
    }

    @Autowired
    public VerificationSupportService(
            EmailVerificationRepository emailVerificationRepository,
            UserRepository userRepository,
            @Autowired(required = false) UserSessionRepository userSessionRepository,
            @Autowired(required = false) PasswordResetTokenRepository passwordResetTokenRepository,
            @Autowired(required = false) EmailChangeRequestRepository emailChangeRequestRepository) {
        this.emailVerificationRepository = emailVerificationRepository;
        this.userRepository = userRepository;
        this.userSessionRepository = userSessionRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailChangeRequestRepository = emailChangeRequestRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteUnverifiedUser(User user) {
        if (user == null) return;
        try {
            if (emailVerificationRepository != null) emailVerificationRepository.deleteByUser(user);
        } catch (Exception ignored) {}
        try {
            if (userSessionRepository != null) userSessionRepository.deleteByUser(user);
        } catch (Exception ignored) {}
        try {
            if (passwordResetTokenRepository != null) passwordResetTokenRepository.deleteByUser(user);
        } catch (Exception ignored) {}
        try {
            if (emailChangeRequestRepository != null) emailChangeRequestRepository.deleteByUser(user);
        } catch (Exception ignored) {}
        try {
            userRepository.delete(user);
        } catch (Exception ignored) {}
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void cleanupUnverifiedConflicts(String email, String username) {
        LocalDateTime tenMinutesAgo = LocalDateTime.now().minusMinutes(10);

        if (email != null && !email.trim().isEmpty()) {
            userRepository.findByEmail(email.trim().toLowerCase()).ifPresent(user -> {
                if (user.isVerified()) {
                    throw new EmailAlreadyInUseException("Email is already registered.");
                }
                boolean expired = false;
                if (user.getOtpExpiry() != null && Instant.now().isAfter(user.getOtpExpiry())) {
                    expired = true;
                } else if (user.getCreatedAt() != null && user.getCreatedAt().isBefore(tenMinutesAgo)) {
                    expired = true;
                }
                if (!expired) {
                    throw new VerificationException("An account with this email is pending verification. Please check your email for the OTP or wait 10 minutes.");
                }
                log.info("Cleaning up abandoned unverified user with email {} (past 10-minute TTL)", email);
                deleteUnverifiedUser(user);
            });
        }

        if (username != null && !username.trim().isEmpty()) {
            userRepository.findByUsername(username.trim().toLowerCase()).ifPresent(user -> {
                if (user.isVerified()) {
                    throw new UsernameAlreadyInUseException("Username is already registered.");
                }
                boolean expired = false;
                if (user.getOtpExpiry() != null && Instant.now().isAfter(user.getOtpExpiry())) {
                    expired = true;
                } else if (user.getCreatedAt() != null && user.getCreatedAt().isBefore(tenMinutesAgo)) {
                    expired = true;
                }
                if (!expired) {
                    throw new VerificationException("An account with this username is pending verification. Please check your email for the OTP or wait 10 minutes.");
                }
                log.info("Cleaning up abandoned unverified user with username {} (past 10-minute TTL)", username);
                deleteUnverifiedUser(user);
            });
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void incrementFailedAttempts(EmailVerification emailVerification) {
        emailVerification.setFailedAttempts(emailVerification.getFailedAttempts() + 1);
        emailVerificationRepository.save(emailVerification);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void isMaxAttemptsExceeded(EmailVerification emailVerification) {
        if (emailVerification.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
            throw new VerificationException("Too many failed attempts. Please request a new OTP.");
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteEmailVerification(EmailVerification emailVerification) {
        emailVerificationRepository.delete(emailVerification);
    }
}
