package com.proxask.controller;

import com.proxask.dto.response.ApiResponse;
import com.proxask.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/notifications", "/api/notifications"})
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications() {
        return ResponseEntity.ok(notificationService.getNotifications());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(Map.of("count", count, "unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked as read", null));
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(new ApiResponse<>(true, "All notifications marked as read", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification deleted", null));
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<ApiResponse<Void>> clearAllNotifications() {
        notificationService.clearAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "All notifications cleared", null));
    }
}
