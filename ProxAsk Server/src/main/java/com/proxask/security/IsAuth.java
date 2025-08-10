package com.proxask.security;

import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("isAuth")
@RequiredArgsConstructor
public class IsAuth {

    private final QuestionRepository questionRepository;

    public boolean isUserAuthenticated(Authentication authentication, String username){
        return authentication != null && authentication.getName().equals(username);
    }

    public boolean hasQuestionPermission(String questionId, Authentication authentication){
        String username = questionRepository.findById(questionId).orElseThrow(() ->
                 new ResourceNotFoundException("Question not found")).getReceiver().getUsername();
        return authentication.getName().equals(username);
    }

}
