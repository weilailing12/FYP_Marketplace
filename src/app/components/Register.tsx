import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Tesseract from 'tesseract.js';
import { supabase } from "../../supabase";

export const Register = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<string>("");
  
  const [formData, setFormData] = useState({ 
    name: "", 
    studentId: "", 
    email: "",
    password: "" 
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    setOcrProgress("Starting OCR scanner...");

    const previewUrl = URL.createObjectURL(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return previewUrl;
    });

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === "recognizing text") {
            setOcrProgress(`Scanning ID... ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      const text = result.data.text.toUpperCase();
      console.log("OCR Result:", text);
      
      // Split text into lines to process it similarly to the python backend
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

      let studentId = "";
      let name = "";

      // 1. Look for the UTAR ID format (e.g., 22ACB07233)
      // Regex explanation: 2 digits, 3 letters, 5 digits
      const idPattern = /\d{2}[A-Z]{3}\d{5}/;

      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(idPattern);
        if (match) {
          studentId = match[0];
          // On this specific ID card, the name is usually the line right above the ID
          if (i > 0) {
            name = lines[i - 1];
          }
          break;
        }
      }

      // 2. Fallback: if it didn't find the alphanumeric one, look for the 7-digit one under the barcode
      if (!studentId) {
        const backupPattern = /\b\d{7}\b/;
        for (let i = 0; i < lines.length; i++) {
          const backupMatch = lines[i].match(backupPattern);
          if (backupMatch) {
            studentId = backupMatch[0];
            break;
          }
        }
      }

      if (studentId) {
        setFormData({
          ...formData,
          name: name || "Verified Student", 
          studentId: studentId 
        });
        setOcrProgress("ID Verified Successfully!");
      } else {
        setError("Could not detect a valid Student ID in the image. Please upload a clearer photo.");
        setOcrProgress("");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinishRegistration = async () => {
    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;

      // Create a profile for the user in the database
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: formData.name,
          student_id: formData.studentId,
          is_verified: true
        });
      }

      alert("Registration successful! You can now log in.");
      navigate("/login");
    } catch (e: any) {
      setError(e.message || "Network error while registering.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Student ID Verification</h2>
        <p className="register-subtitle">Please upload a clear photo of your Student ID to verify your university status.</p>

        <div className="upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="upload-input"
          />

          {isProcessing && <p className="text-blue-600 font-medium my-2">{ocrProgress}</p>}
          {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}
          {!isProcessing && !error && ocrProgress && <p className="text-green-600 font-medium my-2">{ocrProgress}</p>}

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", marginTop: "10px", borderRadius: "8px" }} />
            </div>
          )}
        </div>

        <div className="form-section" style={{ marginTop: "20px" }}>
          
          <label>Full Name</label>
          <input
            type="text"
            value={formData.name}
            readOnly
            style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed", display: "block", width: "100%", marginBottom: "10px" }}
            placeholder="Please upload your ID card to auto-fill"
          />

          <label>Student ID Status</label>
          <input
            type="text"
            value={formData.studentId}
            readOnly
            style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed", display: "block", width: "100%", marginBottom: "10px" }}
            placeholder="Please upload your ID card to auto-fill"
          />

          <label>Student Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ display: "block", width: "100%", marginBottom: "10px" }}
            placeholder="student@university.edu"
          />

          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ display: "block", width: "100%", marginBottom: "20px" }}
            placeholder="Create a strong password"
          />

          <button
            onClick={handleFinishRegistration}
            className="register-button"
            disabled={isProcessing || !formData.studentId}
            style={{ width: "100%", padding: "10px", backgroundColor: (!formData.studentId ? "#ccc" : "#007bff"), color: "white", cursor: (!formData.studentId ? "not-allowed" : "pointer"), borderRadius: "6px", fontWeight: "bold" }}
          >
            Create Account
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