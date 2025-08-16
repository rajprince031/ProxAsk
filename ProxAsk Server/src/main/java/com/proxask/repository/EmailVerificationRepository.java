package com.proxask.repository;

import com.proxask.entity.EmailVerification;
import com.proxask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, String> {

    Optional <EmailVerification> findByUser(User user);

    @Modifying
    @Transactional
    void deleteByUser(User user);

    Optional<EmailVerification> findByVerificationToken(String token);
}
