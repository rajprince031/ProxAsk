package com.proxask.mapper;

import com.proxask.dto.UserDTO;
import com.proxask.entity.User;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * Clean, high-performance, type-safe Java mapper for User and UserDTO.
 * Replaces reflection-based ModelMapper to ensure full JDK 25+ compatibility
 * and eliminate sun.misc.Unsafe deprecation warnings completely.
 */
@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .bio(user.getBio())
                .avatar(user.getAvatar())
                .location(user.getLocation())
                .website(user.getWebsite())
                .isActive(user.getIsActive() != null ? user.getIsActive() : true)
                .isVerified(user.isVerified())
                .verified(user.isVerified())
                .requiresVerification(!user.isVerified())
                .isPrivate(user.getIsPrivate() != null ? user.getIsPrivate() : false)
                .role(user.getRole())
                .updatedAt(user.getUpdatedAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public List<UserDTO> toDTOList(List<User> users) {
        if (users == null || users.isEmpty()) {
            return Collections.emptyList();
        }
        return users.stream().map(this::toDTO).toList();
    }
}
