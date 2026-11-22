package com.proxask.service.answer;

import com.proxask.dto.AnswerDTO;
import com.proxask.entity.Answer;
import com.proxask.entity.AnswerLike;
import com.proxask.entity.Question;
import com.proxask.entity.User;
import com.proxask.enums.Visibility;
import com.proxask.exception.QuestionAlreadyAnsweredException;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.AnswerLikeRepository;
import com.proxask.repository.AnswerRepository;
import com.proxask.repository.QuestionRepository;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnswerService {
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final AnswerLikeRepository answerLikeRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public AnswerDTO getAnswerByQuestionId(String questionId) {
        Question question = questionRepository.findById(questionId).orElseThrow(() ->
                new ResourceNotFoundException("Question not found"));

        Answer answer = answerRepository.findByQuestion(question).orElseThrow(() ->
                new ResourceNotFoundException("Answer not found for this question"));

        User caller = userService.getCurrentAuthenticatedUser();
        return toDTO(answer, caller);
    }

    @Transactional
    public AnswerDTO postAnswerByQuestionId(String questionId, AnswerDTO answerDTO) {
        Question question = questionRepository.findById(questionId).orElseThrow(() ->
                new ResourceNotFoundException("Question not found"));

        if (question.getAnswer() != null) {
            throw new QuestionAlreadyAnsweredException("This question has already been answered");
        }

        Answer answer = new Answer();
        answer.setContent(answerDTO.getContent());
        answer.setQuestion(question);
        answer.setVisibility(answerDTO.getVisibility() != null ? answerDTO.getVisibility() : Visibility.PUBLIC);

        Answer savedAnswer = answerRepository.save(answer);
        User caller = userService.getCurrentAuthenticatedUser();
        return toDTO(savedAnswer, caller);
    }

    @Transactional
    public void deleteAnswerByQuestionId(String questionId) {
        Question question = questionRepository.findById(questionId).orElseThrow(() ->
                new ResourceNotFoundException("Question not found"));

        Answer answer = answerRepository.findByQuestion(question).orElseThrow(() ->
                new ResourceNotFoundException("Answer not found for this question"));

        answerRepository.delete(answer);
    }

    @Transactional
    public AnswerDTO updateAnswerById(String answerId, AnswerDTO answerDTO) {
        Answer answer = answerRepository.findById(answerId).orElseThrow(() ->
                new ResourceNotFoundException("Answer not found"));

        answer.setContent(answerDTO.getContent());
        if (answerDTO.getVisibility() != null) {
            answer.setVisibility(answerDTO.getVisibility());
        }
        Answer updated = answerRepository.save(answer);
        User caller = userService.getCurrentAuthenticatedUser();
        return toDTO(updated, caller);
    }

    @Transactional
    public Map<String, Object> toggleLike(String answerOrQuestionId, Authentication authentication) {
        User caller = userService.getCurrentAuthenticatedUser();
        if (caller == null) {
            throw new AccessDeniedException("User must be authenticated to like an answer.");
        }

        Answer answer = findAnswerByIdOrQuestionId(answerOrQuestionId);

        boolean alreadyLiked = answerLikeRepository.existsByUserAndAnswer(caller, answer);
        boolean nextLikedState;

        if (alreadyLiked) {
            answerLikeRepository.deleteByUserAndAnswer(caller, answer);
            nextLikedState = false;
        } else {
            AnswerLike like = new AnswerLike();
            like.setUser(caller);
            like.setAnswer(answer);
            answerLikeRepository.save(like);
            nextLikedState = true;
        }

        long count = answerLikeRepository.countByAnswer(answer);

        Map<String, Object> response = new HashMap<>();
        response.put("liked", nextLikedState);
        response.put("likesCount", count);
        response.put("answerId", answer.getId());
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLikeStatus(String answerOrQuestionId) {
        Answer answer = findAnswerByIdOrQuestionId(answerOrQuestionId);
        User caller = userService.getCurrentAuthenticatedUser();

        boolean isLiked = caller != null && answerLikeRepository.existsByUserAndAnswer(caller, answer);
        long count = answerLikeRepository.countByAnswer(answer);

        Map<String, Object> response = new HashMap<>();
        response.put("liked", isLiked);
        response.put("likesCount", count);
        response.put("answerId", answer.getId());
        return response;
    }

    private Answer findAnswerByIdOrQuestionId(String id) {
        // Try direct answer ID
        return answerRepository.findById(id)
                .or(() -> questionRepository.findById(id).map(Question::getAnswer))
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found with ID or Question ID: " + id));
    }

    public AnswerDTO toDTO(Answer answer, User caller) {
        if (answer == null) return null;

        long likesCount = answerLikeRepository.countByAnswer(answer);
        boolean isLiked = caller != null && answerLikeRepository.existsByUserAndAnswer(caller, answer);

        return AnswerDTO.builder()
                .id(answer.getId())
                .content(answer.getContent())
                .createdAt(answer.getCreatedAt())
                .visibility(answer.getVisibility())
                .likesCount(likesCount)
                .isLiked(isLiked)
                .build();
    }
}
