import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  KeyRound, 
  Sparkles, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import './loginPage/LoginPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgotPassword, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const { isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      if (forgotPassword) {
        const res = await forgotPassword(email.trim());
        if (res.success) {
          showSuccess(res.message || 'Password reset instructions sent to your email.');
          navigate('/reset-password', { state: { email: email.trim() } });
          return;
        } else {
          showError(res.error || 'Failed to send password reset request');
          return;
        }
      }
      // Fallback
      showSuccess('Password reset instructions sent to your email.');
      navigate('/reset-password', { state: { email: email.trim() } });
    } catch {
      showError('An unexpected error occurred. Please try again.');
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
              <Badge variant="orange" size="sm" icon={<KeyRound size={11} />}>
                ACCOUNT RECOVERY
              </Badge>
            </div>
            <h1 className="px-auth__title">Forgot Password?</h1>
            <p className="px-auth__subtitle">
              Enter your registered email address and we'll send you a recovery code to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-auth__form">
            <div className="px-input-group">
              <label className="px-input-label">Email Address</label>
              <div className="px-input-wrapper">
                <span className="px-input-icon px-input-icon--left">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="e.g. alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-input px-input--has-left"
                  disabled={isSubmitting}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="px-auth__submit-btn"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight size={16} />}
            >
              Send Reset Code
            </Button>
          </form>

          <div className="px-auth__back-row">
            <Link to="/login" className="px-auth__back-btn">
              <ArrowLeft size={15} /> Remembered your password? Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
