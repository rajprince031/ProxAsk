package com.proxask;

import com.proxask.entity.User;
import com.proxask.exception.EmailAlreadyInUseException;
import com.proxask.exception.UsernameAlreadyInUseException;
import com.proxask.exception.VerificationException;
import com.proxask.repository.EmailVerificationRepository;
import com.proxask.repository.UserRepository;
import com.proxask.service.auth.VerificationSupportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthDuplicateAndTtlTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailVerificationRepository emailVerificationRepository;

    @InjectMocks
    private VerificationSupportService verificationSupportService;

    private User verifiedUser;
    private User pendingUnverifiedUser;
    private User expiredUnverifiedUser;

    @BeforeEach
    void setUp() {
        verifiedUser = new User();
        verifiedUser.setId("u-1");
        verifiedUser.setEmail("alex@proxask.com");
        verifiedUser.setUsername("alex_creator");
        verifiedUser.setIsVerified(true);
        verifiedUser.setCreatedAt(LocalDateTime.now().minusDays(5));

        pendingUnverifiedUser = new User();
        pendingUnverifiedUser.setId("u-2");
        pendingUnverifiedUser.setEmail("pending@proxask.com");
        pendingUnverifiedUser.setUsername("pending_user");
        pendingUnverifiedUser.setIsVerified(false);
        // Created 3 minutes ago (within 10-minute window)
        pendingUnverifiedUser.setCreatedAt(LocalDateTime.now().minusMinutes(3));

        expiredUnverifiedUser = new User();
        expiredUnverifiedUser.setId("u-3");
        expiredUnverifiedUser.setEmail("expired@proxask.com");
        expiredUnverifiedUser.setUsername("expired_user");
        expiredUnverifiedUser.setIsVerified(false);
        // Created 15 minutes ago (older than 10-minute window)
        expiredUnverifiedUser.setCreatedAt(LocalDateTime.now().minusMinutes(15));
    }

    @Test
    @DisplayName("Duplicate registration with already-verified email throws EmailAlreadyInUseException")
    void testVerifiedEmailRejected() {
        when(userRepository.findByEmail("alex@proxask.com")).thenReturn(Optional.of(verifiedUser));

        assertThatThrownBy(() -> verificationSupportService.cleanupUnverifiedConflicts("alex@proxask.com", "brand_new_username"))
                .isInstanceOf(EmailAlreadyInUseException.class)
                .hasMessageContaining("Email is already registered");

        verify(userRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Duplicate registration with already-verified username throws UsernameAlreadyInUseException")
    void testVerifiedUsernameRejected() {
        when(userRepository.findByEmail("new_email@proxask.com")).thenReturn(Optional.empty());
        when(userRepository.findByUsername("alex_creator")).thenReturn(Optional.of(verifiedUser));

        assertThatThrownBy(() -> verificationSupportService.cleanupUnverifiedConflicts("new_email@proxask.com", "alex_creator"))
                .isInstanceOf(UsernameAlreadyInUseException.class)
                .hasMessageContaining("Username is already registered");

        verify(userRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Registration with email pending verification (< 10 mins) throws VerificationException with guidance")
    void testPendingUnverifiedEmailRejected() {
        when(userRepository.findByEmail("pending@proxask.com")).thenReturn(Optional.of(pendingUnverifiedUser));

        assertThatThrownBy(() -> verificationSupportService.cleanupUnverifiedConflicts("pending@proxask.com", "other_user"))
                .isInstanceOf(VerificationException.class)
                .hasMessageContaining("pending verification");

        verify(userRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Registration with email past 10-minute TTL cleans up abandoned unverified user and allows registration")
    void testExpiredUnverifiedEmailCleanedUp() {
        when(userRepository.findByEmail("expired@proxask.com")).thenReturn(Optional.of(expiredUnverifiedUser));
        when(userRepository.findByUsername("expired_user")).thenReturn(Optional.empty());

        verificationSupportService.cleanupUnverifiedConflicts("expired@proxask.com", "expired_user");

        // Old abandoned record deleted
        verify(emailVerificationRepository).deleteByUser(expiredUnverifiedUser);
        verify(userRepository).delete(expiredUnverifiedUser);
    }
}
