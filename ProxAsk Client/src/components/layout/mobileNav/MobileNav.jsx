import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Plus, Bell, User } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';
import './MobileNav.css';

const MobileNav = () => {
  const { unreadCount } = useNotifications();

  return (
    <nav className="px-mobile-nav">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `px-mobile-nav__item ${isActive ? 'px-mobile-nav__item--active' : ''}`
        }
      >
        <Home size={20} />
        <span className="px-mobile-nav__label">Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `px-mobile-nav__item ${isActive ? 'px-mobile-nav__item--active' : ''}`
        }
      >
        <Compass size={20} />
        <span className="px-mobile-nav__label">Explore</span>
      </NavLink>

      <NavLink
        to="/ask"
        className="px-mobile-nav__item px-mobile-nav__item--action"
        title="Ask Question"
        data-testid="mobile-nav-ask-btn"
      >
        <div className="px-mobile-nav__action-btn" aria-label="Ask Question">
          <Plus size={22} className="px-mobile-nav__action-icon" />
        </div>
      </NavLink>

      <NavLink
        to="/notifications"
        className={({ isActive }) =>
          `px-mobile-nav__item ${isActive ? 'px-mobile-nav__item--active' : ''}`
        }
      >
        <div className="px-mobile-nav__icon-wrap">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="px-mobile-nav__badge font-mono">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <span className="px-mobile-nav__label">Alerts</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `px-mobile-nav__item ${isActive ? 'px-mobile-nav__item--active' : ''}`
        }
      >
        <User size={20} />
        <span className="px-mobile-nav__label">Profile</span>
      </NavLink>
    </nav>
  );
};

export default MobileNav;
