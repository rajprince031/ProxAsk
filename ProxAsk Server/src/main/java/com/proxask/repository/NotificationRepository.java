package com.proxask.repository;

import com.proxask.entity.Notification;
import com.proxask.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    long countByRecipientAndIsReadFalse(User recipient);
    void deleteByRecipient(User recipient);
}
