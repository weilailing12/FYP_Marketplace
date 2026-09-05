import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      else setError("This reset link is invalid or has expired. Please request a new one.");
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else { setMessage("Password updated successfully. You can now log in."); setTimeout(() => navigate("/login"), 1500); }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Create a new password</h2>
        <p className="login-subtitle">Choose a strong password for your CampusTrade account.</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm text-center">{message}</div>}
        {ready && !message && <form onSubmit={handleSubmit} className="login-form"><div className="form-group"><label className="form-label">New password</label><input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="form-input" required /></div><div className="form-group"><label className="form-label">Confirm new password</label><input type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="form-input" required /></div><button type="submit" className="login-button" disabled={loading}>{loading ? "Updating..." : "Update password"}</button></form>}
        {!ready && !message && <button onClick={() => navigate("/forgot-password")} className="link-button mt-5">Request a new reset link</button>}
      </div>
    </div>
  );
}