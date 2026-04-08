import React, { useMemo, useState } from "react";

interface RegisterProps {
  onNavigate: (page: string) => void;
}

type OcrResponse =
  | { name?: string; studentId?: string; rawText?: string; error?: string }
  | undefined;

export const Register = ({ onNavigate }: RegisterProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", studentId: "" });

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
        name: (data && "name" in data && data.name ? data.name : "") ?? "",
        studentId: (data && "studentId" in data && data.studentId ? data.studentId : "") ?? ""
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
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

          {isProcessing && <p className="processing-message">Processing OCR...</p>}
          {error && <p className="error-message">{error}</p>}

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-section">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Auto-filled from card (edit if needed)"
          />

          <label>Student ID</label>
          <input
            type="text"
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            placeholder="Auto-filled from card (edit if needed)"
          />

          <button
            onClick={() => alert("Proceeding to Email Verification...")}
            className="register-button"
            disabled={isProcessing}
          >
            Finish Registration
          </button>

          <button
            onClick={() => onNavigate("login")}
            className="link-button"
            style={{ display: "block", marginTop: "16px", width: "100%", textAlign: "center" }}
            disabled={isProcessing}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
