import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiCompass, 
  FiMessageCircle, 
  FiBell, 
  FiUsers, 
  FiSettings,
  FiPlusCircle,
  FiShield,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigationItems = [
    {
      path: '/dashboard',
      icon: FiHome,
      label: 'Home',
      exact: true
    },
    {
      path: '/explore',
      icon: FiCompass,
      label: 'Explore'
    },
    {
      path: '/messages',
      icon: FiMessageCircle,
      label: 'Messages'
    },
    {
      path: '/notifications',
      icon: FiBell,
      label: 'Notifications',
      badge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null
    },
    {
      path: '/followers',
      icon: FiUsers,
      label: 'Followers'
    }
  ];

  const actionItems = [
    {
      path: '/ask',
      icon: FiPlusCircle,
      label: 'Ask Question',
      isAction: true
    }
  ];

  const settingsItems = [
    {
      path: '/settings',
      icon: FiSettings,
      label: 'Settings'
    }
  ];

  // Add admin item if user is admin
  if (isAdmin()) {
    settingsItems.unshift({
      path: '/admin',
      icon: FiShield,
      label: 'Admin Panel'
    });
  }

  const renderNavItem = (item) => {
    const IconComponent = item.icon;
    const isActive = item.exact 
      ? location.pathname === item.path 
      : location.pathname.startsWith(item.path);

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={`proxask-sidebar__nav-item ${
          item.isAction ? 'proxask-sidebar__nav-item--action' : ''
        } ${isActive ? 'proxask-sidebar__nav-item--active' : ''}`}
        title={isCollapsed ? item.label : ''}
      >
        <div className="proxask-sidebar__nav-item-icon">
          <IconComponent />
          {item.badge && (
            <span className="proxask-sidebar__nav-badge">
              {item.badge}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <span className="proxask-sidebar__nav-item-label">
            {item.label}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      <aside className={`proxask-sidebar ${isCollapsed ? 'proxask-sidebar--collapsed' : ''}`}>
        <div className="proxask-sidebar__content">
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="proxask-sidebar__toggle"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>

          {/* Main Navigation */}
          <nav className="proxask-sidebar__nav">
            <div className="proxask-sidebar__nav-section">
              {!isCollapsed && (
                <h3 className="proxask-sidebar__nav-section-title">Navigation</h3>
              )}
              {navigationItems.map(renderNavItem)}
            </div>

            {/* Action Items */}
            <div className="proxask-sidebar__nav-section">
              {!isCollapsed && (
                <h3 className="proxask-sidebar__nav-section-title">Actions</h3>
              )}
              {actionItems.map(renderNavItem)}
            </div>

            {/* Settings */}
            <div className="proxask-sidebar__nav-section proxask-sidebar__nav-section--bottom">
              {!isCollapsed && (
                <h3 className="proxask-sidebar__nav-section-title">Settings</h3>
              )}
              {settingsItems.map(renderNavItem)}
            </div>
          </nav>

          {/* User Info (when not collapsed) */}
          {!isCollapsed && (
            <div className="proxask-sidebar__user">
              <div className="proxask-sidebar__user-avatar">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.firstname}
                    className="proxask-sidebar__user-image"
                  />
                ) : (
                  <div className="proxask-sidebar__user-initials">
                    {user?.firstname?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="proxask-sidebar__user-info">
                <p className="proxask-sidebar__user-name">
                  {user?.firstname} {user?.lastname}
                </p>
                <p className="proxask-sidebar__user-username">
                  @{user?.username}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      <div 
        className={`proxask-sidebar__overlay ${!isCollapsed ? 'proxask-sidebar__overlay--visible' : ''}`}
        onClick={toggleSidebar}
      />
    </>
  );
};

export default Sidebar;