package com.proxask.service.notification;

import com.proxask.entity.Notification;
import com.proxask.entity.User;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.NotificationRepository;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public Map<String, Object> getNotifications() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to retrieve notifications.");
        }

        List<Notification> list = notificationRepository.findByRecipientOrderByCreatedAtDesc(currentUser);
        long unreadCount = notificationRepository.countByRecipientAndIsReadFalse(currentUser);

        List<Map<String, Object>> mapped = list.stream().map(n -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("type", n.getType());
            map.put("message", n.getMessage());
            map.put("targetId", n.getTargetId());
            map.put("read", n.getIsRead());
            map.put("createdAt", n.getCreatedAt());
            map.put("user", n.getActor() != null ? n.getActor().getUsername() : "Anonymous");
            return map;
        }).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("notifications", mapped);
        result.put("unreadCount", unreadCount);
        return result;
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            return 0;
        }
        return notificationRepository.countByRecipientAndIsReadFalse(currentUser);
    }

    @Transactional
    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser != null) {
            List<Notification> list = notificationRepository.findByRecipientOrderByCreatedAtDesc(currentUser);
            list.forEach(n -> n.setIsRead(true));
            notificationRepository.saveAll(list);
        }
    }

    @Transactional
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Transactional
    public void clearAll() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser != null) {
            notificationRepository.deleteByRecipient(currentUser);
        }
    }

    @Transactional
    public void createNotification(User recipient, User actor, String type, String message, String targetId) {
        if (recipient == null) return;
        Notification notification = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .message(message)
                .targetId(targetId)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }
}
