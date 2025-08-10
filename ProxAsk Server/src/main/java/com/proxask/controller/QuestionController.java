package com.proxask.controller;


import com.proxask.dto.question.QuestionDTO;
import com.proxask.service.question.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ask")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping("/{username}")
    public ResponseEntity<QuestionDTO> postQuestions(@RequestBody QuestionDTO question, @PathVariable String username){
        QuestionDTO questionDTO =  questionService.postQuestion(question, username);
        return ResponseEntity.ok(questionDTO);
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<QuestionDTO>> getAllQuestionByUser(@PathVariable String username){
        List<QuestionDTO> questionDTOList = questionService.getQuestionsByUser(username);
        return ResponseEntity.ok(questionDTOList);
    }

    @PreAuthorize("@isAuth.hasQuestionPermission(#questionId, authentication)")
    @DeleteMapping("/{questionId}")
    public ResponseEntity<QuestionDTO> deleteQuestion(@PathVariable String questionId, Authentication authentication) {
        QuestionDTO questionDTO =  questionService.deleteQuestionById(questionId, authentication);
        return ResponseEntity.ok(questionDTO);
    }

}
