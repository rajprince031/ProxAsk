import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

// Master App Layout
import AppLayout from './components/layout/AppLayout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ToastContainer from './components/common/ToastContainer';

// Public Landing Page
import LandingPage from './pages/landing/LandingPage';

// Auth Pages
import LoginPage from './pages/auth/loginPage/LoginPage';
import SignupPage from './pages/auth/signupPage/SignupPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Authenticated App Pages
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ExplorePage from './pages/ExplorePage';
import AskQuestionPage from './pages/AskQuestionPage';
import FollowersPage from './pages/FollowersPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// 404 Not Found Page
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component (Outlet Pattern)
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="px-app-loading">
        <LoadingSpinner size="large" message="Authenticating session..." />
      </div>
    );
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

// Admin Guarded Route Component (Outlet Pattern)
const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="px-app-loading">
        <LoadingSpinner size="large" message="Checking permissions..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin || !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Public Route Component (redirects to /dashboard if already logged in) (Outlet Pattern)
const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="px-app-loading">
        <LoadingSpinner size="large" message="Starting ProxAsk..." />
      </div>
    );
  }
  
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

// Landing Route Component (renders Landing for visitors, redirects to Dashboard for authenticated)
const LandingRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="px-app-loading">
        <LoadingSpinner size="large" message="Loading ProxAsk..." />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="px-app-loading">
        <LoadingSpinner size="large" message="Starting ProxAsk..." />
      </div>
    );
  }

  return (
    <div className="proxask-app">
      <Routes>
        {/* Landing Page for public visitors, or dashboard if logged in */}
        <Route path="/" element={<LandingRoute />} />

        {/* Public Authentication Pages with Outlet Layout */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Authenticated Application Routes with Outlet Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/ask" element={<AskQuestionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/followers" element={<FollowersPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Role-Protected Admin Console with Dedicated AdminLayout */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>

        {/* Public/Guest Accessible Profiles & Anonymous Asking */}
        <Route element={<AppLayout />}>
          <Route path="/ask/:username" element={<AskQuestionPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
