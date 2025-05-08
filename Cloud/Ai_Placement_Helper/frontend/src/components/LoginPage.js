import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import "./Auth.css";

function LoginPage() {
  const { handleLogin } = useContext(AuthContext);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-dismiss messages after 3 seconds
  useEffect(() => {
    if (error || message) {
      const timer = setTimeout(() => {
        setError(null);
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, message]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/user/login", {
        email: loginData.email.trim().toLowerCase(),
        password: loginData.password.trim(),
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        setMessage("Login successful!");
        setTimeout(() => {
          handleLogin();
          navigate("/");
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");
    setLoading(true);
    
    const trimmedPassword = signupData.password.trim();
    const trimmedConfirmPassword = signupData.confirmPassword.trim();
    
    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    
    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:5000/api/user/register", {
        name: `${signupData.firstName.trim()} ${signupData.lastName.trim()}`,
        email: signupData.email.trim().toLowerCase(),
        password: trimmedPassword,
      });
      
      if (response.data.message) {
        setMessage(response.data.message);
        const registeredEmail = signupData.email.trim().toLowerCase();
        setSignupData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setLoginData(prev => ({
          ...prev,
          email: registeredEmail
        }));
        setTimeout(() => {
          setIsFlipped(false);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error creating account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFlip = (toSignup) => {
    setError(null);
    setMessage("");
    setIsFlipped(toSignup);
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <h1 className="auth-title">AI Placement Helper</h1>
        
        <div className={`form-container ${isFlipped ? 'flipped' : ''}`}>
          {/* Login Form */}
          <div className="login-form">
            <h2 className="form-title">Welcome Back!</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
              
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
              
              <div className="toggle-form">
                Don't have an account?
                <button
                  type="button"
                  className="toggle-button"
                  onClick={() => handleFlip(true)}
                  disabled={loading}
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>

          {/* Signup Form */}
          <div className="signup-form">
            <h2 className="form-title">Create Account</h2>
            <form onSubmit={handleSignup}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-input"
                    value={signupData.firstName}
                    onChange={handleSignupChange}
                    placeholder="First name"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-input"
                    value={signupData.lastName}
                    onChange={handleSignupChange}
                    placeholder="Last name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="signupEmail" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="signupEmail"
                  name="email"
                  className="form-input"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="signupPassword" className="form-label">Password</label>
                <input
                  type="password"
                  id="signupPassword"
                  name="password"
                  className="form-input"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  placeholder="Create a password"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
              </div>
              
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
              
              <div className="toggle-form">
                Already have an account?
                <button
                  type="button"
                  className="toggle-button"
                  onClick={() => handleFlip(false)}
                  disabled={loading}
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Floating shapes for background effect */}
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      
      {/* Show error or success message */}
      {error && <div className="auth-message error">{error}</div>}
      {message && <div className="auth-message success">{message}</div>}
    </div>
  );
}

export default LoginPage;