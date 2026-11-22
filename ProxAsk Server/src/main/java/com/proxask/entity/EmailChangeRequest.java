package com.proxask.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_change_request")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmailChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String newEmail;

    @Column(nullable = false)
    private int otp;

    @Builder.Default
    private int failedAttempts = 0;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;
}
