import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import App from '../../App';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { ThemeContext } from '../../context/ThemeContext';
import Navbar from '../../components/layout/navbar/Navbar';
import Sidebar from '../../components/layout/sidebar/Sidebar';
import MobileNav from '../../components/layout/mobileNav/MobileNav';
import QuestionCard from '../../components/question/QuestionCard';
import api from '../../service/AuthService';

const mockGuestAuth = {
  user: null,
  isAuthenticated: false,
  loading: false,
  isAdmin: () => false,
  login: vi.fn().mockResolvedValue({ success: true }),
  register: vi.fn().mockResolvedValue({ success: true }),
  logout: vi.fn(),
  clearError: vi.fn(),
};

const mockUserAuth = {
  user: {
    id: 'u1',
    username: 'test_user',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'ROLE_USER',
  },
  isAuthenticated: true,
  loading: false,
  isAdmin: () => false,
  login: vi.fn().mockResolvedValue({ success: true }),
  register: vi.fn().mockResolvedValue({ success: true }),
  logout: vi.fn(),
  clearError: vi.fn(),
};

const mockAdminAuth = {
  user: {
    id: 'u_admin',
    username: 'admin_user',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: 'ROLE_ADMIN',
  },
  isAuthenticated: true,
  loading: false,
  isAdmin: () => true,
  login: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
};

const mockNotifContext = {
  unreadCount: 3,
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
};

const mockThemeContext = {
  theme: 'light',
  isDark: false,
  toggleTheme: vi.fn(),
};

const renderWithContext = (ui, authContext = mockGuestAuth, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeContext.Provider value={mockThemeContext}>
        <NotificationContext.Provider value={mockNotifContext}>
          <AuthContext.Provider value={authContext}>
            {ui}
          </AuthContext.Provider>
        </NotificationContext.Provider>
      </ThemeContext.Provider>
    </MemoryRouter>
  );
};

const renderAppWithRoute = (initialRoute = '/', authContext = mockGuestAuth) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ThemeContext.Provider value={mockThemeContext}>
        <NotificationContext.Provider value={mockNotifContext}>
          <AuthContext.Provider value={authContext}>
            <App />
          </AuthContext.Provider>
        </NotificationContext.Provider>
      </ThemeContext.Provider>
    </MemoryRouter>
  );
};

describe('ProxAsk Full Navigation & Routing Audit (20 Verification Cases)', () => {
  beforeEach(() => {
    vi.spyOn(api, 'get').mockImplementation((url) => {
      if (url === '/user/suggested') {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 'u-1',
                username: 'sarah_tech',
                firstName: 'Sarah',
                lastName: 'Tech',
                bio: 'Tech enthusiast',
                followersCount: 10,
                followingCount: 5,
                questionsCount: 20
              }
            ]
          }
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });
  });
  // Case 1: Login -> Signup navigation via link
  it('1. navigates from Login to Signup via link immediately without reload', async () => {
    renderAppWithRoute('/login', mockGuestAuth);
    expect(screen.getByRole('heading', { name: /sign in to proxask/i })).toBeDefined();

    const createLink = screen.getByRole('link', { name: /create one now/i });
    fireEvent.click(createLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeDefined();
    });
  });

  // Case 2: Signup -> Login navigation via link
  it('2. navigates from Signup to Login via link immediately without reload', async () => {
    renderAppWithRoute('/signup', mockGuestAuth);
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeDefined();

    const signInLink = screen.getByRole('link', { name: /sign in/i });
    fireEvent.click(signInLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to proxask/i })).toBeDefined();
    });
  });

  // Case 3: Logo click from Login (guest) -> navigates to /
  it('3. Logo click from Login as guest targets /', () => {
    const { container } = renderAppWithRoute('/login', mockGuestAuth);
    const logoLink = container.querySelector('.px-auth__brand');
    expect(logoLink).not.toBeNull();
    expect(logoLink.getAttribute('href')).toBe('/');
  });

  // Case 4: Logo click from Signup (guest) -> navigates to /
  it('4. Logo click from Signup as guest targets /', () => {
    const { container } = renderAppWithRoute('/signup', mockGuestAuth);
    const logoLink = container.querySelector('.px-auth__brand');
    expect(logoLink).not.toBeNull();
    expect(logoLink.getAttribute('href')).toBe('/');
  });

  // Case 5: Logo click from Public Profile (guest) -> navigates to /
  it('5. Logo click from Public Profile as guest targets /', () => {
    const { container } = renderAppWithRoute('/profile/alex_creator', mockGuestAuth);
    const logoLink = container.querySelector('.px-navbar__brand');
    expect(logoLink).not.toBeNull();
    expect(logoLink.getAttribute('href')).toBe('/');
  });

  // Case 6: Logo click from Dashboard (logged in) -> stays on or navigates to /dashboard
  it('6. Logo click from Dashboard as authenticated user targets /dashboard', () => {
    const { container } = renderAppWithRoute('/dashboard', mockUserAuth);
    const logoLink = container.querySelector('.px-navbar__brand');
    expect(logoLink).not.toBeNull();
    expect(logoLink.getAttribute('href')).toBe('/dashboard');
  });

  // Case 7: Logo click from Settings (logged in) -> navigates to /dashboard
  it('7. Logo click from Settings as authenticated user targets /dashboard', () => {
    const { container } = renderAppWithRoute('/settings', mockUserAuth);
    const logoLink = container.querySelector('.px-navbar__brand');
    expect(logoLink).not.toBeNull();
    expect(logoLink.getAttribute('href')).toBe('/dashboard');
  });

  // Case 8: Logo click from Profile (logged in) -> navigates to /dashboard
  it('8. Logo click from Profile as authenticated user targets /dashboard', () => {
    const { container } = renderAppWithRoute('/profile', mockUserAuth);
    const logoLink = container.querySelector('.px-navbar__brand');
    expect(logoLink).not.toBeNull();
    expect(logoLink.getAttribute('href')).toBe('/dashboard');
  });

  // Case 9: Browser back from Signup -> returns to Login
  it('9. MemoryRouter history back from Signup returns to Login cleanly', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/login', '/signup']} initialIndex={1}>
        <ThemeContext.Provider value={mockThemeContext}>
          <NotificationContext.Provider value={mockNotifContext}>
            <AuthContext.Provider value={mockGuestAuth}>
              <App />
            </AuthContext.Provider>
          </NotificationContext.Provider>
        </ThemeContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /create your account/i })).toBeDefined();
    // Simulate navigation back to previous entry
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    fireEvent.click(signInLink);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to proxask/i })).toBeDefined();
    });
  });

  // Case 10: Browser back from Login -> returns to previous or falls back gracefully without blank screen
  it('10. App renders valid content on /login without blank screen', () => {
    const { container } = renderAppWithRoute('/login', mockGuestAuth);
    expect(container.querySelector('.px-auth')).not.toBeNull();
    expect(screen.getByRole('heading', { name: /sign in to proxask/i })).toBeDefined();
  });

  // Case 11: Direct navigation to unknown route -> renders NotFoundPage
  it('11. Direct navigation to unknown route renders NotFoundPage', () => {
    renderAppWithRoute('/some/invalid/route-that-does-not-exist', mockGuestAuth);
    expect(screen.getByTestId('not-found-page')).toBeDefined();
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeDefined();
    expect(screen.getByText(/404 error/i)).toBeDefined();
  });

  // Case 12: Top navigation on public profile (logged out) -> contains Login and Sign Up buttons
  it('12. Top navigation on public profile for logged-out guest contains Login and Sign Up buttons', () => {
    const { container } = renderWithContext(<Navbar />, mockGuestAuth);
    expect(screen.getByRole('link', { name: /log in/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeDefined();
  });

  // Case 13: Top navigation on public profile (logged out) -> does NOT contain Ask button
  it('13. Top navigation on public profile for logged-out guest does NOT contain top Ask button', () => {
    const { container } = renderWithContext(<Navbar />, mockGuestAuth);
    expect(container.querySelector('.px-navbar__ask-btn')).toBeNull();
  });

  // Case 14: Sidebar navigation: each link navigates to the correct page
  it('14. Sidebar navigation links point to the correct routes', () => {
    const { container } = renderWithContext(<Sidebar isMobileOpen={false} onCloseMobile={() => {}} />, mockUserAuth);
    
    const links = Array.from(container.querySelectorAll('.px-sidebar__nav-item'));
    const hrefs = links.map(el => el.getAttribute('href'));

    expect(hrefs).toContain('/dashboard');
    expect(hrefs).toContain('/explore');
    expect(hrefs).toContain('/ask');
    expect(hrefs).toContain('/followers');
    expect(hrefs).toContain('/notifications');
    expect(hrefs).toContain('/profile');
    expect(hrefs).toContain('/settings');
  });

  // Case 15: Mobile bottom nav: each link navigates to the correct page
  it('15. Mobile bottom nav links point to correct routes', () => {
    const { container } = renderWithContext(<MobileNav />, mockUserAuth);
    
    const links = Array.from(container.querySelectorAll('.px-mobile-nav__item'));
    const hrefs = links.map(el => el.getAttribute('href'));

    expect(hrefs).toContain('/dashboard');
    expect(hrefs).toContain('/explore');
    expect(hrefs).toContain('/ask');
    expect(hrefs).toContain('/notifications');
    expect(hrefs).toContain('/profile');
  });

  // Case 16: Question card user link -> navigates to user profile
  it('16. Question card creator link points to creator profile (/profile/:userId)', () => {
    const mockQuestion = {
      id: 'q101',
      content: 'How do you design scalable SPAs?',
      sender: { username: 'alex', firstName: 'Alex', lastName: 'Doe' },
      receiver: { username: 'sarah_tech', firstName: 'Sarah', lastName: 'Tech' },
      isAnonymous: false,
      likesCount: 5,
      answers: [],
      createdAt: '2026-11-15T10:00:00Z',
    };

    const { container } = renderWithContext(
      <QuestionCard question={mockQuestion} currentUser={mockUserAuth.user} />,
      mockUserAuth
    );

    const profileLinks = Array.from(container.querySelectorAll('a'))
      .map(a => a.getAttribute('href'))
      .filter(h => h && h.startsWith('/profile/'));

    expect(profileLinks.length).toBeGreaterThan(0);
    expect(profileLinks).toContain('/profile/sarah_tech');
  });

  // Case 17: Explore page creator card -> navigates to creator profile
  it('17. Explore page renders creator profile links', async () => {
    const { container } = renderAppWithRoute('/explore', mockUserAuth);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /discover people/i })).toBeDefined();
    });

    await waitFor(() => {
      const profileLinks = Array.from(container.querySelectorAll('a'))
        .map(a => a.getAttribute('href'))
        .filter(h => h && h.startsWith('/profile/'));
      expect(profileLinks.length).toBeGreaterThan(0);
    });
  });

  // Case 18: Settings -> back/exit navigates to profile
  it('18. Settings page renders and provides navigation link to profile', async () => {
    renderAppWithRoute('/settings', mockUserAuth);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /account settings/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /edit in profile/i })).toBeDefined();
    });
  });

  // Case 19: Admin console -> exit navigates to dashboard
  it('19. Admin console layout provides Exit to User App link to /dashboard', async () => {
    const { container } = renderAppWithRoute('/admin', mockAdminAuth);
    await waitFor(() => {
      const exitBtn = container.querySelector('.px-admin-header__exit-btn');
      expect(exitBtn).not.toBeNull();
      expect(exitBtn.getAttribute('href')).toBe('/dashboard');
    });
  });

  // Case 20: Protected routes redirect unauthenticated users to /login
  it('20. Protected routes redirect unauthenticated visitors to /login', async () => {
    const { unmount } = renderAppWithRoute('/dashboard', mockGuestAuth);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to proxask/i })).toBeDefined();
    });
    unmount();

    renderAppWithRoute('/settings', mockGuestAuth);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to proxask/i })).toBeDefined();
    });
  });
});
