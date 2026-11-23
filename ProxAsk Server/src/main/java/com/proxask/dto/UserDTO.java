package com.proxask.dto;

import com.proxask.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {
    private String id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String bio;
    private String avatar;
    private String location;
    private String website;
    private Boolean isActive;
    private Boolean isVerified;
    private Boolean verified;
    private Boolean requiresVerification;
    private Boolean isPrivate;
    private Role role;
    private Long followersCount;
    private Long followingCount;
    private Long questionsCount;
    private Long answersCount;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;
}
