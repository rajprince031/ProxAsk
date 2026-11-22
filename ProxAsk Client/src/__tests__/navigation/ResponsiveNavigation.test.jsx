import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MobileNav from '../../components/layout/mobileNav/MobileNav';
import Navbar from '../../components/layout/navbar/Navbar';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { ThemeContext } from '../../context/ThemeContext';

describe('Responsive Navigation & Duplicate Actions Cleanup', () => {
  it('renders central prominent Ask Question (+) button in MobileNav with proper aria-label', () => {
    render(
      <NotificationContext.Provider value={{ unreadCount: 3 }}>
        <MemoryRouter>
          <MobileNav />
        </MemoryRouter>
      </NotificationContext.Provider>
    );

    const askBtn = screen.getByTestId('mobile-nav-ask-btn');
    expect(askBtn).toBeDefined();
    expect(askBtn.getAttribute('href')).toBe('/ask');

    const plusIconContainer = screen.getByLabelText('Ask Question');
    expect(plusIconContainer).toBeDefined();
  });

  it('renders Navbar with top Ask button on desktop, which is styled to hide on mobile via CSS', () => {
    const mockUser = {
      id: 'u-1',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
    };

    const { container } = render(
      <ThemeContext.Provider value={{ isDark: false, toggleTheme: vi.fn() }}>
        <NotificationContext.Provider value={{ unreadCount: 0 }}>
          <AuthContext.Provider value={{ user: mockUser, logout: vi.fn(), isAdmin: () => false }}>
            <MemoryRouter>
              <Navbar />
            </MemoryRouter>
          </AuthContext.Provider>
        </NotificationContext.Provider>
      </ThemeContext.Provider>
    );

    // Navbar has .px-navbar__ask-btn
    const topAskBtn = container.querySelector('.px-navbar__ask-btn');
    expect(topAskBtn).toBeDefined();
    expect(topAskBtn.getAttribute('href')).toBe('/ask');
  });

  it('renders correct navigation in dark mode without breaking contrast', () => {
    render(
      <ThemeContext.Provider value={{ isDark: true, toggleTheme: vi.fn() }}>
        <NotificationContext.Provider value={{ unreadCount: 0 }}>
          <MemoryRouter>
            <MobileNav />
          </MemoryRouter>
        </NotificationContext.Provider>
      </ThemeContext.Provider>
    );

    expect(screen.getByTestId('mobile-nav-ask-btn')).toBeDefined();
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Explore')).toBeDefined();
    expect(screen.getByText('Alerts')).toBeDefined();
    expect(screen.getByText('Profile')).toBeDefined();
  });
});
