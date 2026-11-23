package com.proxask.service.auth;

import com.proxask.entity.EmailVerification;
import com.proxask.entity.User;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.exception.UserAlreadyVerifiedException;
import com.proxask.exception.VerificationException;
import com.proxask.repository.jpa.EmailVerificationRepository;
import com.proxask.repository.jpa.UserRepository;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final VerificationSupportService verificationSupportService;
    private final OtpService otpService;

    public EmailVerification getEmailVerification(User user) {
        return emailVerificationRepository.findByUser(user).orElseThrow(() ->
                new VerificationException("Email verification details not found"));
    }

    public void isTokenExpired(EmailVerification emailVerification) {
        if (emailVerification.getExpiryDate().isBefore(LocalDateTime.now())) {
            User user = emailVerification.getUser();
            if (user != null && !user.isVerified()) {
                verificationSupportService.deleteUnverifiedUser(user);
            }
            throw new VerificationException("Your verification link/OTP has expired. Please register again.");
        }
    }

    public void isAccountVerified(User user) {
        if (user.isVerified()) {
            throw new UserAlreadyVerifiedException("Your account is already verified. Please log in.");
        }
    }

    @Transactional
    public void verify(String email, int otp) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        User user = userRepository.findByEmail(cleanEmail).orElse(null);
        if (user == null) {
            try {
                user = userService.getUserByEmail(cleanEmail);
            } catch (Exception ignored) {}
        }
        if (user == null) {
            throw new VerificationException("Your verification link/OTP has expired. Please register again.");
        }

        isAccountVerified(user);

        // 1. Check 10-minute expiry first
        boolean isExpired = false;
        Instant now = Instant.now();
        if (user.getOtpExpiry() != null && now.isAfter(user.getOtpExpiry())) {
            isExpired = true;
        } else if (user.getVerificationExpiresAt() != null && now.isAfter(user.getVerificationExpiresAt())) {
            isExpired = true;
        } else if (user.getCreatedAt() != null && user.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(10))) {
            isExpired = true;
        }

        Optional<EmailVerification> evOpt = emailVerificationRepository.findByUser(user);
        if (!isExpired && evOpt.isPresent()) {
            EmailVerification ev = evOpt.get();
            if (ev.getExpiryDate() != null && ev.getExpiryDate().isBefore(LocalDateTime.now())) {
                isExpired = true;
            }
        }

        if (isExpired) {
            verificationSupportService.deleteUnverifiedUser(user);
            throw new VerificationException("Your verification link/OTP has expired. Please register again.");
        }

        // 2. Validate OTP
        boolean matches = false;
        String rawOtpStr = String.valueOf(otp);
        String hashedOtpStr = SessionService.hashToken(rawOtpStr);

        if (user.getOtpCode() != null) {
            matches = user.getOtpCode().equals(rawOtpStr) || user.getOtpCode().equals(hashedOtpStr);
        }

        if (!matches && evOpt.isPresent()) {
            EmailVerification ev = evOpt.get();
            if (ev.getHashedOtp() != null && ev.getHashedOtp().equals(hashedOtpStr)) {
                matches = true;
            } else if (ev.getOtp() == otp) {
                matches = true;
            }
        }

        if (!matches) {
            int attempts = user.getOtpAttempts() + 1;
            user.setOtpAttempts(attempts);
            if (evOpt.isPresent()) {
                EmailVerification ev = evOpt.get();
                ev.setFailedAttempts(attempts);
                emailVerificationRepository.save(ev);
            }

            if (attempts >= 3) {
                verificationSupportService.deleteUnverifiedUser(user);
                throw new VerificationException("Maximum 3 OTP attempts exceeded. Your unverified registration has been deleted—please sign up again.");
            } else {
                userRepository.save(user);
                int remaining = 3 - attempts;
                throw new VerificationException("Invalid OTP. " + remaining + " attempt(s) remaining.");
            }
        }

        user.setVerified(true);
        user.setIsVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        user.setVerificationExpiresAt(null);
        user.setOtpAttempts(0);
        userRepository.save(user);
        evOpt.ifPresent(emailVerificationRepository::delete);
        log.info("User {} ({}) successfully verified email via OTP", user.getUsername(), user.getEmail());
    }

    public EmailVerification findEmailVerificationByToken(String token) {
        return emailVerificationRepository.findByVerificationToken(token).orElseThrow(() ->
                new VerificationException("Your verification link/OTP has expired. Please register again."));
    }

    @Transactional
    public String verifyTokenWithStatus(String token) {
        Optional<EmailVerification> evOpt = emailVerificationRepository.findByVerificationToken(token);
        if (evOpt.isEmpty()) {
            throw new VerificationException("Your verification link/OTP has expired. Please register again.");
        }

        EmailVerification emailVerification = evOpt.get();
        User user = emailVerification.getUser();

        // Idempotent guard: if user is already verified, clean up token and return cleanly
        if (user != null && user.isVerified()) {
            emailVerificationRepository.delete(emailVerification);
            log.info("User {} ({}) email is already verified. Token invalidated idempotently.", user.getUsername(), user.getEmail());
            return "ALREADY_VERIFIED";
        }

        isTokenExpired(emailVerification);

        // Also check user 10-minute TTL
        Instant now = Instant.now();
        boolean userExpired = false;
        if (user != null && !user.isVerified()) {
            if (user.getOtpExpiry() != null && now.isAfter(user.getOtpExpiry())) userExpired = true;
            else if (user.getVerificationExpiresAt() != null && now.isAfter(user.getVerificationExpiresAt())) userExpired = true;
            else if (user.getCreatedAt() != null && user.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(10))) userExpired = true;
        }
        if (userExpired) {
            verificationSupportService.deleteUnverifiedUser(user);
            throw new VerificationException("Your verification link/OTP has expired. Please register again.");
        }

        verificationSupportService.isMaxAttemptsExceeded(emailVerification);

        user.setVerified(true);
        user.setIsVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        user.setVerificationExpiresAt(null);
        user.setOtpAttempts(0);
        userRepository.save(user);
        emailVerificationRepository.delete(emailVerification);
        log.info("User {} ({}) successfully verified email via token link", user.getUsername(), user.getEmail());
        return "VERIFIED";
    }

    @Transactional
    public void verify(String token) {
        verifyTokenWithStatus(token);
    }

    @Transactional
    public void resendOtp(String email) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        User user = userRepository.findByEmail(cleanEmail).orElse(null);
        if (user == null) {
            try {
                user = userService.getUserByEmail(cleanEmail);
            } catch (Exception ignored) {}
        }
        if (user == null) {
            throw new VerificationException("Your verification link/OTP has expired. Please register again.");
        }

        isAccountVerified(user);

        // Check if registration already expired
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
            verificationSupportService.deleteUnverifiedUser(user);
            throw new VerificationException("Your verification link/OTP has expired. Please register again.");
        }

        // Rate limit: must wait at least 60 seconds after issuance before resending
        if (user.getOtpExpiry() != null) {
            Instant earliestAllowed = user.getOtpExpiry().minus(9, ChronoUnit.MINUTES);
            if (Instant.now().isBefore(earliestAllowed)) {
                throw new VerificationException("Please wait 60 seconds before requesting a new OTP.");
            }
        }

        emailVerificationRepository.findByUser(user).ifPresent(emailVerification -> {
            if (emailVerification.getExpiryDate() != null && emailVerification.getExpiryDate().minusMinutes(9).isAfter(LocalDateTime.now())) {
                throw new VerificationException("Please wait 60 seconds before requesting a new OTP.");
            }
            verificationSupportService.deleteEmailVerification(emailVerification);
        });

        if (otpService != null) {
            otpService.sendOtp(user);
        }
    }
}
