package com.proxask.repository;

import com.proxask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByEmailAndIsVerifiedTrue(String email);

    boolean existsByUsernameAndIsVerifiedTrue(String username);

    boolean existsByEmailAndIsVerifiedFalse(String email);

    List<User> findByIsVerifiedFalseAndCreatedAtBefore(LocalDateTime cutoff);

    @Query("SELECT u FROM User u WHERE (u.isVerified = false OR u.verified = false) AND ((u.otpExpiry IS NOT NULL AND u.otpExpiry < :now) OR (u.createdAt IS NOT NULL AND u.createdAt < :cutoff))")
    List<User> findExpiredUnverifiedUsers(@Param("now") Instant now, @Param("cutoff") LocalDateTime cutoff);

    @Transactional
    @Modifying
    void deleteByEmailAndIsVerifiedFalse(String email);

    @Transactional
    @Modifying
    void deleteByUsernameAndIsVerifiedFalse(String username);

    List<User> findByUsernameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String username, String firstName, String lastName);

    List<User> findTop10ByOrderByCreatedAtDesc();
}
