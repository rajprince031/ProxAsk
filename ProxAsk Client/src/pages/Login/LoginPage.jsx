import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { loginUser } from "../../services/authService";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setErrors({ apiError: "Email and password are required" });
      return;
    }

    setLoading(true);
    try {
      await loginUser(formData);
      navigate("/dashboard");
    } catch {
      setErrors({ apiError: "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginFullScreen">
      {/* Left Section */}
      <div className="loginLeftPanel">
        <div className="loginBrandContent">
          <h1 className="brandLogo">Proxask</h1>
          <p className="brandMainText">
            Ask questions freely.<br />
            Connect anonymously.
          </p>
          <p className="brandSubText">
            A safe space to ask, answer & connect.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="loginRightPanel">
        <div className="loginFormBox">
          <h2 className="loginHeading">Welcome back</h2>
          <p className="loginSubHeading">Login to continue</p>

          {errors.apiError && (
            <div className="loginErrorBox">{errors.apiError}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="loginInputBlock">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="loginInputBlock">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="loginForgotWrapper">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button className="loginPrimaryButton" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="loginFooterText">
            Don’t have an account?
            <Link to="/signup"> Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
