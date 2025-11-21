import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  MessageCircle, 
  Plus, 
  Home, 
  User, 
  Users, 
  Settings, 
  LogOut,
  TrendingUp,
  HelpCircle,
  Send,
  UserPlus,
  MoreHorizontal,
  Shield,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  Clock
} from 'lucide-react';
import { AuthContext } from '../../App';
import '../../style/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'follow', user: 'Alice Johnson', time: '2m ago', read: false },
    { id: 2, type: 'answer', question: 'What is the best programming language?', time: '5m ago', read: false },
    { id: 3, type: 'message', user: 'Bob Smith', time: '10m ago', read: true }
  ]);
  
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'question',
      user: { name: 'Anonymous', username: 'anonymous', avatar: null },
      content: 'What are the best practices for React development in 2025?',
      time: '15m ago',
      stats: { answers: 3, views: 45, likes: 12 },
      isAnonymous: true
    },
    {
      id: 2,
      type: 'answer',
      user: { name: 'Sarah Wilson', username: 'sarahwilson', avatar: null },
      question: 'How to optimize database queries?',
      content: 'Use indexing, avoid N+1 queries, and consider caching strategies. Database optimization is crucial for application performance...',
      time: '30m ago',
      stats: { likes: 28, replies: 5 }
    },
    {
      id: 3,
      type: 'question',
      user: { name: 'Mike Chen', username: 'mikechen', avatar: null },
      content: 'Best way to handle authentication in modern web apps?',
      time: '1h ago',
      stats: { answers: 7, views: 89, likes: 15 },
      isAnonymous: false
    },
    {
      id: 4,
      type: 'answer',
      user: { name: 'Emma Davis', username: 'emmadavis', avatar: null },
      question: 'How to learn React effectively?',
      content: 'Start with the official documentation, build projects, and practice consistently. The key is hands-on experience...',
      time: '2h ago',
      stats: { likes: 34, replies: 8 }
    }
  ]);

  const [suggestedUsers] = useState([
    { id: 2, username: 'techguru', name: 'Alex Rodriguez', followers: 2100, avatar: null },
    { id: 3, username: 'designpro', name: 'Emma Davis', followers: 1800, avatar: null },
    { id: 4, username: 'datawhiz', name: 'Ryan Kim', followers: 950, avatar: null }
  ]);

  const [trendingTopics] = useState([
    { tag: 'react', count: 234 },
    { tag: 'javascript', count: 189 },
    { tag: 'webdev', count: 156 },
    { tag: 'career', count: 98 },
    { tag: 'ai', count: 87 }
  ]);

  useEffect(() => {
    // Fetch user data and activity on component mount
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard data from your Spring Boot backend
      // const response = await fetch('/api/dashboard/data', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('proxask_token')}`
      //   }
      // });
      // const data = await response.json();
      // setRecentActivity(data.activity);
      // setNotifications(data.notifications);
      
      console.log('Fetching dashboard data...');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleAskQuestion = async () => {
    if (!questionText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('proxask_token')}`
        },
        body: JSON.stringify({
          content: questionText,
          isAnonymous: isAnonymous
        })
      });

      if (response.ok) {
        const newQuestion = await response.json();
        // Add new question to feed
        setRecentActivity(prev => [newQuestion, ...prev]);
        setQuestionText('');
        setShowAskModal(false);
      }
    } catch (error) {
      console.error('Error posting question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'profile':
        navigate('/profile');
        break;
      case 'messages':
        navigate('/messages');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        break;
    }
  };

  const renderUserAvatar = (user, size = 'md') => {
    const sizeClass = `proxask-avatar-${size}`;
    if (user.avatar) {
      return (
        <div className={`proxask-avatar ${sizeClass}`}>
          <img src={user.avatar} alt={user.name} />
        </div>
      );
    }
    
    return (
      <div className={`proxask-avatar ${sizeClass}`} style={{ backgroundColor: '#2563eb' }}>
        <span>{user.name?.charAt(0) || '?'}</span>
      </div>
    );
  };

  const formatTime = (timeStr) => {
    // You can implement proper time formatting here
    return timeStr;
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="proxask-dashboard-container">
      {/* Header */}
      <header className="proxask-dashboard-header">
        <div className="proxask-dashboard-header-content">
          <div className="proxask-dashboard-logo">
            <h2 onClick={() => navigate('/dashboard')}>ProXask</h2>
          </div>

          <div className="proxask-dashboard-search">
            <Search className="proxask-search-icon" size={20} />
            <input
              type="text"
              placeholder="Search users, questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="proxask-search-input"
            />
          </div>

          <div className="proxask-dashboard-header-actions">
            <button className="proxask-header-btn" title="Notifications">
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="proxask-notification-badge">{unreadNotifications}</span>
              )}
            </button>
            
            <button 
              className="proxask-header-btn" 
              title="Messages"
              onClick={() => navigate('/messages')}
            >
              <MessageCircle size={20} />
              <span className="proxask-notification-badge">2</span>
            </button>

            <div className="proxask-user-menu" onClick={() => navigate('/profile')}>
              {renderUserAvatar(user, 'sm')}
            </div>
          </div>
        </div>
      </header>

      <div className="proxask-dashboard-main">
        {/* Sidebar */}
        <aside className="proxask-dashboard-sidebar">
          <nav className="proxask-sidebar-nav">
            <button 
              className={`proxask-nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <Home size={20} />
              <span>Home</span>
            </button>
            
            <button 
              className={`proxask-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleNavigation('profile')}
            >
              <User size={20} />
              <span>Profile</span>
            </button>
            
            <button 
              className={`proxask-nav-item ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              <Users size={20} />
              <span>Following</span>
            </button>
            
            <button 
              className={`proxask-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => handleNavigation('messages')}
            >
              <MessageCircle size={20} />
              <span>Messages</span>
            </button>

            {user?.role === 'ADMIN' && (
              <button 
                className={`proxask-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => handleNavigation('admin')}
              >
                <Shield size={20} />
                <span>Admin Panel</span>
              </button>
            )}
            
            <button 
              className={`proxask-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleNavigation('settings')}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
            
            <button className="proxask-nav-item" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="proxask-dashboard-content">
          {/* Quick Stats */}
          <div className="proxask-stats-panel">
            <div className="proxask-stat-card">
              <div className="proxask-stat-number">{user?.stats?.followers || 0}</div>
              <div className="proxask-stat-label">Followers</div>
            </div>
            <div className="proxask-stat-card">
              <div className="proxask-stat-number">{user?.stats?.following || 0}</div>
              <div className="proxask-stat-label">Following</div>
            </div>
            <div className="proxask-stat-card">
              <div className="proxask-stat-number">{user?.stats?.questions || 0}</div>
              <div className="proxask-stat-label">Questions</div>
            </div>
            <div className="proxask-stat-card">
              <div className="proxask-stat-number">{user?.stats?.answers || 0}</div>
              <div className="proxask-stat-label">Answers</div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="proxask-activity-feed">
            <div className="proxask-feed-header">
              <h3>Recent Activity</h3>
              <button className="proxask-refresh-btn" onClick={fetchDashboardData}>
                <TrendingUp size={16} />
                Refresh
              </button>
            </div>

            <div className="proxask-feed-content">
              {recentActivity.map(item => (
                <div key={item.id} className="proxask-activity-item">
                  <div className="proxask-activity-avatar">
                    {item.isAnonymous ? (
                      <HelpCircle size={24} />
                    ) : (
                      renderUserAvatar(item.user, 'md')
                    )}
                  </div>
                  
                  <div className="proxask-activity-content">
                    <div className="proxask-activity-header">
                      <span className="proxask-activity-user">
                        {item.isAnonymous ? 'Anonymous' : item.user.name}
                      </span>
                      {!item.isAnonymous && (
                        <span className="proxask-activity-username">
                          @{item.user.username}
                        </span>
                      )}
                      <span className="proxask-activity-time">
                        <Clock size={12} />
                        {formatTime(item.time)}
                      </span>
                    </div>
                    
                    {item.type === 'question' && (
                      <div className="proxask-question-content">
                        <p className="proxask-activity-text">{item.content}</p>
                      </div>
                    )}
                    
                    {item.type === 'answer' && (
                      <div className="proxask-answer-content">
                        <p className="proxask-answer-question">Q: {item.question}</p>
                        <p className="proxask-activity-text">{item.content}</p>
                      </div>
                    )}
                    
                    <div className="proxask-activity-actions">
                      <div className="proxask-activity-stats">
                        {item.stats.views && (
                          <span className="proxask-activity-stat">
                            <Eye size={14} />
                            {item.stats.views}
                          </span>
                        )}
                        {item.stats.answers && (
                          <span className="proxask-activity-stat">
                            <MessageSquare size={14} />
                            {item.stats.answers}
                          </span>
                        )}
                        {item.stats.likes && (
                          <span className="proxask-activity-stat">
                            <Heart size={14} />
                            {item.stats.likes}
                          </span>
                        )}
                        {item.stats.replies && (
                          <span className="proxask-activity-stat">
                            <MessageSquare size={14} />
                            {item.stats.replies}
                          </span>
                        )}
                      </div>
                      
                      <div className="proxask-activity-buttons">
                        <button className="proxask-activity-btn">
                          <Heart size={16} />
                          Like
                        </button>
                        <button className="proxask-activity-btn">
                          <MessageSquare size={16} />
                          {item.type === 'question' ? 'Answer' : 'Reply'}
                        </button>
                        <button className="proxask-activity-btn">
                          <Share2 size={16} />
                          Share
                        </button>
                        <button className="proxask-activity-btn">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="proxask-dashboard-right-sidebar">
          {/* Trending Topics */}
          <div className="proxask-trending-panel">
            <h4>Trending Topics</h4>
            <div className="proxask-trending-list">
              {trendingTopics.map(topic => (
                <div key={topic.tag} className="proxask-trending-item">
                  <span className="proxask-trending-tag">#{topic.tag}</span>
                  <span className="proxask-trending-count">{topic.count} questions</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="proxask-notifications-panel">
            <h4>Recent Notifications</h4>
            <div className="proxask-notifications-list">
              {notifications.slice(0, 5).map(notif => (
                <div 
                  key={notif.id} 
                  className={`proxask-notification-item ${!notif.read ? 'unread' : ''}`}
                >
                  <div className="proxask-notification-content">
                    {notif.type === 'follow' && (
                      <>
                        <UserPlus size={16} className="proxask-notification-icon" />
                        <span>{notif.user} started following you</span>
                      </>
                    )}
                    {notif.type === 'answer' && (
                      <>
                        <MessageSquare size={16} className="proxask-notification-icon" />
                        <span>Someone answered: "{notif.question.substring(0, 30)}..."</span>
                      </>
                    )}
                    {notif.type === 'message' && (
                      <>
                        <MessageCircle size={16} className="proxask-notification-icon" />
                        <span>{notif.user} sent you a message</span>
                      </>
                    )}
                  </div>
                  <div className="proxask-notification-time">{notif.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Users */}
          <div className="proxask-suggested-users">
            <h4>Suggested for You</h4>
            {suggestedUsers.map(suggestedUser => (
              <div key={suggestedUser.id} className="proxask-suggested-user">
                {renderUserAvatar(suggestedUser, 'sm')}
                <div className="proxask-suggested-info">
                  <div className="proxask-suggested-name">{suggestedUser.name}</div>
                  <div className="proxask-suggested-username">@{suggestedUser.username}</div>
                  <div className="proxask-suggested-followers">{suggestedUser.followers} followers</div>
                </div>
                <button className="proxask-follow-btn">
                  <UserPlus size={16} />
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Floating Ask Question Button */}
      <button 
        className="proxask-floating-ask-btn"
        onClick={() => setShowAskModal(true)}
        title="Ask a Question"
      >
        <Plus size={24} />
      </button>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="proxask-modal-overlay" onClick={() => setShowAskModal(false)}>
          <div className="proxask-modal-content" onClick={e => e.stopPropagation()}>
            <div className="proxask-modal-header">
              <h3>Ask a Question</h3>
              <button 
                className="proxask-modal-close"
                onClick={() => setShowAskModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="proxask-modal-body">
              <textarea
                placeholder="What would you like to ask?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="proxask-question-input"
                rows={4}
                disabled={isSubmitting}
              />
              
              <div className="proxask-question-options">
                <label className="proxask-anonymous-toggle">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <span>Ask anonymously</span>
                </label>
              </div>
            </div>
            
            <div className="proxask-modal-footer">
              <button 
                className="proxask-btn proxask-btn-secondary"
                onClick={() => setShowAskModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="proxask-btn proxask-btn-primary"
                onClick={handleAskQuestion}
                disabled={!questionText.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="proxask-btn-spinner"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Ask Question
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;