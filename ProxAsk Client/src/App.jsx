import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

/* Auth Pages */
import LoginPage from "./pages/Login/LoginPage";
import SignupPage from "./pages/Signup/SignupPage";
import VerifyEmailPage from "./pages/VerifyEmail/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPassword/ForgotPasswordPage";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import ProfilePage from "./pages/Profile/ProfilePage";
// import SignupPage from "./pages/Signup/SignupPage";
// import ForgotPasswordPage from "./pages/ForgotPassword/ForgotPasswordPage";
// import VerifyEmailPage from "./pages/VerifyEmail/VerifyEmailPage";

/* Main Pages */
// import DashboardPage from "./pages/Dashboard/DashboardPage";
// import ProfilePage from "./pages/Profile/ProfilePage";
// import MessagesPage from "./pages/Messages/MessagesPage";
// import NotificationsPage from "./pages/Notifications/NotificationsPage";
// import SettingsPage from "./pages/Settings/SettingsPage";

/* Protected Route Wrapper (JWT logic later) */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = false; // replace with token check later

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        


        {/* Protected Routes */}
        {/*
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        */}

        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
