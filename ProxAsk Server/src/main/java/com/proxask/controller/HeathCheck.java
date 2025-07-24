package com.proxask.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health-check")
public class HeathCheck {

    @GetMapping
    public String checkingServer(){
        return "running fine";
    }
}
