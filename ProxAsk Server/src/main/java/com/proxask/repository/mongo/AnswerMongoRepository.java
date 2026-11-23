package com.proxask.repository.mongo;

import com.proxask.document.AnswerDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerMongoRepository extends MongoRepository<AnswerDocument, String> {
    Optional<AnswerDocument> findByQuestionId(String questionId);
    List<AnswerDocument> findByCreatorUserIdOrderByCreatedAtDesc(String userId);
    List<AnswerDocument> findAllByOrderByCreatedAtDesc();
    long countByCreatorUserId(String userId);
}
