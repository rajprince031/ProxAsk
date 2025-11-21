import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiBell, FiUser, FiLogOut, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <nav className="proxask-navbar">
      <div className="proxask-navbar__container">
        {/* Logo Section */}
        <div className="proxask-navbar__logo">
          <Link to="/dashboard" className="proxask-navbar__logo-link">
            <span className="proxask-navbar__logo-text">Proxask</span>
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <div className="proxask-navbar__search">
          <form onSubmit={handleSearch} className="proxask-navbar__search-form">
            <div className="proxask-navbar__search-input-wrapper">
              <FiSearch className="proxask-navbar__search-icon" />
              <input
                type="text"
                placeholder="Search questions, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="proxask-navbar__search-input"
              />
            </div>
          </form>
        </div>

        {/* Desktop Navigation */}
        <div className="proxask-navbar__nav">
          {/* Notifications */}
          <Link 
            to="/notifications" 
            className="proxask-navbar__nav-item proxask-navbar__notifications"
            title="Notifications"
          >
            <FiBell className="proxask-navbar__nav-icon" />
            {unreadCount > 0 && (
              <span className="proxask-navbar__notification-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile Menu */}
          <div className="proxask-navbar__profile" ref={profileMenuRef}>
            <button
              onClick={toggleProfileMenu}
              className="proxask-navbar__profile-trigger"
              title="Profile Menu"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.firstname}
                  className="proxask-navbar__profile-image"
                />
              ) : (
                <div className="proxask-navbar__profile-avatar">
                  {user?.firstname?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </button>

            {showProfileMenu && (
              <div className="proxask-navbar__profile-menu">
                <div className="proxask-navbar__profile-menu-header">
                  <div className="proxask-navbar__profile-menu-user">
                    <p className="proxask-navbar__profile-menu-name">
                      {user?.firstname} {user?.lastname}
                    </p>
                    <p className="proxask-navbar__profile-menu-username">
                      @{user?.username}
                    </p>
                  </div>
                </div>
                
                <div className="proxask-navbar__profile-menu-divider"></div>
                
                <div className="proxask-navbar__profile-menu-items">
                  <Link
                    to={`/profile/${user?.id}`}
                    className="proxask-navbar__profile-menu-item"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <FiUser className="proxask-navbar__profile-menu-item-icon" />
                    My Profile
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="proxask-navbar__profile-menu-item"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <FiSettings className="proxask-navbar__profile-menu-item-icon" />
                    Settings
                  </Link>
                  
                  <div className="proxask-navbar__profile-menu-divider"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="proxask-navbar__profile-menu-item proxask-navbar__logout-button"
                  >
                    <FiLogOut className="proxask-navbar__profile-menu-item-icon" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="proxask-navbar__mobile-toggle">
          <button
            onClick={toggleMobileMenu}
            className="proxask-navbar__mobile-toggle-btn"
            title="Menu"
          >
            {showMobileMenu ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="proxask-navbar__mobile-menu" ref={mobileMenuRef}>
          {/* Mobile Search */}
          <div className="proxask-navbar__mobile-search">
            <form onSubmit={handleSearch} className="proxask-navbar__search-form">
              <div className="proxask-navbar__search-input-wrapper">
                <FiSearch className="proxask-navbar__search-icon" />
                <input
                  type="text"
                  placeholder="Search questions, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="proxask-navbar__search-input"
                />
              </div>
            </form>
          </div>

          {/* Mobile Navigation Items */}
          <div className="proxask-navbar__mobile-nav">
            <Link
              to="/notifications"
              className="proxask-navbar__mobile-nav-item"
            >
              <FiBell className="proxask-navbar__mobile-nav-icon" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="proxask-navbar__notification-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to={`/profile/${user?.id}`}
              className="proxask-navbar__mobile-nav-item"
            >
              <FiUser className="proxask-navbar__mobile-nav-icon" />
              <span>My Profile</span>
            </Link>

            <Link
              to="/settings"
              className="proxask-navbar__mobile-nav-item"
            >
              <FiSettings className="proxask-navbar__mobile-nav-icon" />
              <span>Settings</span>
            </Link>

            <button
              onClick={handleLogout}
              className="proxask-navbar__mobile-nav-item proxask-navbar__mobile-logout"
            >
              <FiLogOut className="proxask-navbar__mobile-nav-icon" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;