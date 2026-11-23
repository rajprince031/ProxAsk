import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EmailVerificationPage from '../../pages/auth/EmailVerificationPage';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { ThemeContext } from '../../context/ThemeContext';

const mockVerifyEmail = vi.fn();
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

const renderEmailVerification = (initialRoute = '/verify-email') => {
  return render(
    <ThemeContext.Provider value={{ theme: 'light', isDark: false, toggleTheme: vi.fn() }}>
      <NotificationContext.Provider value={{ showSuccess: mockShowSuccess, showError: mockShowError }}>
        <AuthContext.Provider value={{
          verifyEmail: mockVerifyEmail,
          resendVerificationEmail: vi.fn(),
          isAuthenticated: false,
          loading: false
        }}>
          <MemoryRouter initialEntries={[initialRoute]}>
            <Routes>
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/login" element={<div>Mock Login Page</div>} />
              <Route path="/" element={<div>Mock Home Page</div>} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </NotificationContext.Provider>
    </ThemeContext.Provider>
  );
};

describe('EmailVerificationPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders OTP form when opened without query tokens', () => {
    renderEmailVerification('/verify-email');
    expect(screen.getByRole('heading', { name: /verify your email/i })).toBeDefined();
    expect(screen.getByPlaceholderText(/alex@example.com/i)).toBeDefined();
    expect(screen.getByPlaceholderText('123456')).toBeDefined();
    expect(screen.getByRole('button', { name: /verify & activate account/i })).toBeDefined();
  });

  it('triggers verifyEmail exactly ONCE when opened with ?token=... and renders success card', async () => {
    mockVerifyEmail.mockResolvedValue({ success: true, message: 'Verified' });

    renderEmailVerification('/verify-email?token=valid-secret-token');

    // Wait for the verification to complete
    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledTimes(1);
      expect(mockVerifyEmail).toHaveBeenCalledWith({ token: 'valid-secret-token' });
    });

    // Verify static success card is displayed
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /account verified successfully!/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /go to login page/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /go to home page/i })).toBeDefined();
    });

    // Verify verifyEmail was NOT called more than once (no infinite loop)
    expect(mockVerifyEmail).toHaveBeenCalledTimes(1);
  });

  it('navigates to /login when clicking Go to Login Page on verified screen', async () => {
    mockVerifyEmail.mockResolvedValue({ success: true, message: 'Verified' });

    renderEmailVerification('/verify-email?token=valid-secret-token');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /go to login page/i })).toBeDefined();
    });

    fireEvent.click(screen.getByRole('button', { name: /go to login page/i }));

    await waitFor(() => {
      expect(screen.getByText('Mock Login Page')).toBeDefined();
    });
  });

  it('displays error notification if token verification fails with generic error and retains form view', async () => {
    mockVerifyEmail.mockResolvedValue({ success: false, error: 'Invalid token signature' });

    renderEmailVerification('/verify-email?token=invalid-token');

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledTimes(1);
      expect(mockShowError).toHaveBeenCalledWith('Invalid token signature');
    });

    // Stays on form view so user can enter OTP manually
    expect(screen.getByRole('button', { name: /verify & activate account/i })).toBeDefined();
  });

  it('displays Already Verified screen with button to /login when account is already verified', async () => {
    mockVerifyEmail.mockResolvedValue({ success: true, message: 'Your account is already verified. Please log in.', data: { status: 'ALREADY_VERIFIED' } });

    renderEmailVerification('/verify-email?token=already-verified-token');

    await waitFor(() => {
      expect(screen.getByTestId('already-verified-card')).toBeDefined();
      expect(screen.getByTestId('already-verified-message').textContent).toContain('Your account is already verified. Please log in.');
      expect(screen.getByRole('button', { name: /go to login/i })).toBeDefined();
    });
  });

  it('displays Expired screen with button to /signup when token is expired', async () => {
    mockVerifyEmail.mockResolvedValue({ success: false, error: 'Your verification link/OTP has expired. Please register again.' });

    renderEmailVerification('/verify-email?token=expired-token');

    await waitFor(() => {
      expect(screen.getByTestId('expired-verification-card')).toBeDefined();
      expect(screen.getByTestId('expired-verification-message').textContent).toContain('Your verification link/OTP has expired. Please register again.');
      expect(screen.getByRole('button', { name: /register again/i })).toBeDefined();
    });
  });

  it('renders pending state message and Resend OTP / Link button when in pending state', () => {
    renderEmailVerification('/verify-email');
    expect(screen.getByTestId('verification-pending-message').textContent).toContain(
      'Your account is not verified yet. Please enter the OTP (or click the verification link) sent to your email.'
    );
    expect(screen.getByRole('button', { name: /resend otp \/ link/i })).toBeDefined();
  });
});
