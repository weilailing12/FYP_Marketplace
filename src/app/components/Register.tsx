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
        console.log("Filtered lines:", textLines); // Debug: show all detected lines

        let name = "Not detected";
        let studentId = "Not detected";

        // Pattern for ID: 2 digits, 3 letters, 4 digits
        const idPattern = /^\d{2}[A-Za-z]{3}\d{4}$/;

        // Primary strategy: find line matching ID pattern and use previous line as name
        for (let i = 0; i < textLines.length; i++) {
          if (idPattern.test(textLines[i].replace(/\s+/g, ''))) {
            studentId = textLines[i];
            if (i > 0) {
              name = textLines[i - 1];
            }
            break;
          }
        }

        // Secondary strategy: keyword search if primary failed
        if (studentId === "Not detected") {
          for (const line of textLines) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('name') || lowerLine.includes('student') || lowerLine.includes('nama')) {
              const match = line.match(/(?:name|student|nama)[:\s]*(.+)/i);
              if (match) {
                name = match[1].trim();
              } else {
                const keywordIndex = lowerLine.indexOf('name') !== -1 ? lowerLine.indexOf('name') :
                                      lowerLine.indexOf('student') !== -1 ? lowerLine.indexOf('student') :
                                      lowerLine.indexOf('nama');
                if (keywordIndex !== -1) {
                  name = line.substring(keywordIndex + 4).trim();
                }
              }
            }
            const idMatch = line.match(/\d{7,8}/);
            if (idMatch) {
              studentId = idMatch[0];
            }
          }
        }

        // Fallback name detection if still missing
        if (name === "Not detected" && studentId === "Not detected" && textLines.length > 0) {
          name = textLines[0];
        }

        console.log("Detected name:", name, "ID:", studentId); // Debug output

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