import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* Pages */
import LoginPage from "./pages/Login/LoginPage";
import SignupPage from "./pages/Signup/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPassword/ForgotPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmail/VerifyEmailPage";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import ProfilePage from "./pages/Profile/ProfilePage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";

/* ---------- ROUTE GUARDS ---------- */

/* 🔒 Protected routes (login required) */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/* 🚫 Guest routes (login/signup not allowed if logged in) */
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

/* 🛡 Admin routes (future use) */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  return isAuthenticated && user?.role === "ADMIN"
    ? children
    : <Navigate to="/dashboard" replace />;
};

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* DEFAULT ROUTE */}
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

      {/* AUTH PAGES (GUEST ONLY) */}
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

      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />

      <Route
        path="/verify-email"
        element={
          <GuestRoute>
            <VerifyEmailPage />
          </GuestRoute>
        }
      />

      {/* PROTECTED APP ROUTES */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />

      {/* PUBLIC PROFILE */}
      <Route path="/profile/:username" element={<ProfilePage />} />

      {/* ADMIN (FUTURE READY) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <div>Admin Dashboard</div>
          </AdminRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="/*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
