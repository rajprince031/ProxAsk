package com.proxask.controller;

import com.proxask.dto.question.QuestionDTO;
import com.proxask.dto.response.ApiResponse;
import com.proxask.enums.Visibility;
import com.proxask.service.question.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping({"/ask/{username}", "/api/questions/{username}"})
    public ResponseEntity<ApiResponse<QuestionDTO>> postQuestionToUser(
            @RequestBody QuestionDTO question,
            @PathVariable String username) {
        QuestionDTO questionDTO = questionService.postQuestion(question, username);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Question posted successfully", questionDTO));
    }

    @PostMapping({"/api/questions", "/questions"})
    public ResponseEntity<ApiResponse<QuestionDTO>> postQuestion(@RequestBody QuestionDTO question) {
        String receiver = question.getReceiverUsername();
        if (receiver == null || receiver.trim().isEmpty()) {
            throw new IllegalArgumentException("Receiver username is required to post a question");
        }
        QuestionDTO questionDTO = questionService.postQuestion(question, receiver.trim());
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Question posted successfully", questionDTO));
    }

    @GetMapping({"/ask/{username}", "/api/questions/user/{username}"})
    public ResponseEntity<ApiResponse<List<QuestionDTO>>> getAllQuestionByUser(@PathVariable String username) {
        List<QuestionDTO> questionDTOList = questionService.getQuestionsByUser(username);
        return ResponseEntity.ok(new ApiResponse<>(true, "Questions retrieved", questionDTOList));
    }

    @GetMapping({"/api/questions/feed", "/questions/feed", "/api/questions"})
    public ResponseEntity<ApiResponse<List<QuestionDTO>>> getFeedQuestions() {
        List<QuestionDTO> feed = questionService.getFeedQuestions();
        return ResponseEntity.ok(new ApiResponse<>(true, "Feed questions retrieved", feed));
    }

    @PreAuthorize("@isAuth.hasQuestionPermission(#questionId, authentication)")
    @PutMapping({"/ask/{questionId}/visibility", "/api/questions/{questionId}/visibility"})
    public ResponseEntity<ApiResponse<QuestionDTO>> updateQuestionVisibility(
            @PathVariable String questionId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String visStr = body.getOrDefault("visibility", "PUBLIC");
        Visibility visibility = Visibility.valueOf(visStr.toUpperCase());
        QuestionDTO questionDTO = questionService.updateQuestionVisibility(questionId, visibility, authentication);
        return ResponseEntity.ok(new ApiResponse<>(true, "Question visibility updated", questionDTO));
    }

    @PreAuthorize("@isAuth.hasQuestionPermission(#questionId, authentication)")
    @DeleteMapping({"/ask/{questionId}", "/api/questions/{questionId}"})
    public ResponseEntity<ApiResponse<QuestionDTO>> deleteQuestion(
            @PathVariable String questionId,
            Authentication authentication) {
        QuestionDTO questionDTO = questionService.deleteQuestionById(questionId, authentication);
        return ResponseEntity.ok(new ApiResponse<>(true, "Question deleted successfully", questionDTO));
    }
}
