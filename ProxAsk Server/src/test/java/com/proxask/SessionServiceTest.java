package com.proxask;

import com.proxask.dto.auth.SessionResponseDTO;
import com.proxask.entity.User;
import com.proxask.entity.UserSession;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.exception.VerificationException;
import com.proxask.repository.UserSessionRepository;
import com.proxask.service.auth.SessionService;
import com.proxask.service.jwt.JWTService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private UserSessionRepository userSessionRepository;

    private JWTService jwtService;
    private SessionService sessionService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JWTService(
                "af60addca9ea3e3c099551e1b6576c9966dce0a33de879dd7e160f86dbd872ca236d6e9ee66fb6e30039fe7c345324a10f3d0741b0600fa7a45df4c6691eff4f4209767ed39f51e37717d8feecd5dd14fc34ebe619e6a29ae91d9ffe134cb5718bec0b3680d6ae7fc09e67763fe7c05d05d3ba69f47211163852633755b7f861132b0c98f8d7c1af9152d547408e676867a0a32fb525a4354180f5fb6b2dc23b5faa4155b8db63385f96259a90b6ee0e74a5b90a4f0f4fa96fafc296c64588b5c009b3829ae2e1d69a1cf7569b50a65fa553350495d18816f785f961c970c0a9cb9c8da25cc5e9fa4a3e9527a132d616b232d1ee21c3bf6dc8d9e3376e2e82c0",
                900000L
        );
        sessionService = new SessionService(userSessionRepository, jwtService);

        testUser = new User();
        testUser.setId("user-uuid-1");
        testUser.setUsername("alex_creator");
        testUser.setEmail("alex@proxask.com");
    }

    @Test
    @DisplayName("Create session hashes refresh token, parses device info, and embeds sessionId in JWT")
    void testCreateSession() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0.0.0 Safari/537.36");
        request.setRemoteAddr("127.0.0.1");

        when(userSessionRepository.save(any(UserSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SessionService.SessionTokens tokens = sessionService.createSession(testUser, request);

        assertThat(tokens).isNotNull();
        assertThat(tokens.getAccessToken()).isNotBlank();
        assertThat(tokens.getRawRefreshToken()).isNotBlank();
        assertThat(tokens.getSessionId()).isNotBlank();
        assertThat(tokens.getUserSession().getDeviceInfo()).isEqualTo("Chrome on macOS");
        assertThat(tokens.getUserSession().getRefreshTokenHash()).isEqualTo(SessionService.hashToken(tokens.getRawRefreshToken()));

        // Verify the generated JWT contains username and sessionId claims
        assertThat(jwtService.extractUsername(tokens.getAccessToken())).isEqualTo("alex_creator");
        assertThat(jwtService.extractSessionId(tokens.getAccessToken())).isEqualTo(tokens.getSessionId());

        verify(userSessionRepository).save(any(UserSession.class));
    }

    @Test
    @DisplayName("Rotate refresh token generates new tokens and updates session")
    void testRotateRefreshTokenSuccess() {
        String rawToken = "initial-raw-token";
        String hashedToken = SessionService.hashToken(rawToken);

        UserSession existingSession = UserSession.builder()
                .sessionId("session-1")
                .refreshTokenHash(hashedToken)
                .user(testUser)
                .isRevoked(false)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        when(userSessionRepository.findByRefreshTokenHash(hashedToken)).thenReturn(Optional.of(existingSession));
        when(userSessionRepository.save(any(UserSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SessionService.SessionTokens rotated = sessionService.rotateRefreshToken(rawToken, null);

        assertThat(rotated).isNotNull();
        assertThat(rotated.getAccessToken()).isNotBlank();
        assertThat(rotated.getRawRefreshToken()).isNotEqualTo(rawToken);
        assertThat(existingSession.getRefreshTokenHash()).isEqualTo(SessionService.hashToken(rotated.getRawRefreshToken()));

        assertThat(jwtService.extractUsername(rotated.getAccessToken())).isEqualTo("alex_creator");
        assertThat(jwtService.extractSessionId(rotated.getAccessToken())).isEqualTo("session-1");

        verify(userSessionRepository).save(existingSession);
    }

    @Test
    @DisplayName("Reuse detection: Presenting revoked refresh token revokes all sessions for user")
    void testTokenReuseDetectionRevokesAllSessions() {
        String rawToken = "stolen-old-token";
        String hashedToken = SessionService.hashToken(rawToken);

        UserSession revokedSession = UserSession.builder()
                .sessionId("compromised-session")
                .refreshTokenHash(hashedToken)
                .user(testUser)
                .isRevoked(true) // already revoked/used!
                .expiresAt(LocalDateTime.now().plusDays(5))
                .build();

        when(userSessionRepository.findByRefreshTokenHash(hashedToken)).thenReturn(Optional.of(revokedSession));

        assertThatThrownBy(() -> sessionService.rotateRefreshToken(rawToken, null))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Token reuse detected");

        // Verifies security action: ALL sessions revoked for that user!
        verify(userSessionRepository).revokeAllForUser(testUser);
    }

    @Test
    @DisplayName("IDOR Protection: User cannot revoke a session belonging to another user")
    void testRevokeSessionIdorProtection() {
        User otherUser = new User();
        otherUser.setId("user-uuid-999");
        otherUser.setUsername("victim_user");

        UserSession session = UserSession.builder()
                .sessionId("target-session-id")
                .user(otherUser) // Owned by other user!
                .isRevoked(false)
                .build();

        when(userSessionRepository.findBySessionId("target-session-id")).thenReturn(Optional.of(session));

        // Attacker testUser attempts to revoke target-session-id
        assertThatThrownBy(() -> sessionService.revokeSession("target-session-id", testUser))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("do not have permission");

        assertThat(session.getIsRevoked()).isFalse();
        verify(userSessionRepository, never()).save(session);
    }

    @Test
    @DisplayName("Revoke all other sessions invalidates all except current sessionId")
    void testRevokeAllOtherSessions() {
        sessionService.revokeAllOtherSessions(testUser, "current-session-id");
        verify(userSessionRepository).revokeAllOtherSessionsForUser(testUser, "current-session-id");
    }

    @Test
    @DisplayName("isSessionValid correctly identifies active, revoked, and expired sessions")
    void testIsSessionValid() {
        UserSession activeSession = UserSession.builder()
                .sessionId("active")
                .isRevoked(false)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        UserSession revokedSession = UserSession.builder()
                .sessionId("revoked")
                .isRevoked(true)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        UserSession expiredSession = UserSession.builder()
                .sessionId("expired")
                .isRevoked(false)
                .expiresAt(LocalDateTime.now().minusHours(1))
                .build();

        when(userSessionRepository.findBySessionId("active")).thenReturn(Optional.of(activeSession));
        when(userSessionRepository.findBySessionId("revoked")).thenReturn(Optional.of(revokedSession));
        when(userSessionRepository.findBySessionId("expired")).thenReturn(Optional.of(expiredSession));
        when(userSessionRepository.findBySessionId("nonexistent")).thenReturn(Optional.empty());

        assertThat(sessionService.isSessionValid("active")).isTrue();
        assertThat(sessionService.isSessionValid("revoked")).isFalse();
        assertThat(sessionService.isSessionValid("expired")).isFalse();
        assertThat(sessionService.isSessionValid("nonexistent")).isFalse();
        assertThat(sessionService.isSessionValid(null)).isFalse();
    }
}
