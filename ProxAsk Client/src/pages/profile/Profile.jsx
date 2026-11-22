import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Edit3, 
  MapPin, 
  Globe, 
  Calendar, 
  Share2, 
  UserPlus, 
  UserCheck, 
  HelpCircle,
  Check,
  Lock,
  Unlock,
  Shield,
  Send,
  Users,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import dialogService from '../../service/dialogService';
import api from '../../service/AuthService';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import QuestionCard from '../../components/question/QuestionCard';
import { MOCK_FEED_QUESTIONS, MOCK_SUGGESTED_USERS } from '../../data/mockData';
import './Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const { showSuccess, showError } = useNotifications();

  // Profile data
  const [profileUser, setProfileUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Profile Privacy Setting: true if private, false if public
  const [isPrivate, setIsPrivate] = useState(false);

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: '',
    isPrivate: false
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Ask Question Modal
  const [showAskModal, setShowAskModal] = useState(false);
  const [askContent, setAskContent] = useState('');
  const [askAnonymous, setAskAnonymous] = useState(true);
  const [isSubmittingAsk, setIsSubmittingAsk] = useState(false);

  // Followers & Following Lists Modal
  const [connectionsModal, setConnectionsModal] = useState({
    isOpen: false,
    type: 'followers', // 'followers' | 'following'
  });

  // Active Tab: 'questions' | 'about'
  const [activeTab, setActiveTab] = useState('questions');

  const isOwnProfile = !userId || (
    currentUser && (
      userId.toLowerCase() === currentUser.username?.toLowerCase() || 
      String(userId) === String(currentUser.id)
    )
  );

  const targetIdentifier = userId || currentUser?.username || currentUser?.id;

  const fetchQuestions = useCallback(async (username) => {
    if (!username) return;
    try {
      const res = await api.get(`/ask/${encodeURIComponent(username)}`);
      if (res.data && res.data.data && res.data.data.length > 0) {
        setQuestions(res.data.data);
      } else {
        const matched = MOCK_FEED_QUESTIONS.filter(q =>
          q.receiverUsername?.toLowerCase() === username.toLowerCase() ||
          q.senderUsername?.toLowerCase() === username.toLowerCase()
        );
        setQuestions(matched.length > 0 ? matched : MOCK_FEED_QUESTIONS);
      }
    } catch {
      const matched = MOCK_FEED_QUESTIONS.filter(q =>
        q.receiverUsername?.toLowerCase() === username.toLowerCase() ||
        q.senderUsername?.toLowerCase() === username.toLowerCase()
      );
      setQuestions(matched.length > 0 ? matched : MOCK_FEED_QUESTIONS);
    }
  }, []);

  const fetchProfileData = useCallback(async () => {
    if (!targetIdentifier) return;
    setIsLoading(true);

    // Retrieve cached privacy state if stored
    const savedPrivacy = localStorage.getItem(`proxask_privacy_${targetIdentifier}`);
    const initialPrivacy = savedPrivacy ? JSON.parse(savedPrivacy) : false;

    try {
      const res = await api.get(`/user/${encodeURIComponent(targetIdentifier)}`);
      if (res.data && res.data.data) {
        const u = res.data.data;
        const profilePrivacy = u.isPrivate !== undefined ? u.isPrivate : initialPrivacy;
        setProfileUser({ ...u, isPrivate: profilePrivacy });
        setIsPrivate(profilePrivacy);
        setEditFormData({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          bio: u.bio || '',
          location: u.location || '',
          website: u.website || '',
          isPrivate: profilePrivacy
        });
        fetchQuestions(u.username);

        if (!isOwnProfile && currentUser) {
          try {
            const statusRes = await api.get(`/follow/status/${encodeURIComponent(u.username || targetIdentifier)}`);
            const statusData = statusRes.data?.data;
            if (statusData?.status === 'FOLLOWING') {
              setIsFollowing(true);
              setIsRequested(false);
            } else if (statusData?.status === 'REQUESTED') {
              setIsFollowing(false);
              setIsRequested(true);
            } else {
              setIsFollowing(false);
              setIsRequested(false);
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      if (isOwnProfile && currentUser) {
        const userPrivacy = currentUser.isPrivate !== undefined ? currentUser.isPrivate : initialPrivacy;
        setProfileUser({ ...currentUser, isPrivate: userPrivacy });
        setIsPrivate(userPrivacy);
        setEditFormData({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          bio: currentUser.bio || '',
          location: currentUser.location || '',
          website: currentUser.website || '',
          isPrivate: userPrivacy
        });
        fetchQuestions(currentUser.username);
      } else {
        // Fallback for mock users
        const fallback = {
          id: `user-${targetIdentifier}`,
          username: targetIdentifier,
          firstName: targetIdentifier,
          lastName: '',
          bio: 'Creator profile on ProxAsk.',
          followersCount: 85,
          followingCount: 30,
          questionsCount: 12,
          answersCount: 10,
          isPrivate: initialPrivacy,
        };
        setProfileUser(fallback);
        setIsPrivate(initialPrivacy);
        fetchQuestions(targetIdentifier);
      }
    } finally {
      setIsLoading(false);
    }
  }, [targetIdentifier, isOwnProfile, currentUser, fetchQuestions]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/profile/${encodeURIComponent(profileUser?.username || '')}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showSuccess('Profile link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!profileUser?.username) return;
    const username = profileUser.username;

    try {
      if (isFollowing || isRequested) {
        await api.post(`/unfollow/${encodeURIComponent(username)}`);
        const wasFollowing = isFollowing;
        setIsFollowing(false);
        setIsRequested(false);
        if (wasFollowing) {
          setProfileUser(prev => ({
            ...prev,
            followersCount: Math.max(0, (prev?.followersCount || 0) - 1)
          }));
        }
        showSuccess(isRequested ? `Cancelled follow request to @${username}` : `Unfollowed @${username}`);
        return;
      }

      const res = await api.post(`/follow/${encodeURIComponent(username)}`);
      const isPending = res.data?.data?.isPending || res.data?.message?.includes('request') || Boolean(userToDisplay?.isPrivate);

      if (isPending) {
        setIsRequested(true);
        showSuccess(`Follow request sent to @${username}`);
      } else {
        setIsFollowing(true);
        setProfileUser(prev => ({
          ...prev,
          followersCount: (prev?.followersCount || 0) + 1
        }));
        showSuccess(`Now following @${username}`);
      }
    } catch {
      // offline fallback
      if (isFollowing || isRequested) {
        setIsFollowing(false);
        setIsRequested(false);
        showSuccess(`Unfollowed @${username}`);
      } else if (userToDisplay?.isPrivate) {
        setIsRequested(true);
        showSuccess(`Follow request sent to @${username}`);
      } else {
        setIsFollowing(true);
        setProfileUser(prev => ({
          ...prev,
          followersCount: (prev?.followersCount || 0) + 1
        }));
        showSuccess(`Now following @${username}`);
      }
    }
  };

  // Toggle privacy (owner only)
  const handleTogglePrivacy = async () => {
    const nextVal = !isPrivate;

    // If switching from Private to Public, check if pending requests exist
    if (!nextVal) {
      try {
        const countRes = await api.get('/follow/requests/count');
        const pendingCount = countRes.data?.data || 0;
        if (pendingCount > 0) {
          const confirmed = await dialogService.confirmMakeProfilePublic(pendingCount);
          if (!confirmed) {
            return;
          }
          await api.post('/user/make-public');
          setIsPrivate(false);
          setProfileUser(prev => ({ ...prev, isPrivate: false }));
          localStorage.setItem(`proxask_privacy_${targetIdentifier}`, JSON.stringify(false));
          if (currentUser) {
            updateUser({ isPrivate: false });
          }
          showSuccess(`Profile is now Public! ${pendingCount} pending request${pendingCount === 1 ? '' : 's'} accepted.`);
          fetchProfileData();
          return;
        }
      } catch {
        // continue
      }
    }

    setIsPrivate(nextVal);
    setProfileUser(prev => ({ ...prev, isPrivate: nextVal }));
    localStorage.setItem(`proxask_privacy_${targetIdentifier}`, JSON.stringify(nextVal));
    if (isOwnProfile && currentUser) {
      updateUser({ isPrivate: nextVal });
    }
    try {
      await api.put('/user/privacy', { isPrivate: nextVal });
    } catch {
      // offline fallback
    }
    showSuccess(`Profile is now ${nextVal ? 'Private' : 'Public'}`);
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      try {
        await api.post('/user/avatar', { avatarUrl: base64 });
      } catch {
        // offline fallback
      }
      setProfileUser(prev => ({ ...prev, avatar: base64 }));
      updateUser({ avatar: base64 });
      showSuccess('Avatar image updated!');
      setIsUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await api.put('/user/profile', editFormData);
      if (res.data && res.data.data) {
        const updated = res.data.data;
        setProfileUser(updated);
        updateUser(updated);
      } else {
        setProfileUser(prev => ({ ...prev, ...editFormData }));
        updateUser(editFormData);
      }
    } catch {
      setProfileUser(prev => ({ ...prev, ...editFormData }));
      updateUser(editFormData);
    } finally {
      setIsPrivate(editFormData.isPrivate);
      localStorage.setItem(`proxask_privacy_${targetIdentifier}`, JSON.stringify(editFormData.isPrivate));
      setShowEditModal(false);
      setIsSavingProfile(false);
      showSuccess('Profile saved successfully!');
    }
  };

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!askContent.trim() || !profileUser?.username) return;

    setIsSubmittingAsk(true);
    let newQ = null;
    try {
      const res = await api.post(`/ask/${encodeURIComponent(profileUser.username)}`, {
        content: askContent.trim(),
        isAnonymous: askAnonymous
      });

      if (res.data && res.data.data) {
        newQ = res.data.data;
      }
    } catch {
      newQ = {
        id: `mock-q-${Date.now()}`,
        content: askContent.trim(),
        senderUsername: askAnonymous ? null : (currentUser?.username || 'anonymous'),
        isAnonymous: askAnonymous,
        receiverUsername: profileUser.username,
        createdAt: new Date().toISOString(),
        answer: null
      };
    }

    if (newQ) {
      setQuestions(prev => [newQ, ...prev]);
      setAskContent('');
      setShowAskModal(false);
      showSuccess(`Question sent to @${profileUser.username}!`);
    }
    setIsSubmittingAsk(false);
  };

  const handleAnswerSubmit = async (questionId, content) => {
    try {
      await api.post(`/answer/${questionId}`, { content });
    } catch {
      // offline fallback
    }
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q,
      answer: {
        id: `mock-ans-${Date.now()}`,
        content,
        createdAt: new Date().toISOString()
      }
    } : q));
    showSuccess('Answer published!');
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await api.delete(`/ask/${questionId}`);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      showSuccess('Question removed.');
    } catch {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      showSuccess('Question removed.');
    }
  };

  const handleDeleteAnswer = async (questionId) => {
    try {
      await api.delete(`/answer/${questionId}`);
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answer: null } : q));
      showSuccess('Answer deleted.');
    } catch {
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answer: null } : q));
      showSuccess('Answer deleted.');
    }
  };

  const handleLikeAnswer = async (answerId, isLiked) => {
    try {
      await api.post(`/answer/${answerId}/like`, { isLiked });
    } catch {
      // offline fallback
    }
  };

  const handleVisibilityChange = async (questionId, newVisibility) => {
    try {
      await api.put(`/ask/${questionId}/visibility`, { visibility: newVisibility });
    } catch {
      // offline fallback
    }
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, visibility: newVisibility } : q));
  };

  // Open connections modal (allowed if public or owner or following)
  const handleOpenConnections = (type) => {
    if (isPrivate && !isOwnProfile && !isFollowing) {
      showError('This account is private. Follow this account to see their followers and following.');
      return;
    }
    setConnectionsModal({ isOpen: true, type });
  };

  if (isLoading) {
    return (
      <div className="px-profile">
        <LoadingSkeleton type="card" count={1} />
        <div style={{ marginTop: '16px' }}>
          <LoadingSkeleton type="feed" count={2} />
        </div>
      </div>
    );
  }

  const userToDisplay = profileUser || currentUser;
  const isPrivateRestricted = isPrivate && !isOwnProfile && !isFollowing;

  return (
    <div className="px-profile" data-testid="profile-page">
      {/* Profile Header Banner */}
      <Card className="px-profile__header-card">
        <div className="px-profile__banner" />

        <div className="px-profile__header-content">
          <div className="px-profile__avatar-row">
            <div className="px-profile__avatar-wrap">
              <Avatar
                src={userToDisplay?.avatar}
                name={`${userToDisplay?.firstName || ''} ${userToDisplay?.lastName || ''}`}
                username={userToDisplay?.username}
                size="xl"
                className="px-profile__avatar"
              />

              {isOwnProfile && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="px-profile__avatar-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change Avatar"
                    disabled={isUploadingAvatar}
                  >
                    <Camera size={15} />
                  </button>
                </>
              )}
            </div>

            <div className="px-profile__actions">
              <button
                type="button"
                className="px-profile__share-btn"
                onClick={handleCopyLink}
                title="Share Profile Link"
                aria-label="Share profile link"
              >
                {copiedLink ? <Check size={15} color="var(--success)" /> : <Share2 size={15} />}
              </button>

              {isOwnProfile ? (
                <div className="px-profile__owner-btns">
                  {/* Privacy Toggle Pill */}
                  <button
                    type="button"
                    className={`px-profile__privacy-toggle font-mono ${isPrivate ? 'px-profile__privacy-toggle--private' : ''}`}
                    onClick={handleTogglePrivacy}
                    title="Click to toggle Public / Private account"
                    data-testid="privacy-toggle-btn"
                  >
                    {isPrivate ? <Lock size={13} /> : <Unlock size={13} />}
                    <span>{isPrivate ? 'Private Account' : 'Public Account'}</span>
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditModal(true)}
                    leftIcon={<Edit3 size={13} />}
                  >
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant={isFollowing ? 'outline' : isRequested ? 'ghost' : 'secondary'}
                    size="sm"
                    onClick={handleFollowToggle}
                    leftIcon={isFollowing ? <UserCheck size={13} /> : isRequested ? <Clock size={13} /> : <UserPlus size={13} />}
                    data-testid="follow-toggle-btn"
                  >
                    {isFollowing ? 'Following' : isRequested ? 'Requested' : 'Follow'}
                  </Button>

                  {/* Ask Question for other users on public profiles (on private profiles, the dedicated lock banner below provides the primary action) */}
                  {!isPrivateRestricted && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAskModal(true)}
                      leftIcon={<HelpCircle size={13} />}
                      data-testid="ask-question-profile-btn"
                    >
                      Ask Question
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="px-profile__info">
            <div className="px-profile__names">
              <div className="px-profile__name-row">
                <h1 className="px-profile__full-name" data-testid="profile-full-name">
                  {userToDisplay?.firstName} {userToDisplay?.lastName}
                </h1>
                {isPrivate && (
                  <span className="px-profile__private-pill font-mono" title="Private Account">
                    <Lock size={11} /> Private
                  </span>
                )}
              </div>
              <span className="px-profile__handle font-mono" data-testid="profile-username">
                @{userToDisplay?.username}
              </span>
            </div>

            {/* Bio is shown if public or authorized */}
            {(!isPrivateRestricted || userToDisplay?.bio) && userToDisplay?.bio && (
              <p className="px-profile__bio">{userToDisplay.bio}</p>
            )}

            <div className="px-profile__metadata">
              {userToDisplay?.location && !isPrivateRestricted && (
                <span className="px-profile__meta-item">
                  <MapPin size={13} /> {userToDisplay.location}
                </span>
              )}
              {userToDisplay?.website && !isPrivateRestricted && (
                <a
                  href={userToDisplay.website.startsWith('http') ? userToDisplay.website : `https://${userToDisplay.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-profile__meta-item px-profile__meta-link"
                >
                  <Globe size={13} /> {userToDisplay.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              <span className="px-profile__meta-item">
                <Calendar size={13} /> Joined
              </span>
            </div>

            {/* Stats Counter Bar */}
            <div className="px-profile__stats font-mono">
              <div className="px-profile__stat-item">
                <span className="px-profile__stat-value">{isPrivateRestricted ? '—' : questions.length}</span>
                <span className="px-profile__stat-label">Questions</span>
              </div>
              
              {/* Followers Button: clickable if public/authorized */}
              <button
                type="button"
                className={`px-profile__stat-item px-profile__stat-btn ${isPrivateRestricted ? 'px-profile__stat-btn--disabled' : ''}`}
                onClick={() => handleOpenConnections('followers')}
                data-testid="followers-stat-btn"
              >
                <span className="px-profile__stat-value">{userToDisplay?.followersCount || 0}</span>
                <span className="px-profile__stat-label">Followers</span>
              </button>

              {/* Following Button: clickable if public/authorized */}
              <button
                type="button"
                className={`px-profile__stat-item px-profile__stat-btn ${isPrivateRestricted ? 'px-profile__stat-btn--disabled' : ''}`}
                onClick={() => handleOpenConnections('following')}
                data-testid="following-stat-btn"
              >
                <span className="px-profile__stat-value">{userToDisplay?.followingCount || 0}</span>
                <span className="px-profile__stat-label">Following</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Bar (Only when public or authorized) */}
        {!isPrivateRestricted && (
          <div className="px-profile__tabs">
            <button
              type="button"
              className={`px-profile__tab ${activeTab === 'questions' ? 'px-profile__tab--active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              Questions &amp; Answers ({questions.length})
            </button>
            <button
              type="button"
              className={`px-profile__tab ${activeTab === 'about' ? 'px-profile__tab--active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About &amp; Public Link
            </button>
          </div>
        )}
      </Card>

      {/* Main Profile Feed / Lock Screen */}
      {isPrivateRestricted ? (
        /* PRIVATE PROFILE LOCK BANNER */
        <Card className="px-profile__lock-card animate-fade-in" data-testid="private-profile-lock">
          <div className="px-profile__lock-icon-wrap">
            <Lock size={32} />
          </div>
          <h2 className="px-profile__lock-title">This Account is Private</h2>
          <p className="px-profile__lock-desc">
            Follow @{userToDisplay?.username} to see their questions and answers.
          </p>
          <div className="px-profile__lock-actions">
            {!currentUser ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/login')}
              >
                Log In to Follow
              </Button>
            ) : (
              <Button
                variant={isFollowing ? 'outline' : 'primary'}
                size="md"
                onClick={handleFollowToggle}
                leftIcon={isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
              >
                {isFollowing ? 'Requested' : 'Follow @' + userToDisplay?.username}
              </Button>
            )}

            {/* "Ask Question" remains functional on private profile */}
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowAskModal(true)}
              leftIcon={<HelpCircle size={14} />}
              data-testid="ask-question-private-btn"
            >
              Ask a Question Anyway
            </Button>
          </div>
        </Card>
      ) : (
        /* PUBLIC / AUTHORIZED FEED */
        <div className="px-profile__feed">
          {activeTab === 'questions' && (
            <div className="px-profile__feed-list">
              {questions.length > 0 ? (
                questions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    onAnswerSubmit={isOwnProfile ? handleAnswerSubmit : null}
                    onDeleteQuestion={isOwnProfile ? handleDeleteQuestion : null}
                    onDeleteAnswer={isOwnProfile ? handleDeleteAnswer : null}
                    onLikeAnswer={handleLikeAnswer}
                    onVisibilityChange={isOwnProfile ? handleVisibilityChange : null}
                  />
                ))
              ) : (
                <Card className="px-card--padded">
                  <EmptyState
                    icon={<HelpCircle size={28} />}
                    title="No questions yet"
                    description={
                      isOwnProfile
                        ? "You haven't received any questions yet. Share your profile link with friends and followers to start receiving questions!"
                        : `@${userToDisplay?.username} hasn't received any public questions yet. Be the first to ask!`
                    }
                    action={
                      !isOwnProfile && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setShowAskModal(true)}
                          leftIcon={<HelpCircle size={14} />}
                        >
                          Ask @{userToDisplay?.username}
                        </Button>
                      )
                    }
                  />
                </Card>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <Card className="px-profile__about-card px-card--padded">
              <h3 className="px-profile__about-heading">Shareable Public Ask Link</h3>
              <p className="px-profile__about-sub">
                Anyone with this link can ask questions anonymously or with their profile.
              </p>
              <div className="px-profile__link-box">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/ask/${encodeURIComponent(userToDisplay?.username || '')}`}
                  className="px-input font-mono"
                />
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleCopyLink}
                  leftIcon={copiedLink ? <Check size={14} color="var(--success)" /> : <Share2 size={14} />}
                >
                  {copiedLink ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Ask Question Modal */}
      <Modal
        isOpen={showAskModal}
        onClose={() => setShowAskModal(false)}
        title={`Ask @${userToDisplay?.username} a Question`}
        subtitle="Questions can be sent completely anonymously or from your profile."
        maxWidth="520px"
      >
        <form onSubmit={handlePostQuestion} className="px-profile__ask-form">
          <div className="px-input-group">
            <label className="px-input-label">Your Question</label>
            <textarea
              className="px-textarea"
              rows={4}
              placeholder={`What would you like to ask @${userToDisplay?.username}?`}
              value={askContent}
              onChange={(e) => setAskContent(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="px-profile__ask-options">
            <label className="px-profile__ask-toggle">
              <input
                type="checkbox"
                checked={askAnonymous}
                onChange={async (e) => {
                  if (!e.target.checked && !currentUser) {
                    const choice = await dialogService.showUnauthenticatedAskPubliclyModal(navigate);
                    if (choice === 'cancel') {
                      setAskAnonymous(true);
                    }
                    return;
                  }
                  setAskAnonymous(e.target.checked);
                }}
              />
              <span className="px-profile__ask-toggle-label">
                <Lock size={14} /> Send anonymously
              </span>
            </label>
            <span className="px-profile__ask-hint font-mono">
              {askAnonymous ? 'Sender identity hidden' : `Visible as @${currentUser?.username || 'user'}`}
            </span>
          </div>

          <div className="px-profile__modal-actions">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowAskModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!askContent.trim()}
              isLoading={isSubmittingAsk}
              rightIcon={<Send size={14} />}
            >
              Send Question
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        subtitle="Update your public profile details and privacy settings."
        maxWidth="560px"
      >
        <form onSubmit={handleSaveProfile} className="px-profile__edit-form">
          <div className="px-profile__edit-grid">
            <div className="px-input-group">
              <label className="px-input-label">First Name</label>
              <input
                type="text"
                className="px-input"
                value={editFormData.firstName}
                onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="px-input-group">
              <label className="px-input-label">Last Name</label>
              <input
                type="text"
                className="px-input"
                value={editFormData.lastName}
                onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div className="px-input-group">
            <label className="px-input-label">Bio</label>
            <textarea
              className="px-textarea"
              rows={3}
              value={editFormData.bio}
              onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell people about yourself..."
            />
          </div>

          <div className="px-profile__edit-grid">
            <div className="px-input-group">
              <label className="px-input-label">Location</label>
              <input
                type="text"
                className="px-input"
                value={editFormData.location}
                onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. San Francisco, CA"
              />
            </div>
            <div className="px-input-group">
              <label className="px-input-label">Website</label>
              <input
                type="text"
                className="px-input"
                value={editFormData.website}
                onChange={(e) => setEditFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="e.g. yoursite.com"
              />
            </div>
          </div>

          {/* Privacy Toggle inside Edit Profile */}
          <div className="px-profile__privacy-box">
            <div className="px-profile__privacy-info">
              <div className="px-profile__privacy-title">
                <Lock size={15} /> Private Account
              </div>
              <p className="px-profile__privacy-desc">
                When your account is private, only followers you approve can see your questions, answers, and follower lists.
              </p>
            </div>
            <label className="px-profile__switch">
              <input
                type="checkbox"
                checked={editFormData.isPrivate}
                onChange={(e) => setEditFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
              />
              <span className="px-profile__switch-slider" />
            </label>
          </div>

          <div className="px-profile__modal-actions">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSavingProfile}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Followers / Following List Modal */}
      <Modal
        isOpen={connectionsModal.isOpen}
        onClose={() => setConnectionsModal({ isOpen: false, type: 'followers' })}
        title={connectionsModal.type === 'followers' ? 'Followers' : 'Following'}
        subtitle={`Users ${connectionsModal.type === 'followers' ? 'following' : 'followed by'} @${userToDisplay?.username}`}
        maxWidth="460px"
      >
        <div className="px-profile__connections-list" data-testid="connections-modal-list">
          {MOCK_SUGGESTED_USERS.slice(0, 4).map((u) => (
            <div key={u.id} className="px-profile__connection-item">
              <div className="px-profile__connection-user">
                <Avatar
                  src={u.avatar}
                  name={`${u.firstName} ${u.lastName}`}
                  username={u.username}
                  size="sm"
                />
                <div>
                  <Link
                    to={`/profile/${u.username}`}
                    className="px-profile__connection-name"
                    onClick={() => setConnectionsModal({ isOpen: false, type: 'followers' })}
                  >
                    {u.firstName} {u.lastName}
                  </Link>
                  <span className="px-profile__connection-handle font-mono">
                    @{u.username}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => showSuccess(`Follow status toggled for @${u.username}`)}
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
