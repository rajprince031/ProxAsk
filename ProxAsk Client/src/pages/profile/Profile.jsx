import React, { useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Edit3, 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  Mail,
  User,
  MessageSquare,
  Heart,
  Eye,
  Save,
  X,
  Upload
} from 'lucide-react';
import { AuthContext } from '../../App';
import '../../style/Profile.css';

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('questions');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });

  const [userQuestions] = useState([
    {
      id: 1,
      content: 'What are the best practices for React development?',
      isAnonymous: false,
      createdAt: '2 days ago',
      stats: { answers: 5, views: 123, likes: 12 }
    },
    {
      id: 2,
      content: 'How to optimize database queries?',
      isAnonymous: true,
      createdAt: '5 days ago',
      stats: { answers: 8, views: 234, likes: 23 }
    }
  ]);

  const [userAnswers] = useState([
    {
      id: 1,
      question: 'Best way to learn JavaScript?',
      content: 'Start with the fundamentals, practice coding daily, and build projects. The key is consistency and hands-on experience...',
      createdAt: '1 day ago',
      stats: { likes: 34, replies: 5 }
    },
    {
      id: 2,
      question: 'How to handle state management in React?',
      content: 'For simple apps, useState and useContext are sufficient. For complex apps, consider Redux or Zustand...',
      createdAt: '3 days ago',
      stats: { likes: 28, replies: 3 }
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('proxask_token')}`
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        login(updatedUser, localStorage.getItem('proxask_token'));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('proxask_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...user, avatar: data.avatarUrl };
        login(updatedUser, localStorage.getItem('proxask_token'));
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderUserAvatar = () => {
    if (user?.avatar) {
      return (
        <img 
          src={user.avatar} 
          alt={`${user.firstName} ${user.lastName}`}
          className="proxask-profile-avatar-img"
        />
      );
    }
    
    return (
      <div className="proxask-profile-avatar-placeholder">
        <span>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
      </div>
    );
  };

  return (
    <div className="proxask-profile-container">
      {/* Header */}
      <header className="proxask-profile-header">
        <div className="proxask-profile-header-content">
          <Link to="/dashboard" className="proxask-profile-back-btn">
            ← Back to Dashboard
          </Link>
          <h1>My Profile</h1>
        </div>
      </header>

      <div className="proxask-profile-main">
        {/* Profile Info Card */}
        <div className="proxask-profile-info-card">
          <div className="proxask-profile-cover"></div>
          
          <div className="proxask-profile-info">
            <div className="proxask-profile-avatar-section">
              <div className="proxask-profile-avatar">
                {renderUserAvatar()}
                <button 
                  className="proxask-profile-avatar-edit"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="proxask-btn-spinner"></div>
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="proxask-hidden"
                />
              </div>
            </div>

            <div className="proxask-profile-details">
              {!isEditing ? (
                <>
                  <div className="proxask-profile-name-section">
                    <h2 className="proxask-profile-name">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="proxask-profile-username">@{user?.username}</p>
                    <button 
                      className="proxask-btn proxask-btn-outline proxask-profile-edit-btn"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  </div>

                  {user?.bio && (
                    <p className="proxask-profile-bio">{user.bio}</p>
                  )}

                  <div className="proxask-profile-meta">
                    <div className="proxask-profile-meta-item">
                      <Calendar size={16} />
                      <span>Joined {user?.joinedAt || 'January 2025'}</span>
                    </div>
                    {user?.location && (
                      <div className="proxask-profile-meta-item">
                        <MapPin size={16} />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user?.website && (
                      <div className="proxask-profile-meta-item">
                        <LinkIcon size={16} />
                        <a href={user.website} target="_blank" rel="noopener noreferrer">
                          {user.website}
                        </a>
                      </div>
                    )}
                    <div className="proxask-profile-meta-item">
                      <Mail size={16} />
                      <span>{user?.email}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="proxask-profile-edit-form">
                  <div className="proxask-profile-name-row">
                    <div className="proxask-form-group">
                      <label className="proxask-form-label">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={editData.firstName}
                        onChange={handleInputChange}
                        className="proxask-input"
                        placeholder="First Name"
                      />
                    </div>
                    <div className="proxask-form-group">
                      <label className="proxask-form-label">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={editData.lastName}
                        onChange={handleInputChange}
                        className="proxask-input"
                        placeholder="Last Name"
                      />
                    </div>
                  </div>

                  <div className="proxask-form-group">
                    <label className="proxask-form-label">Bio</label>
                    <textarea
                      name="bio"
                      value={editData.bio}
                      onChange={handleInputChange}
                      className="proxask-input"
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>

                  <div className="proxask-form-group">
                    <label className="proxask-form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editData.location}
                      onChange={handleInputChange}
                      className="proxask-input"
                      placeholder="Your location"
                    />
                  </div>

                  <div className="proxask-form-group">
                    <label className="proxask-form-label">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={editData.website}
                      onChange={handleInputChange}
                      className="proxask-input"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="proxask-profile-edit-actions">
                    <button 
                      className="proxask-btn proxask-btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button 
                      className="proxask-btn proxask-btn-primary"
                      onClick={handleSaveProfile}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              <div className="proxask-profile-stats">
                <div className="proxask-profile-stat">
                  <span className="proxask-profile-stat-number">{user?.stats?.followers || 0}</span>
                  <span className="proxask-profile-stat-label">Followers</span>
                </div>
                <div className="proxask-profile-stat">
                  <span className="proxask-profile-stat-number">{user?.stats?.following || 0}</span>
                  <span className="proxask-profile-stat-label">Following</span>
                </div>
                <div className="proxask-profile-stat">
                  <span className="proxask-profile-stat-number">{user?.stats?.questions || 0}</span>
                  <span className="proxask-profile-stat-label">Questions</span>
                </div>
                <div className="proxask-profile-stat">
                  <span className="proxask-profile-stat-number">{user?.stats?.answers || 0}</span>
                  <span className="proxask-profile-stat-label">Answers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Tabs */}
        <div className="proxask-profile-activity">
          <div className="proxask-profile-tabs">
            <button 
              className={`proxask-profile-tab ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              <MessageSquare size={16} />
              Questions ({userQuestions.length})
            </button>
            <button 
              className={`proxask-profile-tab ${activeTab === 'answers' ? 'active' : ''}`}
              onClick={() => setActiveTab('answers')}
            >
              <User size={16} />
              Answers ({userAnswers.length})
            </button>
          </div>

          <div className="proxask-profile-content">
            {activeTab === 'questions' && (
              <div className="proxask-profile-questions">
                {userQuestions.length > 0 ? (
                  userQuestions.map(question => (
                    <div key={question.id} className="proxask-profile-question-item">
                      <div className="proxask-profile-question-content">
                        <p className="proxask-profile-question-text">{question.content}</p>
                        <div className="proxask-profile-question-meta">
                          <span className="proxask-profile-question-type">
                            {question.isAnonymous ? 'Anonymous Question' : 'Public Question'}
                          </span>
                          <span className="proxask-profile-question-time">{question.createdAt}</span>
                        </div>
                      </div>
                      <div className="proxask-profile-question-stats">
                        <span className="proxask-profile-question-stat">
                          <Eye size={14} />
                          {question.stats.views}
                        </span>
                        <span className="proxask-profile-question-stat">
                          <MessageSquare size={14} />
                          {question.stats.answers}
                        </span>
                        <span className="proxask-profile-question-stat">
                          <Heart size={14} />
                          {question.stats.likes}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="proxask-profile-empty-state">
                    <MessageSquare size={48} />
                    <h3>No questions yet</h3>
                    <p>Start asking questions to see them here</p>
                    <Link to="/dashboard" className="proxask-btn proxask-btn-primary">
                      Ask Your First Question
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'answers' && (
              <div className="proxask-profile-answers">
                {userAnswers.length > 0 ? (
                  userAnswers.map(answer => (
                    <div key={answer.id} className="proxask-profile-answer-item">
                      <div className="proxask-profile-answer-question">
                        <strong>Q:</strong> {answer.question}
                      </div>
                      <div className="proxask-profile-answer-content">
                        <p>{answer.content}</p>
                      </div>
                      <div className="proxask-profile-answer-meta">
                        <span className="proxask-profile-answer-time">{answer.createdAt}</span>
                        <div className="proxask-profile-answer-stats">
                          <span className="proxask-profile-answer-stat">
                            <Heart size={14} />
                            {answer.stats.likes}
                          </span>
                          <span className="proxask-profile-answer-stat">
                            <MessageSquare size={14} />
                            {answer.stats.replies}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="proxask-profile-empty-state">
                    <User size={48} />
                    <h3>No answers yet</h3>
                    <p>Start answering questions to build your reputation</p>
                    <Link to="/dashboard" className="proxask-btn proxask-btn-primary">
                      Browse Questions
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;