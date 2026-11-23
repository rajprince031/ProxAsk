import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Compass, 
  Search, 
  UserPlus, 
  UserCheck, 
  HelpCircle, 
  MapPin, 
  Globe, 
  X,
  Users
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import api from '../service/AuthService';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import './ExplorePage.css';

const ExplorePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess } = useNotifications();

  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [usersList, setUsersList] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const loadSuggested = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/user/suggested');
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setUsersList(list);
    } catch {
      setUsersList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setIsSearching(false);
      loadSuggested();
      return;
    }
    setIsSearching(true);
    setIsLoading(true);
    try {
      const res = await api.get(`/user/search?q=${encodeURIComponent(query.trim())}`);
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setUsersList(list);
    } catch {
      setUsersList([]);
    } finally {
      setIsLoading(false);
    }
  }, [loadSuggested]);

  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
      handleSearch(initialSearch);
    } else {
      loadSuggested();
    }
  }, [initialSearch, handleSearch, loadSuggested]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    loadSuggested();
    navigate('/explore');
  };

  const handleFollowToggle = async (targetUser) => {
    const username = targetUser.username;
    const isCurrentlyFollowing = followingMap[username];
    try {
      if (isCurrentlyFollowing) {
        await api.post(`/unfollow/${encodeURIComponent(username)}`);
      } else {
        await api.post(`/follow/${encodeURIComponent(username)}`);
      }
    } catch {
      // Offline fallback
    }
    setFollowingMap(prev => ({ ...prev, [username]: !isCurrentlyFollowing }));
    showSuccess(!isCurrentlyFollowing ? `Now following @${username}` : `Unfollowed @${username}`);
  };

  return (
    <div className="px-explore">
      {/* Page Header */}
      <div className="px-explore__header">
        <div>
          <div className="px-explore__badge-wrap">
            <Badge variant="teal" size="sm" icon={<Compass size={12} />}>
              DISCOVER PEOPLE
            </Badge>
          </div>
          <h1 className="px-explore__title">Discover People</h1>
          <p className="px-explore__subtitle">
            Find people to follow, discover interesting creators, and ask them anonymous or public questions.
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="px-explore__search-wrap">
        <form onSubmit={handleSearchSubmit} className="px-explore__search-form">
          <Search size={18} className="px-explore__search-icon" />
          <input
            type="text"
            placeholder="Search by name, username or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-explore__search-input"
          />
          {searchTerm && (
            <button
              type="button"
              className="px-explore__search-clear"
              onClick={handleClearSearch}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
        </form>
      </div>

      {/* Results Header */}
      <div className="px-explore__section-row">
        <h2 className="px-explore__section-title">
          {isSearching ? `Search Results for "${searchTerm}"` : 'Suggested for You'}
        </h2>
        <span className="px-explore__count font-mono">{usersList.length} Users</span>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="px-explore__grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="px-explore__card">
              <LoadingSkeleton type="card" count={1} />
            </Card>
          ))}
        </div>
      ) : usersList.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users size={24} />}
            title="No users found"
            description={
              isSearching
                ? `No users matched "${searchTerm}". Try another username or clear your search query.`
                : 'No recommendations are available right now. Check back soon!'
            }
            action={
              isSearching && (
                <Button variant="outline" size="sm" onClick={handleClearSearch}>
                  Clear Search
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="px-explore__grid">
          {usersList.map((targetUser) => {
            const isFollowing = followingMap[targetUser.username];

            return (
              <Card key={targetUser.id || targetUser.username} hoverable className="px-explore__card">
                <div className="px-explore__card-top">
                  <Avatar
                    src={targetUser.avatar}
                    name={`${targetUser.firstName || ''} ${targetUser.lastName || ''}`}
                    username={targetUser.username}
                    size="lg"
                  />
                  <div className="px-explore__card-info">
                    <Link to={`/profile/${targetUser.username}`} className="px-explore__card-name">
                      {targetUser.firstName} {targetUser.lastName}
                    </Link>
                    <span className="px-explore__card-handle font-mono">
                      @{targetUser.username}
                    </span>
                  </div>
                </div>

                {targetUser.bio && (
                  <p className="px-explore__card-bio">{targetUser.bio}</p>
                )}

                <div className="px-explore__card-meta">
                  {targetUser.location && (
                    <span className="px-explore__meta-item">
                      <MapPin size={12} /> {targetUser.location}
                    </span>
                  )}
                  {targetUser.website && (
                    <a
                      href={targetUser.website.startsWith('http') ? targetUser.website : `https://${targetUser.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-explore__meta-item px-explore__meta-link"
                    >
                      <Globe size={12} /> {targetUser.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>

                <div className="px-explore__card-stats font-mono">
                  <span><strong>{targetUser.followersCount || 0}</strong> Followers</span>
                  <span><strong>{targetUser.followingCount || 0}</strong> Following</span>
                </div>

                <div className="px-explore__card-actions">
                  <Button
                    variant={isFollowing ? 'outline' : 'secondary'}
                    size="sm"
                    onClick={() => handleFollowToggle(targetUser)}
                    leftIcon={isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    className="px-explore__action-btn"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/ask?to=${encodeURIComponent(targetUser.username)}`)}
                    leftIcon={<HelpCircle size={14} />}
                    className="px-explore__action-btn"
                  >
                    Ask
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
