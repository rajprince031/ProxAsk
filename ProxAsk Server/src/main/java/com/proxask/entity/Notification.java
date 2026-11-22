package com.proxask.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    @JsonBackReference
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    @JsonBackReference
    private User actor;

    @Column(nullable = false)
    private String type; // FOLLOW, QUESTION, ANSWER, SYSTEM

    @Column(nullable = false, length = 1000)
    private String message;

    private String targetId;

    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
