import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../service/AuthService';

export const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  loading: true, // Only true on initial startup session check
  isAuthenticated: false,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load strictly once
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('proxask_token');
      if (token) {
        try {
          const user = await authService.validateToken(token);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token }
          });
        } catch {
          localStorage.removeItem('proxask_token');
          localStorage.removeItem('proxask_user');
          dispatch({ type: 'AUTH_FAILURE', payload: null });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    checkAuthStatus();
  }, []);

  // Decoupled: do NOT toggle global loading during user actions (prevents unmounting active routes)
  const login = useCallback(async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { user, token } = response;
      
      // Store in localStorage
      localStorage.setItem('proxask_token', token);
      localStorage.setItem('proxask_user', JSON.stringify(user));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await authService.register(userData);
      
      return { 
        success: true, 
        message: 'Verification code sent to your email', 
        requiresVerification: true,
        data: response 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  const verifyEmail = useCallback(async (verificationData) => {
    try {
      const response = await authService.verifyEmail(verificationData);
      return { 
        success: true, 
        message: response?.message || 'Account verified and created successfully!',
        data: response
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Email verification failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      await authService.forgotPassword(email);
      return { success: true, message: 'Password reset OTP sent to your email address.' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
      return { success: false, error: errorMessage };
    }
  }, []);

  const resetPassword = useCallback(async (resetData) => {
    try {
      await authService.resetPassword(resetData);
      return { success: true, message: 'Password reset successfully! You can now login with your new password.' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('proxask_token');
    localStorage.removeItem('proxask_user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const updateUser = useCallback((userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  }, []);

  // Check if user has specific role across all common backend serialization shapes
  const hasRole = useCallback((role) => {
    if (!state.user) return false;
    const target = String(role || '').toUpperCase().replace(/^ROLE_/, '');

    // 1. Direct single role property (e.g. user.role === 'ADMIN' or 'ROLE_ADMIN')
    if (state.user.role) {
      const uRole = String(state.user.role).toUpperCase().replace(/^ROLE_/, '');
      if (uRole === target) return true;
    }

    // 2. Roles array (e.g. user.roles === ['ADMIN'] or ['ROLE_ADMIN'])
    if (Array.isArray(state.user.roles)) {
      if (state.user.roles.some(r => String(r).toUpperCase().replace(/^ROLE_/, '') === target)) {
        return true;
      }
    }

    // 3. Spring Security Authorities array (e.g. user.authorities === [{ authority: 'ROLE_ADMIN' }])
    if (Array.isArray(state.user.authorities)) {
      if (state.user.authorities.some(a => String(a.authority || a).toUpperCase().replace(/^ROLE_/, '') === target)) {
        return true;
      }
    }

    return false;
  }, [state.user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole('ADMIN');
  }, [hasRole]);

  const value = {
    ...state,
    login,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout,
    clearError,
    updateUser,
    hasRole,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
