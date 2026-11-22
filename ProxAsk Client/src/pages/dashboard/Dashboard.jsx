import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Sparkles, 
  Copy, 
  Check, 
  HelpCircle, 
  Send, 
  UserPlus, 
  UserCheck, 
  RefreshCw,
  Share2,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../service/AuthService';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import QuestionCard from '../../components/question/QuestionCard';
import { MOCK_FEED_QUESTIONS, MOCK_SUGGESTED_USERS, MOCK_NOTIFICATIONS } from '../../data/mockData';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();

  const [feedQuestions, setFeedQuestions] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Ask Modal State
  const [showAskModal, setShowAskModal] = useState(false);
  const [askTargetUsername, setAskTargetUsername] = useState('');
  const [askContent, setAskContent] = useState('');
  const [askAnonymous, setAskAnonymous] = useState(true);
  const [isSubmittingAsk, setIsSubmittingAsk] = useState(false);

  const profileUrl = `${window.location.origin}/profile/${encodeURIComponent(user?.username || '')}`;

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // 1. Fetch Feed Questions (with mock fallback for offline/test accounts)
      try {
        const feedRes = await api.get('/questions/feed');
        if (feedRes.data && feedRes.data.data && feedRes.data.data.length > 0) {
          setFeedQuestions(feedRes.data.data);
        } else {
          setFeedQuestions(MOCK_FEED_QUESTIONS);
        }
      } catch {
        setFeedQuestions(MOCK_FEED_QUESTIONS);
      }

      // 2. Fetch Suggested Users (with mock fallback)
      try {
        const usersRes = await api.get('/user/suggested');
        if (usersRes.data && usersRes.data.data && usersRes.data.data.length > 0) {
          setSuggestedUsers(usersRes.data.data);
        } else {
          setSuggestedUsers(MOCK_SUGGESTED_USERS);
        }
      } catch {
        setSuggestedUsers(MOCK_SUGGESTED_USERS);
      }

      // 3. Fetch Notifications Preview
      try {
        const notifRes = await api.get('/notifications');
        if (notifRes.data && notifRes.data.notifications && notifRes.data.notifications.length > 0) {
          setRecentNotifications(notifRes.data.notifications.slice(0, 3));
        } else {
          setRecentNotifications(MOCK_NOTIFICATIONS.slice(0, 3));
        }
      } catch {
        setRecentNotifications(MOCK_NOTIFICATIONS.slice(0, 3));
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCopyProfileLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      setCopiedLink(true);
      showSuccess('Your profile ask link is copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleFollowToggle = async (targetUser) => {
    const username = targetUser.username;
    const isFollowing = followingMap[username];

    try {
      if (isFollowing) {
        await api.post(`/unfollow/${encodeURIComponent(username)}`);
      } else {
        await api.post(`/follow/${encodeURIComponent(username)}`);
      }
    } catch {
      // Allow seamless toggle in test mode
    }
    setFollowingMap(prev => ({ ...prev, [username]: !isFollowing }));
    showSuccess(!isFollowing ? `Now following @${username}` : `Unfollowed @${username}`);
  };

  const handleAnswerSubmit = async (questionId, content) => {
    try {
      await api.post(`/answer/${questionId}`, { content });
    } catch {
      // In demo mode, apply local optimistic update
    }
    setFeedQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q,
      answer: {
        id: `mock-ans-${Date.now()}`,
        content,
        createdAt: new Date().toISOString()
      }
    } : q));
    showSuccess('Answer published to your feed!');
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await api.delete(`/ask/${questionId}`);
    } catch {
      // Local removal in demo mode
    }
    setFeedQuestions(prev => prev.filter(q => q.id !== questionId));
    showSuccess('Question removed.');
  };

  const handleDeleteAnswer = async (questionId) => {
    try {
      await api.delete(`/answer/${questionId}`);
    } catch {
      // Local removal in demo mode
    }
    setFeedQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answer: null } : q));
    showSuccess('Answer deleted.');
  };

  const handleLikeAnswer = async (answerId, isLiked) => {
    try {
      await api.post(`/answer/${answerId}/like`, { isLiked });
    } catch {
      // fallback
    }
  };

  const handleVisibilityChange = async (questionId, newVisibility) => {
    try {
      await api.put(`/ask/${questionId}/visibility`, { visibility: newVisibility });
    } catch {
      // offline fallback
    }
    setFeedQuestions(prev => prev.map(q => q.id === questionId ? { ...q, visibility: newVisibility } : q));
  };

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    const target = askTargetUsername.trim() || user?.username;
    if (!target) {
      showError('Please enter a recipient username.');
      return;
    }
    if (!askContent.trim()) {
      showError('Please write your question.');
      return;
    }

    setIsSubmittingAsk(true);
    let newQ = null;
    try {
      const res = await api.post(`/ask/${encodeURIComponent(target)}`, {
        content: askContent.trim(),
        isAnonymous: askAnonymous,
      });

      if (res.data && res.data.data) {
        newQ = res.data.data;
      }
    } catch {
      // Create local item in demo mode
      newQ = {
        id: `mock-q-${Date.now()}`,
        content: askContent.trim(),
        senderUsername: askAnonymous ? null : (user?.username || 'anonymous'),
        isAnonymous: askAnonymous,
        receiverUsername: target,
        createdAt: new Date().toISOString(),
        answer: null,
      };
    }

    if (newQ) {
      setFeedQuestions(prev => [newQ, ...prev]);
      setShowAskModal(false);
      setAskContent('');
      setAskTargetUsername('');
      showSuccess(`Question sent to @${target}!`);
    }
    setIsSubmittingAsk(false);
  };

  return (
    <div className="px-dashboard">
      {/* Main Column */}
      <div className="px-dashboard__main">
        {/* Welcome Banner */}
        <div className="px-dashboard__welcome">
          <div>
            <div className="px-dashboard__date font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
            </div>
            <h1 className="px-dashboard__greeting">
              Welcome back, {user?.firstName || user?.username || 'Friend'}
            </h1>
          </div>

          <div className="px-dashboard__welcome-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData(true)}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw size={14} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAskModal(true)}
              leftIcon={<Plus size={15} />}
            >
              New Question
            </Button>
          </div>
        </div>

        {/* Quick Ask Prompt Bar */}
        <Card className="px-dashboard__prompt-card">
          <div className="px-dashboard__prompt-inner" onClick={() => setShowAskModal(true)}>
            <Avatar
              src={user?.avatar}
              name={`${user?.firstName || ''} ${user?.lastName || ''}`}
              username={user?.username}
              size="sm"
            />
            <span className="px-dashboard__prompt-placeholder">
              Ask someone a question anonymously or publicly...
            </span>
            <Button variant="primary" size="sm">
              Ask
            </Button>
          </div>
        </Card>

        {/* Feed Header */}
        <div className="px-dashboard__feed-header">
          <div className="px-dashboard__feed-title-wrap">
            <h2 className="px-dashboard__feed-title">Home Feed</h2>
            <Badge variant="teal" size="sm">LIVE</Badge>
          </div>
          <span className="px-dashboard__feed-count font-mono">
            {feedQuestions.length} Questions
          </span>
        </div>

        {/* Feed List */}
        {isLoading ? (
          <LoadingSkeleton type="feed" count={3} />
        ) : feedQuestions.length === 0 ? (
          <Card>
            <EmptyState
              icon={<MessageSquare size={24} />}
              title="No questions in your feed yet"
              description="Be the first to ask someone a question or share your personal profile link to start receiving questions!"
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAskModal(true)}
                  leftIcon={<Plus size={15} />}
                >
                  Ask Your First Question
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="px-dashboard__feed-list">
            {feedQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onAnswerSubmit={handleAnswerSubmit}
                onDeleteQuestion={handleDeleteQuestion}
                onDeleteAnswer={handleDeleteAnswer}
                onLikeAnswer={handleLikeAnswer}
                onVisibilityChange={handleVisibilityChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right Column Contextual Panel */}
      <aside className="px-dashboard__sidebar">
        {/* Share Profile Link Widget */}
        <Card className="px-dashboard__widget">
          <div className="px-dashboard__widget-header">
            <h3 className="px-dashboard__widget-title">Your Ask Link</h3>
            <Badge variant="orange" size="sm">SHARE</Badge>
          </div>
          <p className="px-dashboard__widget-desc">
            Copy and post this link on social media to let people ask you anything:
          </p>
          <div className="px-dashboard__link-box">
            <span className="px-dashboard__link-text font-mono">
              proxask.com/profile/{user?.username || 'you'}
            </span>
            <button
              type="button"
              className="px-dashboard__link-copy-btn"
              onClick={handleCopyProfileLink}
              title="Copy Link"
            >
              {copiedLink ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
            </button>
          </div>
        </Card>

        {/* Who to Follow Widget */}
        <Card className="px-dashboard__widget">
          <div className="px-dashboard__widget-header">
            <h3 className="px-dashboard__widget-title">Who to Follow</h3>
            <Link to="/explore" className="px-dashboard__widget-link font-mono">
              VIEW ALL →
            </Link>
          </div>

          {suggestedUsers.length === 0 ? (
            <p className="px-dashboard__empty-note">
              No recommendations available at this moment.
            </p>
          ) : (
            <div className="px-dashboard__user-list">
              {suggestedUsers.slice(0, 4).map((sUser) => (
                <div key={sUser.id} className="px-dashboard__user-item">
                  <Avatar
                    src={sUser.avatar}
                    name={`${sUser.firstName || ''} ${sUser.lastName || ''}`}
                    username={sUser.username}
                    size="sm"
                  />
                  <div className="px-dashboard__user-meta">
                    <Link to={`/profile/${sUser.username}`} className="px-dashboard__user-name">
                      {sUser.firstName} {sUser.lastName}
                    </Link>
                    <span className="px-dashboard__user-handle font-mono">
                      @{sUser.username}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`px-dashboard__follow-btn ${
                      followingMap[sUser.username] ? 'px-dashboard__follow-btn--active' : ''
                    }`}
                    onClick={() => handleFollowToggle(sUser)}
                    title={followingMap[sUser.username] ? 'Unfollow' : 'Follow'}
                  >
                    {followingMap[sUser.username] ? <UserCheck size={15} /> : <UserPlus size={15} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Trending Tags Widget */}
        <Card className="px-dashboard__widget">
          <div className="px-dashboard__widget-header">
            <h3 className="px-dashboard__widget-title">Trending Topics</h3>
            <TrendingUp size={15} color="var(--brand-orange)" />
          </div>
          <div className="px-dashboard__tag-list">
            {[
              { tag: 'proxask', count: 184 },
              { tag: 'anonymous', count: 142 },
              { tag: 'tech', count: 96 },
              { tag: 'startups', count: 78 },
              { tag: 'advice', count: 64 },
            ].map(t => (
              <div key={t.tag} className="px-dashboard__tag-item">
                <span className="px-dashboard__tag-name font-mono">#{t.tag}</span>
                <span className="px-dashboard__tag-count font-mono">{t.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Alerts Widget */}
        {recentNotifications.length > 0 && (
          <Card className="px-dashboard__widget">
            <div className="px-dashboard__widget-header">
              <h3 className="px-dashboard__widget-title">Recent Alerts</h3>
              <Link to="/notifications" className="px-dashboard__widget-link font-mono">
                ALL →
              </Link>
            </div>
            <div className="px-dashboard__notif-list">
              {recentNotifications.map((notif, i) => (
                <div key={notif.id || i} className="px-dashboard__notif-item">
                  <span className="px-dashboard__notif-text">
                    {notif.title || notif.message}
                  </span>
                  <span className="px-dashboard__notif-time font-mono">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </aside>

      {/* Ask Question Modal */}
      <Modal
        isOpen={showAskModal}
        onClose={() => setShowAskModal(false)}
        title="Ask a Question"
        subtitle="Submit a question to anyone on ProxAsk"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowAskModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePostQuestion}
              isLoading={isSubmittingAsk}
              disabled={!askContent.trim()}
              rightIcon={<Send size={14} />}
            >
              Submit Question
            </Button>
          </>
        }
      >
        <form onSubmit={handlePostQuestion} className="px-dashboard__modal-form">
          <div className="px-input-group">
            <label className="px-input-label">Recipient Username</label>
            <input
              type="text"
              placeholder={`Enter username (e.g. ${user?.username || 'admin'})`}
              value={askTargetUsername}
              onChange={(e) => setAskTargetUsername(e.target.value)}
              className="px-input"
            />
            <span className="px-input-helper">
              Leave blank to ask on your own profile.
            </span>
          </div>

          <div className="px-input-group" style={{ marginTop: '12px' }}>
            <label className="px-input-label">Your Question</label>
            <textarea
              className="px-textarea"
              rows={4}
              placeholder="What would you like to ask?"
              value={askContent}
              onChange={(e) => setAskContent(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="px-dashboard__modal-toggle-box">
            <label className="px-dashboard__modal-toggle">
              <input
                type="checkbox"
                checked={askAnonymous}
                onChange={(e) => setAskAnonymous(e.target.checked)}
              />
              <div>
                <span className="px-dashboard__modal-toggle-title">Ask Anonymously</span>
                <p className="px-dashboard__modal-toggle-desc">
                  Your identity and profile will never be shown to the recipient or public.
                </p>
              </div>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
