import React, { useState } from "react";

// Defined the Props to match your App.tsx logic
interface LoginPageProps {
  onLogin: () => void;
  onNavigate: (page: string) => void;
}

export const LoginPage = ({ onLogin, onNavigate }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For FYP demo purposes, we call the login handler
    onLogin();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">CampusTrade</h2>
        <p className="login-subtitle">University Marketplace</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">University Email</label>
            <input
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <div className="login-footer">
          <span className="login-footer-text">New Student?</span>
          <button 
            onClick={() => onNavigate("register")}
            className="link-button"
          >
            Create account & Verify ID
          </button>
        </div>
      </div>
    </div>
  );
};