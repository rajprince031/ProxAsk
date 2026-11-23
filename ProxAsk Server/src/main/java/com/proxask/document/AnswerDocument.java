package com.proxask.document;

import com.proxask.enums.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "answers")
@CompoundIndexes({
    @CompoundIndex(name = "idx_creator_vis_created", def = "{'creator.userId': 1, 'visibility': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "idx_vis_created", def = "{'visibility': 1, 'createdAt': -1}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerDocument {

    @Id
    private String id;

    @Indexed
    private String questionId;

    private String questionContent;

    private Boolean isAnonymousQuestion;

    private String askerUsername;

    private CreatorSnapshot creator;

    private String content;

    private Visibility visibility;

    @Builder.Default
    private int likeCount = 0;

    @Indexed
    @Builder.Default
    private Instant createdAt = Instant.now();
}
