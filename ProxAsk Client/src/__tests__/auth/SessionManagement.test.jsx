import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from '../../pages/SettingsPage';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { ThemeContext } from '../../context/ThemeContext';
import { authService } from '../../service/AuthService';
import dialogService from '../../service/dialogService';

vi.mock('../../service/AuthService', () => {
  const mockApi = {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  };
  return {
    default: mockApi,
    authService: {
      getActiveSessions: vi.fn(),
      revokeSession: vi.fn(),
      revokeOtherSessions: vi.fn(),
      logout: vi.fn(),
    },
  };
});

vi.mock('../../service/dialogService', () => ({
  default: {
    confirmAction: vi.fn(),
    confirmMakeProfilePublic: vi.fn(),
  },
}));

const mockUser = {
  id: 'u123',
  username: 'alex_creator',
  email: 'alex@proxask.com',
  firstName: 'Alex',
  lastName: 'Mercer',
  isVerified: true,
  isPrivate: false,
};

const mockSessions = [
  {
    sessionId: 'sess-current-1',
    deviceInfo: 'Chrome on macOS',
    ipAddress: '127.0.0.1',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    isCurrentSession: true,
  },
  {
    sessionId: 'sess-remote-2',
    deviceInfo: 'Mobile Safari on iOS',
    ipAddress: '192.168.1.50',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    lastActiveAt: new Date(Date.now() - 1800000).toISOString(),
    isCurrentSession: false,
  },
];

const renderSettings = () => {
  return render(
    <ThemeContext.Provider value={{ theme: 'light', isDark: false, toggleTheme: vi.fn() }}>
      <NotificationContext.Provider value={{ showSuccess: vi.fn(), showError: vi.fn() }}>
        <AuthContext.Provider
          value={{
            user: mockUser,
            logout: vi.fn(),
            isAdmin: () => false,
            updateUser: vi.fn(),
          }}
        >
          <MemoryRouter>
            <SettingsPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </NotificationContext.Provider>
    </ThemeContext.Provider>
  );
};

describe('Active Devices & Session Management Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.getActiveSessions.mockResolvedValue(mockSessions);
  });

  it('renders active sessions list with current device highlighted', async () => {
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Active Devices & Sessions')).toBeDefined();
      expect(screen.getByText('Chrome on macOS')).toBeDefined();
      expect(screen.getByText('Mobile Safari on iOS')).toBeDefined();
      expect(screen.getByText('THIS DEVICE')).toBeDefined();
      expect(screen.getByText(/192\.168\.1\.50/)).toBeDefined();
    });
  });

  it('allows revoking a remote device session after confirmation', async () => {
    dialogService.confirmAction.mockResolvedValueOnce(true);
    authService.revokeSession.mockResolvedValueOnce({ success: true });

    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Mobile Safari on iOS')).toBeDefined();
    });

    const revokeButtons = screen.getAllByRole('button', { name: /revoke/i });
    expect(revokeButtons.length).toBe(1);

    fireEvent.click(revokeButtons[0]);

    await waitFor(() => {
      expect(dialogService.confirmAction).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Revoke Session',
          isDestructive: true,
        })
      );
      expect(authService.revokeSession).toHaveBeenCalledWith('sess-remote-2');
    });
  });

  it('allows logging out all other devices with one click', async () => {
    dialogService.confirmAction.mockResolvedValueOnce(true);
    authService.revokeOtherSessions.mockResolvedValueOnce({ success: true });

    renderSettings();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log out other devices/i })).toBeDefined();
    });

    fireEvent.click(screen.getByRole('button', { name: /log out other devices/i }));

    await waitFor(() => {
      expect(dialogService.confirmAction).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Log Out Other Devices',
          isDestructive: true,
        })
      );
      expect(authService.revokeOtherSessions).toHaveBeenCalled();
    });
  });
});
