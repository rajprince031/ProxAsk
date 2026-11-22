import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from '../../pages/SettingsPage';
import ForgotPasswordPage from '../../pages/auth/ForgotPasswordPage';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { ThemeContext } from '../../context/ThemeContext';
import api from '../../service/AuthService';

vi.mock('../../service/AuthService', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Account Security & Email OTP Workflows', () => {
  const mockShowSuccess = vi.fn();
  const mockShowError = vi.fn();
  const mockUpdateUser = vi.fn();
  const mockForgotPassword = vi.fn();

  const mockUser = {
    id: 'user-123',
    username: 'alex_dev',
    email: 'alex@example.com',
    firstName: 'Alex',
    lastName: 'Rivera',
    isVerified: true,
    isPrivate: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url.includes('/follow/requests/count')) {
        return Promise.resolve({ data: { success: true, data: 0 } });
      }
      return Promise.resolve({ data: { success: true, data: {} } });
    });
    api.post.mockResolvedValue({ data: { success: true, message: 'Success' } });
    api.put.mockResolvedValue({ data: { success: true, message: 'Success' } });
  });

  const renderSettings = () => {
    return render(
      <MemoryRouter>
        <ThemeContext.Provider value={{ isDark: false, toggleTheme: () => {} }}>
          <NotificationContext.Provider value={{ showSuccess: mockShowSuccess, showError: mockShowError }}>
            <AuthContext.Provider value={{ user: mockUser, updateUser: mockUpdateUser, logout: () => {}, isAdmin: () => false }}>
              <SettingsPage />
            </AuthContext.Provider>
          </NotificationContext.Provider>
        </ThemeContext.Provider>
      </MemoryRouter>
    );
  };

  it('ensures Appearance & Theme section has been removed from SettingsPage (Pillar 8)', () => {
    renderSettings();
    expect(screen.queryByText(/Appearance & Theme/i)).toBeNull();
    expect(screen.queryByText(/GitHub Light/i)).toBeNull();
  });

  it('renders Account Identity with Email and Change button', () => {
    renderSettings();
    expect(screen.getByText('alex@example.com')).toBeDefined();
    expect(screen.getByRole('button', { name: /^Change$/i })).toBeDefined();
  });

  it('opens Change Email modal and sends OTP to the proposed NEW email address', async () => {
    renderSettings();
    const changeEmailBtn = screen.getByRole('button', { name: /^Change$/i });
    fireEvent.click(changeEmailBtn);

    expect(screen.getByText(/To update your email, we will send a 6-digit confirmation code directly to your proposed new email address/i)).toBeDefined();

    const newEmailInput = screen.getByPlaceholderText(/new.email@example.com/i);
    fireEvent.change(newEmailInput, { target: { value: 'new.alex@example.com' } });

    const sendCodeBtn = screen.getByRole('button', { name: /Send Verification Code/i });
    fireEvent.click(sendCodeBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/user/change-email/request-otp',
        { newEmail: 'new.alex@example.com' }
      );
    });
  });

  it('renders Password & Security section and opens Change Password modal', async () => {
    renderSettings();
    const changePwBtn = screen.getByRole('button', { name: /Change Password/i });
    fireEvent.click(changePwBtn);

    expect(screen.getByText(/For your security, we'll verify your identity with a 6-digit OTP code sent to your registered email/i)).toBeDefined();

    const sendOtpBtn = screen.getByRole('button', { name: /Send Verification OTP/i });
    fireEvent.click(sendOtpBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/user/change-password/request-otp');
    });
  });

  it('validates Forgot Password submission workflow', async () => {
    mockForgotPassword.mockResolvedValue({ success: true, message: 'Reset code sent' });

    render(
      <MemoryRouter>
        <ThemeContext.Provider value={{ isDark: false, toggleTheme: () => {} }}>
          <NotificationContext.Provider value={{ showSuccess: mockShowSuccess, showError: mockShowError }}>
            <AuthContext.Provider value={{ forgotPassword: mockForgotPassword }}>
              <ForgotPasswordPage />
            </AuthContext.Provider>
          </NotificationContext.Provider>
        </ThemeContext.Provider>
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/alex@example.com/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    const submitBtn = screen.getByRole('button', { name: /Send Reset Code/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('user@example.com');
    });
  });
});
