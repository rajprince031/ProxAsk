package com.proxask;

import com.proxask.entity.EmailVerification;
import com.proxask.entity.User;
import com.proxask.exception.UserAlreadyVerifiedException;
import com.proxask.exception.VerificationException;
import com.proxask.repository.EmailVerificationRepository;
import com.proxask.repository.UserRepository;
import com.proxask.service.auth.OtpService;
import com.proxask.service.auth.SessionService;
import com.proxask.service.auth.VerificationService;
import com.proxask.service.auth.VerificationSupportService;
import com.proxask.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpVerificationTest {

    @Mock
    private EmailVerificationRepository emailVerificationRepository;

    @Mock
    private UserRepository userRepository;

    private UserService userService;
    private VerificationSupportService verificationSupportService;
    private VerificationService verificationService;

    private User testUser;
    private EmailVerification testVerification;
    private int rawOtp = 654321;
    private String hashedOtp;
    private int failedAttemptsCount = 0;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("user-otp-1");
        testUser.setEmail("alex@proxask.com");
        testUser.setUsername("alex_creator");
        testUser.setIsVerified(false);
        testUser.setVerified(false);
        testUser.setOtpAttempts(0);
        testUser.setOtpExpiry(Instant.now().plus(10, ChronoUnit.MINUTES));

        hashedOtp = SessionService.hashToken(String.valueOf(rawOtp));
        testUser.setOtpCode(hashedOtp);

        testVerification = EmailVerification.builder()
                .id("ev-1")
                .user(testUser)
                .otp(rawOtp)
                .hashedOtp(hashedOtp)
                .failedAttempts(0)
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .build();

        failedAttemptsCount = 0;

        userService = new UserService(userRepository, null, null, null) {
            @Override
            public User getUserByEmail(String email) {
                return testUser;
            }
        };

        verificationSupportService = spy(new VerificationSupportService(emailVerificationRepository, userRepository) {
            @Override
            public void incrementFailedAttempts(EmailVerification ev) {
                failedAttemptsCount++;
                ev.setFailedAttempts(ev.getFailedAttempts() + 1);
            }

            @Override
            public void isMaxAttemptsExceeded(EmailVerification ev) {
                if (ev.getFailedAttempts() >= 3) {
                    throw new VerificationException("Too many failed attempts. Please request a new OTP.");
                }
            }

            @Override
            public void deleteUnverifiedUser(User user) {
                // Mock deletion of unverified user
            }
        });

        verificationService = new VerificationService(
                emailVerificationRepository,
                userRepository,
                userService,
                verificationSupportService,
                null
        );

        lenient().when(userRepository.findByEmail("alex@proxask.com")).thenReturn(Optional.of(testUser));
    }

    @Test
    @DisplayName("Submitting valid OTP verifies user account and removes verification record")
    void testVerifyOtpSuccess() {
        when(emailVerificationRepository.findByUser(testUser)).thenReturn(Optional.of(testVerification));

        verificationService.verify("alex@proxask.com", rawOtp);

        assertThat(testUser.isVerified()).isTrue();
        verify(userRepository).save(testUser);
        verify(emailVerificationRepository).delete(testVerification);
    }

    @Test
    @DisplayName("Submitting wrong OTP increments failed attempts and throws VerificationException with remaining count")
    void testVerifyOtpFailure() {
        when(emailVerificationRepository.findByUser(testUser)).thenReturn(Optional.of(testVerification));

        assertThatThrownBy(() -> verificationService.verify("alex@proxask.com", 999999))
                .isInstanceOf(VerificationException.class)
                .hasMessageContaining("Invalid OTP")
                .hasMessageContaining("2 attempt(s) remaining");

        assertThat(testUser.isVerified()).isFalse();
        assertThat(testUser.getOtpAttempts()).isEqualTo(1);
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Exceeding 3 failed OTP attempts deletes user record and throws specific VerificationException")
    void testVerifyOtpMaxAttemptsExceeded() {
        when(emailVerificationRepository.findByUser(testUser)).thenReturn(Optional.of(testVerification));
        testUser.setOtpAttempts(2);

        assertThatThrownBy(() -> verificationService.verify("alex@proxask.com", 999999))
                .isInstanceOf(VerificationException.class)
                .hasMessageContaining("Maximum 3 OTP attempts exceeded")
                .hasMessageContaining("Your unverified registration has been deleted—please sign up again");

        verify(verificationSupportService).deleteUnverifiedUser(testUser);
    }

    @Test
    @DisplayName("Expired OTP (past 10-minute expiry) deletes unverified user and throws specific VerificationException")
    void testVerifyOtpExpired() {
        testUser.setOtpExpiry(Instant.now().minusSeconds(30));

        assertThatThrownBy(() -> verificationService.verify("alex@proxask.com", rawOtp))
                .isInstanceOf(VerificationException.class)
                .hasMessageContaining("OTP has expired after 10 minutes")
                .hasMessageContaining("Your unverified registration has been deleted—please sign up again");

        verify(verificationSupportService).deleteUnverifiedUser(testUser);
    }

    @Test
    @DisplayName("Attempting to verify already-verified user throws UserAlreadyVerifiedException")
    void testVerifyAlreadyVerifiedUser() {
        testUser.setIsVerified(true);
        testUser.setVerified(true);

        assertThatThrownBy(() -> verificationService.verify("alex@proxask.com", rawOtp))
                .isInstanceOf(UserAlreadyVerifiedException.class)
                .hasMessageContaining("already been verified");
    }
}
