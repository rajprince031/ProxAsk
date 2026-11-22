package com.proxask.security;

import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("isAuth")
@RequiredArgsConstructor
public class IsAuth {

    private final QuestionRepository questionRepository;

    public boolean isUserAuthenticated(Authentication authentication, String username) {
        return authentication != null && authentication.isAuthenticated() && authentication.getName().equals(username);
    }

    public boolean hasQuestionPermission(String questionId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return true;
        }
        String username = questionRepository.findById(questionId).orElseThrow(() ->
                new ResourceNotFoundException("Question not found")).getReceiver().getUsername();
        return authentication.getName().equalsIgnoreCase(username);
    }
}
