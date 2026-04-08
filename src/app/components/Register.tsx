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
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "Arial" }}>
      <h2>Student ID Verification</h2>

      <p>Please upload a clear photo of your Student ID.</p>

      <input type="file" accept="image/*" onChange={handleUpload} style={{ margin: "20px 0" }} />

      {isProcessing && <p>Processing OCR...</p>}
      {error && <p style={{ color: "#b00020" }}>{error}</p>}

      {imagePreview && (
        <div style={{ margin: "20px 0" }}>
          <img src={imagePreview} alt="Preview" style={{ maxWidth: "300px", borderRadius: "10px" }} />
        </div>
      )}

      <div style={{ maxWidth: "400px", margin: "20px auto", textAlign: "left" }}>
        <label>Full Name</label>
        <input
          style={{ width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ccc" }}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Auto-filled from card (edit if needed)"
        />

        <label>Student ID</label>
        <input
          style={{ width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ccc" }}
          value={formData.studentId}
          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
          placeholder="Auto-filled from card (edit if needed)"
        />

        <button
          onClick={() => alert("Proceeding to Email Verification...")}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginTop: "10px"
          }}
          disabled={isProcessing}
        >
          Finish Registration
        </button>

        <button
          onClick={() => onNavigate("login")}
          style={{ width: "100%", marginTop: "10px", background: "none", border: "none", color: "#666", cursor: "pointer" }}
          disabled={isProcessing}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};
