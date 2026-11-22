package com.proxask.service.email;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.backend.base-url:http://localhost:8080}")
    private String baseUrl;

    public void sendVerificationEmail(String to, String name, int otp, String verificationToken) {
        try {
            Context context = new Context();
            context.setVariable("name", name != null ? name : "User");
            context.setVariable("otp", otp);
            String verificationLink = baseUrl + "/verify?token=" + verificationToken;
            context.setVariable("verificationLink", verificationLink);

            String htmlContent = templateEngine.process("Verification-email", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            helper.setTo(to);
            helper.setSubject("ProxAsk Email Verification");
            helper.setText(htmlContent, true);
            helper.setFrom("support@proxask.com");
            mailSender.send(message);
            log.info("Verification email sent successfully to {}", to);
        } catch (Exception e) {
            log.warn("Could not dispatch verification email to {}: {}. Verification OTP is: {}", to, e.getMessage(), otp);
        }
    }

    public void sendPasswordResetEmail(String to, String name, int otp) {
        try {
            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e1e4e8; border-radius: 8px;'>"
                    + "<h2 style='color: #0D6731;'>ProxAsk Password Recovery</h2>"
                    + "<p>Hello <strong>" + (name != null ? name : "User") + "</strong>,</p>"
                    + "<p>You recently requested to reset your password for your ProxAsk account. Use the following 6-digit verification code:</p>"
                    + "<div style='background: #f6f8fa; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;'>"
                    + "<span style='font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0D6731;'>" + otp + "</span>"
                    + "</div>"
                    + "<p style='color: #586069; font-size: 13px;'>This code is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>"
                    + "<p style='color: #8c959f; font-size: 12px; margin-top: 24px; border-top: 1px solid #eaecef; padding-top: 12px;'>&copy; 2026 ProxAsk. All rights reserved.</p>"
                    + "</div>";

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            helper.setTo(to);
            helper.setSubject("ProxAsk Password Reset Code: " + otp);
            helper.setText(htmlContent, true);
            helper.setFrom("security@proxask.com");
            mailSender.send(message);
            log.info("Password reset email sent to {}", to);
        } catch (Exception e) {
            log.warn("Could not dispatch password reset email to {}: {}. Password reset OTP is: {}", to, e.getMessage(), otp);
        }
    }

    public void sendPasswordChangeEmail(String to, String name, int otp) {
        try {
            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e1e4e8; border-radius: 8px;'>"
                    + "<h2 style='color: #0D6731;'>ProxAsk Security - Change Password</h2>"
                    + "<p>Hello <strong>" + (name != null ? name : "User") + "</strong>,</p>"
                    + "<p>We received a request to change the password for your ProxAsk account. Please enter the 6-digit confirmation code below:</p>"
                    + "<div style='background: #f6f8fa; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;'>"
                    + "<span style='font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0D6731;'>" + otp + "</span>"
                    + "</div>"
                    + "<p style='color: #586069; font-size: 13px;'>This code is valid for 10 minutes. If you did not initiate this change, please secure your account immediately.</p>"
                    + "</div>";

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            helper.setTo(to);
            helper.setSubject("ProxAsk Change Password OTP: " + otp);
            helper.setText(htmlContent, true);
            helper.setFrom("security@proxask.com");
            mailSender.send(message);
            log.info("Password change OTP email sent to {}", to);
        } catch (Exception e) {
            log.warn("Could not dispatch password change OTP email to {}: {}. Password change OTP is: {}", to, e.getMessage(), otp);
        }
    }

    public void sendEmailChangeVerificationEmail(String newEmail, String name, int otp) {
        try {
            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e1e4e8; border-radius: 8px;'>"
                    + "<h2 style='color: #0D6731;'>Confirm Your New ProxAsk Email Address</h2>"
                    + "<p>Hello <strong>" + (name != null ? name : "User") + "</strong>,</p>"
                    + "<p>You requested to update your ProxAsk account email to <strong>" + newEmail + "</strong>. To complete this update, enter the confirmation code below:</p>"
                    + "<div style='background: #f6f8fa; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;'>"
                    + "<span style='font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0D6731;'>" + otp + "</span>"
                    + "</div>"
                    + "<p style='color: #586069; font-size: 13px;'>This code is valid for 10 minutes. If you did not make this request, please contact support.</p>"
                    + "</div>";

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            helper.setTo(newEmail);
            helper.setSubject("ProxAsk Email Change Verification Code: " + otp);
            helper.setText(htmlContent, true);
            helper.setFrom("security@proxask.com");
            mailSender.send(message);
            log.info("Email change verification code sent to new email: {}", newEmail);
        } catch (Exception e) {
            log.warn("Could not dispatch email change OTP to new email {}: {}. OTP is: {}", newEmail, e.getMessage(), otp);
        }
    }
}
