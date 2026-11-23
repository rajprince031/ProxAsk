package com.proxask.document;

import com.proxask.enums.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "questions")
@CompoundIndex(name = "idx_receiver_status_created", def = "{'receiverId': 1, 'status': 1, 'createdAt': -1}")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDocument {

    @Id
    private String id;

    @Indexed
    private String receiverId;

    @Indexed
    private String receiverUsername;

    private SenderSnapshot sender;

    private String content;

    private Visibility visibility;

    @Builder.Default
    private String status = "PENDING";

    @Indexed
    @Builder.Default
    private Instant createdAt = Instant.now();
}
