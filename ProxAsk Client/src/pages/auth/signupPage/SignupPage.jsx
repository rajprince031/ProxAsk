import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  Sun,
  Moon,
  Check,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useTheme } from '../../../context/ThemeContext';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Card from '../../../components/common/Card';
import './SignupPage.css';

// Sanitize backend messages and convert technical exceptions into friendly explanations
const formatRegistrationError = (rawError) => {
  if (!rawError) return 'An unexpected error occurred during registration. Please try again.';
  const str = String(rawError).toLowerCase();

  if (str.includes('network') || str.includes('connection') || str.includes('failed to fetch') || str.includes('timeout')) {
    return 'Network connection failure. Server is currently unreachable, please check your connection.';
  }
  if (str.includes('username') && (str.includes('already') || str.includes('exist') || str.includes('taken') || str.includes('duplicate'))) {
    return 'This username is already taken. Please choose a different username.';
  }
  if (str.includes('email') && (str.includes('already') || str.includes('exist') || str.includes('taken') || str.includes('duplicate'))) {
    return 'An account with this email address already exists. Please log in or use a different email.';
  }
  if (str.includes('password') && (str.includes('requirement') || str.includes('short') || str.includes('weak') || str.includes('character'))) {
    return 'Password does not meet security requirements. It must contain at least 8 characters.';
  }
  if (str.includes('required') || str.includes('missing')) {
    return 'All registration fields are required. Please check your information.';
  }
  // Strip any java class names or stack trace artifacts
  const clean = String(rawError)
    .replace(/^.*Exception:\s*/i, '')
    .replace(/at\s+[\w$.]+\([\w$.]+:\d+\)/g, '')
    .trim();

  return clean.length > 0 && clean.length < 150 
    ? clean 
    : 'Registration could not be completed. Please check your details and try again.';
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, clearError, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const { isDark, toggleTheme } = useTheme();

  // Gracefully fallback to '/' if browser back is pressed with no prior in-app history
  useEffect(() => {
    const handlePopState = (e) => {
      if (!e.state || (typeof e.state.idx === 'number' && e.state.idx <= 0)) {
        // Safe check
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  useEffect(() => {
    if (clearError) clearError();
  }, [clearError]);

  // Compute password strength whenever password changes
  useEffect(() => {
    const pwd = formData.password;
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)
    };

    const metCount = Object.values(checks).filter(Boolean).length;
    setPasswordStrength({
      score: pwd.length === 0 ? 0 : metCount,
      checks
    });
  }, [formData.password]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      errors.username = 'Only letters, numbers, and underscores allowed';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setServerError('');
    setIsSubmitting(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      const result = await register(payload);

      if (result && result.success) {
        showSuccess({
          title: 'Account created successfully',
          message: 'Welcome to ProxAsk! Your account has been created. Please enter the verification code sent to your email.'
        });
        navigate('/verify-email', { 
          state: { email: formData.email.trim().toLowerCase() } 
        });
      } else {
        const errorMsg = formatRegistrationError(result?.error);
        setServerError(errorMsg);
        showError({
          title: 'Registration failed',
          message: errorMsg
        });
      }
    } catch (err) {
      const rawMsg = err.response?.data?.message || err.message;
      const errorMsg = formatRegistrationError(rawMsg);
      setServerError(errorMsg);
      showError({
        title: 'Registration failed',
        message: errorMsg
      });
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
        <Card className="px-auth__card px-auth__card--wide">
          <div className="px-auth__card-header">
            <div className="px-auth__badge-wrap">
              <Badge variant="teal" size="sm" icon={<Sparkles size={11} />}>
                JOIN PROXASK
              </Badge>
            </div>
            <h1 className="px-auth__title">Create Your Account</h1>
            <p className="px-auth__subtitle">
              Start asking and receiving anonymous or verified questions today.
            </p>
          </div>

          {serverError && (
            <div className="px-auth__error-alert" data-testid="signup-server-error" role="alert">
              <AlertCircle size={16} className="px-auth__error-alert-icon" />
              <div className="px-auth__error-alert-text">
                <strong>Registration failed: </strong>
                <span>{serverError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-auth__form">
            {/* First & Last Name */}
            <div className="px-auth__grid">
              <div className={`px-input-group ${formErrors.firstName ? 'px-input-group--error' : ''}`}>
                <label className="px-input-label">First Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="px-input"
                  disabled={isSubmitting}
                  autoComplete="given-name"
                />
                {formErrors.firstName && (
                  <span className="px-input-error">{formErrors.firstName}</span>
                )}
              </div>

              <div className={`px-input-group ${formErrors.lastName ? 'px-input-group--error' : ''}`}>
                <label className="px-input-label">Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mercer"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="px-input"
                  disabled={isSubmitting}
                  autoComplete="family-name"
                />
                {formErrors.lastName && (
                  <span className="px-input-error">{formErrors.lastName}</span>
                )}
              </div>
            </div>

            {/* Username */}
            <div className={`px-input-group ${formErrors.username ? 'px-input-group--error' : ''}`}>
              <label className="px-input-label">Username</label>
              <div className="px-input-wrapper">
                <span className="px-input-icon px-input-icon--left">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. alexmercer"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className="px-input px-input--has-left"
                  disabled={isSubmitting}
                  autoComplete="username"
                />
              </div>
              {formErrors.username && (
                <span className="px-input-error">{formErrors.username}</span>
              )}
            </div>

            {/* Email */}
            <div className={`px-input-group ${formErrors.email ? 'px-input-group--error' : ''}`}>
              <label className="px-input-label">Email Address</label>
              <div className="px-input-wrapper">
                <span className="px-input-icon px-input-icon--left">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="e.g. alex@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="px-input px-input--has-left"
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
              {formErrors.email && (
                <span className="px-input-error">{formErrors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className={`px-input-group ${formErrors.password ? 'px-input-group--error' : ''}`}>
              <label className="px-input-label">Password</label>
              <div className="px-input-wrapper">
                <span className="px-input-icon px-input-icon--left">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="px-input px-input--has-left px-input--has-right"
                  disabled={isSubmitting}
                  autoComplete="new-password"
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

              {/* Real-time Strength Meter */}
              {formData.password.length > 0 && (
                <div className="px-auth__strength">
                  <div className="px-auth__strength-meter">
                    <div className={`px-auth__strength-fill px-auth__strength-fill--${passwordStrength.score}`} />
                  </div>
                  <div className="px-auth__strength-checks">
                    <span className={`px-auth__strength-check ${passwordStrength.checks.length ? 'px-auth__strength-check--met' : ''}`}>
                      <span className="px-auth__check-dot" /> 8+ chars
                    </span>
                    <span className={`px-auth__strength-check ${passwordStrength.checks.uppercase ? 'px-auth__strength-check--met' : ''}`}>
                      <span className="px-auth__check-dot" /> Uppercase
                    </span>
                    <span className={`px-auth__strength-check ${passwordStrength.checks.lowercase ? 'px-auth__strength-check--met' : ''}`}>
                      <span className="px-auth__check-dot" /> Lowercase
                    </span>
                    <span className={`px-auth__strength-check ${passwordStrength.checks.number ? 'px-auth__strength-check--met' : ''}`}>
                      <span className="px-auth__check-dot" /> Number
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className={`px-input-group ${formErrors.confirmPassword ? 'px-input-group--error' : ''}`}>
              <label className="px-input-label">Confirm Password</label>
              <div className="px-input-wrapper">
                <span className="px-input-icon px-input-icon--left">
                  <Lock size={16} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-type password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="px-input px-input--has-left px-input--has-right"
                  disabled={isSubmitting}
                  autoComplete="new-password"
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
              {formErrors.confirmPassword && (
                <span className="px-input-error">{formErrors.confirmPassword}</span>
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
              Create Account
            </Button>
          </form>

          <div className="px-auth__card-footer">
            <span className="px-auth__footer-text">
              Already have an account?{' '}
              <Link to="/login" className="px-auth__footer-link">
                Sign in
              </Link>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
