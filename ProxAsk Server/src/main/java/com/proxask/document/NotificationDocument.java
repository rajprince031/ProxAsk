package com.proxask.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "notifications")
@CompoundIndex(name = "idx_recipient_read_created", def = "{'recipientId': 1, 'isRead': 1, 'createdAt': -1}")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDocument {

    @Id
    private String id;

    @Indexed
    private String recipientId;

    private ActorSnapshot actor;

    private String type; // FOLLOW, QUESTION, ANSWER, SYSTEM

    private String message;

    private String targetId;

    @Builder.Default
    private Boolean isRead = false;

    @Indexed(name = "idx_notification_ttl", expireAfter = "30d")
    @Builder.Default
    private Instant createdAt = Instant.now();
}
