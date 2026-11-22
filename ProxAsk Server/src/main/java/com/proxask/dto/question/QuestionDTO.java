package com.proxask.dto.question;

import com.proxask.dto.AnswerDTO;
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
public class QuestionDTO {
    private String id;
    private String content;
    private String senderUsername;
    private String receiverUsername;
    private Boolean isAnonymous;
    private Visibility visibility;
    private AnswerDTO answer;
    private LocalDateTime createdAt;
}
