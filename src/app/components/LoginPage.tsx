import React, { useState } from "react";

// 1. Defined the Props to match your App.tsx logic
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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>CampusTrade</h2>
        <p style={styles.subtitle}>University Marketplace</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>University Email</label>
            <input
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.loginButton}>
            Login
          </button>
        </form>

        <div style={styles.footer}>
          <span>New Student? </span>
          <button 
            onClick={() => onNavigate("register")} // 2. Leads to the ID scan page
            style={styles.linkButton}
          >
            Create account & Verify ID
          </button>
        </div>
      </div>
    </div>
  );
};

// Basic inline styling to keep it clean without a separate CSS file
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f7f6",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center" as const,
  },
  title: { color: "#0056b3", margin: "0 0 10px 0" },
  subtitle: { color: "#666", marginBottom: "30px" },
  form: { textAlign: "left" as const },
  inputGroup: { marginBottom: "20px" },
  label: { display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    boxSizing: "border-box" as const,
  },
  loginButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#0056b3",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },
  footer: { marginTop: "25px", fontSize: "14px" },
  linkButton: {
    background: "none",
    border: "none",
    color: "#0056b3",
    textDecoration: "underline",
    cursor: "pointer",
    fontWeight: "bold",
  },
};