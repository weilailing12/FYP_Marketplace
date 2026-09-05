import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) setError(resetError.message);
    else setMessage("If an account uses this email, a password reset link has been sent.");
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Reset your password</h2>
        <p className="login-subtitle">Enter your university email and we will send a secure reset link.</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm text-center">{message}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group"><label className="form-label">University Email</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="form-input" required /></div>
          <button type="submit" className="login-button" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
        </form>
        <button onClick={() => navigate("/login")} className="link-button mt-5">Back to login</button>
      </div>
    </div>
  );
}