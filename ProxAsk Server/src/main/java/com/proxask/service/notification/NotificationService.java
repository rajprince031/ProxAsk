package com.proxask.service.notification;

import com.proxask.document.ActorSnapshot;
import com.proxask.document.NotificationDocument;
import com.proxask.entity.User;
import com.proxask.exception.ResourceNotFoundException;
import com.proxask.repository.mongo.NotificationMongoRepository;
import com.proxask.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationMongoRepository notificationMongoRepository;
    private final UserService userService;

    public Map<String, Object> getNotifications() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to retrieve notifications.");
        }

        List<NotificationDocument> list = notificationMongoRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId());
        long unreadCount = notificationMongoRepository.countByRecipientIdAndIsReadFalse(currentUser.getId());

        List<Map<String, Object>> mapped = list.stream().map(n -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("type", n.getType());
            map.put("message", n.getMessage());
            map.put("targetId", n.getTargetId());
            map.put("read", n.getIsRead());
            map.put("createdAt", n.getCreatedAt());
            map.put("user", n.getActor() != null ? n.getActor().getUsername() : "Anonymous");
            map.put("avatar", n.getActor() != null ? n.getActor().getAvatar() : null);
            return map;
        }).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("notifications", mapped);
        result.put("unreadCount", unreadCount);
        return result;
    }

    public long getUnreadCount() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            return 0;
        }
        return notificationMongoRepository.countByRecipientIdAndIsReadFalse(currentUser.getId());
    }

    public void markAsRead(String notificationId) {
        NotificationDocument notification = notificationMongoRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        notification.setIsRead(true);
        notificationMongoRepository.save(notification);
    }

    public void markAllAsRead() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser != null) {
            List<NotificationDocument> list = notificationMongoRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId());
            list.forEach(n -> n.setIsRead(true));
            notificationMongoRepository.saveAll(list);
        }
    }

    public void deleteNotification(String notificationId) {
        notificationMongoRepository.deleteById(notificationId);
    }

    public void clearAll() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser != null) {
            notificationMongoRepository.deleteByRecipientId(currentUser.getId());
        }
    }

    public void createNotification(String recipientId, String actorUsername, String actorAvatar, String actorUserId, String type, String message, String targetId) {
        if (recipientId == null) return;
        ActorSnapshot actor = null;
        if (actorUsername != null || actorUserId != null) {
            actor = ActorSnapshot.builder()
                    .userId(actorUserId)
                    .username(actorUsername)
                    .avatar(actorAvatar)
                    .build();
        }
        NotificationDocument notification = NotificationDocument.builder()
                .recipientId(recipientId)
                .actor(actor)
                .type(type)
                .message(message)
                .targetId(targetId)
                .isRead(false)
                .createdAt(Instant.now())
                .build();
        notificationMongoRepository.save(notification);
    }

    public void createNotification(User recipient, User actor, String type, String message, String targetId) {
        if (recipient == null) return;
        String actorUsername = actor != null ? actor.getUsername() : "Anonymous";
        String actorAvatar = actor != null ? actor.getAvatar() : null;
        String actorUserId = actor != null ? actor.getId() : null;
        createNotification(recipient.getId(), actorUsername, actorAvatar, actorUserId, type, message, targetId);
    }
}
