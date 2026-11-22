package com.proxask.controller;

import com.proxask.dto.AnswerDTO;
import com.proxask.dto.response.ApiResponse;
import com.proxask.service.answer.AnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/answer/{id}", "/api/answer/{id}", "/api/answers/{id}"})
@RequiredArgsConstructor
public class AnswerController {

    private final AnswerService answerService;

    @GetMapping
    public ResponseEntity<ApiResponse<AnswerDTO>> getAnswerByQuestionId(@PathVariable("id") String questionId) {
        AnswerDTO answerDTO = answerService.getAnswerByQuestionId(questionId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Answer retrieved", answerDTO));
    }

    @PreAuthorize("@isAuth.hasQuestionPermission(#questionId, authentication)")
    @PostMapping
    public ResponseEntity<ApiResponse<AnswerDTO>> postAnswerByQuestionId(
            @PathVariable("id") String questionId,
            @RequestBody AnswerDTO answerDTO,
            Authentication authentication) {
        AnswerDTO responseAnswerDTO = answerService.postAnswerByQuestionId(questionId, answerDTO);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Answer posted successfully", responseAnswerDTO));
    }

    @PreAuthorize("@isAuth.hasQuestionPermission(#questionId, authentication)")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Boolean>> deleteAnswerByQuestionId(@PathVariable("id") String questionId) {
        answerService.deleteAnswerByQuestionId(questionId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Answer deleted successfully", true));
    }

    @PostMapping({"/like", "/likes"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleLike(
            @PathVariable("id") String answerOrQuestionId,
            Authentication authentication) {
        Map<String, Object> result = answerService.toggleLike(answerOrQuestionId, authentication);
        return ResponseEntity.ok(new ApiResponse<>(true, "Like status updated", result));
    }

    @GetMapping({"/like", "/likes"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLikeStatus(
            @PathVariable("id") String answerOrQuestionId) {
        Map<String, Object> result = answerService.getLikeStatus(answerOrQuestionId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Like status retrieved", result));
    }
}
