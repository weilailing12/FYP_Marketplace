import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";

// Helper to convert the image file into Base64 for the Gemini API
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Extract the raw base64 string without the data URI prefix
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

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
    setOcrProgress("Analyzing ID with Gemini AI...");

    const previewUrl = URL.createObjectURL(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return previewUrl;
    });

    try {
      // 1. Convert image to Base64 format
      const base64Data = await fileToBase64(file);
      
      // 2. Fetch the API key from your Vite environment variables
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
      if (!GEMINI_API_KEY) throw new Error("Gemini API key is missing from .env");

      // 3. The Strict Gemini AI Prompt
      const promptText = `
        You are an automated university identity verification system for Universiti Tunku Abdul Rahman (UTAR). 
        Analyze the provided image of a student ID card. 
        1. Verify that the card is a valid UTAR student ID.
        2. Extract the exact student name and student ID number.
        3. If the card does not belong to UTAR, is unreadable, or is fake, mark is_utar_id as false.
        
        Return ONLY a JSON object exactly matching this structure:
        {
          "is_utar_id": boolean,
          "student_name": "extracted name or null",
          "student_id": "extracted ID or null",
          "error_message": "reason for failure or null"
        }
      `;

      // 4. Send request to Google AI Studio REST API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: promptText },
              { inline_data: { mime_type: file.type, data: base64Data } }
            ]
          }],
          generation_config: {
            response_mime_type: "application/json", // Forces Gemini to return pure JSON
            temperature: 0.1 // Keeps the AI strict and precise
          }
        })
      });

      const result = await response.json();
      
      if (result.error) throw new Error(result.error.message);

      // 5. Parse the JSON response from Gemini
      const aiResponseText = result.candidates[0].content.parts[0].text;
      const aiData = JSON.parse(aiResponseText);

      console.log("Gemini AI Result:", aiData);

      // 6. Enforce UTAR ID rules
      if (aiData.is_utar_id && aiData.student_id) {
        setFormData({
          ...formData,
          name: aiData.student_name || "",
          studentId: aiData.student_id
        });
        setOcrProgress("UTAR ID Verified Successfully!");
      } else {
        setError(aiData.error_message || "Verification failed: This does not appear to be a valid UTAR Student ID.");
        setOcrProgress("");
      }

    } catch (e: any) {
      console.error(e);
      setError("Failed to verify image with AI. Please try again.");
      setOcrProgress("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinishRegistration = async () => {
    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    // UTAR EMAIL ENFORCEMENT - Your original code was perfect!
    if (!formData.email.toLowerCase().endsWith('@1utar.my')) {
      setError("You must use a valid @1utar.my student email address to register.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            student_id: formData.studentId,
          }
        }
      });

      if (signUpError) throw signUpError;

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
        <p className="register-subtitle">Please upload a clear photo of your UTAR Student ID.</p>

        <div className="upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="upload-input"
          />

          {isProcessing && <p className="text-blue-600 font-medium my-2">{ocrProgress}</p>}
          {error && <p className="error-message" style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>{error}</p>}
          {!isProcessing && !error && ocrProgress && <p className="text-green-600 font-medium my-2">{ocrProgress}</p>}

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", marginTop: "10px", borderRadius: "8px" }} />
            </div>
          )}
        </div>

        <div className="form-section" style={{ marginTop: "20px" }}>
          <label>Full Name (From ID)</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ display: "block", width: "100%", marginBottom: "10px" }}
            placeholder="Auto-filled by AI"
          />

          <label>Student ID Status</label>
          <input
            type="text"
            value={formData.studentId}
            readOnly
            style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed", display: "block", width: "100%", marginBottom: "10px" }}
            placeholder="Upload UTAR ID to verify"
          />

          <label>Student Email (@1utar.my)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ display: "block", width: "100%", marginBottom: "10px" }}
            placeholder="student@1utar.my"
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