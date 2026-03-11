import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

interface RegisterProps {
  onNavigate: (page: string) => void;
}

export const Register = ({ onNavigate }: RegisterProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({ name: "", studentId: "" });

  const handleScan = useCallback(async () => {
    if (webcamRef.current) {
      setIsProcessing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const { data: { text } } = await Tesseract.recognize(imageSrc, "eng");
        const idMatch = text.match(/\d{7,8}/); 
        const lines = text.split("\n").filter(line => line.trim().length > 5);

        setFormData({
          name: lines[0] || "Not detected",
          studentId: idMatch ? idMatch[0] : "Not detected"
        });
      }
      setIsProcessing(false);
    }
  }, []);

  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "Arial" }}>
      <h2>Student ID Verification</h2>
      <p>Scan your ID to automatically fill your registration details.</p>

      <div style={{ position: "relative", display: "inline-block", margin: "20px 0" }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{ width: "100%", maxWidth: "400px", borderRadius: "10px" }}
        />
        {/* Viewfinder Overlay */}
        <div style={{
          position: "absolute", top: "20%", left: "10%", right: "10%", bottom: "20%",
          border: "2px solid #00ff00", pointerEvents: "none"
        }}></div>
      </div>

      <div>
        <button 
          onClick={handleScan} 
          style={{ padding: "10px 20px", backgroundColor: "#0056b3", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          {isProcessing ? "Processing..." : "Scan Card"}
        </button>
      </div>

      <div style={{ maxWidth: "400px", margin: "20px auto", textAlign: "left" }}>
        <label>Full Name</label>
        <input 
          style={{ width: "100%", padding: "10px", margin: "10px 0" }} 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <label>Student ID</label>
        <input 
          style={{ width: "100%", padding: "10px", margin: "10px 0" }} 
          value={formData.studentId} 
          onChange={(e) => setFormData({...formData, studentId: e.target.value})}
        />
        
        <button onClick={() => alert("Registered!")} style={{ width: "100%", padding: "12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px" }}>
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