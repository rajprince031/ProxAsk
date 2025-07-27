package com.proxask.dto.question;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QuestionDTO {
    private String id;
    private String content;
    private String senderUsername;
    private LocalDateTime createdAt;
}
