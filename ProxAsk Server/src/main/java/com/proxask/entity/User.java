package com.proxask.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.proxask.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@ToString(exclude = {"followers", "followings", "emailVerification", "sessions", "passwordResetTokens", "emailChangeRequests"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;

    @Column(nullable = false)
    private String firstName;
    private String lastName;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 1000)
    private String bio;
    private String avatar;
    private String location;
    private String website;

    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column(nullable = false)
    private Boolean isVerified = false;

    @Column(length = 128)
    private String otpCode;

    private Instant otpExpiry;

    private Instant verificationExpiresAt;

    @Column(nullable = false)
    private int otpAttempts = 0;

    @Column(nullable = false)
    private Boolean isPrivate = false;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public boolean isVerified() {
        return Boolean.TRUE.equals(this.isVerified) || Boolean.TRUE.equals(this.verified);
    }

    public Boolean getVerified() {
        return isVerified();
    }

    public Boolean getIsVerified() {
        return isVerified();
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
        this.isVerified = verified;
        if (Boolean.TRUE.equals(verified)) {
            this.otpExpiry = null;
            this.verificationExpiresAt = null;
        }
    }

    public void setIsVerified(Boolean isVerified) {
        this.verified = isVerified;
        this.isVerified = isVerified;
        if (Boolean.TRUE.equals(isVerified)) {
            this.otpExpiry = null;
            this.verificationExpiresAt = null;
        }
    }

    public void setOtpExpiry(Instant otpExpiry) {
        this.otpExpiry = otpExpiry;
        this.verificationExpiresAt = otpExpiry;
    }

    public void setVerificationExpiresAt(Instant verificationExpiresAt) {
        this.verificationExpiresAt = verificationExpiresAt;
        if (this.otpExpiry == null) {
            this.otpExpiry = verificationExpiresAt;
        }
    }

    public void setUsername(String username) {
        this.username = username != null ? username.toLowerCase() : null;
    }

    @OneToMany(mappedBy = "follower", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Follow> followers = new ArrayList<>();

    @OneToMany(mappedBy = "following", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Follow> followings = new ArrayList<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private EmailVerification emailVerification;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserSession> sessions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PasswordResetToken> passwordResetTokens = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmailChangeRequest> emailChangeRequests = new ArrayList<>();
}
