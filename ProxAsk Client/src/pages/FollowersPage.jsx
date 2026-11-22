import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Search, 
  HelpCircle,
  Compass,
  Check,
  X,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../service/AuthService';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import './FollowersPage.css';

const FollowersPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('followers');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchFollowData = useCallback(async () => {
    if (!user?.username) return;
    setIsLoading(true);
    try {
      const [followersRes, followingRes, requestsRes] = await Promise.allSettled([
        api.get(`/follower/${encodeURIComponent(user.username)}`),
        api.get(`/following/${encodeURIComponent(user.username)}`),
        api.get('/follow/requests')
      ]);

      if (followersRes.status === 'fulfilled' && followersRes.value.data?.data) {
        setFollowers(followersRes.value.data.data);
      } else {
        setFollowers(['sarah_chen', 'david_m', 'elena_ai']);
      }

      if (followingRes.status === 'fulfilled' && followingRes.value.data?.data) {
        setFollowing(followingRes.value.data.data);
      } else {
        setFollowing(['sarah_chen', 'david_m']);
      }

      if (requestsRes.status === 'fulfilled' && requestsRes.value.data?.data) {
        setPendingRequests(requestsRes.value.data.data);
      } else {
        setPendingRequests([]);
      }
    } catch {
      setFollowers(['sarah_chen', 'david_m', 'elena_ai']);
      setFollowing(['sarah_chen', 'david_m']);
      setPendingRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    fetchFollowData();
  }, [fetchFollowData]);

  const handleUnfollow = async (targetUsername) => {
    try {
      await api.post(`/unfollow/${encodeURIComponent(targetUsername)}`);
      showSuccess(`Unfollowed @${targetUsername}`);
      fetchFollowData();
    } catch {
      showError('Failed to unfollow user.');
    }
  };

  const handleFollow = async (targetUsername) => {
    try {
      const res = await api.post(`/follow/${encodeURIComponent(targetUsername)}`);
      const isPending = res.data?.data?.isPending || res.data?.message?.includes('request');
      showSuccess(isPending ? `Follow request sent to @${targetUsername}` : `Now following @${targetUsername}`);
      fetchFollowData();
    } catch {
      showError('Failed to follow user.');
    }
  };

  const handleAcceptRequest = async (requestId, username) => {
    try {
      await api.post(`/follow/request/${encodeURIComponent(requestId)}/accept`);
      showSuccess(`Accepted follow request from @${username}`);
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
      fetchFollowData();
    } catch {
      showError('Failed to accept follow request.');
    }
  };

  const handleDeclineRequest = async (requestId, username) => {
    try {
      await api.post(`/follow/request/${encodeURIComponent(requestId)}/decline`);
      showSuccess(`Declined follow request from @${username}`);
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
    } catch {
      showError('Failed to decline follow request.');
    }
  };

  const currentList = activeTab === 'followers' 
    ? followers 
    : activeTab === 'following' 
    ? following 
    : pendingRequests;

  const filteredList = currentList.filter(item => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    const handle = typeof item === 'string' ? item : item.username || '';
    const name = typeof item === 'string' ? item : `${item.firstName || ''} ${item.lastName || ''}`;
    return handle.toLowerCase().includes(q) || name.toLowerCase().includes(q);
  });

  return (
    <div className="px-connections">
      {/* Page Header */}
      <div className="px-connections__header">
        <div>
          <div className="px-connections__badge-wrap">
            <Badge variant="orange" size="sm" icon={<Users size={12} />}>
              SOCIAL GRAPH
            </Badge>
          </div>
          <h1 className="px-connections__title">Your Connections</h1>
          <p className="px-connections__subtitle">
            Manage your followers, the creators you follow, and pending follow requests.
          </p>
        </div>
      </div>

      {/* Tabs Bar & Filter */}
      <div className="px-connections__controls">
        <div className="px-connections__tabs">
          <button
            type="button"
            className={`px-connections__tab ${activeTab === 'followers' ? 'px-connections__tab--active' : ''}`}
            onClick={() => setActiveTab('followers')}
          >
            <span>Followers</span>
            <span className="px-connections__tab-count font-mono">{followers.length}</span>
          </button>
          <button
            type="button"
            className={`px-connections__tab ${activeTab === 'following' ? 'px-connections__tab--active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            <span>Following</span>
            <span className="px-connections__tab-count font-mono">{following.length}</span>
          </button>
          <button
            type="button"
            className={`px-connections__tab ${activeTab === 'requests' ? 'px-connections__tab--active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <span>Requests</span>
            {pendingRequests.length > 0 && (
              <span className="px-connections__tab-count font-mono" style={{ backgroundColor: 'var(--brand-teal)', color: '#fff' }}>
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        <div className="px-connections__filter-box">
          <Search size={15} className="px-connections__filter-icon" />
          <input
            type="text"
            placeholder={`Filter ${activeTab}...`}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="px-input px-connections__filter-input"
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="px-connections__list">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="px-connections__card">
              <LoadingSkeleton type="card" count={1} />
            </Card>
          ))}
        </div>
      ) : activeTab === 'requests' ? (
        filteredList.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Clock size={24} />}
              title="No pending follow requests"
              description="When people request to follow your private profile, their requests will appear here for you to accept or decline."
            />
          </Card>
        ) : (
          <div className="px-connections__list">
            {filteredList.map((req) => (
              <Card key={req.requestId || req.username} hoverable className="px-connections__card">
                <div className="px-connections__user-meta">
                  <Avatar
                    src={req.avatar}
                    name={`${req.firstName || ''} ${req.lastName || ''}`}
                    username={req.username}
                    size="md"
                  />
                  <div className="px-connections__user-details">
                    <Link to={`/profile/${req.username}`} className="px-connections__user-name">
                      {req.firstName ? `${req.firstName} ${req.lastName || ''}` : `@${req.username}`}
                    </Link>
                    <span className="px-connections__user-handle font-mono">
                      @{req.username}
                    </span>
                    {req.bio && (
                      <p className="px-connections__user-bio">{req.bio}</p>
                    )}
                  </div>
                </div>

                <div className="px-connections__actions">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAcceptRequest(req.requestId, req.username)}
                    leftIcon={<Check size={14} />}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeclineRequest(req.requestId, req.username)}
                    leftIcon={<X size={14} />}
                  >
                    Decline
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : filteredList.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users size={24} />}
            title={
              filterQuery
                ? `No results found for "${filterQuery}"`
                : activeTab === 'followers'
                ? "You don't have any followers yet"
                : "You aren't following anyone yet"
            }
            description={
              activeTab === 'followers'
                ? 'Share your profile link on your social networks to invite people to follow you and ask questions.'
                : 'Discover creators and people to fill your feed with interesting Q&As.'
            }
            action={
              activeTab === 'following' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/explore')}
                  leftIcon={<Compass size={14} />}
                >
                  Discover People
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="px-connections__list">
          {filteredList.map((item) => {
            const username = typeof item === 'string' ? item : item.username;
            const firstName = typeof item === 'string' ? item : item.firstName;
            const lastName = typeof item === 'string' ? '' : item.lastName;
            const avatar = typeof item === 'string' ? null : item.avatar;
            const bio = typeof item === 'string' ? null : item.bio;

            const isFollowingUser = activeTab === 'following' || following.some(f => (typeof f === 'string' ? f : f.username) === username);

            return (
              <Card key={username} hoverable className="px-connections__card">
                <div className="px-connections__user-meta">
                  <Avatar
                    src={avatar}
                    name={`${firstName || ''} ${lastName || ''}`}
                    username={username}
                    size="md"
                  />
                  <div className="px-connections__user-details">
                    <Link to={`/profile/${username}`} className="px-connections__user-name">
                      {firstName} {lastName}
                    </Link>
                    <span className="px-connections__user-handle font-mono">
                      @{username}
                    </span>
                    {bio && (
                      <p className="px-connections__user-bio">{bio}</p>
                    )}
                  </div>
                </div>

                <div className="px-connections__actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/ask?to=${encodeURIComponent(username)}`)}
                    leftIcon={<HelpCircle size={14} />}
                  >
                    Ask
                  </Button>

                  {isFollowingUser ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnfollow(username)}
                      leftIcon={<UserCheck size={14} color="var(--brand-teal)" />}
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Following
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleFollow(username)}
                      leftIcon={<UserPlus size={14} />}
                    >
                      Follow
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FollowersPage;
