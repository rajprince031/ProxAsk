package com.proxask.repository.jpa;

import com.proxask.entity.EmailChangeRequest;
import com.proxask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailChangeRequestRepository extends JpaRepository<EmailChangeRequest, String> {
    Optional<EmailChangeRequest> findByUser(User user);
    Optional<EmailChangeRequest> findByUserAndNewEmail(User user, String newEmail);
    void deleteByUser(User user);
}
