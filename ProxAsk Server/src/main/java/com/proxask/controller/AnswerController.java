package com.proxask.controller;


import com.proxask.dto.AnswerDTO;
import com.proxask.service.answer.AnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/answer/{id}")
public class AnswerController {

    @Autowired
    private AnswerService answerService;


    @GetMapping
    public ResponseEntity<AnswerDTO> getAnswerByQuestionId(@PathVariable("id") String questionId){
        AnswerDTO answerDTO = answerService.getAnswerByQuestionId(questionId);
        return ResponseEntity.ok(answerDTO);
    }

    @PreAuthorize("@isAuth.hasQuestionPermission(#questionId, authentication)")
    @PostMapping
    public ResponseEntity<AnswerDTO> postAnswerByQuestionId(@PathVariable("id") String questionId, @RequestBody AnswerDTO answerDTO, Authentication authentication){
        AnswerDTO responseAnswerDTO = answerService.postAnswerByQuestionId(questionId, answerDTO);
        return ResponseEntity.status(201).body(responseAnswerDTO);

    }

    @PreAuthorize("@isAuth.hasQuestionPermission(#questionId, authentication)")
    @DeleteMapping
    public ResponseEntity<Boolean> deleteAnswerByQuestionId(@PathVariable("id") String questionId){
        answerService.deleteAnswerByQuestionId(questionId);
        return ResponseEntity.ok(true);
    }
}
