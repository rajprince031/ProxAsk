package com.proxask.dto;

import com.proxask.dto.question.QuestionDTO;
import com.proxask.entity.Question;
import com.proxask.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


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
    private Boolean isActive;
    private Boolean isVerified;
    private Role role;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;
}
