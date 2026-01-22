import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";


const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setErrors({ apiError: "Username and password are required" });
            return;
        }

        setLoading(true);
        setErrors("");
        loginUser(formData).then((response) => {
           const hello = login(response.data);
           console.log("I am here" , hello)
            navigate("/dashboard");
        }).catch((err) => {
            setErrors({ apiError: err.response?.data?.message || "Invalid email or password" });
        }).finally(() => {
            setLoading(false);
        });
    }
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
                                <label>Username</label>
                                <input
                                    name="username"
                                    placeholder="username"
                                    value={formData.username}
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
