package com.proxask.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_session", indexes = {
        @Index(name = "idx_user_session_session_id", columnList = "sessionId", unique = true),
        @Index(name = "idx_user_session_refresh_token_hash", columnList = "refreshTokenHash"),
        @Index(name = "idx_user_session_user_id", columnList = "user_id")
})
public class UserSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String sessionId;

    @Column(nullable = false, length = 128)
    private String refreshTokenHash;

    @Column(length = 255)
    private String deviceInfo;

    @Column(length = 1000)
    private String userAgent;

    @Column(length = 64)
    private String ipAddress;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isRevoked = false;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime lastActiveAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
