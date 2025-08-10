package com.proxask.repository;

import com.proxask.entity.EmailVerification;
import com.proxask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, String> {

    Optional <EmailVerification> findByUser(User user);
}
