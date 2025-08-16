package com.proxask.service.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    @Value("${BACKEND_BASE_URL}")
    private String baseUrl;
    public void sendVerificationEmail(String to, String name, int otp, String verificationToken){
        Context context = new Context();
        context.setVariable("name",name);
        context.setVariable("otp",otp);
        String verificationLink = baseUrl+"/verify?token="+verificationToken;
        context.setVariable("verificationLink",verificationLink);
        String htmlContent = templateEngine.process("verification-email", context);
        try {

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            helper.setTo(to);
            helper.setSubject("ProxAsk Email Verification");
            helper.setText(htmlContent, true);
            helper.setFrom("rajprince031@gmail.com");
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
}
