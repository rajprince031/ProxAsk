package com.proxask.service.answer;

import com.proxask.document.AnswerDocument;
import com.proxask.document.CreatorSnapshot;
import com.proxask.document.QuestionDocument;
import com.proxask.dto.AnswerDTO;
import com.proxask.entity.AnswerLike;
import com.proxask.entity.User;
import com.proxask.enums.Visibility;
import com.proxask.exception.QuestionAlreadyAnsweredException;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.jpa.AnswerLikeRepository;
import com.proxask.repository.mongo.AnswerMongoRepository;
import com.proxask.repository.mongo.QuestionMongoRepository;
import com.proxask.service.notification.NotificationService;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnswerService {
    private final AnswerMongoRepository answerMongoRepository;
    private final QuestionMongoRepository questionMongoRepository;
    private final AnswerLikeRepository answerLikeRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final MongoTemplate mongoTemplate;

    public AnswerDTO getAnswerByQuestionId(String questionId) {
        AnswerDocument answer = answerMongoRepository.findByQuestionId(questionId).orElseThrow(() ->
                new ResourceNotFoundException("Answer not found for question: " + questionId));

        User caller = userService.getCurrentAuthenticatedUser();
        return toDTO(answer, caller);
    }

    public AnswerDTO postAnswerByQuestionId(String questionId, AnswerDTO answerDTO) {
        QuestionDocument question = questionMongoRepository.findById(questionId).orElseThrow(() ->
                new ResourceNotFoundException("Question not found: " + questionId));

        if ("ANSWERED".equalsIgnoreCase(question.getStatus()) || answerMongoRepository.findByQuestionId(questionId).isPresent()) {
            throw new QuestionAlreadyAnsweredException("This question has already been answered");
        }

        User caller = userService.getCurrentAuthenticatedUser();
        if (caller == null) {
            throw new AccessDeniedException("User must be authenticated to answer a question");
        }

        CreatorSnapshot creator = CreatorSnapshot.builder()
                .userId(caller.getId())
                .username(caller.getUsername())
                .firstName(caller.getFirstName())
                .avatar(caller.getAvatar())
                .build();

        AnswerDocument answer = AnswerDocument.builder()
                .questionId(question.getId())
                .questionContent(question.getContent())
                .isAnonymousQuestion(question.getSender() == null)
                .askerUsername(question.getSender() != null ? question.getSender().getUsername() : null)
                .creator(creator)
                .content(answerDTO.getContent())
                .visibility(answerDTO.getVisibility() != null ? answerDTO.getVisibility() : Visibility.PUBLIC)
                .likeCount(0)
                .createdAt(Instant.now())
                .build();

        AnswerDocument savedAnswer = answerMongoRepository.save(answer);

        // Update Question status to ANSWERED
        question.setStatus("ANSWERED");
        questionMongoRepository.save(question);

        // Notify asker if not anonymous and asker is known
        if (question.getSender() != null && question.getSender().getUserId() != null) {
            notificationService.createNotification(
                    question.getSender().getUserId(),
                    caller.getUsername(),
                    caller.getAvatar(),
                    caller.getId(),
                    "ANSWER",
                    "@" + caller.getUsername() + " answered your question: \"" + question.getContent() + "\"",
                    question.getId()
            );
        }

        return toDTO(savedAnswer, caller);
    }

    public void deleteAnswerByQuestionId(String questionId) {
        AnswerDocument answer = findAnswerByIdOrQuestionId(questionId);
        answerMongoRepository.delete(answer);

        // Reset question status back to PENDING if question exists
        questionMongoRepository.findById(answer.getQuestionId()).ifPresent(q -> {
            q.setStatus("PENDING");
            questionMongoRepository.save(q);
        });
    }

    public AnswerDTO updateAnswerById(String answerId, AnswerDTO answerDTO) {
        AnswerDocument answer = answerMongoRepository.findById(answerId).orElseThrow(() ->
                new ResourceNotFoundException("Answer not found: " + answerId));

        answer.setContent(answerDTO.getContent());
        if (answerDTO.getVisibility() != null) {
            answer.setVisibility(answerDTO.getVisibility());
        }
        AnswerDocument updated = answerMongoRepository.save(answer);
        User caller = userService.getCurrentAuthenticatedUser();
        return toDTO(updated, caller);
    }

    @Transactional
    public Map<String, Object> toggleLike(String answerOrQuestionId, Authentication authentication) {
        User caller = userService.getCurrentAuthenticatedUser();
        if (caller == null) {
            throw new AccessDeniedException("User must be authenticated to like an answer.");
        }

        AnswerDocument answer = findAnswerByIdOrQuestionId(answerOrQuestionId);

        boolean alreadyLiked = answerLikeRepository.existsByUserAndAnswerId(caller, answer.getId());
        boolean nextLikedState;

        if (alreadyLiked) {
            answerLikeRepository.deleteByUserAndAnswerId(caller, answer.getId());
            // Atomic decrement in MongoDB Atlas
            mongoTemplate.updateFirst(
                    Query.query(Criteria.where("id").is(answer.getId())),
                    new Update().inc("likeCount", -1),
                    AnswerDocument.class
            );
            nextLikedState = false;
        } else {
            AnswerLike like = AnswerLike.builder()
                    .user(caller)
                    .answerId(answer.getId())
                    .build();
            answerLikeRepository.save(like);
            // Atomic increment in MongoDB Atlas
            mongoTemplate.updateFirst(
                    Query.query(Criteria.where("id").is(answer.getId())),
                    new Update().inc("likeCount", 1),
                    AnswerDocument.class
            );
            nextLikedState = true;
        }

        AnswerDocument refreshed = answerMongoRepository.findById(answer.getId()).orElse(answer);
        long count = Math.max(0, refreshed.getLikeCount());

        Map<String, Object> response = new HashMap<>();
        response.put("liked", nextLikedState);
        response.put("likesCount", count);
        response.put("answerId", answer.getId());
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLikeStatus(String answerOrQuestionId) {
        User caller = userService.getCurrentAuthenticatedUser();
        AnswerDocument answer = findAnswerByIdOrQuestionId(answerOrQuestionId);

        boolean isLiked = caller != null && answerLikeRepository.existsByUserAndAnswerId(caller, answer.getId());
        long count = Math.max(0, answer.getLikeCount());

        Map<String, Object> response = new HashMap<>();
        response.put("liked", isLiked);
        response.put("likesCount", count);
        response.put("answerId", answer.getId());
        return response;
    }

    public AnswerDocument findAnswerByIdOrQuestionId(String id) {
        return answerMongoRepository.findById(id)
                .or(() -> answerMongoRepository.findByQuestionId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found with ID or Question ID: " + id));
    }

    public AnswerDTO toDTO(AnswerDocument answer, User caller) {
        if (answer == null) return null;

        boolean isLiked = caller != null && answerLikeRepository.existsByUserAndAnswerId(caller, answer.getId());
        long likesCount = Math.max(0, answer.getLikeCount());

        LocalDateTime createdDate = answer.getCreatedAt() != null
                ? LocalDateTime.ofInstant(answer.getCreatedAt(), ZoneId.systemDefault())
                : LocalDateTime.now();

        return AnswerDTO.builder()
                .id(answer.getId())
                .content(answer.getContent())
                .createdAt(createdDate)
                .visibility(answer.getVisibility())
                .likesCount(likesCount)
                .isLiked(isLiked)
                .build();
    }
}
