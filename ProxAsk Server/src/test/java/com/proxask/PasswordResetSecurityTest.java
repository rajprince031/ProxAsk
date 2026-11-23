package com.proxask;

import com.proxask.entity.PasswordResetToken;
import com.proxask.entity.User;
import com.proxask.repository.jpa.PasswordResetTokenRepository;
import com.proxask.repository.jpa.UserRepository;
import com.proxask.repository.jpa.UserSessionRepository;
import com.proxask.service.auth.AccountSecurityService;
import com.proxask.service.auth.SessionService;
import com.proxask.service.jwt.JWTService;
import com.proxask.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetSecurityTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private UserSessionRepository userSessionRepository;

    private BCryptPasswordEncoder bCryptPasswordEncoder;
    private SessionService sessionService;
    private AccountSecurityService accountSecurityService;

    private User testUser;
    private PasswordResetToken resetToken;
    private int rawOtp = 123456;

    @BeforeEach
    void setUp() {
        bCryptPasswordEncoder = new BCryptPasswordEncoder();
        JWTService jwtService = new JWTService(
                "af60addca9ea3e3c099551e1b6576c9966dce0a33de879dd7e160f86dbd872ca236d6e9ee66fb6e30039fe7c345324a10f3d0741b0600fa7a45df4c6691eff4f4209767ed39f51e37717d8feecd5dd14fc34ebe619e6a29ae91d9ffe134cb5718bec0b3680d6ae7fc09e67763fe7c05d05d3ba69f47211163852633755b7f861132b0c98f8d7c1af9152d547408e676867a0a32fb525a4354180f5fb6b2dc23b5faa4155b8db63385f96259a90b6ee0e74a5b90a4f0f4fa96fafc296c64588b5c009b3829ae2e1d69a1cf7569b50a65fa553350495d18816f785f961c970c0a9cb9c8da25cc5e9fa4a3e9527a132d616b232d1ee21c3bf6dc8d9e3376e2e82c0",
                900000L
        );
        sessionService = new SessionService(userSessionRepository, jwtService);

        accountSecurityService = new AccountSecurityService(
                userRepository,
                null,
                passwordResetTokenRepository,
                null,
                new com.proxask.service.email.EmailService(null, null) {
                    @Override
                    public void sendPasswordResetEmail(String to, String name, int otp) {
                        // no-op for tests
                    }
                },
                bCryptPasswordEncoder,
                sessionService
        );

        testUser = new User();
        testUser.setId("user-pw-1");
        testUser.setEmail("alex@proxask.com");
        testUser.setUsername("alex_creator");
        testUser.setPassword(bCryptPasswordEncoder.encode("OldPassword123!"));

        resetToken = PasswordResetToken.builder()
                .id("prt-1")
                .user(testUser)
                .otp(rawOtp)
                .hashedOtp(SessionService.hashToken(String.valueOf(rawOtp)))
                .failedAttempts(0)
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .build();
    }

    @Test
    @DisplayName("Resetting password updates user password and revokes all active sessions for that user")
    void testResetPasswordRevokesAllSessions() {
        when(userRepository.findByEmail("alex@proxask.com")).thenReturn(Optional.of(testUser));
        when(passwordResetTokenRepository.findByUser(testUser)).thenReturn(Optional.of(resetToken));

        accountSecurityService.resetPassword("alex@proxask.com", rawOtp, "BrandNewPassword123!");

        // Password was encrypted with BCrypt
        assertThat(bCryptPasswordEncoder.matches("BrandNewPassword123!", testUser.getPassword())).isTrue();
        verify(userRepository).save(testUser);
        verify(passwordResetTokenRepository).delete(resetToken);

        // Security requirement: ALL active sessions must be revoked!
        verify(userSessionRepository).revokeAllForUser(testUser);
    }
}
