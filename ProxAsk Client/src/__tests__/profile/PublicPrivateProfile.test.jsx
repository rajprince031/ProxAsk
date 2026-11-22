import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Profile from '../../pages/profile/Profile';
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

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

const renderProfile = ({ currentUser = null, targetUserId = 'sarah_chen', isTargetPrivate = false } = {}) => {
  // Mock target user API response
  api.get.mockImplementation((url) => {
    if (url.includes('/user/')) {
      return Promise.resolve({
        data: {
          success: true,
          data: {
            id: 'user-sarah',
            username: 'sarah_chen',
            firstName: 'Sarah',
            lastName: 'Chen',
            bio: 'Frontend Architect and Tech Speaker',
            followersCount: 1420,
            followingCount: 380,
            isPrivate: isTargetPrivate,
          },
        },
      });
    }
    if (url.includes('/ask/')) {
      return Promise.resolve({
        data: {
          success: true,
          data: [
            {
              id: 'q-101',
              content: 'What is your favorite React 19 pattern?',
              receiverUsername: 'sarah_chen',
              isAnonymous: true,
              createdAt: new Date().toISOString(),
              answer: {
                id: 'ans-101',
                content: 'Server Components combined with granular suspense boundaries!',
                likesCount: 15,
                createdAt: new Date().toISOString(),
              },
            },
          ],
        },
      });
    }
    return Promise.reject(new Error('not found'));
  });

  return render(
    <NotificationContext.Provider value={{ showSuccess: mockShowSuccess, showError: mockShowError }}>
      <AuthContext.Provider value={{ user: currentUser, updateUser: vi.fn() }}>
        <MemoryRouter initialEntries={[`/profile/${targetUserId}`]}>
          <Routes>
            <Route path="/profile/:userId" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </NotificationContext.Provider>
  );
};

describe('Public and Private Profile Behavior (Instagram-Style)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders complete public profile: user details, Q&As, follower counts, and Ask Question button', async () => {
    renderProfile({ isTargetPrivate: false });

    // Wait for data load
    await waitFor(() => {
      expect(screen.getByTestId('profile-full-name').textContent).toContain('Sarah Chen');
      expect(screen.getByTestId('profile-username').textContent).toContain('@sarah_chen');
    });

    // Public Q&A is visible
    await waitFor(() => {
      expect(screen.getByText(/What is your favorite React 19 pattern\?/i)).toBeDefined();
      expect(screen.getByText(/Server Components combined with granular suspense boundaries!/i)).toBeDefined();
    });

    // Follower and following buttons are present and clickable
    const followersBtn = screen.getByTestId('followers-stat-btn');
    expect(followersBtn).toBeDefined();
    fireEvent.click(followersBtn);

    // Connections modal opens for public profile
    await waitFor(() => {
      expect(screen.getByTestId('connections-modal-list')).toBeDefined();
    });

    // Ask Question button is available
    expect(screen.getByTestId('ask-question-profile-btn')).toBeDefined();
  });

  it('renders restricted private profile: hides Q&As and lists, displays lock banner, but STILL allows Ask Question', async () => {
    renderProfile({ isTargetPrivate: true });

    // Wait for profile load
    await waitFor(() => {
      expect(screen.getByTestId('profile-full-name').textContent).toContain('Sarah Chen');
      expect(screen.getByTestId('profile-username').textContent).toContain('@sarah_chen');
    });

    // Private lock banner MUST be displayed
    await waitFor(() => {
      expect(screen.getByTestId('private-profile-lock')).toBeDefined();
      expect(screen.getByText(/this account is private/i)).toBeDefined();
      expect(screen.getByText(/follow @sarah_chen to see their questions and answers/i)).toBeDefined();
    });

    // Q&As must NOT be exposed
    expect(screen.queryByText(/What is your favorite React 19 pattern\?/i)).toBeNull();

    // Critical Requirement: Ask Question button MUST remain available on private profile!
    const askPrivateBtn = screen.getByTestId('ask-question-private-btn');
    expect(askPrivateBtn).toBeDefined();
    fireEvent.click(askPrivateBtn);

    // Ask modal opens
    await waitFor(() => {
      expect(screen.getByText(/ask @sarah_chen a question/i)).toBeDefined();
    });
  });

  it('allows profile owner to toggle account privacy setting', async () => {
    const ownerUser = {
      id: 'owner-1',
      username: 'owner_user',
      firstName: 'Owner',
      lastName: 'User',
      isPrivate: false,
    };

    renderProfile({ currentUser: ownerUser, targetUserId: 'owner_user', isTargetPrivate: false });

    await waitFor(() => {
      expect(screen.getByTestId('privacy-toggle-btn')).toBeDefined();
    });

    const toggleBtn = screen.getByTestId('privacy-toggle-btn');
    expect(toggleBtn.textContent).toContain('Public Account');

    // Click to toggle
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(toggleBtn.textContent).toContain('Private Account');
      expect(mockShowSuccess).toHaveBeenCalledWith(expect.stringContaining('Private'));
    });
  });
});
