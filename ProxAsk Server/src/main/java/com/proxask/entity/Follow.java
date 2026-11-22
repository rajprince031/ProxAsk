package com.proxask.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.proxask.enums.FollowStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "follows", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"follower_id", "following_id"})
})
@Data
@NoArgsConstructor
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    @JsonBackReference
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "following_id", nullable = false)
    @JsonBackReference
    private User following;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FollowStatus status = FollowStatus.ACCEPTED;

    public Follow(User follower, User following) {
        this.follower = follower;
        this.following = following;
        this.status = FollowStatus.ACCEPTED;
    }

    public Follow(User follower, User following, FollowStatus status) {
        this.follower = follower;
        this.following = following;
        this.status = status;
    }

    @CreationTimestamp
    @Column(name = "followed_at")
    private LocalDateTime followedAt;
}
