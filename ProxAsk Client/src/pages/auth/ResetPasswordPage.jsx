import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Sun, 
  Moon, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import './loginPage/LoginPage.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const { isDark, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.otp.trim() || !formData.newPassword) {
      showError('All fields are required');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 8) {
      showError('New password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      if (resetPassword) {
        const res = await resetPassword(formData);
        if (res.success) {
          showSuccess('Password reset successfully! You can now sign in.');
          navigate('/login');
          return;
        } else {
          showError(res.error || 'Password reset failed. Invalid or expired OTP.');
          return;
        }
      }
      showSuccess('Password reset successfully! You can now sign in.');
      navigate('/login');
    } catch {
      showError('An error occurred during password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-auth">
      {/* Top Bar */}
      <div className="px-auth__topbar">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="px-auth__brand" aria-label="ProxAsk Home">
          <div className="px-auth__brand-badge font-mono">P</div>
          <span className="px-auth__brand-name">Prox<span className="px-auth__brand-accent">Ask</span></span>
        </Link>

        <button
          type="button"
          className="px-auth__theme-btn"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light' : 'Switch to Dark'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      {/* Main Center Card */}
      <div className="px-auth__container">
        <Card className="px-auth__card">
          <div className="px-auth__card-header">
            <div className="px-auth__badge-wrap">
              <Badge variant="teal" size="sm" icon={<ShieldCheck size={11} />}>
                SECURE RESET
              </Badge>
            </div>
            <h1 className="px-auth__title">Create New Password</h1>
            <p className="px-auth__subtitle">
              Enter the reset OTP sent to your email and your new secure password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-auth__form">
            {/* Email Address */}
            <div className="px-input-group">
              <label className="px-input-label">Email Address</label>
              <div className="px-input-wrapper">
                <span className="px-input-icon px-input-icon--left">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="px-input px-input--has-left"
                  disabled={isSubmitting}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* OTP Code */}
            <div className="px-input-group">
              <label className="px-input-label">Reset OTP Code</label>
              <div className="px-input-wrapper">
                <span className="px-input-icon px-input-icon--left">
                  <KeyRound size={16} />
                </span>
                <input
                  type="text"
                  placeholder="6-digit code"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                  className="px-input px-input--has-left font-mono"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div className="px-input-group">
              <label className="px-input-label">New Password</label>
              <div className="px-input-wrapper">
                <span className="px-input-icon px-input-icon--left">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="px-input px-input--has-left px-input--has-right"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="px-input-icon px-input-icon--right"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="px-input-group">
              <label className="px-input-label">Confirm New Password</label>
              <div className="px-input-wrapper">
                <span className="px-input-icon px-input-icon--left">
                  <Lock size={16} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-type new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="px-input px-input--has-left px-input--has-right"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="px-input-icon px-input-icon--right"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="px-auth__submit-btn"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight size={16} />}
            >
              Reset Password & Sign In
            </Button>
          </form>

          <div className="px-auth__back-row">
            <Link to="/login" className="px-auth__back-btn">
              <ArrowLeft size={15} /> Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
