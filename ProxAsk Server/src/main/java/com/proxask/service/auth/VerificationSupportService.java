package com.proxask.service.auth;

import com.proxask.entity.EmailVerification;
import com.proxask.exception.EmailAlreadyInUseException;
import com.proxask.exception.UsernameAlreadyInUseException;
import com.proxask.repository.EmailVerificationRepository;
import com.proxask.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserCleanupService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void cleanupUnverifiedConflicts(String email, String username){
        userRepository.findByEmail(email).ifPresent(user ->
        {
            if(Boolean.TRUE.equals(user.getIsVerified()))
                throw new EmailAlreadyInUseException("Email Already in use");

            emailVerificationRepository.deleteByUser(user);
            userRepository.delete(user);
        });

        userRepository.findByUsername(username).ifPresent(user ->
        {
            if(Boolean.TRUE.equals(user.getIsVerified()))
                throw new UsernameAlreadyInUseException("Username Already in use");

            emailVerificationRepository.deleteByUser(user);
            userRepository.delete(user);
        });

    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void incrementFailedAttempts(EmailVerification emailVerification){
        emailVerification.setFailedAttempts(emailVerification.getFailedAttempts()+1);
        emailVerificationRepository.save(emailVerification);
    }
}
