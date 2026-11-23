package com.proxask.config;

import com.proxask.entity.User;
import com.proxask.enums.Role;
import com.proxask.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            // Seed verified standard test user
            if (userRepository.findByUsername("alex_creator").isEmpty() && userRepository.findByEmail("alex@proxask.com").isEmpty()) {
                User testUser = new User();
                testUser.setUsername("alex_creator");
                testUser.setEmail("alex@proxask.com");
                testUser.setFirstName("Alex");
                testUser.setLastName("Mercer");
                testUser.setPassword(passwordEncoder.encode("Password123!"));
                testUser.setIsVerified(true);
                testUser.setIsActive(true);
                testUser.setIsPrivate(false);
                testUser.setRole(Role.USER);
                testUser.setBio("Tech enthusiast and ProxAsk tester.");
                userRepository.save(testUser);
                log.info("Initialized verified test user: alex@proxask.com / alex_creator (Password: Password123!)");
            }

            // Seed verified admin user
            if (userRepository.findByUsername("admin").isEmpty() && userRepository.findByEmail("admin@proxask.com").isEmpty()) {
                User adminUser = new User();
                adminUser.setUsername("admin");
                adminUser.setEmail("admin@proxask.com");
                adminUser.setFirstName("Admin");
                adminUser.setLastName("ProxAsk");
                adminUser.setPassword(passwordEncoder.encode("Password123!"));
                adminUser.setIsVerified(true);
                adminUser.setIsActive(true);
                adminUser.setIsPrivate(false);
                adminUser.setRole(Role.ADMIN);
                adminUser.setBio("System Administrator");
                userRepository.save(adminUser);
                log.info("Initialized verified admin user: admin@proxask.com / admin (Password: Password123!)");
            }
        } catch (Exception e) {
            log.warn("Could not complete test user initialization: {}", e.getMessage());
        }
    }
}
