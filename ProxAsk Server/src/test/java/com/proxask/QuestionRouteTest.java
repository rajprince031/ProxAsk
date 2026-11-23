package com.proxask;

import com.proxask.controller.QuestionController;
import com.proxask.dto.question.QuestionDTO;
import com.proxask.exception.GlobalExceptionHandler;
import com.proxask.service.question.QuestionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.http.HttpMethod;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class QuestionRouteTest {

    @Mock
    private QuestionService questionService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        QuestionController questionController = new QuestionController(questionService);
        mockMvc = MockMvcBuilders.standaloneSetup(questionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/ask/{username} successfully resolves to question listing without 404 NoResourceFoundException")
    void testGetQuestionsByUsernameWithApiPrefix() throws Exception {
        QuestionDTO q = new QuestionDTO();
        q.setId("q-101");
        q.setContent("How does ProxAsk work?");
        q.setReceiverUsername("alex_creator");

        when(questionService.getQuestionsByUser("alex_creator")).thenReturn(List.of(q));

        mockMvc.perform(get("/api/ask/alex_creator"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].content").value("How does ProxAsk work?"));
    }

    @Test
    @DisplayName("POST /api/ask/{username} successfully posts question to user with /api prefix")
    void testPostQuestionToUserWithApiPrefix() throws Exception {
        QuestionDTO responseDto = new QuestionDTO();
        responseDto.setId("q-102");
        responseDto.setContent("What is your favourite language?");
        responseDto.setReceiverUsername("alex_creator");

        when(questionService.postQuestion(any(QuestionDTO.class), eq("alex_creator"))).thenReturn(responseDto);

        mockMvc.perform(post("/api/ask/alex_creator")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"What is your favourite language?\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("q-102"));
    }
}
