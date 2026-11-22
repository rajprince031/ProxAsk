import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { ThemeContext } from '../../context/ThemeContext';

describe('Full App Real Navigation Test', () => {
  const mockAuthContext = {
    login: vi.fn().mockResolvedValue({ success: true }),
    register: vi.fn().mockResolvedValue({ success: true }),
    clearError: vi.fn(),
    isAuthenticated: false,
    loading: false,
    user: null,
  };

  const mockNotifContext = {
    showSuccess: vi.fn(),
    showError: vi.fn(),
    unreadCount: 0,
  };

  const mockThemeContext = {
    theme: 'light',
    isDark: false,
    toggleTheme: vi.fn(),
  };

  const renderFullApp = (initialRoute = '/login') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <ThemeContext.Provider value={mockThemeContext}>
          <NotificationContext.Provider value={mockNotifContext}>
            <AuthContext.Provider value={mockAuthContext}>
              <App />
            </AuthContext.Provider>
          </NotificationContext.Provider>
        </ThemeContext.Provider>
      </MemoryRouter>
    );
  };

  it('navigates from Login to Signup when clicking Create one now', async () => {
    renderFullApp('/login');

    expect(screen.getByRole('heading', { name: /sign in to proxask/i })).toBeDefined();

    const createLink = screen.getByRole('link', { name: /create one now/i });
    fireEvent.click(createLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeDefined();
    });
  });

  it('navigates from Signup to Login when clicking Sign in', async () => {
    renderFullApp('/signup');

    expect(screen.getByRole('heading', { name: /create your account/i })).toBeDefined();

    const signInLink = screen.getByRole('link', { name: /sign in/i });
    fireEvent.click(signInLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to proxask/i })).toBeDefined();
    });
  });
});
