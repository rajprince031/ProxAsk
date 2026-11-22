import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Lock, 
  LogOut, 
  ExternalLink,
  Shield,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../service/AuthService';
import dialogService from '../service/dialogService';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin, updateUser } = useAuth();
  const { showSuccess, showError } = useNotifications();

  const savedPrivacy = user?.username ? localStorage.getItem(`proxask_privacy_${user.username}`) : null;
  const [isPrivate, setIsPrivate] = useState(savedPrivacy ? JSON.parse(savedPrivacy) : Boolean(user?.isPrivate));

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwStep, setPwStep] = useState('request'); // 'request' | 'verify'
  const [pwOtp, setPwOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isPwSubmitting, setIsPwSubmitting] = useState(false);
  const [pwCooldown, setPwCooldown] = useState(0);

  // Change Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStep, setEmailStep] = useState('request'); // 'request' | 'verify'
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);

  // Cooldown timers
  useEffect(() => {
    if (pwCooldown > 0) {
      const timer = setTimeout(() => setPwCooldown(pwCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [pwCooldown]);

  useEffect(() => {
    if (emailCooldown > 0) {
      const timer = setTimeout(() => setEmailCooldown(emailCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCooldown]);

  // Handle Privacy Toggle (with batch request acceptance if moving Private -> Public)
  const handleTogglePrivacy = async (checked) => {
    // If moving from Private to Public, check pending requests
    if (!checked) {
      try {
        const countRes = await api.get('/follow/requests/count');
        const pendingCount = countRes.data?.data || 0;
        if (pendingCount > 0) {
          const confirmed = await dialogService.confirmMakeProfilePublic(pendingCount);
          if (!confirmed) {
            return;
          }
          await api.post('/user/make-public');
          setIsPrivate(false);
          if (user?.username) {
            localStorage.setItem(`proxask_privacy_${user.username}`, JSON.stringify(false));
          }
          updateUser({ isPrivate: false });
          showSuccess(`Profile is now Public! ${pendingCount} pending follow request${pendingCount === 1 ? '' : 's'} accepted.`);
          return;
        }
      } catch {
        // fallback to normal privacy update
      }
    }

    setIsPrivate(checked);
    if (user?.username) {
      localStorage.setItem(`proxask_privacy_${user.username}`, JSON.stringify(checked));
    }
    updateUser({ isPrivate: checked });
    try {
      await api.put('/user/privacy', { isPrivate: checked });
    } catch {
      // offline fallback
    }
    showSuccess(`Account set to ${checked ? 'Private' : 'Public'}`);
  };

  // Request Password Change OTP
  const handleRequestPasswordOtp = async () => {
    setIsPwSubmitting(true);
    try {
      await api.post('/user/change-password/request-otp');
      showSuccess(`Verification code sent to your registered email (${user?.email}).`);
      setPwStep('verify');
      setPwCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send verification code. Please try again.';
      showError(msg);
    } finally {
      setIsPwSubmitting(false);
    }
  };

  // Submit Password Change
  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    if (!pwOtp.trim() || pwOtp.trim().length !== 6) {
      showError('Please enter the 6-digit OTP code.');
      return;
    }
    if (newPassword.length < 8) {
      showError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showError('Passwords do not match.');
      return;
    }

    setIsPwSubmitting(true);
    try {
      await api.post('/user/change-password', {
        otp: parseInt(pwOtp.trim(), 10),
        newPassword
      });
      showSuccess('Your password has been changed successfully!');
      setShowPasswordModal(false);
      setPwStep('request');
      setPwOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password. Invalid or expired OTP.';
      showError(msg);
    } finally {
      setIsPwSubmitting(false);
    }
  };

  // Request Email Change OTP (Sent to NEW email address)
  const handleRequestEmailOtp = async (e) => {
    e.preventDefault();
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      showError('Please enter a valid new email address.');
      return;
    }
    if (newEmail.trim().toLowerCase() === user?.email?.toLowerCase()) {
      showError('New email cannot be the same as your current email.');
      return;
    }

    setIsEmailSubmitting(true);
    try {
      await api.post('/user/change-email/request-otp', {
        newEmail: newEmail.trim().toLowerCase()
      });
      showSuccess(`Verification code dispatched to your NEW email: ${newEmail.trim()}`);
      setEmailStep('verify');
      setEmailCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send verification code to the proposed email.';
      showError(msg);
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  // Submit Email Change Verification
  const handleSubmitEmailChange = async (e) => {
    e.preventDefault();
    if (!emailOtp.trim() || emailOtp.trim().length !== 6) {
      showError('Please enter the 6-digit OTP code received on your new email.');
      return;
    }

    setIsEmailSubmitting(true);
    try {
      await api.post('/user/change-email/verify', {
        newEmail: newEmail.trim().toLowerCase(),
        otp: parseInt(emailOtp.trim(), 10)
      });
      showSuccess('Email address updated successfully!');
      updateUser({ email: newEmail.trim().toLowerCase() });
      setShowEmailModal(false);
      setEmailStep('request');
      setNewEmail('');
      setEmailOtp('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to verify new email. Code may be invalid or expired.';
      showError(msg);
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await dialogService.confirmAction({
      title: 'Sign Out',
      text: 'Are you sure you want to sign out?',
      confirmText: 'Sign Out',
      isDestructive: false
    });
    if (confirmed) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="px-settings">
      {/* Page Header */}
      <div className="px-settings__header">
        <div>
          <div className="px-settings__badge-wrap">
            <Badge variant="teal" size="sm" icon={<Settings size={12} />}>
              PREFERENCES
            </Badge>
          </div>
          <h1 className="px-settings__title">Account Settings</h1>
          <p className="px-settings__subtitle">
            Manage your account security, profile privacy, and registered credentials.
          </p>
        </div>
      </div>

      <div className="px-settings__grid">
        {/* Profile Privacy Controls (Instagram-style) */}
        <Card className="px-settings__card">
          <div className="px-settings__card-header">
            <div className="px-settings__card-title-row">
              <Lock size={16} />
              <h2 className="px-settings__card-title">Profile Privacy</h2>
            </div>
            <p className="px-settings__card-desc">
              Control whether your questions and follower lists are visible to anyone or only approved followers.
            </p>
          </div>

          <div className="px-settings__privacy-toggle-box">
            <div className="px-settings__privacy-details">
              <span className="px-settings__privacy-label">Private Account</span>
              <p className="px-settings__privacy-desc">
                When your account is private, only people who follow you can see your questions and answers. Unauthenticated visitors can only view your display name, counts, and send you questions.
              </p>
            </div>
            <label className="px-profile__switch">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => handleTogglePrivacy(e.target.checked)}
              />
              <span className="px-profile__switch-slider" />
            </label>
          </div>
        </Card>

        {/* User Identity & Email Management */}
        <Card className="px-settings__card">
          <div className="px-settings__card-header">
            <div className="px-settings__card-title-row">
              <Shield size={16} />
              <h2 className="px-settings__card-title">Account Identity</h2>
            </div>
            <p className="px-settings__card-desc">
              Your registered public credentials and primary contact email.
            </p>
          </div>

          <div className="px-settings__user-row">
            <Avatar
              src={user?.avatar}
              name={`${user?.firstName || ''} ${user?.lastName || ''}`}
              username={user?.username}
              size="lg"
            />
            <div className="px-settings__profile-meta">
              <div className="px-settings__name-row">
                <span className="px-settings__profile-name">
                  {user?.firstName} {user?.lastName}
                </span>
                {user?.isVerified && (
                  <Badge variant="teal" size="sm">VERIFIED</Badge>
                )}
                {isAdmin && isAdmin() && (
                  <Badge variant="orange" size="sm">ADMIN</Badge>
                )}
              </div>
              <span className="px-settings__profile-handle font-mono">
                @{user?.username}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              leftIcon={<ExternalLink size={14} />}
            >
              Edit in Profile
            </Button>
          </div>

          <div className="px-settings__data-grid">
            <div className="px-settings__data-item">
              <span className="px-settings__data-label font-mono">EMAIL ADDRESS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span className="px-settings__data-value">{user?.email || 'Not specified'}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmailModal(true)}
                  style={{ padding: '2px 8px', fontSize: '11px', height: 'auto' }}
                >
                  Change
                </Button>
              </div>
            </div>

            <div className="px-settings__data-item">
              <span className="px-settings__data-label font-mono">ACCOUNT STATUS</span>
              <span className="px-settings__data-value" style={{ color: 'var(--success)' }}>
                ● Active
              </span>
            </div>
          </div>
        </Card>

        {/* Security & Password */}
        <Card className="px-settings__card">
          <div className="px-settings__card-header">
            <div className="px-settings__card-title-row">
              <KeyRound size={16} />
              <h2 className="px-settings__card-title">Security &amp; Password</h2>
            </div>
            <p className="px-settings__card-desc">
              Protect your account by regularly updating your password with email OTP verification.
            </p>
          </div>

          <div className="px-settings__danger-row">
            <div>
              <span className="px-settings__danger-title">Account Password</span>
              <p className="px-settings__danger-desc">
                Update your login password securely using an email-delivered OTP.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordModal(true)}
              leftIcon={<KeyRound size={14} />}
            >
              Change Password
            </Button>
          </div>
        </Card>

        {/* Session / Logout */}
        <Card className="px-settings__card px-settings__danger-card">
          <div className="px-settings__card-header">
            <h2 className="px-settings__card-title">Session Management</h2>
            <p className="px-settings__card-desc">
              Log out of your current session on this browser.
            </p>
          </div>

          <div className="px-settings__danger-row">
            <div>
              <span className="px-settings__danger-title">Sign Out of ProxAsk</span>
              <p className="px-settings__danger-desc">
                Your authentication token will be removed from this device.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut size={14} />}
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPwStep('request');
        }}
        title="Change Password"
        subtitle="For your security, we'll verify your identity with a 6-digit OTP code sent to your registered email."
        maxWidth="480px"
      >
        {pwStep === 'request' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: '6px', fontSize: '13px' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>Registered Email:</p>
              <span className="font-mono" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{user?.email}</span>
              <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '12px' }}>
                We will send a 6-digit One-Time Password (OTP) to this email address to authorize your password change.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleRequestPasswordOtp}
                isLoading={isPwSubmitting}
                disabled={pwCooldown > 0}
              >
                {pwCooldown > 0 ? `Wait ${pwCooldown}s` : 'Send Verification OTP'}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="px-input-group">
              <label className="px-input-label">Enter 6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 123456"
                value={pwOtp}
                onChange={(e) => setPwOtp(e.target.value.replace(/\D/g, ''))}
                className="px-input font-mono"
                required
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Code valid for 10 minutes</span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                  onClick={handleRequestPasswordOtp}
                  disabled={pwCooldown > 0 || isPwSubmitting}
                >
                  {pwCooldown > 0 ? `Resend in ${pwCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </div>

            <div className="px-input-group">
              <label className="px-input-label">New Password</label>
              <div className="px-input-wrapper">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-input px-input--has-right"
                  required
                />
                <button
                  type="button"
                  className="px-input-icon px-input-icon--right"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="px-input-group">
              <label className="px-input-label">Confirm New Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Re-type new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="px-input"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setPwStep('request')}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isPwSubmitting}
                disabled={!pwOtp || !newPassword || !confirmNewPassword}
              >
                Update Password
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Change Email Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setEmailStep('request');
        }}
        title="Change Email Address"
        subtitle="To update your email, we will send a 6-digit confirmation code directly to your proposed new email address."
        maxWidth="480px"
      >
        {emailStep === 'request' ? (
          <form onSubmit={handleRequestEmailOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="px-input-group">
              <label className="px-input-label">Current Email</label>
              <input
                type="text"
                value={user?.email || ''}
                disabled
                className="px-input font-mono"
                style={{ opacity: 0.7 }}
              />
            </div>

            <div className="px-input-group">
              <label className="px-input-label">New Email Address</label>
              <input
                type="email"
                placeholder="e.g. new.email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="px-input"
                required
                autoFocus
              />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                A 6-digit verification code will be sent to this new email to confirm ownership.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isEmailSubmitting}
                disabled={!newEmail.trim() || emailCooldown > 0}
              >
                {emailCooldown > 0 ? `Wait ${emailCooldown}s` : 'Send Verification Code'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitEmailChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '10px 12px', background: 'var(--bg-muted)', borderRadius: '6px', fontSize: '12.5px' }}>
              Verification code was sent to: <strong className="font-mono">{newEmail}</strong>
            </div>

            <div className="px-input-group">
              <label className="px-input-label">Enter 6-Digit Code from New Email</label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 123456"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                className="px-input font-mono"
                required
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Code valid for 10 minutes</span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                  onClick={handleRequestEmailOtp}
                  disabled={emailCooldown > 0 || isEmailSubmitting}
                >
                  {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : 'Resend to New Email'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setEmailStep('request')}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isEmailSubmitting}
                disabled={!emailOtp}
              >
                Confirm &amp; Update Email
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default SettingsPage;
