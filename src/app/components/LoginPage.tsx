import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";

// Defined the Props to match your App.tsx logic
interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Successfully logged in
      onLogin();
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">CampusTrade</h2>
        <p className="login-subtitle">University Marketplace</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

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

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <span className="login-footer-text">New Student?</span>
          <button 
            onClick={() => navigate("/register")}
            className="link-button"
          >
            Create account & Verify ID
          </button>
        </div>
      </div>
    </div>
  );
};