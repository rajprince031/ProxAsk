import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  Sun, 
  Moon, 
  ArrowLeft,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import './loginPage/LoginPage.css';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerificationEmail, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const { isDark, toggleTheme } = useTheme();

  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get('token');
  const initialEmail = location.state?.email || queryParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // If token is in URL (verification link clicked from email), verify immediately
  useEffect(() => {
    if (tokenFromUrl) {
      const verifyToken = async () => {
        setIsSubmitting(true);
        try {
          const res = await verifyEmail({ token: tokenFromUrl });
          if (res.success) {
            showSuccess('Email verified successfully! You can now sign in.');
            navigate('/login');
          } else {
            showError(res.error || 'Verification link is invalid or expired.');
          }
        } catch (_err) {
          showError('Verification failed. Please enter your email and OTP below.');
        } finally {
          setIsSubmitting(false);
        }
      };
      verifyToken();
    }
  }, [tokenFromUrl, navigate, showError, showSuccess, verifyEmail]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      showError('Please enter your email address.');
      return;
    }
    if (!otp.trim() || otp.trim().length !== 6) {
      showError('Please enter the 6-digit OTP code (or click Use Test Code 123456).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyEmail({ email: email.trim(), otp: otp.trim() });
      if (res.success) {
        showSuccess('Email verified successfully! You can now sign in.');
        navigate('/login');
      } else {
        showError(res.error || 'Invalid or expired OTP. Please try again.');
      }
    } catch (_err) {
      showError('Verification failed. Please double check the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFillTestOtp = () => {
    setOtp('123456');
    if (!email.trim()) {
      setEmail('demo@proxask.com');
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      showError('Please enter your email address to receive an OTP.');
      return;
    }

    setIsResending(true);
    try {
      if (resendVerificationEmail) {
        await resendVerificationEmail(email.trim());
      }
      showSuccess('A fresh 6-digit verification code has been generated (Use OTP 123456 in test mode)!');
      setResendCooldown(60);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to resend verification OTP.');
    } finally {
      setIsResending(false);
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
              <Badge variant="teal" size="sm" icon={<Sparkles size={11} />}>
                SECURITY VERIFICATION
              </Badge>
            </div>
            <h1 className="px-auth__title">Verify Your Email</h1>
            <p className="px-auth__subtitle">
              Enter the 6-digit verification code to activate your ProxAsk account.
            </p>
          </div>

          {/* Test Mode Helper Banner */}
          <div className="px-auth__alert px-auth__alert--info">
            <CheckCircle2 size={16} className="px-auth__alert-icon" />
            <div className="px-auth__alert-text">
              <strong>Testing Mode Active:</strong> Since email delivery is disabled, you can click below to pre-fill test OTP <code>123456</code>.
              <div style={{ marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={handleQuickFillTestOtp}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'var(--brand-teal, #0F766E)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Quick Fill Test Code (123456)
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleVerifyOtp} className="px-auth__form">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-input px-input--has-left"
                  disabled={isSubmitting}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* 6-Digit OTP */}
            <div className="px-input-group">
              <label className="px-input-label">6-Digit Verification Code</label>
              <div className="px-input-wrapper">
                <span className="px-input-icon px-input-icon--left">
                  <KeyRound size={16} />
                </span>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="px-input px-input--has-left px-auth__otp-input"
                  disabled={isSubmitting}
                  autoFocus
                  required
                />
              </div>

              <div className="px-auth__resend-row">
                <span className="px-auth__signup-note">Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isResending}
                  className="px-auth__resend-btn"
                >
                  <RefreshCw size={13} className={isResending ? 'spin' : ''} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
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
              Verify & Activate Account
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

export default EmailVerificationPage;
