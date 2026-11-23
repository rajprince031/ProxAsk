package com.proxask.service.auth;

import com.proxask.dto.auth.SessionResponseDTO;
import com.proxask.entity.User;
import com.proxask.entity.UserSession;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.exception.VerificationException;
import com.proxask.repository.jpa.UserSessionRepository;
import com.proxask.service.jwt.JWTService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final UserSessionRepository userSessionRepository;
    private final JWTService jwtService;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Data
    @Builder
    public static class SessionTokens {
        private String accessToken;
        private String rawRefreshToken;
        private String sessionId;
        private UserSession userSession;
    }

    public static String hashToken(String rawToken) {
        if (rawToken == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    public static String generateSecureRefreshToken() {
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    @Transactional
    public SessionTokens createSession(User user, HttpServletRequest request) {
        String sessionId = UUID.randomUUID().toString();
        String rawRefreshToken = generateSecureRefreshToken();
        String hashedRefreshToken = hashToken(rawRefreshToken);

        String ipAddress = extractClientIp(request);
        String userAgent = request != null ? request.getHeader("User-Agent") : null;
        String deviceInfo = parseDeviceInfo(userAgent);

        UserSession session = UserSession.builder()
                .user(user)
                .sessionId(sessionId)
                .refreshTokenHash(hashedRefreshToken)
                .deviceInfo(deviceInfo)
                .userAgent(userAgent != null && userAgent.length() > 950 ? userAgent.substring(0, 950) : userAgent)
                .ipAddress(ipAddress)
                .isRevoked(false)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .lastActiveAt(LocalDateTime.now())
                .build();

        UserSession savedSession = userSessionRepository.save(session);
        String accessToken = jwtService.generateTokenWithSession(user.getUsername(), sessionId);

        log.info("Created active session {} for user {}", sessionId, user.getUsername());

        return SessionTokens.builder()
                .accessToken(accessToken)
                .rawRefreshToken(rawRefreshToken)
                .sessionId(sessionId)
                .userSession(savedSession)
                .build();
    }

    @Transactional
    public SessionTokens rotateRefreshToken(String rawRefreshToken, HttpServletRequest request) {
        if (rawRefreshToken == null || rawRefreshToken.trim().isEmpty()) {
            throw new VerificationException("Refresh token is required.");
        }

        String incomingHash = hashToken(rawRefreshToken.trim());
        Optional<UserSession> sessionOpt = userSessionRepository.findByRefreshTokenHash(incomingHash);

        if (sessionOpt.isEmpty()) {
            log.warn("Invalid refresh token attempted: hash not found");
            throw new VerificationException("Invalid refresh token.");
        }

        UserSession session = sessionOpt.get();

        // REUSE DETECTION: If this refresh token was already revoked, someone is reusing an old token!
        if (Boolean.TRUE.equals(session.getIsRevoked())) {
            log.error("SECURITY ALERT: Token reuse detected on revoked session {} for user {}. Revoking all sessions!",
                    session.getSessionId(), session.getUser().getUsername());
            userSessionRepository.revokeAllForUser(session.getUser());
            throw new AccessDeniedException("Security violation: Token reuse detected. All active sessions have been invalidated.");
        }

        // Expiration check
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            session.setIsRevoked(true);
            userSessionRepository.save(session);
            throw new VerificationException("Refresh token has expired. Please sign in again.");
        }

        // ROTATE: Issue new secure refresh token and new 15-minute access token
        String newRawRefreshToken = generateSecureRefreshToken();
        String newHash = hashToken(newRawRefreshToken);

        session.setRefreshTokenHash(newHash);
        session.setExpiresAt(LocalDateTime.now().plusDays(7));
        session.setLastActiveAt(LocalDateTime.now());

        if (request != null) {
            String ip = extractClientIp(request);
            if (ip != null) session.setIpAddress(ip);
            String userAgent = request.getHeader("User-Agent");
            if (userAgent != null) {
                session.setDeviceInfo(parseDeviceInfo(userAgent));
                session.setUserAgent(userAgent.length() > 950 ? userAgent.substring(0, 950) : userAgent);
            }
        }

        UserSession updatedSession = userSessionRepository.save(session);
        String newAccessToken = jwtService.generateTokenWithSession(session.getUser().getUsername(), session.getSessionId());

        log.info("Successfully rotated refresh token for session {} (user {})", session.getSessionId(), session.getUser().getUsername());

        return SessionTokens.builder()
                .accessToken(newAccessToken)
                .rawRefreshToken(newRawRefreshToken)
                .sessionId(session.getSessionId())
                .userSession(updatedSession)
                .build();
    }

    @Transactional(readOnly = true)
    public List<SessionResponseDTO> getActiveSessionsForUser(User user, String currentSessionId) {
        List<UserSession> sessions = userSessionRepository.findAllByUserAndIsRevokedFalseOrderByLastActiveAtDesc(user);
        return sessions.stream()
                .map(s -> SessionResponseDTO.builder()
                        .sessionId(s.getSessionId())
                        .deviceInfo(s.getDeviceInfo() != null ? s.getDeviceInfo() : "Web Browser")
                        .ipAddress(s.getIpAddress() != null ? s.getIpAddress() : "127.0.0.1")
                        .createdAt(s.getCreatedAt())
                        .lastActiveAt(s.getLastActiveAt() != null ? s.getLastActiveAt() : s.getCreatedAt())
                        .isCurrentSession(currentSessionId != null && currentSessionId.equals(s.getSessionId()))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void revokeSession(String sessionId, User currentUser) {
        UserSession session = userSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        // IDOR Prevention: Ensure authenticated user owns this session
        if (!session.getUser().getId().equals(currentUser.getId())) {
            log.warn("IDOR attempt: User {} tried to revoke session {} owned by user {}",
                    currentUser.getId(), sessionId, session.getUser().getId());
            throw new AccessDeniedException("You do not have permission to revoke this session.");
        }

        session.setIsRevoked(true);
        userSessionRepository.save(session);
        log.info("Revoked session {} for user {}", sessionId, currentUser.getUsername());
    }

    @Transactional
    public void revokeAllOtherSessions(User currentUser, String currentSessionId) {
        if (currentSessionId != null) {
            userSessionRepository.revokeAllOtherSessionsForUser(currentUser, currentSessionId);
            log.info("Revoked all other sessions for user {} except {}", currentUser.getUsername(), currentSessionId);
        } else {
            userSessionRepository.revokeAllForUser(currentUser);
            log.info("Revoked all sessions for user {}", currentUser.getUsername());
        }
    }

    @Transactional
    public void revokeAllSessionsForUser(User user) {
        userSessionRepository.revokeAllForUser(user);
        log.info("Revoked all active sessions for user {}", user.getUsername());
    }

    @Transactional(readOnly = true)
    public boolean isSessionValid(String sessionId) {
        if (sessionId == null) return false;
        Optional<UserSession> sessionOpt = userSessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isEmpty()) return false;

        UserSession session = sessionOpt.get();
        if (Boolean.TRUE.equals(session.getIsRevoked())) return false;
        return !session.getExpiresAt().isBefore(LocalDateTime.now());
    }

    @Transactional
    public void touchSession(String sessionId) {
        if (sessionId == null) return;
        userSessionRepository.findBySessionId(sessionId).ifPresent(session -> {
            if (!Boolean.TRUE.equals(session.getIsRevoked())) {
                session.setLastActiveAt(LocalDateTime.now());
                userSessionRepository.save(session);
            }
        });
    }

    public static String extractClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        if ("0:0:0:0:0:0:0:1".equals(ip) || "localhost".equalsIgnoreCase(ip)) {
            return "127.0.0.1";
        }
        return ip != null ? ip : "127.0.0.1";
    }

    public static String parseDeviceInfo(String userAgent) {
        if (userAgent == null || userAgent.trim().isEmpty()) {
            return "Desktop Web Client";
        }

        String os = "Unknown OS";
        if (userAgent.contains("Macintosh") || userAgent.contains("Mac OS")) {
            os = "macOS";
        } else if (userAgent.contains("Windows")) {
            os = "Windows";
        } else if (userAgent.contains("iPhone") || userAgent.contains("iPad")) {
            os = "iOS";
        } else if (userAgent.contains("Android")) {
            os = "Android";
        } else if (userAgent.contains("Linux")) {
            os = "Linux";
        }

        String browser = "Browser";
        if (userAgent.contains("Edg/")) {
            browser = "Edge";
        } else if (userAgent.contains("OPR/") || userAgent.contains("Opera")) {
            browser = "Opera";
        } else if (userAgent.contains("Chrome/")) {
            browser = "Chrome";
        } else if (userAgent.contains("Firefox/")) {
            browser = "Firefox";
        } else if (userAgent.contains("Safari/")) {
            browser = "Safari";
        }

        return browser + " on " + os;
    }
}
