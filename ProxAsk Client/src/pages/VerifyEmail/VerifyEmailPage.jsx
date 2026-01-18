import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VerifyEmailPage.css";

const VerifyEmailPage = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // API call will be added by you
      navigate("/login");
    } catch {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verifyFullScreen">
      {/* Left Branding */}
      <div className="verifyLeftPanel">
        <div className="verifyBrandContent">
          <h1 className="verifyBrandLogo">Proxask</h1>
          <p className="verifyBrandMain">
            Verify your email<br />
            to get started.
          </p>
          <p className="verifyBrandSub">
            We’ve sent a verification code to your email address.
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="verifyRightPanel">
        <div className="verifyFormBox">
          <h2 className="verifyHeading">Email Verification</h2>
          <p className="verifySubHeading">
            Enter the 6-digit code sent to your email
          </p>

          {error && <div className="verifyErrorBox">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="verifyOtpBlock">
              <input
                type="text"
                placeholder="Enter OTP"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button className="verifyPrimaryButton" disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <p className="verifyFooterText">
            Didn’t receive the code?{" "}
            <span className="verifyResendLink">Resend OTP</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
