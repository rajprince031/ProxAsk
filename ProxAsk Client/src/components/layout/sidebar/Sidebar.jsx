import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  HelpCircle, 
  Users, 
  Bell, 
  User, 
  Settings, 
  Shield, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import Avatar from '../../common/Avatar';
import './Sidebar.css';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Home Feed',
      exact: true
    },
    {
      path: '/explore',
      icon: Compass,
      label: 'Explore'
    },
    {
      path: '/ask',
      icon: HelpCircle,
      label: 'Ask a Question'
    },
    {
      path: '/followers',
      icon: Users,
      label: 'Connections'
    },
    {
      path: '/notifications',
      icon: Bell,
      label: 'Notifications',
      badge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null
    },
    {
      path: '/profile',
      icon: User,
      label: 'My Profile'
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings'
    }
  ];

  if (isAdmin && isAdmin()) {
    navigationItems.push({
      path: '/admin',
      icon: Shield,
      label: 'Admin Console',
      badge: 'ADMIN',
      isAdminItem: true
    });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div className="px-sidebar__mobile-backdrop" onClick={onCloseMobile} />
      )}

      <aside
        className={`px-sidebar ${isCollapsed ? 'px-sidebar--collapsed' : ''} ${
          isMobileOpen ? 'px-sidebar--mobile-open' : ''
        }`}
      >
        {/* Navigation Section */}
        <div className="px-sidebar__section">
          <div className="px-sidebar__nav-list">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`px-sidebar__nav-item ${isActive ? 'px-sidebar__nav-item--active' : ''} ${
                    item.isAdminItem ? 'px-sidebar__nav-item--admin' : ''
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="px-sidebar__nav-icon">
                    <Icon size={18} />
                  </span>
                  
                  {!isCollapsed && (
                    <>
                      <span className="px-sidebar__nav-label">{item.label}</span>
                      {item.badge && (
                        <span className={`px-sidebar__nav-badge font-mono ${
                          item.isAdminItem ? 'px-sidebar__nav-badge--admin' : ''
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="px-sidebar__footer">
          {/* User Preview or Guest Prompt */}
          {user ? (
            <div className="px-sidebar__user-box">
              <NavLink to="/profile" className="px-sidebar__user-link" onClick={onCloseMobile}>
                <Avatar
                  src={user?.avatar}
                  name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  username={user?.username}
                  size="sm"
                />
                {!isCollapsed && (
                  <div className="px-sidebar__user-info">
                    <span className="px-sidebar__user-name">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="px-sidebar__user-handle font-mono">
                      @{user?.username}
                    </span>
                  </div>
                )}
              </NavLink>

              {!isCollapsed && (
                <button
                  type="button"
                  className="px-sidebar__logout-btn"
                  onClick={handleLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          ) : (
            !isCollapsed && (
              <div className="px-sidebar__guest-footer">
                <span className="px-sidebar__guest-text font-mono">PROXASK NETWORK</span>
                <div className="px-sidebar__guest-actions">
                  <NavLink to="/login" className="px-btn px-btn--outline px-btn--sm" onClick={onCloseMobile}>
                    Log In
                  </NavLink>
                  <NavLink to="/signup" className="px-btn px-btn--primary px-btn--sm" onClick={onCloseMobile}>
                    Sign Up
                  </NavLink>
                </div>
              </div>
            )
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            className="px-sidebar__collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
