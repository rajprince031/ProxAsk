package com.proxask.service.auth;

import com.proxask.entity.EmailChangeRequest;
import com.proxask.entity.PasswordResetToken;
import com.proxask.entity.User;
import com.proxask.exception.EmailAlreadyInUseException;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.exception.VerificationException;
import com.proxask.repository.jpa.EmailChangeRequestRepository;
import com.proxask.repository.jpa.PasswordResetTokenRepository;
import com.proxask.repository.jpa.UserRepository;
import com.proxask.service.email.EmailService;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountSecurityService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailChangeRequestRepository emailChangeRequestRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final SessionService sessionService;

    private static final SecureRandom RANDOM = new SecureRandom();

    private int generateOtp() {
        return 100000 + RANDOM.nextInt(900000);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        String cleanEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + cleanEmail));

        int otp = generateOtp();
        String hashedOtp = SessionService.hashToken(String.valueOf(otp));

        PasswordResetToken token = passwordResetTokenRepository.findByUser(user)
                .orElse(PasswordResetToken.builder().user(user).build());

        token.setOtp(otp);
        token.setHashedOtp(hashedOtp);
        token.setFailedAttempts(0);
        token.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        passwordResetTokenRepository.save(token);

        emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), otp);
    }

    @Transactional
    public void resetPassword(String email, int otp, String newPassword) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters.");
        }

        String cleanEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + cleanEmail));

        PasswordResetToken token = passwordResetTokenRepository.findByUser(user)
                .orElseThrow(() -> new VerificationException("No active password reset request found. Please request a new code."));

        validateToken(token, otp);

        user.setPassword(bCryptPasswordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(token);

        // Security requirement: invalidate all existing active sessions when password is reset
        sessionService.revokeAllSessionsForUser(user);
        log.info("Password reset successfully and all active sessions revoked for user {}", user.getUsername());
    }

    @Transactional
    public void requestPasswordChangeOtp() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to request password change.");
        }

        int otp = generateOtp();
        String hashedOtp = SessionService.hashToken(String.valueOf(otp));

        PasswordResetToken token = passwordResetTokenRepository.findByUser(currentUser)
                .orElse(PasswordResetToken.builder().user(currentUser).build());

        token.setOtp(otp);
        token.setHashedOtp(hashedOtp);
        token.setFailedAttempts(0);
        token.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        passwordResetTokenRepository.save(token);

        emailService.sendPasswordChangeEmail(currentUser.getEmail(), currentUser.getFirstName(), otp);
    }

    @Transactional
    public void changePassword(int otp, String newPassword) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to change password.");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters.");
        }

        PasswordResetToken token = passwordResetTokenRepository.findByUser(currentUser)
                .orElseThrow(() -> new VerificationException("No active password change OTP found. Please request a new code."));

        validateToken(token, otp);

        currentUser.setPassword(bCryptPasswordEncoder.encode(newPassword));
        userRepository.save(currentUser);
        passwordResetTokenRepository.delete(token);

        // Security requirement: invalidate all other active sessions when password is changed
        sessionService.revokeAllSessionsForUser(currentUser);
        log.info("Password changed successfully and all active sessions revoked for user {}", currentUser.getUsername());
    }

    @Transactional
    public void requestEmailChangeOtp(String newEmail) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to request email change.");
        }
        if (newEmail == null || !newEmail.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
            throw new IllegalArgumentException("Please provide a valid new email address.");
        }

        String cleanNewEmail = newEmail.trim().toLowerCase();
        if (cleanNewEmail.equalsIgnoreCase(currentUser.getEmail())) {
            throw new IllegalArgumentException("New email address cannot be the same as your current email.");
        }

        userRepository.findByEmail(cleanNewEmail).ifPresent(u -> {
            if (!u.getId().equals(currentUser.getId())) {
                throw new EmailAlreadyInUseException("Email " + cleanNewEmail + " is already in use by another account.");
            }
        });

        int otp = generateOtp();
        EmailChangeRequest request = emailChangeRequestRepository.findByUser(currentUser)
                .orElse(EmailChangeRequest.builder().user(currentUser).build());

        request.setNewEmail(cleanNewEmail);
        request.setOtp(otp);
        request.setFailedAttempts(0);
        request.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        emailChangeRequestRepository.save(request);

        emailService.sendEmailChangeVerificationEmail(cleanNewEmail, currentUser.getFirstName(), otp);
    }

    @Transactional
    public void verifyEmailChange(String newEmail, int otp) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to verify email change.");
        }
        if (newEmail == null || newEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("New email address is required.");
        }

        String cleanNewEmail = newEmail.trim().toLowerCase();
        EmailChangeRequest request = emailChangeRequestRepository.findByUserAndNewEmail(currentUser, cleanNewEmail)
                .orElseThrow(() -> new VerificationException("No matching pending email change request found for " + cleanNewEmail));

        if (request.getExpiryDate().isBefore(LocalDateTime.now())) {
            emailChangeRequestRepository.delete(request);
            throw new VerificationException("Email verification code has expired. Please request a new code.");
        }

        if (request.getFailedAttempts() >= 5) {
            emailChangeRequestRepository.delete(request);
            throw new VerificationException("Maximum attempts exceeded. Please request a new verification code.");
        }

        if (request.getOtp() != otp) {
            request.setFailedAttempts(request.getFailedAttempts() + 1);
            emailChangeRequestRepository.save(request);
            throw new VerificationException("The verification code you entered is incorrect.");
        }

        currentUser.setEmail(cleanNewEmail);
        userRepository.save(currentUser);
        emailChangeRequestRepository.delete(request);
    }

    private void validateToken(PasswordResetToken token, int otp) {
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(token);
            throw new VerificationException("Reset code has expired. Please request a new one.");
        }

        if (token.getFailedAttempts() >= 5) {
            passwordResetTokenRepository.delete(token);
            throw new VerificationException("Maximum attempts exceeded. Please request a new reset code.");
        }

        boolean matches = false;
        if (token.getHashedOtp() != null) {
            matches = token.getHashedOtp().equals(SessionService.hashToken(String.valueOf(otp)));
        } else {
            matches = (token.getOtp() == otp);
        }

        if (!matches) {
            token.setFailedAttempts(token.getFailedAttempts() + 1);
            passwordResetTokenRepository.save(token);
            throw new VerificationException("The reset code you entered is incorrect.");
        }
    }
}
