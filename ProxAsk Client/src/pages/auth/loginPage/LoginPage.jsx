import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuth();
  const { showSuccess, showError } = useNotifications();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get redirect path from location state
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Clear auth errors when component mounts
    clearError();
  }, [clearError]);

  useEffect(() => {
    // Clear form errors when user starts typing
    if (Object.keys(formErrors).length > 0) {
      setFormErrors({});
    }
  }, [formData]);

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        showSuccess('Login successful! Welcome back.');
        navigate(from, { replace: true });
      } else {
        showError(result.error || 'Login failed. Please try again.');
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

  return (
    <div className="proxask-login-page">
      <div className="proxask-login-container">
        {/* Left Side - Branding */}
        <div className="proxask-login-brand">
          <div className="proxask-login-brand-content">
            <h1 className="proxask-login-brand-title">
              Welcome to <span className="proxask-login-brand-name">Proxask</span>
            </h1>
            <p className="proxask-login-brand-subtitle">
              Your anonymous Q&A platform where curiosity meets privacy.
            </p>
            <div className="proxask-login-features">
              <div className="proxask-login-feature">
                <span className="proxask-login-feature-icon">🔒</span>
                <span className="proxask-login-feature-text">Anonymous Questions</span>
              </div>
              <div className="proxask-login-feature">
                <span className="proxask-login-feature-icon">💬</span>
                <span className="proxask-login-feature-text">Real-time Messaging</span>
              </div>
              <div className="proxask-login-feature">
                <span className="proxask-login-feature-icon">🌐</span>
                <span className="proxask-login-feature-text">Global Community</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="proxask-login-form-container">
          <div className="proxask-login-form-wrapper">
            <div className="proxask-login-form-header">
              <h2 className="proxask-login-form-title">Sign In</h2>
              <p className="proxask-login-form-subtitle">
                Welcome back! Please sign in to your account.
              </p>
            </div>

            {error && (
              <div className="proxask-login-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="proxask-login-form" noValidate>
              {/* Email Field */}
              <div className="proxask-login-form-group">
                <label htmlFor="email" className="proxask-login-form-label">
                  Email Address
                </label>
                <div className="proxask-login-form-input-wrapper">
                  <FiMail className="proxask-login-form-input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`proxask-login-form-input ${
                      formErrors.email ? 'proxask-login-form-input--error' : ''
                    }`}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={isSubmitting || loading}
                  />
                </div>
                {formErrors.email && (
                  <span className="proxask-login-form-error">{formErrors.email}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="proxask-login-form-group">
                <label htmlFor="password" className="proxask-login-form-label">
                  Password
                </label>
                <div className="proxask-login-form-input-wrapper">
                  <FiLock className="proxask-login-form-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`proxask-login-form-input ${
                      formErrors.password ? 'proxask-login-form-input--error' : ''
                    }`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isSubmitting || loading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="proxask-login-form-password-toggle"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isSubmitting || loading}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {formErrors.password && (
                  <span className="proxask-login-form-error">{formErrors.password}</span>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="proxask-login-forgot-password">
                <Link 
                  to="/forgot-password" 
                  className="proxask-login-forgot-password-link"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="proxask-login-submit-btn"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    Sign In
                    <FiArrowRight className="proxask-login-submit-icon" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="proxask-login-signup-link">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="proxask-login-signup-link-text">
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;