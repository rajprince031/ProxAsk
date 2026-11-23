package com.proxask.service.auth;

import com.proxask.entity.User;
import com.proxask.repository.EmailVerificationRepository;
import com.proxask.repository.UserRepository;
import com.proxask.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UnverifiedUserCleanupService {

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final UserSessionRepository userSessionRepository;
    private final VerificationSupportService verificationSupportService;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupExpiredUnverifiedUsers() {
        try {
            LocalDateTime cutoff = LocalDateTime.now().minusMinutes(10);
            Instant now = Instant.now();
            List<User> expiredUsers = userRepository.findExpiredUnverifiedUsers(now, cutoff);
            if (!expiredUsers.isEmpty()) {
                log.info("Scheduled cleanup: found {} unverified account(s) older than 10 minutes", expiredUsers.size());
                for (User u : expiredUsers) {
                    verificationSupportService.deleteUnverifiedUser(u);
                    log.info("Cleaned up expired unverified account: {} ({})", u.getUsername(), u.getEmail());
                }
            }

            userSessionRepository.deleteExpiredSessions(LocalDateTime.now());
        } catch (Exception e) {
            log.warn("Scheduled cleanup encountered an issue: {}", e.getMessage());
        }
    }
}
