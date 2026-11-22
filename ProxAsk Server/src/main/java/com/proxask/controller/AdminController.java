package com.proxask.controller;

import com.proxask.dto.UserDTO;
import com.proxask.dto.question.QuestionDTO;
import com.proxask.dto.response.ApiResponse;
import com.proxask.entity.User;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.AnswerLikeRepository;
import com.proxask.repository.AnswerRepository;
import com.proxask.repository.QuestionRepository;
import com.proxask.repository.UserRepository;
import com.proxask.service.question.QuestionService;
import lombok.RequiredArgsConstructor;
import com.proxask.mapper.UserMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/admin", "/api/admin"})
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final AnswerLikeRepository answerLikeRepository;
    private final QuestionService questionService;
    private final UserMapper userMapper;

    @GetMapping("/all-user")
    public ResponseEntity<List<UserDTO>> getAllUser() {
        List<UserDTO> users = userRepository.findAll().stream()
                .map(userMapper::toDTO)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping({"/stats", "/overview"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findAll().stream().filter(u -> Boolean.TRUE.equals(u.getIsActive())).count();
        long verifiedUsers = userRepository.findAll().stream().filter(u -> Boolean.TRUE.equals(u.getIsVerified())).count();
        long totalQuestions = questionRepository.count();
        long totalAnswers = answerRepository.count();
        long totalLikes = answerLikeRepository.count();

        Map<String, Object> stats = Map.of(
                "totalUsers", totalUsers,
                "activeUsers", activeUsers,
                "verifiedUsers", verifiedUsers,
                "totalQuestions", totalQuestions,
                "totalAnswers", totalAnswers,
                "totalLikes", totalLikes
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Platform metrics retrieved", stats));
    }

    @PutMapping("/user/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<UserDTO>> toggleUserStatus(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        boolean current = user.getIsActive() != null ? user.getIsActive() : true;
        user.setIsActive(!current);
        User saved = userRepository.save(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "User status updated", userMapper.toDTO(saved)));
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        userRepository.delete(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "User deleted successfully", true));
    }

    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<List<QuestionDTO>>> getAllQuestionsForModeration() {
        List<QuestionDTO> questions = questionService.getFeedQuestions();
        return ResponseEntity.ok(new ApiResponse<>(true, "Questions for moderation retrieved", questions));
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteQuestionModeration(
            @PathVariable String questionId,
            Authentication authentication) {
        questionService.deleteQuestionById(questionId, authentication);
        return ResponseEntity.ok(new ApiResponse<>(true, "Question moderated successfully", true));
    }
}
