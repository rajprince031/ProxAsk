package com.proxask.service.question;

import com.proxask.dto.question.QuestionDTO;
import com.proxask.entity.Question;
import com.proxask.entity.User;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.QuestionRepository;
import com.proxask.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    public QuestionDTO postQuestion(QuestionDTO questionDTO, String receiverUsername){
        User receiver = userRepository
                .findByUsername(receiverUsername)
                .orElseThrow(() ->
                new ResourceNotFoundException("Receiver not found"));
        Question question = modelMapper.map(questionDTO, Question.class);
        question.setReceiver(receiver);
        if(!questionDTO.getSenderUsername().isBlank()){
            User sender =  userRepository
                    .findByUsername(questionDTO.getSenderUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
            question.setSender(sender);
        }
        Question savedQuestion = questionRepository.save(question);
        QuestionDTO savedQuestionDTO = modelMapper.map(savedQuestion,QuestionDTO.class);
        if(savedQuestion.getSender() != null)
            savedQuestionDTO.setSenderUsername(savedQuestion.getSender().getUsername());

        return savedQuestionDTO;
    }

    public QuestionDTO getQuestionById(String questionId){
        Question question = questionRepository
                .findById(questionId)
                .orElseThrow(() ->
                new ResourceNotFoundException("Question not found"));
        QuestionDTO questionDTO = modelMapper.map(question,QuestionDTO.class);
        if(question.getSender() != null) questionDTO.setSenderUsername(question.getSender().getUsername());
        return questionDTO;
    }

    public List<QuestionDTO> getQuestionsByUser(String receiverUsername) {
        User receiver = userRepository.findByUsername(receiverUsername).orElseThrow(() ->
                new ResourceNotFoundException("Receiver not found"));
        List<Question> questionList = receiver.getReceiveQuestions();
        List<QuestionDTO> questionDTOList = questionList.stream().map(question -> {
           QuestionDTO questionDTO =  modelMapper.map(question,QuestionDTO.class);
           if(question.getSender() != null) questionDTO.setSenderUsername(question.getSender().getUsername());
           return questionDTO;
        }).collect(Collectors.toList());

        return questionDTOList;

    }

    @Transactional
    public QuestionDTO deleteQuestionById(String questionId, Authentication authentication) throws AccessDeniedException {
        Question question = questionRepository.findById(questionId).orElseThrow(() ->
                new ResourceNotFoundException("Question not found"));
        if(!authentication.getName().equals(question.getReceiver().getUsername()))
            throw new AccessDeniedException("Unauthorized access");
        questionRepository.deleteById(questionId);
        QuestionDTO questionDTO = modelMapper.map(question, QuestionDTO.class);
        if(question.getSender() != null) questionDTO.setSenderUsername(question.getSender().getUsername());
        return questionDTO;
    }
}
