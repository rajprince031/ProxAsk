import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./layout/AppLayout";

import LoginPage from "./pages/Login/LoginPage";
import SignupPage from "./pages/Signup/SignupPage";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import ProfilePage from "./pages/Profile/ProfilePage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";

/* 🔒 Protected routes */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // or loader

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/* 🚫 Guest-only routes */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      {/* ROOT */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* AUTH (GUEST ONLY) */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignupPage />
          </GuestRoute>
        }
      />

      {/* MAIN APP (PROTECTED) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
