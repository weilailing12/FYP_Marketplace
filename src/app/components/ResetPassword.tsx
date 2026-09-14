import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { clearPasswordRecovery, getMfaStatus, isPasswordRecoverySession, rememberPasswordRecovery } from "../../auth";

type ResetStep = "checking" | "mfa" | "password" | "success" | "invalid";

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<ResetStep>("checking");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handledSessionToken = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    async function prepareRecovery(session: Session) {
      if (!active || handledSessionToken.current === session.access_token) return;
      handledSessionToken.current = session.access_token;
      setStep("checking");
      setError("");
      try {
        const { required } = await getMfaStatus(session);
        if (!active) return;
        if (!required) {
          setStep("password");
          return;
        }

        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        const factor = factors?.totp.find(item => item.status === "verified");
        if (factorsError || !factor) throw factorsError || new Error("No verified authenticator was found for this account.");
        if (!active) return;
        setMfaFactorId(factor.id);
        setStep("mfa");
      } catch (recoveryError) {
        if (!active) return;
        setError(recoveryError instanceof Error ? recoveryError.message : "Unable to verify this recovery session.");
        setStep("invalid");
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        rememberPasswordRecovery(session);
        timer = setTimeout(() => { void prepareRecovery(session); }, 0);
      }
    });

    // Supports a refresh after the recovery link has already been exchanged.
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      const urlSignalsRecovery = window.location.hash.includes("type=recovery") || window.location.search.includes("type=recovery");
      if (session && (isPasswordRecoverySession(session) || urlSignalsRecovery)) {
        if (urlSignalsRecovery) rememberPasswordRecovery(session);
        void prepareRecovery(session);
      } else {
        setError("This reset link is invalid or has expired. Please request a new one.");
        setStep("invalid");
      }
    });

    return () => {
      active = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleMfaSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mfaFactorId || mfaCode.length !== 6) return;
    setLoading(true);
    setError("");
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId: mfaFactorId, code: mfaCode });
    if (verifyError) {
      setError("Invalid authenticator code. Please check your app and try again.");
    } else {
      setMfaCode("");
      setStep("password");
    }
    setLoading(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else {
      clearPasswordRecovery();
      setMessage("Password updated successfully. You can now log in with your new password.");
      setStep("success");
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Create a new password</h2>
        <p className="login-subtitle">Choose a strong password for your CampusTrade account.</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm text-center">{message}</div>}
        {step === "checking" && <p className="text-center text-gray-500 py-5">Verifying recovery link...</p>}
        {step === "mfa" && <form onSubmit={handleMfaSubmit} className="login-form"><div className="form-group"><label className="form-label">Authenticator code</label><input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoFocus value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="form-input text-center text-2xl font-mono tracking-widest" placeholder="000000" required /></div><button type="submit" className="login-button" disabled={loading || mfaCode.length !== 6}>{loading ? "Verifying..." : "Verify authenticator"}</button></form>}
        {step === "password" && <form onSubmit={handleSubmit} className="login-form"><div className="form-group"><label className="form-label">New password</label><input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="form-input" required /></div><div className="form-group"><label className="form-label">Confirm new password</label><input type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="form-input" required /></div><button type="submit" className="login-button" disabled={loading}>{loading ? "Updating..." : "Update password"}</button></form>}
        {step === "invalid" && <button onClick={() => navigate("/forgot-password")} className="link-button mt-5">Request a new reset link</button>}
      </div>
    </div>
  );
}
