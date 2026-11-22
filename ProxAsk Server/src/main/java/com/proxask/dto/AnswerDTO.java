package com.proxask.dto;

import com.proxask.enums.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnswerDTO {
    private String id;
    private String content;
    private LocalDateTime createdAt;
    private Long likesCount;
    private Boolean isLiked;
    private Visibility visibility;

    public AnswerDTO(String id, String content) {
        this.id = id;
        this.content = content;
    }
}
