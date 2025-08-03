package com.proxask.service.question;

import com.proxask.dto.question.QuestionDTO;
import com.proxask.entity.Question;
import com.proxask.entity.User;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.QuestionRepository;
import com.proxask.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        if(questionDTO.getSenderUsername() != null){
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
        return questionList.stream().map(question -> {
           QuestionDTO questionDTO =  modelMapper.map(question,QuestionDTO.class);
           if(question.getSender() != null) questionDTO.setSenderUsername(question.getSender().getUsername());
           return questionDTO;
        }).toList();

    }

    @Transactional
    public QuestionDTO deleteQuestionById(String questionId, Authentication authentication) {
        Question question = questionRepository.findById(questionId).orElseThrow(() ->
                new ResourceNotFoundException("Question not found"));
        questionRepository.delete(question);
        QuestionDTO questionDTO = modelMapper.map(question, QuestionDTO.class);
        if(question.getSender() != null) questionDTO.setSenderUsername(question.getSender().getUsername());
        return questionDTO;
    }
}
