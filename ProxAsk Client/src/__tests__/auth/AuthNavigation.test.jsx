import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../../pages/auth/loginPage/LoginPage';
import SignupPage from '../../pages/auth/signupPage/SignupPage';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { ThemeContext } from '../../context/ThemeContext';

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
};

const mockThemeContext = {
  theme: 'light',
  isDark: false,
  toggleTheme: vi.fn(),
};

const renderAuthApp = (initialRoute = '/signup') => {
  return render(
    <ThemeContext.Provider value={mockThemeContext}>
      <NotificationContext.Provider value={mockNotifContext}>
        <AuthContext.Provider value={mockAuthContext}>
          <MemoryRouter initialEntries={[initialRoute]}>
            <Routes>
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </NotificationContext.Provider>
    </ThemeContext.Provider>
  );
};

describe('Auth Navigation — Signup and Login Bidirectional Routing', () => {
  it('renders Signup page on /signup and navigates to Login when clicking Sign in link', async () => {
    renderAuthApp('/signup');

    // Verify on Signup page
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeDefined();

    // Click "Sign in" link
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toBeDefined();
    fireEvent.click(signInLink);

    // Verify transitioned to Login page cleanly
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to proxask/i })).toBeDefined();
      expect(screen.getByPlaceholderText(/alex_creator|demo_user/i)).toBeDefined();
    });
  });

  it('renders Login page on /login and navigates to Signup when clicking Create one now link', async () => {
    renderAuthApp('/login');

    // Verify on Login page
    expect(screen.getByRole('heading', { name: /sign in to proxask/i })).toBeDefined();

    // Click "Create one now" link
    const createLink = screen.getByRole('link', { name: /create one now/i });
    expect(createLink).toBeDefined();
    fireEvent.click(createLink);

    // Verify transitioned to Signup page cleanly
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeDefined();
      expect(screen.getByPlaceholderText('e.g. Alex')).toBeDefined();
    });
  });
});
