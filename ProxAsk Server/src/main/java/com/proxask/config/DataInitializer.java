package com.proxask.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Clean application initializer.
 * All dummy and seeded sample users/data have been disabled so the platform
 * starts completely clean with only real user-registered data.
 */
@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        log.info("ProxAsk initialized cleanly with zero dummy or seeded data.");
    }
}
