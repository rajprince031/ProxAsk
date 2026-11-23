package com.proxask.repository.jpa;

import com.proxask.entity.PasswordResetToken;
import com.proxask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByUser(User user);
    void deleteByUser(User user);
}
