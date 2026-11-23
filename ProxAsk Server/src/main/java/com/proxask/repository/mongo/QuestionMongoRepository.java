package com.proxask.repository.mongo;

import com.proxask.document.QuestionDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionMongoRepository extends MongoRepository<QuestionDocument, String> {
    List<QuestionDocument> findByReceiverUsernameOrderByCreatedAtDesc(String receiverUsername);
    List<QuestionDocument> findByReceiverIdOrderByCreatedAtDesc(String receiverId);
    List<QuestionDocument> findByReceiverIdAndStatusOrderByCreatedAtDesc(String receiverId, String status);
    List<QuestionDocument> findAllByOrderByCreatedAtDesc();
    long countByReceiverUsername(String receiverUsername);
    long countByReceiverId(String receiverId);
}
