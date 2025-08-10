package com.proxask.service.answer;

import com.proxask.dto.AnswerDTO;
import com.proxask.entity.Answer;
import com.proxask.entity.Question;
import com.proxask.exception.QuestionAlreadyAnsweredException;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.AnswerRepository;
import com.proxask.repository.QuestionRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnswerService {

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ModelMapper modelMapper;

    public AnswerDTO getAnswerByQuestionId(String questionId){
        Question question = questionRepository.findById(questionId).orElseThrow(() ->
                new ResourceNotFoundException("Question not found"));

        Answer answer = answerRepository.findByQuestion(question).orElseThrow(() ->
                new ResourceNotFoundException("Answer not found"));

        return modelMapper.map(answer, AnswerDTO.class);
    }


    @Transactional
    public AnswerDTO postAnswerByQuestionId(String questionId, AnswerDTO answerDTO){
        Question question = questionRepository.findById(questionId).orElseThrow(() ->
                new ResourceNotFoundException("Question not found"));

        if(question.getAnswer() != null)
            throw new QuestionAlreadyAnsweredException("This question has already been answered");

        Answer answer = modelMapper.map(answerDTO, Answer.class);
        answer.setQuestion(question);
        Answer savedAnswer = answerRepository.save(answer);
        return modelMapper.map(savedAnswer, AnswerDTO.class);
    }


    @Transactional
    public void deleteAnswerByQuestionId(String answerId){
        Answer answer = answerRepository.findById(answerId).orElseThrow(() ->
        new ResourceNotFoundException("Answer Not found"));
        answerRepository.delete(answer);
    }

    @Transactional
    public AnswerDTO updateAnswerById(String answerId, AnswerDTO answerDTO){
        Answer answer = answerRepository.findById(answerId).orElseThrow(() ->
        new ResourceNotFoundException("Answer not found"));

        answer.setContent(answerDTO.getContent());
        answerRepository.save(answer);
        return modelMapper.map(answer, AnswerDTO.class);
    }
}
