import React, { useState } from "react";
import Tesseract from "tesseract.js";

interface RegisterProps {
  onNavigate: (page: string) => void;
}

export const Register = ({ onNavigate }: RegisterProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", studentId: "" });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setIsProcessing(true);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("http://127.0.0.1:5000/ocr", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    setFormData({
      name: data.name,
      studentId: data.studentId
    });

  } catch (err) {
    console.error("API Error:", err);
  }

  setIsProcessing(false);
};

  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "Arial" }}>
      <h2>Student ID Verification</h2>

      <p>Please upload a clear photo of your Student ID.</p>

      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload}
        style={{ margin: "20px 0" }}
      />

      {isProcessing && <p>Processing OCR... ⏳</p>}

      {imagePreview && (
        <div style={{ margin: "20px 0" }}>
          <img 
            src={imagePreview} 
            alt="Preview" 
            style={{ maxWidth: "300px", borderRadius: "10px" }} 
          />
        </div>
      )}

      <div style={{ maxWidth: "400px", margin: "20px auto", textAlign: "left" }}>
        <label>Full Name</label>
        <input
          style={{ width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ccc" }}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <label>Student ID</label>
        <input
          style={{ width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ccc" }}
          value={formData.studentId}
          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
        />

        <button 
          onClick={() => alert("Proceeding to Email Verification...")} 
          style={{ width: "100%", padding: "12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", marginTop: "10px" }}
        >
          Finish Registration
        </button>

        <button
          onClick={() => onNavigate("login")}
          style={{ width: "100%", marginTop: "10px", background: "none", border: "none", color: "#666", cursor: "pointer" }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};