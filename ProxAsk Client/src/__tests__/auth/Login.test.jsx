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

  it('renders login fields, submit button, and quick-login test accounts', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/e\.g\. demo_user or admin/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
    expect(screen.getByText(/TEST ACCOUNTS/i)).toBeDefined();
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
    mockLogin.mockResolvedValueOnce({ success: true, user: { username: 'demo_user' } });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. demo_user or admin/i), {
      target: { value: 'demo_user' }
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'demo_user',
        password: 'password123'
      });
      expect(mockShowSuccess).toHaveBeenCalledWith(expect.stringContaining('Welcome back'));
    });
  });

  it('allows 1-click test login using test account pill', async () => {
    mockLogin.mockResolvedValueOnce({ success: true, user: { username: 'demo_user' } });
    renderLogin();

    const demoPill = screen.getByTitle(/click to login as @demo_user/i);
    expect(demoPill).toBeDefined();
    fireEvent.click(demoPill);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'demo_user',
        email: 'demo@proxask.com',
        password: 'password123'
      });
    });
  });
});
