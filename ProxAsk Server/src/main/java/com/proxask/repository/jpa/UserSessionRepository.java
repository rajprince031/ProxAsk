package com.proxask.repository.jpa;

import com.proxask.entity.User;
import com.proxask.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, String> {

    Optional<UserSession> findBySessionId(String sessionId);

    Optional<UserSession> findByRefreshTokenHash(String refreshTokenHash);

    List<UserSession> findAllByUserAndIsRevokedFalseOrderByLastActiveAtDesc(User user);

    List<UserSession> findAllByUser(User user);

    @Modifying
    @Query("UPDATE UserSession s SET s.isRevoked = true WHERE s.user = :user AND s.isRevoked = false")
    void revokeAllForUser(@Param("user") User user);

    @Modifying
    @Query("UPDATE UserSession s SET s.isRevoked = true WHERE s.user = :user AND s.sessionId <> :currentSessionId AND s.isRevoked = false")
    void revokeAllOtherSessionsForUser(@Param("user") User user, @Param("currentSessionId") String currentSessionId);

    void deleteByUser(User user);

    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.expiresAt < :now")
    void deleteExpiredSessions(@Param("now") LocalDateTime now);
}
