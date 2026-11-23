import axios from 'axios';

const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with credentials support
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('proxask_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic refresh token rotation
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints (login, refresh-token, register) or if already retried
    if (
      !error.response ||
      error.response.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      (originalRequest.url && (
        originalRequest.url.includes('/auth/login') ||
        originalRequest.url.includes('/auth/refresh-token') ||
        originalRequest.url.includes('/auth/register')
      ))
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshRes = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      const newToken = refreshRes.data?.authToken || refreshRes.data?.token;
      if (newToken) {
        localStorage.setItem('proxask_token', newToken);
        if (refreshRes.data.user) {
          localStorage.setItem('proxask_user', JSON.stringify(refreshRes.data.user));
        }
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } else {
        throw new Error('No new token returned');
      }
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      localStorage.removeItem('proxask_token');
      localStorage.removeItem('proxask_user');
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export const authService = {
  // User login
  async login(credentials) {
    const payload = {
      username: (credentials.username || credentials.email || '').trim().toLowerCase(),
      email: credentials.email ? credentials.email.trim().toLowerCase() : undefined,
      password: credentials.password,
    };
    const response = await api.post('/auth/login', payload);
    const data = response.data;
    const token = data.token || data.authToken;
    const user = data.user || { username: data.username };
    return { token, user, ...data };
  },

  // User registration
  async register(userData) {
    const payload = {
      firstName: userData.firstname || userData.firstName,
      lastName: userData.lastname || userData.lastName,
      username: (userData.username || '').trim().toLowerCase(),
      email: (userData.email || '').trim().toLowerCase(),
      password: userData.password,
      bio: userData.bio || '',
      avatar: userData.avatar || '',
    };
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  // Email verification (supports OTP or token link)
  async verifyEmail(verificationData) {
    if (typeof verificationData === 'string') {
      const response = await api.get(`/auth/verify?token=${encodeURIComponent(verificationData)}`);
      return response.data;
    }
    if (verificationData.token) {
      const response = await api.get(`/auth/verify?token=${encodeURIComponent(verificationData.token)}`);
      return response.data;
    }

    const payload = {
      email: (verificationData.email || '').trim().toLowerCase(),
      otp: parseInt(verificationData.otp, 10),
    };
    const response = await api.post('/auth/verify', payload);
    return response.data;
  },

  // Resend verification email
  async resendVerificationEmail(email) {
    const response = await api.post('/auth/resend-verification', {
      email: (email || '').trim().toLowerCase(),
    });
    return response.data;
  },

  // Forgot password
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', {
      email: (email || '').trim().toLowerCase(),
    });
    return response.data;
  },

  // Reset password
  async resetPassword(resetData) {
    const payload = {
      email: (resetData.email || '').trim().toLowerCase(),
      otp: parseInt(resetData.otp, 10),
      newPassword: resetData.newPassword,
    };
    const response = await api.post('/auth/reset-password', payload);
    return response.data;
  },

  // Validate token and get user info
  async validateToken(token) {
    const response = await api.get('/auth/validate', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.user || response.data.data;
  },

  // Refresh token
  async refreshToken() {
    const response = await api.post('/auth/refresh-token', {}, { withCredentials: true });
    return response.data;
  },

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('proxask_token');
      localStorage.removeItem('proxask_user');
    }
  },

  // Active Sessions
  async getActiveSessions() {
    const response = await api.get('/auth/sessions');
    return response.data?.data || response.data || [];
  },

  async revokeSession(sessionId) {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  async revokeOtherSessions() {
    const response = await api.delete('/auth/sessions/other');
    return response.data;
  },
};

export default api;
