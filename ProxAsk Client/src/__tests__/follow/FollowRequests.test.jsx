import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FollowersPage from '../../pages/FollowersPage';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../service/AuthService';

vi.mock('../../service/AuthService', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Private Profile Follow Request System', () => {
  const mockShowSuccess = vi.fn();
  const mockShowError = vi.fn();

  const mockUser = {
    id: 'user-123',
    username: 'alex_dev',
    firstName: 'Alex',
    lastName: 'Rivera',
    isPrivate: true,
  };

  const pendingRequests = [
    {
      requestId: 'req-001',
      id: 'user-456',
      username: 'sarah_m',
      firstName: 'Sarah',
      lastName: 'Miller',
      avatar: '',
      bio: 'Design enthusiast',
      requestedAt: '2026-11-15T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url.includes('/follower/')) {
        return Promise.resolve({ data: { success: true, data: ['david_k'] } });
      }
      if (url.includes('/following/')) {
        return Promise.resolve({ data: { success: true, data: ['elena_ai'] } });
      }
      if (url.includes('/follow/requests')) {
        return Promise.resolve({ data: { success: true, data: pendingRequests } });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });
    api.post.mockResolvedValue({ data: { success: true, message: 'Success' } });
  });

  const renderFollowersPage = () => {
    return render(
      <MemoryRouter>
        <NotificationContext.Provider value={{ showSuccess: mockShowSuccess, showError: mockShowError }}>
          <AuthContext.Provider value={{ user: mockUser }}>
            <FollowersPage />
          </AuthContext.Provider>
        </NotificationContext.Provider>
      </MemoryRouter>
    );
  };

  it('renders Followers, Following, and Requests tabs with request badge', async () => {
    renderFollowersPage();

    await waitFor(() => {
      expect(screen.getByText('Followers')).toBeDefined();
      expect(screen.getByText('Following')).toBeDefined();
      expect(screen.getByText('Requests')).toBeDefined();
    });
  });

  it('displays pending follow requests in Requests tab and executes Accept', async () => {
    renderFollowersPage();

    await waitFor(() => {
      expect(screen.getByText('Requests')).toBeDefined();
    });

    const requestsTab = screen.getByText('Requests');
    fireEvent.click(requestsTab);

    await waitFor(() => {
      expect(screen.getByText('@sarah_m')).toBeDefined();
      expect(screen.getByRole('button', { name: /Accept/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Decline/i })).toBeDefined();
    });

    const acceptBtn = screen.getByRole('button', { name: /Accept/i });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/follow/request/req-001/accept');
    });
  });

  it('executes Decline on pending follow request', async () => {
    renderFollowersPage();

    await waitFor(() => {
      expect(screen.getByText('Requests')).toBeDefined();
    });

    const requestsTab = screen.getByText('Requests');
    fireEvent.click(requestsTab);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Decline/i })).toBeDefined();
    });

    const declineBtn = screen.getByRole('button', { name: /Decline/i });
    fireEvent.click(declineBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/follow/request/req-001/decline');
    });
  });
});
