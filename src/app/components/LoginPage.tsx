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
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

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

      const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assurance?.currentLevel === "aal1" && assurance.nextLevel === "aal2") {
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        const factor = factors?.totp.find((item) => item.status === "verified");
        if (factorsError || !factor) throw factorsError || new Error("No verified authenticator was found.");
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
        if (challengeError) throw challengeError;
        setMfaFactorId(factor.id);
        setMfaChallengeId(challenge.id);
        setMfaRequired(true);
        return;
      }
      onLogin();
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mfaFactorId || !mfaChallengeId) return;
    setError(null);
    setLoading(true);
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: mfaChallengeId, code: mfaCode });
    if (verifyError) setError("Invalid authenticator code. Please try again.");
    else onLogin();
    setLoading(false);
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

        {mfaRequired ? <form onSubmit={handleMfaSubmit} className="login-form">
          <p className="text-sm text-gray-600 mb-4">Enter the 6-digit code from your authenticator app.</p>
          <div className="form-group"><label className="form-label">Authenticator code</label><input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="form-input" required /></div>
          <button type="submit" className="login-button" disabled={loading || mfaCode.length !== 6}>{loading ? "Verifying..." : "Verify and login"}</button>
        </form> : <form onSubmit={handleSubmit} className="login-form">
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
        </form>}

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