import React, { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

type OcrResponse =
  | { name?: string; studentId?: string; rawText?: string; error?: string }
  | undefined;

export const Register = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 1. ADDED 'email' TO STATE
  const [formData, setFormData] = useState({ name: "", studentId: "", email: "" });

  const apiBase = useMemo(() => "http://127.0.0.1:5000", []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return previewUrl;
    });

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch(`${apiBase}/ocr`, { method: "POST", body });
      const data = (await res.json()) as OcrResponse;

      if (!res.ok) {
        setError(data && "error" in data && data.error ? data.error : `OCR failed (${res.status})`);
        return;
      }

      setFormData({
        ...formData, // Keep the email if they already typed it
        name: (data && "name" in data && data.name ? data.name : "") ?? "",
        studentId: (data && "studentId" in data && data.studentId ? data.studentId : "") ?? ""
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. THE MISSING FUNCTION
  const handleFinishRegistration = async () => {
    if (!formData.email) {
      setError("Please enter your email address to verify your account.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Verification email sent! Please check your inbox.");
        navigate("/login");
      } else {
        setError(data.error || "Failed to send email.");
      }
    } catch (e) {
      setError("Network error while sending email.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Student ID Verification</h2>
        <p className="register-subtitle">Please upload a clear photo of your Student ID.</p>

        <div className="upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="upload-input"
          />

          {isProcessing && <p className="processing-message">Processing...</p>}
          {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", marginTop: "10px" }} />
            </div>
          )}
        </div>

        <div className="form-section" style={{ marginTop: "20px" }}>
          
          {/* LOCKED INPUTS FOR OCR */}
          <label>Full Name</label>
          <input
            type="text"
            value={formData.name}
            readOnly
            style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed", display: "block", width: "100%", marginBottom: "10px" }}
            placeholder="Please upload your ID card to auto-fill"
          />

          <label>Student ID</label>
          <input
            type="text"
            value={formData.studentId}
            readOnly
            style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed", display: "block", width: "100%", marginBottom: "10px" }}
            placeholder="Please upload your ID card to auto-fill"
          />

          {/* NEW EMAIL INPUT */}
          <label>Student Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ display: "block", width: "100%", marginBottom: "20px" }}
            placeholder="Enter your email to receive verification link"
          />

          <button
            onClick={handleFinishRegistration}
            className="register-button"
            disabled={isProcessing || !formData.studentId} // Forces them to upload ID first!
            style={{ width: "100%", padding: "10px", backgroundColor: (!formData.studentId ? "#ccc" : "#007bff"), color: "white" }}
          >
            Finish Registration
          </button>

          <button
            onClick={() => navigate("/login")}
            className="link-button"
            style={{ display: "block", marginTop: "16px", width: "100%", textAlign: "center", background: "none", border: "none", color: "#007bff", cursor: "pointer" }}
            disabled={isProcessing}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};