import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { ShieldCheck, ArrowLeft } from "lucide-react";

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

  // Check on mount if user already entered credentials and is awaiting MFA verification (e.g. after refresh)
  useEffect(() => {
    async function checkPendingMfa() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assurance?.currentLevel === "aal1" && assurance?.nextLevel === "aal2") {
          const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
          const factor = factors?.totp.find((item) => item.status === "verified");
          if (factorsError || !factor) return;

          const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
          if (challengeError) return;

          setMfaFactorId(factor.id);
          setMfaChallengeId(challenge.id);
          setMfaRequired(true);
        }
      } catch (err) {
        console.error("Error checking pending MFA status:", err);
      }
    }
    checkPendingMfa();
  }, []);

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

      // Check if MFA is required for this account
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

    try {
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code: mfaCode,
      });

      if (verifyError) {
        setError("Invalid authenticator code. Please check your authenticator app and try again.");
      } else {
        onLogin();
      }
    } catch (err: any) {
      console.error("MFA verification error:", err);
      setError(err.message || "Failed to verify authenticator code.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelMfa = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setMfaRequired(false);
    setMfaCode("");
    setMfaFactorId(null);
    setMfaChallengeId(null);
    setError(null);
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

        {mfaRequired ? (
          <form onSubmit={handleMfaSubmit} className="login-form">
            <div className="text-center mb-5">
              <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Two-Factor Authentication</h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit verification code from your authenticator app (e.g. Google Authenticator).
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">6-Digit Authenticator Code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoFocus
                placeholder="000000"
                value={mfaCode}
                onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="form-input text-center text-2xl font-mono tracking-widest"
                required
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading || mfaCode.length !== 6}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <button
              type="button"
              onClick={handleCancelMfa}
              className="link-button mt-3 text-center w-full text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to email & password
            </button>
          </form>
        ) : (
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
        )}

        {!mfaRequired && (
          <button onClick={() => navigate("/forgot-password")} className="link-button mt-4">
            Forgot password?
          </button>
        )}

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