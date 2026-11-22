package com.proxask.controller;

import com.proxask.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/email", "/api/email"})
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailService emailService;
}
