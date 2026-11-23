import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  MessageSquare, 
  UserPlus, 
  Sparkles,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import dialogService from '../service/dialogService';
import api from '../service/AuthService';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import './NotificationsPage.css';

const formatTime = (ts) => {
  if (!ts) return 'Recent';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return 'Recent';
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  } catch {
    return 'Recent';
  }
};

const getNotificationIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'question':
    case 'ask':
      return <HelpCircle size={16} color="var(--brand-orange)" />;
    case 'answer':
      return <CheckCircle2 size={16} color="var(--brand-teal)" />;
    case 'follow':
      return <UserPlus size={16} color="#3B82F6" />;
    default:
      return <Bell size={16} color="var(--brand-orange)" />;
  }
};

const NotificationsPage = () => {
  const { showSuccess, showError, markAllAsRead, refreshNotifications } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data && res.data.notifications) {
        setNotifications(res.data.notifications);
      } else if (Array.isArray(res.data)) {
        setNotifications(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkOne = async (id) => {
    try {
      await api.put(`/notifications/read/${id}`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      refreshNotifications();
    } catch {
      // silently ignore
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showSuccess('All notifications marked as read.');
    } catch {
      showError('Failed to mark all as read.');
    }
  };

  const handleClearAll = async () => {
    const confirmed = await dialogService.confirmAction({
      title: 'Clear All Notifications',
      text: 'Are you sure you want to clear all notifications? This cannot be undone.',
      confirmText: 'Clear All',
      isDestructive: true
    });
    if (!confirmed) return;
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      refreshNotifications();
      showSuccess('Notifications cleared.');
    } catch {
      showError('Failed to clear notifications.');
    }
  };

  return (
    <div className="px-notifs">
      {/* Header */}
      <div className="px-notifs__header">
        <div>
          <div className="px-notifs__badge-wrap">
            <Badge variant="orange" size="sm" icon={<Bell size={12} />}>
              ACTIVITY CENTER
            </Badge>
          </div>
          <h1 className="px-notifs__title">Notifications</h1>
          <p className="px-notifs__subtitle">
            Stay updated with new questions, answers, and new followers.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="px-notifs__header-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAll}
              leftIcon={<CheckCheck size={14} />}
            >
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              leftIcon={<Trash2 size={14} />}
              style={{ color: 'var(--danger)' }}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="px-notifs__list">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="px-notifs__card">
              <LoadingSkeleton type="card" count={1} />
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bell size={24} />}
            title="All caught up!"
            description="You don't have any unread notifications right now. New questions and follower alerts will appear here."
          />
        </Card>
      ) : (
        <div className="px-notifs__list">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`px-notifs__card ${!notif.isRead ? 'px-notifs__card--unread' : ''}`}
              onClick={() => handleMarkOne(notif.id)}
            >
              <div className="px-notifs__card-left">
                <div className="px-notifs__icon-wrap">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="px-notifs__content">
                  <div className="px-notifs__content-header">
                    <span className="px-notifs__card-title">
                      {notif.title || notif.type || 'Notification'}
                    </span>
                    <span className="px-notifs__time font-mono">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className="px-notifs__message">{notif.message}</p>
                </div>
              </div>

              {!notif.isRead && <span className="px-notifs__unread-dot" title="Unread" />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
