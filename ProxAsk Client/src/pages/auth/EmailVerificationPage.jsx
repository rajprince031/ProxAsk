import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  Mail, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  Sun, 
  Moon, 
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Home,
  LogIn,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../service/AuthService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import './loginPage/LoginPage.css';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerificationEmail, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const { isDark, toggleTheme } = useTheme();

  const token = searchParams.get('token');
  const code = searchParams.get('code') || searchParams.get('otp');
  const storedEmail = sessionStorage.getItem('pendingVerificationEmail') || '';
  const initialEmail = location.state?.email || searchParams.get('email') || storedEmail;

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(code || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Verification state: 'PENDING' | 'ALREADY_VERIFIED' | 'EXPIRED' | 'VERIFIED_SUCCESS'
  const [verificationState, setVerificationState] = useState('PENDING');
  const [isVerifyingToken, setIsVerifyingToken] = useState(Boolean(token));

  // Single-execution guard refs to prevent infinite loops across re-renders
  const hasVerifiedTokenRef = useRef(false);
  const hasVerifiedCodeRef = useRef(false);
  const hasCheckedStatusRef = useRef(false);

  // Keep callback refs stable inside effects
  const verifyEmailRef = useRef(verifyEmail);
  verifyEmailRef.current = verifyEmail;
  const showSuccessRef = useRef(showSuccess);
  showSuccessRef.current = showSuccess;
  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // 1. Guarded Token Verification: runs strictly ONCE on mount / token arrival
  useEffect(() => {
    if (!token || hasVerifiedTokenRef.current) return;
    hasVerifiedTokenRef.current = true;

    let isMounted = true;
    setIsVerifyingToken(true);

    const executeTokenVerification = async () => {
      try {
        const res = await verifyEmailRef.current({ token });
        if (!isMounted) return;

        if (res && res.success) {
          const status = res.data?.status || res.status;
          if (status === 'ALREADY_VERIFIED' || res.message?.includes('already verified')) {
            setVerificationState('ALREADY_VERIFIED');
            sessionStorage.removeItem('pendingVerificationEmail');
            showSuccessRef.current('Your account is already verified. Please log in.');
          } else {
            setVerificationState('VERIFIED_SUCCESS');
            sessionStorage.removeItem('pendingVerificationEmail');
            showSuccessRef.current('Account verified successfully!');
          }
          // Clean URL immediately to prevent re-verification on page refresh
          navigateRef.current('/verify-email', { replace: true });
        } else {
          const errLower = (res?.error || '').toLowerCase();
          if (errLower.includes('already verified') || res?.status === 409) {
            setVerificationState('ALREADY_VERIFIED');
            showSuccessRef.current('Your account is already verified. Please log in.');
            navigateRef.current('/verify-email', { replace: true });
          } else if (errLower.includes('expired')) {
            setVerificationState('EXPIRED');
            showErrorRef.current('Your verification link/OTP has expired. Please register again.');
            navigateRef.current('/verify-email', { replace: true });
          } else {
            showErrorRef.current(res?.error || 'Verification link is invalid or expired.');
          }
        }
      } catch (err) {
        if (!isMounted) return;
        const errMsg = err.response?.data?.message || err.message || 'Verification link is invalid or expired.';
        const errLower = errMsg.toLowerCase();
        if (errLower.includes('already verified') || err.response?.status === 409) {
          setVerificationState('ALREADY_VERIFIED');
          showSuccessRef.current('Your account is already verified. Please log in.');
          navigateRef.current('/verify-email', { replace: true });
        } else if (errLower.includes('expired')) {
          setVerificationState('EXPIRED');
          showErrorRef.current('Your verification link/OTP has expired. Please register again.');
          navigateRef.current('/verify-email', { replace: true });
        } else {
          showErrorRef.current(errMsg);
        }
      } finally {
        if (isMounted) {
          setIsVerifyingToken(false);
        }
      }
    };

    executeTokenVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // 2. Guarded Code/OTP Verification from query params (e.g. ?email=...&code=...)
  useEffect(() => {
    if (token || !code || !initialEmail || hasVerifiedCodeRef.current) return;
    hasVerifiedCodeRef.current = true;

    let isMounted = true;
    setIsSubmitting(true);

    const executeCodeVerification = async () => {
      try {
        const res = await verifyEmailRef.current({ email: initialEmail.trim(), otp: code.trim() });
        if (!isMounted) return;

        if (res && res.success) {
          const status = res.data?.status || res.status;
          if (status === 'ALREADY_VERIFIED' || res.message?.includes('already verified')) {
            setVerificationState('ALREADY_VERIFIED');
            sessionStorage.removeItem('pendingVerificationEmail');
            showSuccessRef.current('Your account is already verified. Please log in.');
          } else {
            setVerificationState('VERIFIED_SUCCESS');
            sessionStorage.removeItem('pendingVerificationEmail');
            showSuccessRef.current('Account verified successfully!');
          }
          navigateRef.current('/verify-email', { replace: true });
        } else {
          const errLower = (res?.error || '').toLowerCase();
          if (errLower.includes('already verified') || res?.status === 409) {
            setVerificationState('ALREADY_VERIFIED');
            showSuccessRef.current('Your account is already verified. Please log in.');
            navigateRef.current('/verify-email', { replace: true });
          } else if (errLower.includes('expired')) {
            setVerificationState('EXPIRED');
            showErrorRef.current('Your verification link/OTP has expired. Please register again.');
            navigateRef.current('/verify-email', { replace: true });
          } else {
            showErrorRef.current(res?.error || 'Verification code is invalid or expired.');
          }
        }
      } catch (err) {
        if (!isMounted) return;
        const errMsg = err.response?.data?.message || err.message || 'Verification failed. Please check the code.';
        const errLower = errMsg.toLowerCase();
        if (errLower.includes('already verified') || err.response?.status === 409) {
          setVerificationState('ALREADY_VERIFIED');
          showSuccessRef.current('Your account is already verified. Please log in.');
          navigateRef.current('/verify-email', { replace: true });
        } else if (errLower.includes('expired')) {
          setVerificationState('EXPIRED');
          showErrorRef.current('Your verification link/OTP has expired. Please register again.');
          navigateRef.current('/verify-email', { replace: true });
        } else {
          showErrorRef.current(errMsg);
        }
      } finally {
        if (isMounted) {
          setIsSubmitting(false);
        }
      }
    };

    executeCodeVerification();

    return () => {
      isMounted = false;
    };
  }, [code, initialEmail, token]);

  // 3. Status check on refresh if email is present and not currently verifying
  useEffect(() => {
    if (token || code || verificationState === 'VERIFIED_SUCCESS' || !initialEmail || hasCheckedStatusRef.current) return;
    hasCheckedStatusRef.current = true;

    const checkStatus = async () => {
      try {
        const res = await api.get(`/auth/verification-status?email=${encodeURIComponent(initialEmail.trim())}`);
        const status = res.data?.data?.status || res.data?.status;
        if (status === 'ALREADY_VERIFIED' || status === 'VERIFIED') {
          setVerificationState('ALREADY_VERIFIED');
          sessionStorage.removeItem('pendingVerificationEmail');
        } else if (status === 'EXPIRED') {
          setVerificationState('EXPIRED');
        } else if (status === 'PENDING') {
          setVerificationState('PENDING');
        }
      } catch {
        // Ignore passive check errors
      }
    };

    checkStatus();
  }, [initialEmail, token, code, verificationState]);

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
      showError('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyEmail({ email: email.trim(), otp: otp.trim() });
      if (res && res.success) {
        const status = res.data?.status || res.status;
        if (status === 'ALREADY_VERIFIED' || res.message?.includes('already verified')) {
          setVerificationState('ALREADY_VERIFIED');
          sessionStorage.removeItem('pendingVerificationEmail');
          showSuccess('Your account is already verified. Please log in.');
        } else {
          setVerificationState('VERIFIED_SUCCESS');
          sessionStorage.removeItem('pendingVerificationEmail');
          showSuccess('Account verified successfully!');
        }
      } else {
        const errLower = (res?.error || '').toLowerCase();
        if (errLower.includes('already verified') || res?.status === 409) {
          setVerificationState('ALREADY_VERIFIED');
          showSuccess('Your account is already verified. Please log in.');
        } else if (errLower.includes('expired')) {
          setVerificationState('EXPIRED');
          showError('Your verification link/OTP has expired. Please register again.');
        } else {
          showError(res?.error || 'Invalid or expired OTP. Please try again.');
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Verification failed. Please double check the code.';
      const errLower = errMsg.toLowerCase();
      if (errLower.includes('already verified') || err.response?.status === 409) {
        setVerificationState('ALREADY_VERIFIED');
        showSuccess('Your account is already verified. Please log in.');
      } else if (errLower.includes('expired')) {
        setVerificationState('EXPIRED');
        showError('Your verification link/OTP has expired. Please register again.');
      } else {
        showError(errMsg);
      }
    } finally {
      setIsSubmitting(false);
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
      showSuccess('A fresh 6-digit verification code has been dispatched to your email.');
      setResendCooldown(60);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to resend verification OTP.';
      const errLower = errMsg.toLowerCase();
      if (errLower.includes('already verified') || err.response?.status === 409) {
        setVerificationState('ALREADY_VERIFIED');
      } else if (errLower.includes('expired')) {
        setVerificationState('EXPIRED');
        showError('Your verification link/OTP has expired. Please register again.');
      } else {
        showError(errMsg);
      }
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
        {/* Loading / Auto-verifying from URL token */}
        {isVerifyingToken ? (
          <Card className="px-auth__card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <Loader2 size={44} className="spin" color="var(--primary, #0D6731)" />
            </div>
            <h1 className="px-auth__title">Verifying Your Account</h1>
            <p className="px-auth__subtitle" style={{ maxWidth: '380px', margin: '8px auto 0' }}>
              Please wait while we confirm your verification link with the server...
            </p>
          </Card>
        ) : verificationState === 'ALREADY_VERIFIED' ? (
          /* State 1: Already Verified Screen */
          <Card className="px-auth__card" style={{ textAlign: 'center', padding: '36px 24px' }} data-testid="already-verified-card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: 'rgba(45, 164, 78, 0.12)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <CheckCircle2 size={36} color="#2da44e" />
              </div>
            </div>

            <div className="px-auth__badge-wrap" style={{ justifyContent: 'center' }}>
              <Badge variant="green" size="sm" icon={<Sparkles size={11} />}>
                ACCOUNT VERIFIED
              </Badge>
            </div>

            <h1 className="px-auth__title" style={{ marginTop: '12px' }}>Already Verified</h1>
            <p className="px-auth__subtitle" style={{ maxWidth: '400px', margin: '8px auto 28px' }} data-testid="already-verified-message">
              Your account is already verified. Please log in.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '340px', margin: '0 auto' }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/login')}
                leftIcon={<LogIn size={16} />}
              >
                Go to Login
              </Button>
            </div>
          </Card>
        ) : verificationState === 'EXPIRED' ? (
          /* State 2: Expired Verification Screen */
          <Card className="px-auth__card" style={{ textAlign: 'center', padding: '36px 24px' }} data-testid="expired-verification-card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: 'rgba(207, 34, 46, 0.12)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <AlertCircle size={36} color="#cf222e" />
              </div>
            </div>

            <div className="px-auth__badge-wrap" style={{ justifyContent: 'center' }}>
              <Badge variant="red" size="sm" icon={<AlertCircle size={11} />}>
                LINK / OTP EXPIRED
              </Badge>
            </div>

            <h1 className="px-auth__title" style={{ marginTop: '12px' }}>Verification Expired</h1>
            <p className="px-auth__subtitle" style={{ maxWidth: '400px', margin: '8px auto 28px' }} data-testid="expired-verification-message">
              Your verification link/OTP has expired. Please register again.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '340px', margin: '0 auto' }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/signup')}
                rightIcon={<ArrowRight size={16} />}
              >
                Register Again
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                leftIcon={<LogIn size={16} />}
              >
                Back to Sign In
              </Button>
            </div>
          </Card>
        ) : verificationState === 'VERIFIED_SUCCESS' ? (
          /* State 3: Static Newly Verified Confirmation Screen */
          <Card className="px-auth__card" style={{ textAlign: 'center', padding: '36px 24px' }} data-testid="verified-success-card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: 'rgba(45, 164, 78, 0.12)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <CheckCircle2 size={36} color="#2da44e" />
              </div>
            </div>

            <div className="px-auth__badge-wrap" style={{ justifyContent: 'center' }}>
              <Badge variant="green" size="sm" icon={<Sparkles size={11} />}>
                ACCOUNT VERIFIED
              </Badge>
            </div>

            <h1 className="px-auth__title" style={{ marginTop: '12px' }}>Account Verified Successfully!</h1>
            <p className="px-auth__subtitle" style={{ maxWidth: '400px', margin: '8px auto 28px' }}>
              Your email has been confirmed and your ProxAsk account is now fully active. You're ready to start exploring, asking, and answering.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '340px', margin: '0 auto' }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/login')}
                leftIcon={<LogIn size={16} />}
              >
                Go to Login Page
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/')}
                leftIcon={<Home size={16} />}
              >
                Go to Home Page
              </Button>
            </div>
          </Card>
        ) : (
          /* State 4: Standard OTP / Email Verification Form (PENDING) */
          <Card className="px-auth__card">
            <div className="px-auth__card-header">
              <div className="px-auth__badge-wrap">
                <Badge variant="teal" size="sm" icon={<Sparkles size={11} />}>
                  SECURITY VERIFICATION
                </Badge>
              </div>
              <h1 className="px-auth__title">Verify Your Email</h1>
              <p className="px-auth__subtitle" data-testid="verification-pending-message">
                Your account is not verified yet. Please enter the OTP (or click the verification link) sent to your email.
              </p>
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
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP / Link'}
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
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
