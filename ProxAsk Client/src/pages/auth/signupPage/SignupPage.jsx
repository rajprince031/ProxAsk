import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight,
  FiCheck 
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  const { showSuccess, showError } = useNotifications();
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
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
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      setFormErrors({});
    }
  }, [formData]);

  // Password strength checker
  useEffect(() => {
    const password = formData.password;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    setPasswordStrength({ score, checks });
  }, [formData.password]);

  const validateForm = () => {
    const errors = {};

    // First name validation
    if (!formData.firstname.trim()) {
      errors.firstname = 'First name is required';
    } else if (formData.firstname.trim().length < 2) {
      errors.firstname = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastname.trim()) {
      errors.lastname = 'Last name is required';
    } else if (formData.lastname.trim().length < 2) {
      errors.lastname = 'Last name must be at least 2 characters';
    }

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (passwordStrength.score < 3) {
      errors.password = 'Password is too weak. Please make it stronger.';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await register({
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      
      if (result.success) {
        showSuccess(result.message);
        navigate('/verify-email', { 
          state: { email: formData.email.trim() }
        });
      } else {
        showError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return 'Very Weak';
      case 2:
        return 'Weak';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      case 5:
        return 'Very Strong';
      default:
        return 'Very Weak';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return '#ef4444';
      case 2:
        return '#f97316';
      case 3:
        return '#eab308';
      case 4:
        return '#22c55e';
      case 5:
        return '#16a34a';
      default:
        return '#ef4444';
    }
  };

  return (
    <div className="proxask-signup-page">
      <div className="proxask-signup-container">
        {/* Left Side - Form */}
        <div className="proxask-signup-form-container">
          <div className="proxask-signup-form-wrapper">
            <div className="proxask-signup-form-header">
              <h1 className="proxask-signup-form-title">Create Account</h1>
              <p className="proxask-signup-form-subtitle">
                Join Proxask and start asking questions anonymously
              </p>
            </div>

            {error && (
              <div className="proxask-signup-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="proxask-signup-form" noValidate>
              {/* Name Fields */}
              <div className="proxask-signup-form-row">
                <div className="proxask-signup-form-group">
                  <label htmlFor="firstname" className="proxask-signup-form-label">
                    First Name
                  </label>
                  <div className="proxask-signup-form-input-wrapper">
                    <FiUser className="proxask-signup-form-input-icon" />
                    <input
                      type="text"
                      id="firstname"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      className={`proxask-signup-form-input ${
                        formErrors.firstname ? 'proxask-signup-form-input--error' : ''
                      }`}
                      placeholder="First name"
                      autoComplete="given-name"
                      disabled={isSubmitting || loading}
                    />
                  </div>
                  {formErrors.firstname && (
                    <span className="proxask-signup-form-error">{formErrors.firstname}</span>
                  )}
                </div>

                <div className="proxask-signup-form-group">
                  <label htmlFor="lastname" className="proxask-signup-form-label">
                    Last Name
                  </label>
                  <div className="proxask-signup-form-input-wrapper">
                    <FiUser className="proxask-signup-form-input-icon" />
                    <input
                      type="text"
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      className={`proxask-signup-form-input ${
                        formErrors.lastname ? 'proxask-signup-form-input--error' : ''
                      }`}
                      placeholder="Last name"
                      autoComplete="family-name"
                      disabled={isSubmitting || loading}
                    />
                  </div>
                  {formErrors.lastname && (
                    <span className="proxask-signup-form-error">{formErrors.lastname}</span>
                  )}
                </div>
              </div>

              {/* Username Field */}
              <div className="proxask-signup-form-group">
                <label htmlFor="username" className="proxask-signup-form-label">
                  Username
                </label>
                <div className="proxask-signup-form-input-wrapper">
                  <span className="proxask-signup-form-username-prefix">@</span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`proxask-signup-form-input proxask-signup-form-input--with-prefix ${
                      formErrors.username ? 'proxask-signup-form-input--error' : ''
                    }`}
                    placeholder="username"
                    autoComplete="username"
                    disabled={isSubmitting || loading}
                  />
                </div>
                {formErrors.username && (
                  <span className="proxask-signup-form-error">{formErrors.username}</span>
                )}
              </div>

              {/* Email Field */}
              <div className="proxask-signup-form-group">
                <label htmlFor="email" className="proxask-signup-form-label">
                  Email Address
                </label>
                <div className="proxask-signup-form-input-wrapper">
                  <FiMail className="proxask-signup-form-input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`proxask-signup-form-input ${
                      formErrors.email ? 'proxask-signup-form-input--error' : ''
                    }`}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={isSubmitting || loading}
                  />
                </div>
                {formErrors.email && (
                  <span className="proxask-signup-form-error">{formErrors.email}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="proxask-signup-form-group">
                <label htmlFor="password" className="proxask-signup-form-label">
                  Password
                </label>
                <div className="proxask-signup-form-input-wrapper">
                  <FiLock className="proxask-signup-form-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`proxask-signup-form-input ${
                      formErrors.password ? 'proxask-signup-form-input--error' : ''
                    }`}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    disabled={isSubmitting || loading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="proxask-signup-form-password-toggle"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isSubmitting || loading}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="proxask-signup-password-strength">
                    <div className="proxask-signup-password-strength-bar">
                      <div 
                        className="proxask-signup-password-strength-fill"
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }}
                      />
                    </div>
                    <span 
                      className="proxask-signup-password-strength-label"
                      style={{ color: getPasswordStrengthColor() }}
                    >
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                )}

                {/* Password Requirements */}
                {formData.password && (
                  <div className="proxask-signup-password-requirements">
                    <div className={`proxask-signup-password-requirement ${
                      passwordStrength.checks.length ? 'proxask-signup-password-requirement--met' : ''
                    }`}>
                      <FiCheck className="proxask-signup-password-requirement-icon" />
                      At least 8 characters
                    </div>
                    <div className={`proxask-signup-password-requirement ${
                      passwordStrength.checks.uppercase ? 'proxask-signup-password-requirement--met' : ''
                    }`}>
                      <FiCheck className="proxask-signup-password-requirement-icon" />
                      One uppercase letter
                    </div>
                    <div className={`proxask-signup-password-requirement ${
                      passwordStrength.checks.lowercase ? 'proxask-signup-password-requirement--met' : ''
                    }`}>
                      <FiCheck className="proxask-signup-password-requirement-icon" />
                      One lowercase letter
                    </div>
                    <div className={`proxask-signup-password-requirement ${
                      passwordStrength.checks.number ? 'proxask-signup-password-requirement--met' : ''
                    }`}>
                      <FiCheck className="proxask-signup-password-requirement-icon" />
                      One number
                    </div>
                  </div>
                )}

                {formErrors.password && (
                  <span className="proxask-signup-form-error">{formErrors.password}</span>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="proxask-signup-form-group">
                <label htmlFor="confirmPassword" className="proxask-signup-form-label">
                  Confirm Password
                </label>
                <div className="proxask-signup-form-input-wrapper">
                  <FiLock className="proxask-signup-form-input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`proxask-signup-form-input ${
                      formErrors.confirmPassword ? 'proxask-signup-form-input--error' : ''
                    }`}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    disabled={isSubmitting || loading}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="proxask-signup-form-password-toggle"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    disabled={isSubmitting || loading}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <span className="proxask-signup-form-error">{formErrors.confirmPassword}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="proxask-signup-submit-btn"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    Create Account
                    <FiArrowRight className="proxask-signup-submit-icon" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="proxask-signup-login-link">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="proxask-signup-login-link-text">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Info */}
        <div className="proxask-signup-info">
          <div className="proxask-signup-info-content">
            <h2 className="proxask-signup-info-title">Why Join Proxask?</h2>
            <div className="proxask-signup-info-features">
              <div className="proxask-signup-info-feature">
                <div className="proxask-signup-info-feature-icon">🔐</div>
                <div>
                  <h3>Complete Privacy</h3>
                  <p>Ask questions anonymously without revealing your identity</p>
                </div>
              </div>
              <div className="proxask-signup-info-feature">
                <div className="proxask-signup-info-feature-icon">💬</div>
                <div>
                  <h3>Real-time Chat</h3>
                  <p>Connect with others through instant messaging</p>
                </div>
              </div>
              <div className="proxask-signup-info-feature">
                <div className="proxask-signup-info-feature-icon">🌍</div>
                <div>
                  <h3>Global Community</h3>
                  <p>Join thousands of users sharing knowledge worldwide</p>
                </div>
              </div>
              <div className="proxask-signup-info-feature">
                <div className="proxask-signup-info-feature-icon">⚡</div>
                <div>
                  <h3>Instant Answers</h3>
                  <p>Get quick responses from knowledgeable community members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;