import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../pages/auth/loginPage/LoginPage';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { ThemeContext } from '../../context/ThemeContext';

const mockLogin = vi.fn();
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

const renderLogin = () => {
  return render(
    <ThemeContext.Provider value={{ theme: 'light', isDark: false, toggleTheme: vi.fn() }}>
      <NotificationContext.Provider value={{ showSuccess: mockShowSuccess, showError: mockShowError }}>
        <AuthContext.Provider value={{ login: mockLogin, clearError: vi.fn() }}>
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </NotificationContext.Provider>
    </ThemeContext.Provider>
  );
};

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login fields, submit button, and signup link', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/alex_creator|demo_user/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /create one now/i })).toBeDefined();
  });

  it('shows validation errors when submitted empty', async () => {
    renderLogin();
    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/username or email is required/i)).toBeDefined();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login API with credentials on submit', async () => {
    mockLogin.mockResolvedValueOnce({ success: true, user: { username: 'alex_creator' } });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/alex_creator|demo_user/i), {
      target: { value: 'alex_creator' }
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'alex_creator',
        password: 'password123'
      });
      expect(mockShowSuccess).toHaveBeenCalledWith(expect.stringContaining('Welcome back'));
    });
  });

  it('toggles password visibility', () => {
    renderLogin();
    const pwdInput = screen.getByPlaceholderText(/••••••••/i);
    expect(pwdInput.getAttribute('type')).toBe('password');

    const toggleBtn = screen.getByLabelText(/show password/i);
    fireEvent.click(toggleBtn);
    expect(pwdInput.getAttribute('type')).toBe('text');

    fireEvent.click(screen.getByLabelText(/hide password/i));
    expect(pwdInput.getAttribute('type')).toBe('password');
  });
});
