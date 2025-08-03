package com.proxask.security;

import com.proxask.entity.Question;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.QuestionRepository;
import com.proxask.repository.UserRepository;
import com.proxask.service.question.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("isAuth")
public class IsAuth {

    @Autowired
    private QuestionRepository questionRepository;

    public boolean isUserAuthenticated(Authentication authentication, String username){
        return authentication != null && authentication.getName().equals(username);
    }

    public boolean hasQuestionPermission(String questionId, Authentication authentication){
        String username = questionRepository.findById(questionId).orElseThrow(() ->
                 new ResourceNotFoundException("Question not found")).getReceiver().getUsername();
        return authentication.getName().equals(username);
    }

}
