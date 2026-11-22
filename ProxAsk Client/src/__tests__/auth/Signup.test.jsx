import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from '../../pages/auth/signupPage/SignupPage';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { ThemeContext } from '../../context/ThemeContext';

const mockRegister = vi.fn();
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

const renderSignup = () => {
  return render(
    <ThemeContext.Provider value={{ theme: 'light', isDark: false, toggleTheme: vi.fn() }}>
      <NotificationContext.Provider value={{ showSuccess: mockShowSuccess, showError: mockShowError }}>
        <AuthContext.Provider value={{ register: mockRegister, clearError: vi.fn() }}>
          <MemoryRouter>
            <SignupPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </NotificationContext.Provider>
    </ThemeContext.Provider>
  );
};

describe('SignupPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required signup fields and submit button', () => {
    renderSignup();
    expect(screen.getByPlaceholderText('e.g. Alex')).toBeDefined();
    expect(screen.getByPlaceholderText('e.g. Mercer')).toBeDefined();
    expect(screen.getByPlaceholderText('e.g. alexmercer')).toBeDefined();
    expect(screen.getByPlaceholderText('e.g. alex@example.com')).toBeDefined();
    expect(screen.getByPlaceholderText('At least 8 characters')).toBeDefined();
    expect(screen.getByPlaceholderText('Re-type password')).toBeDefined();
    expect(screen.getByRole('button', { name: /create account/i })).toBeDefined();
  });

  it('validates empty fields on submission and prevents API call', async () => {
    renderSignup();
    const submitBtn = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeDefined();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('validates password mismatch correctly', async () => {
    renderSignup();
    fireEvent.change(screen.getByPlaceholderText('e.g. Alex'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Mercer'), { target: { value: 'Morgan' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. alexmercer'), { target: { value: 'alex_m' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. alex@example.com'), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText('Re-type password'), { target: { value: 'Different123!' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeDefined();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register API with trimmed, valid payload upon submission and displays success notification', async () => {
    mockRegister.mockResolvedValueOnce({ success: true });
    renderSignup();

    fireEvent.change(screen.getByPlaceholderText('e.g. Alex'), { target: { value: '  Alex  ' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Mercer'), { target: { value: '  Morgan ' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. alexmercer'), { target: { value: '  alex_m  ' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. alex@example.com'), { target: { value: '  alex@example.com ' } });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText('Re-type password'), { target: { value: 'Password123!' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'Alex',
        lastName: 'Morgan',
        username: 'alex_m',
        email: 'alex@example.com',
        password: 'Password123!',
      });
      expect(mockShowSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Account created successfully',
          message: expect.stringContaining('Welcome to ProxAsk'),
        })
      );
      expect(mockShowError).not.toHaveBeenCalled();
    });
  });

  it('displays error notification and never welcome message when registration fails', async () => {
    mockRegister.mockResolvedValueOnce({ success: false, error: 'Username already taken' });
    renderSignup();

    fireEvent.change(screen.getByPlaceholderText('e.g. Alex'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Mercer'), { target: { value: 'Morgan' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. alexmercer'), { target: { value: 'taken_user' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. alex@example.com'), { target: { value: 'taken@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText('Re-type password'), { target: { value: 'Password123!' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Registration failed',
          message: expect.stringContaining('username is already taken'),
        })
      );
      expect(mockShowSuccess).not.toHaveBeenCalled();
      expect(screen.getByTestId('signup-server-error')).toBeDefined();
    });
  });

  it('handles network / server failure with clear error notification and prevents duplicate submission', async () => {
    let resolveRegister;
    const pendingPromise = new Promise((resolve) => {
      resolveRegister = resolve;
    });
    mockRegister.mockReturnValueOnce(pendingPromise);

    renderSignup();

    fireEvent.change(screen.getByPlaceholderText('e.g. Alex'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Mercer'), { target: { value: 'Morgan' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. alexmercer'), { target: { value: 'alex_m' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. alex@example.com'), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText('Re-type password'), { target: { value: 'Password123!' } });

    const submitBtn = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitBtn);

    // Button should be disabled / submitting, duplicate click should not trigger extra register call
    fireEvent.click(submitBtn);
    expect(mockRegister).toHaveBeenCalledTimes(1);

    // Now reject with network failure
    resolveRegister({ success: false, error: 'Network Error: Failed to fetch' });

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Registration failed',
          message: expect.stringContaining('Network connection failure'),
        })
      );
      expect(mockShowSuccess).not.toHaveBeenCalled();
    });
  });
});
