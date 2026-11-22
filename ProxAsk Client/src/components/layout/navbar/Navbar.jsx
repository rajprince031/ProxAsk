import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Shield, 
  Sun, 
  Moon,
  Plus,
  Compass,
  Menu
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useTheme } from '../../../context/ThemeContext';
import Avatar from '../../common/Avatar';
import './Navbar.css';

const Navbar = ({ onToggleMobileSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const { isDark, toggleTheme } = useTheme();

  const homeRoute = (isAuthenticated || user) ? '/dashboard' : '/';

  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setShowProfileMenu(false);
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
  };

  return (
    <header className="px-navbar">
      <div className="px-navbar__container">
        {/* Left: Mobile Menu & Brand */}
        <div className="px-navbar__left">
          {user && onToggleMobileSidebar && (
            <button
              type="button"
              className="px-navbar__mobile-toggle"
              onClick={onToggleMobileSidebar}
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </button>
          )}

          <Link to={homeRoute} className="px-navbar__brand">
            <div className="px-navbar__brand-badge font-mono">P</div>
            <span className="px-navbar__brand-name">
              Prox<span className="px-navbar__brand-accent">Ask</span>
            </span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="px-navbar__center">
          <form onSubmit={handleSearch} className="px-navbar__search-form">
            <Search size={15} className="px-navbar__search-icon" />
            <input
              type="text"
              placeholder="Search creators, people, questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-navbar__search-input"
            />
            <span className="px-navbar__search-hint font-mono">↵</span>
          </form>
        </div>

        {/* Right: Actions */}
        <div className="px-navbar__right">
          {/* Quick Ask Button (authenticated only) */}
          {user && (
            <Link to="/ask" className="px-navbar__ask-btn">
              <Plus size={15} />
              <span className="px-navbar__ask-btn-text">Ask</span>
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            className="px-navbar__action-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Notifications Shortcut (authenticated only) */}
          {user && (
            <Link
              to="/notifications"
              className="px-navbar__action-btn px-navbar__notif-btn"
              title="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="px-navbar__badge font-mono">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* User Menu or Guest Auth Buttons */}
          {user ? (
            <div className="px-navbar__profile-wrap" ref={profileMenuRef}>
              <button
                type="button"
                className="px-navbar__avatar-btn"
                onClick={() => setShowProfileMenu(prev => !prev)}
                aria-label="User menu"
                aria-expanded={showProfileMenu}
              >
                <Avatar
                  src={user?.avatar}
                  name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  username={user?.username}
                  size="sm"
                />
              </button>

              {showProfileMenu && (
                <div className="px-navbar__menu animate-fade-in">
                  <div className="px-navbar__menu-header">
                    <div className="px-navbar__menu-user-name">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="px-navbar__menu-user-handle font-mono">
                      @{user?.username}
                    </div>
                  </div>

                  <div className="px-navbar__menu-divider" />

                  <Link
                    to="/profile"
                    className="px-navbar__menu-item"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <UserIcon size={16} />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/explore"
                    className="px-navbar__menu-item"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Compass size={16} />
                    <span>Discover People</span>
                  </Link>

                  <Link
                    to="/settings"
                    className="px-navbar__menu-item"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings size={16} />
                    <span>Account Settings</span>
                  </Link>

                  {isAdmin && isAdmin() && (
                    <Link
                      to="/admin"
                      className="px-navbar__menu-item px-navbar__menu-item--admin"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Shield size={16} />
                      <span>Admin Console</span>
                    </Link>
                  )}

                  <div className="px-navbar__menu-divider" />

                  <button
                    type="button"
                    className="px-navbar__menu-item px-navbar__menu-item--logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-navbar__guest-btns">
              <Link to="/login" className="px-btn px-btn--outline px-btn--sm">
                Log In
              </Link>
              <Link to="/signup" className="px-btn px-btn--primary px-btn--sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
