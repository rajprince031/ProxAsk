import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Activity, 
  ArrowLeft, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import Avatar from '../../common/Avatar';
import Badge from '../../common/Badge';
import './AdminLayout.css';

const AdminLayout = ({ children, activeSection = 'overview', onSelectSection }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const adminMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'moderation', label: 'Content Moderation', icon: MessageSquare },
    { id: 'system', label: 'System & Health', icon: Activity },
  ];

  return (
    <div className="px-admin-layout">
      {/* Admin Top Header */}
      <header className="px-admin-header">
        <div className="px-admin-header__container">
          <div className="px-admin-header__left">
            <button
              type="button"
              className="px-admin-header__mobile-toggle"
              onClick={() => setIsMobileSidebarOpen(prev => !prev)}
              aria-label="Toggle admin sidebar"
            >
              {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to="/admin" className="px-admin-header__brand">
              <div className="px-admin-header__shield-badge">
                <Shield size={16} />
              </div>
              <div className="px-admin-header__titles">
                <span className="px-admin-header__name">ProxAsk</span>
                <span className="px-admin-header__tag font-mono">ADMIN CONSOLE</span>
              </div>
            </Link>

            <div className="px-admin-header__status-pill font-mono">
              <span className="px-admin-header__status-dot" />
              <span>LIVE API</span>
            </div>
          </div>

          <div className="px-admin-header__right">
            {/* Quick exit to public application */}
            <Link to="/dashboard" className="px-admin-header__exit-btn" title="Return to public user feed">
              <ArrowLeft size={14} />
              <span className="px-admin-header__exit-text">Exit to User App</span>
            </Link>

            {/* Theme Toggle */}
            <button
              type="button"
              className="px-admin-header__icon-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Admin Profile Dropdown */}
            <div className="px-admin-header__profile-wrap" ref={adminMenuRef}>
              <button
                type="button"
                className="px-admin-header__avatar-btn"
                onClick={() => setShowAdminMenu(prev => !prev)}
                aria-label="Admin menu"
              >
                <Avatar
                  src={user?.avatar}
                  name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  username={user?.username || 'admin'}
                  size="sm"
                />
              </button>

              {showAdminMenu && (
                <div className="px-admin-header__menu animate-fade-in">
                  <div className="px-admin-header__menu-header">
                    <div className="px-admin-header__menu-name">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="px-admin-header__menu-handle font-mono">
                      @{user?.username}
                    </div>
                    <Badge variant="teal" size="sm" className="px-admin-header__menu-role font-mono">
                      ROLE_ADMIN
                    </Badge>
                  </div>

                  <div className="px-admin-header__menu-divider" />

                  <Link
                    to="/dashboard"
                    className="px-admin-header__menu-item"
                    onClick={() => setShowAdminMenu(false)}
                  >
                    <ExternalLink size={15} />
                    <span>Return to User Feed</span>
                  </Link>

                  <div className="px-admin-header__menu-divider" />

                  <button
                    type="button"
                    className="px-admin-header__menu-item px-admin-header__menu-item--logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={15} />
                    <span>Admin Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Admin Body (Sidebar + Content Area) */}
      <div className="px-admin-layout__body">
        {/* Mobile backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="px-admin-sidebar__backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Dedicated Admin Sidebar */}
        <aside className={`px-admin-sidebar ${isMobileSidebarOpen ? 'px-admin-sidebar--mobile-open' : ''}`}>
          <div className="px-admin-sidebar__header">
            <span className="px-admin-sidebar__section-title font-mono">MANAGEMENT CONSOLE</span>
          </div>

          <nav className="px-admin-sidebar__nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`px-admin-sidebar__link ${isActive ? 'px-admin-sidebar__link--active' : ''}`}
                  onClick={() => {
                    if (onSelectSection) onSelectSection(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  data-testid={`admin-nav-${item.id}`}
                >
                  <Icon size={18} className="px-admin-sidebar__link-icon" />
                  <span className="px-admin-sidebar__link-label">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="px-admin-sidebar__footer">
            <Link to="/dashboard" className="px-admin-sidebar__exit-link">
              <ArrowLeft size={16} />
              <span>Back to Public App</span>
            </Link>

            <button
              type="button"
              className="px-admin-sidebar__logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="px-admin-layout__content">
          <div className="px-admin-layout__content-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
