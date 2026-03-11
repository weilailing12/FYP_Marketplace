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
        console.log("OCR Text:", text); // For debugging

        const textLines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        let name = "Not detected";
        let studentId = "Not detected";

        // Look for lines containing "name" or similar
        for (const line of textLines) {
          if (line.toLowerCase().includes('name') || line.toLowerCase().includes('student')) {
            // Extract name after keywords
            const match = line.match(/(?:name|student)[:\s]*(.+)/i);
            if (match) {
              name = match[1].trim();
            }
          }
          // Look for ID numbers
          const idMatch = line.match(/\d{7,8}/);
          if (idMatch) {
            studentId = idMatch[0];
          }
        }

        // Fallback: first line as name, any line with ID
        if (name === "Not detected" && textLines.length > 0) {
          name = textLines[0];
        }

        setFormData({
          name,
          studentId
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
          videoConstraints={{ facingMode: "environment" }}
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