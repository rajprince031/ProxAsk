package com.proxask.service.auth;


import com.proxask.entity.EmailVerification;
import com.proxask.entity.User;
import com.proxask.exception.UserAlreadyVerifiedException;
import com.proxask.exception.UserNotVerifiedException;
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
public class VerificationService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final VerificationSupportService verificationSupportService;
    private final OtpService otpService;


    public EmailVerification getEmailVerification(User user){
        return emailVerificationRepository.findByUser(user).orElseThrow(() ->
                 new VerificationException("Email Verification details not found"));
    }


    public void isTokenExpired(EmailVerification emailVerification){
        if(emailVerification.getExpiryDate().isBefore(LocalDateTime.now()))
            throw new VerificationException("Verification token has expired");

    }

    public boolean isAccountVerified(User user){
        return Boolean.TRUE.equals(user.getIsVerified());
    }



    // Verify Otp
    @Transactional
    public void verifyOtp(String email, int otp){
        User user = userService.getUserByEmail(email);
        if(isAccountVerified(user))
            throw new UserAlreadyVerifiedException("This account has already been verified.");


        EmailVerification emailVerification = getEmailVerification(user);
        isTokenExpired(emailVerification);

        verificationSupportService.isMaxAttemptsExceeded(emailVerification);

        if(emailVerification.getOtp() != otp){
            verificationSupportService.incrementFailedAttempts(emailVerification);
            throw new VerificationException("The OTP you entered is incorrect.");
        }

        user.setIsVerified(true);
        userRepository.save(user);
        emailVerificationRepository.delete(emailVerification);
    }

    public EmailVerification findEmailVerificationByToken(String token){
        return emailVerificationRepository.findByVerificationToken(token).orElseThrow(() ->
                new VerificationException("The Verification token is invalid."));

    }

    //Verify login Token

    // -- I need to work from here
    @Transactional
    public void verifyToken(String token){
        EmailVerification emailVerification = findEmailVerificationByToken(token);

        isTokenExpired(emailVerification);

        User user = emailVerification.getUser();
        if(!isAccountVerified(user))
            throw new UserNotVerifiedException("This account is not verified");
    }

    // Resend Otp
    public void resendOtp(String email){
        User user = userService.getUserByEmail(email);
        if(isAccountVerified(user))
            throw new UserAlreadyVerifiedException("This account has already been verified.");

        EmailVerification emailVerification = getEmailVerification(user);
        if(emailVerification.getExpiryDate().minusMinutes(8).isBefore(LocalDateTime.now()))
            throw new VerificationException("Please wait 120 seconds before requesting a new OTP.");

        verificationSupportService.deleteEmailVerification(emailVerification);
        otpService.sendOtp(user);
    }


}
