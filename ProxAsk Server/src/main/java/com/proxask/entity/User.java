package com.proxask.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.proxask.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@ToString(exclude = {"sendQuestions", "receiveQuestions", "followers", "followings"})
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

    private Boolean isVerified = false;

    @Column(nullable = false)
    private Boolean isPrivate = false;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public void setUsername(String username) {
        this.username = username != null ? username.toLowerCase() : null;
    }

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Question> sendQuestions = new ArrayList<>();

    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Question> receiveQuestions = new ArrayList<>();

    @OneToMany(mappedBy = "follower", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Follow> followers = new ArrayList<>();

    @OneToMany(mappedBy = "following", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Follow> followings = new ArrayList<>();
}
