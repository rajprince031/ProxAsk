package com.proxask.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "answer_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "answer_id"})
})
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnswerLike {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_id", nullable = false)
    private Answer answer;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
