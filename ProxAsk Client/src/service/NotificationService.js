import api from './authService';

export const notificationService = {
  // Get all notifications for current user
  async getNotifications(page = 0, size = 20) {
    try {
      const response = await api.get(`/notifications?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get unread notifications count
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.patch('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Clear all notifications
  async clearAll() {
    try {
      const response = await api.delete('/notifications/clear-all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get notification settings for user
  async getNotificationSettings() {
    try {
      const response = await api.get('/notifications/settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      const response = await api.put('/notifications/settings', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send notification to user (admin only)
  async sendNotification(userId, notificationData) {
    try {
      const response = await api.post(`/admin/notifications/send/${userId}`, notificationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Broadcast notification to all users (admin only)
  async broadcastNotification(notificationData) {
    try {
      const response = await api.post('/admin/notifications/broadcast', notificationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};