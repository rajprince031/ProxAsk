package com.proxask.service.question;

import com.proxask.dto.AnswerDTO;
import com.proxask.dto.question.QuestionDTO;
import com.proxask.entity.Question;
import com.proxask.entity.User;
import com.proxask.enums.Visibility;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.FollowRepository;
import com.proxask.repository.QuestionRepository;
import com.proxask.repository.UserRepository;
import com.proxask.service.answer.AnswerService;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final FollowRepository followRepository;
    private final UserService userService;
    private final AnswerService answerService;

    @Transactional
    public QuestionDTO postQuestion(QuestionDTO questionDTO, String receiverUsername) {
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found: " + receiverUsername));

        Question question = new Question();
        question.setContent(questionDTO.getContent());
        question.setReceiver(receiver);
        question.setVisibility(questionDTO.getVisibility() != null ? questionDTO.getVisibility() : Visibility.PUBLIC);

        // Security: Prevent sender identity spoofing.
        // If explicitly marked anonymous, set sender to null.
        // Otherwise, bind strictly to currently authenticated user if present.
        boolean isAnonymous = Boolean.TRUE.equals(questionDTO.getIsAnonymous());
        if (!isAnonymous) {
            User currentAuthenticatedUser = userService.getCurrentAuthenticatedUser();
            question.setSender(currentAuthenticatedUser);
        } else {
            question.setSender(null);
        }

        Question savedQuestion = questionRepository.save(question);
        return mapToDTO(savedQuestion);
    }

    @Transactional(readOnly = true)
    public QuestionDTO getQuestionById(String questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        return mapToDTO(question);
    }

    @Transactional(readOnly = true)
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

        List<Question> questionList = questionRepository.findByReceiverOrderByCreatedAtDesc(receiver);
        return questionList.stream()
                .filter(q -> canViewQuestion(q, caller, isOwner, isFollowing))
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuestionDTO> getFeedQuestions() {
        User caller = userService.getCurrentAuthenticatedUser();
        List<Question> questions = questionRepository.findAllByOrderByCreatedAtDesc();

        return questions.stream()
                .filter(q -> {
                    User receiver = q.getReceiver();
                    if (receiver == null) return false;
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

    @Transactional
    public QuestionDTO updateQuestionVisibility(String questionId, Visibility visibility, Authentication authentication) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        question.setVisibility(visibility);
        Question saved = questionRepository.save(question);
        return mapToDTO(saved);
    }

    @Transactional
    public QuestionDTO deleteQuestionById(String questionId, Authentication authentication) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        QuestionDTO questionDTO = mapToDTO(question);
        questionRepository.delete(question);
        return questionDTO;
    }

    private boolean canViewQuestion(Question q, User caller, boolean isOwner, boolean isFollowing) {
        Visibility v = q.getVisibility() != null ? q.getVisibility() : Visibility.PUBLIC;
        if (isOwner) return true;
        if (caller != null && q.getSender() != null && caller.getId().equals(q.getSender().getId())) return true;
        if (v == Visibility.PUBLIC) return true;
        if (v == Visibility.FOLLOWERS) return isFollowing;
        return false; // PRIVATE
    }

    private QuestionDTO mapToDTO(Question question) {
        User caller = userService.getCurrentAuthenticatedUser();

        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setContent(question.getContent());
        dto.setCreatedAt(question.getCreatedAt());
        dto.setVisibility(question.getVisibility() != null ? question.getVisibility() : Visibility.PUBLIC);
        dto.setReceiverUsername(question.getReceiver() != null ? question.getReceiver().getUsername() : null);

        if (question.getSender() != null) {
            dto.setSenderUsername(question.getSender().getUsername());
            dto.setIsAnonymous(false);
        } else {
            dto.setSenderUsername(null);
            dto.setIsAnonymous(true);
        }

        if (question.getAnswer() != null) {
            AnswerDTO ansDTO = answerService.toDTO(question.getAnswer(), caller);
            dto.setAnswer(ansDTO);
        }

        return dto;
    }
}
