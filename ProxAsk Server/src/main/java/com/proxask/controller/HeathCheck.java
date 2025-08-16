package com.proxask.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HeathCheck {

    @GetMapping
    public String checkServer(){
        return "Running fine";
    }

    @GetMapping("/health-check")
    public String checkingServer(){
        return "running fine";
    }
}
