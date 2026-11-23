package com.proxask.service.question;

import com.proxask.document.AnswerDocument;
import com.proxask.document.QuestionDocument;
import com.proxask.document.SenderSnapshot;
import com.proxask.dto.AnswerDTO;
import com.proxask.dto.question.QuestionDTO;
import com.proxask.entity.User;
import com.proxask.enums.Visibility;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.jpa.FollowRepository;
import com.proxask.repository.jpa.UserRepository;
import com.proxask.repository.mongo.AnswerMongoRepository;
import com.proxask.repository.mongo.QuestionMongoRepository;
import com.proxask.service.answer.AnswerService;
import com.proxask.service.notification.NotificationService;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final QuestionMongoRepository questionMongoRepository;
    private final AnswerMongoRepository answerMongoRepository;
    private final UserService userService;
    private final AnswerService answerService;
    private final NotificationService notificationService;

    public QuestionDTO postQuestion(QuestionDTO questionDTO, String receiverUsername) {
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found: " + receiverUsername));

        boolean isAnonymous = Boolean.TRUE.equals(questionDTO.getIsAnonymous());
        SenderSnapshot senderSnapshot = null;

        if (!isAnonymous) {
            User currentAuthenticatedUser = userService.getCurrentAuthenticatedUser();
            if (currentAuthenticatedUser != null) {
                senderSnapshot = SenderSnapshot.builder()
                        .userId(currentAuthenticatedUser.getId())
                        .username(currentAuthenticatedUser.getUsername())
                        .avatar(currentAuthenticatedUser.getAvatar())
                        .build();
            }
        }

        QuestionDocument question = QuestionDocument.builder()
                .content(questionDTO.getContent())
                .receiverId(receiver.getId())
                .receiverUsername(receiver.getUsername())
                .sender(senderSnapshot)
                .visibility(questionDTO.getVisibility() != null ? questionDTO.getVisibility() : Visibility.PUBLIC)
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        QuestionDocument savedQuestion = questionMongoRepository.save(question);

        // Notify recipient if caller is not the recipient
        User caller = userService.getCurrentAuthenticatedUser();
        if (caller == null || !caller.getId().equals(receiver.getId())) {
            String actorName = senderSnapshot != null ? senderSnapshot.getUsername() : "Anonymous";
            String actorAvatar = senderSnapshot != null ? senderSnapshot.getAvatar() : null;
            String actorId = senderSnapshot != null ? senderSnapshot.getUserId() : null;
            notificationService.createNotification(
                    receiver.getId(),
                    actorName,
                    actorAvatar,
                    actorId,
                    "QUESTION",
                    actorName + " asked you a question",
                    savedQuestion.getId()
            );
        }

        return mapToDTO(savedQuestion);
    }

    public QuestionDTO getQuestionById(String questionId) {
        QuestionDocument question = questionMongoRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));
        return mapToDTO(question);
    }

    public List<QuestionDTO> getQuestionsByUser(String receiverUsername) {
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found: " + receiverUsername));

        User caller = userService.getCurrentAuthenticatedUser();
        boolean isOwner = caller != null && caller.getId().equals(receiver.getId());
        boolean isFollowing = caller != null && followRepository.existsByFollowerAndFollowing(caller, receiver);

        // If target account is private, and caller is not owner and not an approved follower: return empty list
        if (Boolean.TRUE.equals(receiver.getIsPrivate()) && !isOwner && !isFollowing) {
            return List.of();
        }

        List<QuestionDocument> questionList = questionMongoRepository.findByReceiverUsernameOrderByCreatedAtDesc(receiver.getUsername());
        return questionList.stream()
                .filter(q -> canViewQuestion(q, caller, isOwner, isFollowing))
                .map(this::mapToDTO)
                .toList();
    }

    public List<QuestionDTO> getFeedQuestions() {
        User caller = userService.getCurrentAuthenticatedUser();
        List<QuestionDocument> questions = questionMongoRepository.findAllByOrderByCreatedAtDesc();

        return questions.stream()
                .filter(q -> {
                    String receiverUsername = q.getReceiverUsername();
                    if (receiverUsername == null) return false;

                    Optional<User> receiverOpt = userRepository.findByUsername(receiverUsername);
                    if (receiverOpt.isEmpty()) return false;
                    User receiver = receiverOpt.get();

                    boolean isOwner = caller != null && caller.getId().equals(receiver.getId());
                    boolean isFollowing = caller != null && followRepository.existsByFollowerAndFollowing(caller, receiver);

                    // If receiver account is private, only owner or approved follower sees it
                    if (Boolean.TRUE.equals(receiver.getIsPrivate()) && !isOwner && !isFollowing) {
                        return false;
                    }

                    return canViewQuestion(q, caller, isOwner, isFollowing);
                })
                .map(this::mapToDTO)
                .toList();
    }

    public QuestionDTO updateQuestionVisibility(String questionId, Visibility visibility, Authentication authentication) {
        QuestionDocument question = questionMongoRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));
        question.setVisibility(visibility);
        QuestionDocument saved = questionMongoRepository.save(question);
        return mapToDTO(saved);
    }

    public QuestionDTO deleteQuestionById(String questionId, Authentication authentication) {
        QuestionDocument question = questionMongoRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));
        QuestionDTO questionDTO = mapToDTO(question);
        questionMongoRepository.delete(question);

        // Also clean up any associated answer in Mongo
        answerMongoRepository.findByQuestionId(questionId)
                .ifPresent(answerMongoRepository::delete);

        return questionDTO;
    }

    private boolean canViewQuestion(QuestionDocument q, User caller, boolean isOwner, boolean isFollowing) {
        Visibility v = q.getVisibility() != null ? q.getVisibility() : Visibility.PUBLIC;
        if (isOwner) return true;
        if (caller != null && q.getSender() != null && caller.getId().equals(q.getSender().getUserId())) return true;
        if (v == Visibility.PUBLIC) return true;
        if (v == Visibility.FOLLOWERS) return isFollowing;
        return false; // PRIVATE
    }

    public QuestionDTO mapToDTO(QuestionDocument question) {
        User caller = userService.getCurrentAuthenticatedUser();

        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setContent(question.getContent());
        if (question.getCreatedAt() != null) {
            dto.setCreatedAt(LocalDateTime.ofInstant(question.getCreatedAt(), ZoneId.systemDefault()));
        } else {
            dto.setCreatedAt(LocalDateTime.now());
        }
        dto.setVisibility(question.getVisibility() != null ? question.getVisibility() : Visibility.PUBLIC);
        dto.setReceiverUsername(question.getReceiverUsername());

        if (question.getSender() != null) {
            dto.setSenderUsername(question.getSender().getUsername());
            dto.setIsAnonymous(false);
        } else {
            dto.setSenderUsername(null);
            dto.setIsAnonymous(true);
        }

        // Attach answer if present
        Optional<AnswerDocument> ansOpt = answerMongoRepository.findByQuestionId(question.getId());
        ansOpt.ifPresent(answerDocument -> dto.setAnswer(answerService.toDTO(answerDocument, caller)));

        return dto;
    }
}
