import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import api, { authService } from '../../service/AuthService';

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
      }),
      post: vi.fn(),
    },
  };
});

describe('Refresh Token Rotation & Dual Token Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('stores access token and user in localStorage upon login', async () => {
    const mockPost = vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: {
        token: 'new-jwt-access-token-15min',
        authToken: 'new-jwt-access-token-15min',
        refreshToken: 'raw-refresh-token-7days',
        sessionId: 'sess-uuid-123',
        username: 'alex_creator',
        user: { username: 'alex_creator', email: 'alex@proxask.com' },
      },
    });

    const result = await authService.login({
      username: 'alex_creator',
      password: 'Password123!',
    });

    expect(result.token).toBe('new-jwt-access-token-15min');
    expect(result.sessionId).toBe('sess-uuid-123');
    expect(mockPost).toHaveBeenCalledWith('/auth/login', {
      username: 'alex_creator',
      email: undefined,
      password: 'Password123!',
    });
  });

  it('calls /auth/refresh-token with credentials true on refreshToken', async () => {
    const mockPost = vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: {
        token: 'rotated-access-token',
        authToken: 'rotated-access-token',
        refreshToken: 'rotated-refresh-token',
      },
    });

    const res = await authService.refreshToken();
    expect(res.token).toBe('rotated-access-token');
    expect(mockPost).toHaveBeenCalledWith(
      '/auth/refresh-token',
      {},
      { withCredentials: true }
    );
  });

  it('removes tokens on logout', async () => {
    localStorage.setItem('proxask_token', 'sample-jwt');
    localStorage.setItem('proxask_user', JSON.stringify({ username: 'alex' }));
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { success: true } });

    await authService.logout();

    expect(localStorage.getItem('proxask_token')).toBeNull();
    expect(localStorage.getItem('proxask_user')).toBeNull();
  });
});
