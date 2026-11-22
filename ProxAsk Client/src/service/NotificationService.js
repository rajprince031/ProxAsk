import api from './AuthService';

export const notificationService = {
  // Get all notifications for current user
  async getNotifications(page = 0, size = 20) {
    const response = await api.get(`/notifications?page=${page}&size=${size}`);
    return response.data;
  },

  // Get unread notifications count
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.count ?? response.data.unreadCount ?? 0;
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead() {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Clear all notifications
  async clearAll() {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  },
};

export default notificationService;
