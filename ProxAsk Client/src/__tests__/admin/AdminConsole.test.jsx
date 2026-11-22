import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminDashboardPage from '../../pages/AdminDashboardPage';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { ThemeContext } from '../../context/ThemeContext';
import api from '../../service/AuthService';
import dialogService from '../../service/dialogService';

vi.mock('../../service/AuthService', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../service/dialogService', () => ({
  default: {
    confirmAction: vi.fn(),
    confirmDeleteQuestion: vi.fn(),
  },
}));

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

const renderAdminPage = (user) => {
  api.get.mockImplementation((url) => {
    if (url.includes('/admin/stats')) {
      return Promise.resolve({
        data: {
          success: true,
          data: {
            totalUsers: 42,
            activeUsers: 39,
            verifiedUsers: 18,
            totalQuestions: 150,
            totalAnswers: 120,
            totalLikes: 340,
          },
        },
      });
    }
    if (url.includes('/admin/all-user')) {
      return Promise.resolve({
        data: [
          {
            id: 'u-1',
            username: 'alexmercer',
            firstName: 'Alex',
            lastName: 'Mercer',
            email: 'alex@example.com',
            isActive: true,
            isVerified: true,
            role: 'ROLE_USER',
          },
          {
            id: 'u-2',
            username: 'spammer_bot',
            firstName: 'Spam',
            lastName: 'Account',
            email: 'spam@bot.com',
            isActive: false,
            isVerified: false,
            role: 'ROLE_USER',
          },
        ],
      });
    }
    if (url.includes('/admin/questions')) {
      return Promise.resolve({
        data: [
          {
            id: 'q-99',
            content: 'How do you structure microservices in Spring Boot?',
            receiverUsername: 'alexmercer',
            senderUsername: 'dev_user',
            isAnonymous: false,
            visibility: 'PUBLIC',
            answer: {
              content: 'Use Spring Cloud Gateway and stateless JWT tokens.',
            },
          },
        ],
      });
    }
    if (url.includes('/health-check')) {
      return Promise.resolve({
        data: { status: 'UP', service: 'proxask-server' },
      });
    }
    return Promise.reject(new Error('not found'));
  });

  return render(
    <ThemeContext.Provider value={{ theme: 'light', isDark: false, toggleTheme: vi.fn() }}>
      <NotificationContext.Provider value={{ showSuccess: mockShowSuccess, showError: mockShowError }}>
        <AuthContext.Provider
          value={{
            user,
            isAuthenticated: Boolean(user),
            isAdmin: () => user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN',
            logout: vi.fn(),
          }}
        >
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </NotificationContext.Provider>
    </ThemeContext.Provider>
  );
};

describe('Admin Experience & Dedicated Console', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dedicated AdminLayout with admin branding, live status, and dedicated management sidebar', async () => {
    const adminUser = {
      id: 'admin-1',
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ROLE_ADMIN',
    };

    renderAdminPage(adminUser);

    // Verify Admin Branding & Dedicated Layout
    await waitFor(() => {
      expect(screen.getAllByText('ADMIN CONSOLE').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('LIVE API')).toBeDefined();
      expect(screen.getByText('MANAGEMENT CONSOLE')).toBeDefined();
    });

    // Verify navigation tabs in dedicated admin sidebar
    expect(screen.getByTestId('admin-nav-overview')).toBeDefined();
    expect(screen.getByTestId('admin-nav-users')).toBeDefined();
    expect(screen.getByTestId('admin-nav-moderation')).toBeDefined();
    expect(screen.getByTestId('admin-nav-system')).toBeDefined();

    // Verify Real Metrics from backend
    await waitFor(() => {
      expect(screen.getByText('42')).toBeDefined(); // Total Users
      expect(screen.getByText('150')).toBeDefined(); // Total Questions
      expect(screen.getByText('120')).toBeDefined(); // Total Answers
    });
  });

  it('navigates to User Directory tab and toggles user active/suspended state', async () => {
    const adminUser = {
      id: 'admin-1',
      username: 'admin',
      role: 'ROLE_ADMIN',
    };

    renderAdminPage(adminUser);

    await waitFor(() => {
      expect(screen.getByTestId('admin-nav-users')).toBeDefined();
    });

    // Switch to User Management
    fireEvent.click(screen.getByTestId('admin-nav-users'));

    await waitFor(() => {
      expect(screen.getByText('User Accounts Directory')).toBeDefined();
      expect(screen.getByText('@alexmercer')).toBeDefined();
      expect(screen.getByText('@spammer_bot')).toBeDefined();
    });

    // Toggle active status
    const toggleBtn = screen.getAllByRole('button', { name: /suspend/i })[0];
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith(expect.stringContaining('SUSPENDED'));
    });
  });

  it('navigates to Content Moderation tab and allows administrative question deletion', async () => {
    dialogService.confirmDeleteQuestion.mockResolvedValueOnce(true);
    const adminUser = {
      id: 'admin-1',
      username: 'admin',
      role: 'ROLE_ADMIN',
    };

    renderAdminPage(adminUser);

    await waitFor(() => {
      expect(screen.getByTestId('admin-nav-moderation')).toBeDefined();
    });

    // Switch to Moderation
    fireEvent.click(screen.getByTestId('admin-nav-moderation'));

    await waitFor(() => {
      expect(screen.getByText('Content Moderation Console')).toBeDefined();
      expect(screen.getByText(/How do you structure microservices in Spring Boot\?/i)).toBeDefined();
    });

    // Delete question button
    const deleteBtn = screen.getByTitle('Delete / Moderate question');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(dialogService.confirmDeleteQuestion).toHaveBeenCalled();
      expect(mockShowSuccess).toHaveBeenCalledWith(expect.stringContaining('removed'));
    });
  });
});
