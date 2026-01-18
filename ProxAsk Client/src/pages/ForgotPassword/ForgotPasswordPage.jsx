import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ForgotPasswordPage.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = email, 2 = otp+password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      setError("Email is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // API: /auth/forgot-password
      setStep(2);
    } catch {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.otp ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // API: /auth/reset-password
      navigate("/login");
    } catch {
      setError("Invalid OTP or request expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgotFullScreen">
      {/* Left Branding */}
      <div className="forgotLeftPanel">
        <div className="forgotBrandContent">
          <h1 className="forgotBrandLogo">Proxask</h1>
          <p className="forgotBrandMain">
            Reset your password<br />
            securely.
          </p>
          <p className="forgotBrandSub">
            We’ll help you regain access to your account.
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="forgotRightPanel">
        <div className="forgotFormBox">
          <h2 className="forgotHeading">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h2>

          <p className="forgotSubHeading">
            {step === 1
              ? "Enter your registered email"
              : "Enter OTP and new password"}
          </p>

          {error && <div className="forgotErrorBox">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="forgotInputBlock">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <button className="forgotPrimaryButton" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit}>
              <div className="forgotInputBlock">
                <label>OTP</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  value={formData.otp}
                  onChange={handleChange}
                />
              </div>

              <div className="forgotInputBlock">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="forgotInputBlock">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <button className="forgotPrimaryButton" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className="forgotFooterText">
            Remembered your password?
            <Link to="/login"> Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
