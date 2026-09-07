import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    studentId: "",
  });
  const [isScanning, setIsScanning] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = (reader.result as string).split(",")[1];
        
        const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: "Extract the exact student name (keeping it in EXACTLY the same ALL CAPS format as printed on the card) and student ID number from this university ID card. Return ONLY a valid JSON object with the keys 'student_name' and 'student_id'." },
                    {
                      inline_data: {
                        mime_type: file.type,
                        data: base64Image,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );

        const data = await response.json();
        
        // Clean up the response to parse the JSON securely
        let aiText = data.candidates[0].content.parts[0].text;
        aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
        const aiData = JSON.parse(aiText);

        setFormData((prev) => ({
          ...prev,
          name: (aiData.student_name || "").toUpperCase(),
          studentId: aiData.student_id || "",
        }));
        
        alert("ID scanned successfully!");
      };
    } catch (error) {
      console.error("Scanning error:", error);
      alert("Failed to verify image with AI. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFinishRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Enforce UTAR email domain
    if (!formData.email.endsWith("@1utar.my")) {
      alert("Please use a valid @1utar.my UTAR email address.");
      return;
    }

    // 2. Enforce AI scanning
    if (!formData.name || !formData.studentId) {
      alert("Please upload and scan your Student ID card first.");
      return;
    }

    try {
      // 3. Supabase Auth Signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name, // Already capitalized from the AI scan
            student_id: formData.studentId,
          },
        },
      });

      if (signUpError) throw signUpError;

      // 4. Verification Update (Set is_verified to TRUE)
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ is_verified: true })
          .eq("id", data.user.id);
      }

      alert("Registration and ID Verification successful! You can now log in.");
      navigate("/login");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Student Registration</h2>
      
      <div style={{ marginBottom: "20px" }}>
        <label>Upload Student ID Card</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "block", marginTop: "5px" }} />
        {isScanning && <p style={{ color: "blue" }}>Scanning ID with AI... Please wait.</p>}
      </div>

      <form onSubmit={handleFinishRegistration}>
        <div style={{ marginBottom: "15px" }}>
          <label>Full Name (From ID)</label>
          <input
            type="text"
            value={formData.name}
            readOnly
            placeholder="Auto-filled by AI"
            style={{
              backgroundColor: "#f3f4f6",
              cursor: "not-allowed",
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px"
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Student ID</label>
          <input
            type="text"
            value={formData.studentId}
            readOnly
            placeholder="Auto-filled by AI"
            style={{
              backgroundColor: "#f3f4f6",
              cursor: "not-allowed",
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px"
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>UTAR Email</label>
          <input
            type="email"
            required
            placeholder="example@1utar.my"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ display: "block", width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ display: "block", width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Register Account
        </button>
      </form>
    </div>
  );
};