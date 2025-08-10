package com.proxask.service.email;


import com.proxask.entity.EmailVerification;
import com.proxask.entity.User;
import com.proxask.exception.VerificationException;
import com.proxask.repository.EmailVerificationRepository;
import com.proxask.repository.UserRepository;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    private static final int MAX_FAILED_ATTEMPTS = 3;

    public EmailVerification getEmailVerification(User user){
        return emailVerificationRepository.findByUser(user).orElseThrow(() ->
                 new VerificationException("Email Verification details not found"));
    }


    public void isTokenExpired(LocalDateTime expiryDate){
        if(expiryDate.isBefore(LocalDateTime.now())){
            throw new VerificationException("Verification token has expired");
        }
    }

    public void isAccountVerified(User user){
        if(user.getIsVerified()) {
            throw new VerificationException("This account has already been verified.");
        }
    }

    @Transactional
    public Boolean verify(String email, int otp){
        User user = userService.getUserByEmail(email);
        isAccountVerified(user);

        EmailVerification emailVerification = getEmailVerification(user);
        isTokenExpired(emailVerification.getExpiryDate());

        if(emailVerification.getFailedAttempts() >= MAX_FAILED_ATTEMPTS)
            throw new VerificationException("Too many failed attempts.");

        if(emailVerification.getOtp() != otp){
            emailVerification.setFailedAttempts(emailVerification.getFailedAttempts()+1);
            emailVerificationRepository.save(emailVerification);
            throw new VerificationException("The OTP you entered is invalid.");
        }

        user.setIsVerified(true);
        userRepository.save(user);
        emailVerificationRepository.delete(emailVerification);
        return true;
    }

    @Transactional
    public Boolean verify(String email, String token){
        User user = userService.getUserByEmail(email);
        isAccountVerified(user);

        EmailVerification emailVerification = getEmailVerification(user);
        isTokenExpired(emailVerification.getExpiryDate());

        if(emailVerification.getFailedAttempts() >= MAX_FAILED_ATTEMPTS)
            throw new VerificationException("Too many failed attempts. Request a new OTP.");

        if(!emailVerification.getVerificationToken().equals(token)){
            emailVerification.setFailedAttempts(emailVerification.getFailedAttempts()+1);
            emailVerificationRepository.save(emailVerification);
            throw new VerificationException("The Verification token is invalid.");
        }

        user.setIsVerified(true);
        userRepository.save(user);
        emailVerificationRepository.delete(emailVerification);
        return true;
    }
}
