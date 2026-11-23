import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  Sun,
  Moon,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useTheme } from '../../../context/ThemeContext';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Card from '../../../components/common/Card';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, clearError, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const { isDark, toggleTheme } = useTheme();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (clearError) clearError();
  }, [clearError]);

  const validate = () => {
    const errors = {};
    if (!identifier.trim()) {
      errors.identifier = 'Username or email is required';
    } else if (identifier.trim().length < 3) {
      errors.identifier = 'Must be at least 3 characters';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    const isEmail = identifier.includes('@');
    const payload = isEmail 
      ? { email: identifier.trim().toLowerCase(), password } 
      : { username: identifier.trim().toLowerCase(), password };

    try {
      const result = await login(payload);

      if (result.success) {
        showSuccess(`Welcome back, @${result.user?.username || payload.username || 'User'}!`);
        navigate(from, { replace: true });
      } else {
        const msg = result.error || 'Invalid username or password.';
        setServerError(msg);
        showError(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setServerError(msg);
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPendingVerification = serverError && (
    serverError.toLowerCase().includes('not verified') ||
    serverError.toLowerCase().includes('verify your email') ||
    serverError.toLowerCase().includes('pending verification')
  );

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
              <Badge variant="orange" size="sm" icon={<Sparkles size={11} />}>
                WELCOME BACK
              </Badge>
            </div>
            <h1 className="px-auth__title">Sign In to ProxAsk</h1>
            <p className="px-auth__subtitle">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Inline Server Error Banner */}
          {serverError && (
            <div className="px-auth__alert px-auth__alert--error" role="alert">
              <AlertCircle size={16} className="px-auth__alert-icon" />
              <div className="px-auth__alert-text">
                {serverError}
                {isPendingVerification && (
                  <div style={{ marginTop: '8px' }}>
                    <Link
                      to="/verify-email"
                      state={{ email: identifier.includes('@') ? identifier.trim() : '' }}
                      style={{
                        color: 'var(--brand-primary, #0D6731)',
                        fontWeight: 600,
                        textDecoration: 'underline'
                      }}
                    >
                      Click here to enter your verification code
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-auth__form">
            {/* Username or Email */}
            <div className={`px-input-group ${formErrors.identifier ? 'px-input-group--error' : ''}`}>
              <label className="px-input-label">Username or Email</label>
              <div className="px-input-wrapper">
                <span className="px-input-icon px-input-icon--left">
                  <Mail size={16} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. alex_creator or user@example.com"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (formErrors.identifier) setFormErrors(prev => ({ ...prev, identifier: null }));
                    if (serverError) setServerError('');
                  }}
                  className="px-input px-input--has-left"
                  disabled={isSubmitting}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              {formErrors.identifier && (
                <span className="px-input-error">{formErrors.identifier}</span>
              )}
            </div>

            {/* Password */}
            <div className={`px-input-group ${formErrors.password ? 'px-input-group--error' : ''}`}>
              <div className="px-input-label-row">
                <label className="px-input-label">Password</label>
                <Link to="/forgot-password" className="px-auth__forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="px-input-wrapper">
                <span className="px-input-icon px-input-icon--left">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors(prev => ({ ...prev, password: null }));
                    if (serverError) setServerError('');
                  }}
                  className="px-input px-input--has-left px-input--has-right"
                  disabled={isSubmitting}
                  autoComplete="current-password"
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
              {formErrors.password && (
                <span className="px-input-error">{formErrors.password}</span>
              )}
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
              Sign In
            </Button>
          </form>

          <div className="px-auth__card-footer">
            <span className="px-auth__footer-text">
              Don't have an account yet?{' '}
              <Link to="/signup" className="px-auth__footer-link">
                Create one now
              </Link>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
