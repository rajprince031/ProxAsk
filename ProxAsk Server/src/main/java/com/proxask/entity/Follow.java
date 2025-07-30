package com.proxask.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "follows")
@Data
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private Follow(){
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    @JsonBackReference
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "following_id", nullable = false)
    @JsonBackReference
    private User following;

    public Follow(User follower, User following) {
        this.follower = follower;
        this.following = following;
    }

    @CreationTimestamp
    @JoinColumn(name = "followed_at")
    private LocalDateTime followedAt;

}
