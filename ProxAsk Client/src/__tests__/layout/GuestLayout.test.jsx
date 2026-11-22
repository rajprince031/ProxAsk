import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { ThemeContext } from '../../context/ThemeContext';

const renderAppLayout = ({ currentUser = null } = {}) => {
  const mockAuth = {
    user: currentUser,
    isAuthenticated: Boolean(currentUser),
    isAdmin: () => false,
    logout: () => {},
  };
  const mockNotif = {
    unreadCount: 0,
    showSuccess: () => {},
    showError: () => {},
  };
  const mockTheme = {
    isDark: false,
    toggleTheme: () => {},
  };

  return render(
    <MemoryRouter>
      <ThemeContext.Provider value={mockTheme}>
        <NotificationContext.Provider value={mockNotif}>
          <AuthContext.Provider value={mockAuth}>
            <AppLayout>
              <div data-testid="page-content">Profile Content</div>
            </AppLayout>
          </AuthContext.Provider>
        </NotificationContext.Provider>
      </ThemeContext.Provider>
    </MemoryRouter>
  );
};

describe('GuestLayout Verification', () => {
  it('omits sidebar and mobile bottom nav for unauthenticated guests and expands content', () => {
    const { container } = renderAppLayout({ currentUser: null });

    // Sidebar should NOT be rendered
    expect(container.querySelector('.px-sidebar')).toBeNull();

    // Mobile nav should NOT be rendered
    expect(container.querySelector('.px-mobile-nav')).toBeNull();

    // Content container must have guest modifier for full-width layout
    expect(container.querySelector('.px-layout__content--guest')).not.toBeNull();

    // Page content is rendered
    expect(screen.getByTestId('page-content')).toBeDefined();
  });

  it('renders topbar guest actions: Log In, Sign Up, and omits top Ask button for guests', () => {
    const { container } = renderAppLayout({ currentUser: null });

    expect(screen.getByRole('link', { name: /Log In/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Sign Up/i })).toBeDefined();
    // Top Ask button must NOT be present for unauthenticated guests
    expect(container.querySelector('.px-navbar__ask-btn')).toBeNull();
  });

  it('ensures logo links to public homepage / for guests', () => {
    const { container } = renderAppLayout({ currentUser: null });
    const brandLink = container.querySelector('.px-navbar__brand');
    expect(brandLink.getAttribute('href')).toBe('/');
  });

  it('renders full sidebar and mobile nav when user is authenticated', () => {
    const mockUser = { id: 'u1', username: 'alex', firstName: 'Alex' };
    const { container } = renderAppLayout({ currentUser: mockUser });

    // Sidebar and mobile nav MUST be present for authenticated users
    expect(container.querySelector('.px-sidebar')).not.toBeNull();
    expect(container.querySelector('.px-mobile-nav')).not.toBeNull();
    expect(container.querySelector('.px-layout__content--guest')).toBeNull();
  });
});
