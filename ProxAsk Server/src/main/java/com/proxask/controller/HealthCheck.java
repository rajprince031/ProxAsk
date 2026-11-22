package com.proxask.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthCheck {

    @GetMapping({"/", "/api"})
    public Map<String, String> rootCheck() {
        return Map.of("status", "UP", "message", "ProxAsk Server is running");
    }

    @GetMapping({"/health-check", "/api/health-check"})
    public Map<String, Object> healthCheck() {
        return Map.of(
                "status", "UP",
                "timestamp", System.currentTimeMillis(),
                "service", "ProxAsk API"
        );
    }
}
