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
        const img = new Image();
        img.src = imageSrc;
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Focus on the strip where Name and ID live on UTAR cards
          canvas.width = 500;
          canvas.height = 150;
          

          if (ctx) {
            ctx.filter = "grayscale(100%) contrast(300%) brightness(110%)";
            // Crop source: avoiding logo on left, focusing on text area
            ctx.drawImage(img, 150, 100, 400, 150, 0, 0, 500, 150);

            const processedImage = canvas.toDataURL("image/jpeg");

            try {
              const { data: { text } } = await Tesseract.recognize(processedImage, "eng", {
                // Use 'as any' to bypass strict Tesseract type errors
                workerParams: {
                  tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 "
                }
              } as any);

              console.log("OCR Result:", text);

              const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
              const utarIdPattern = /\d{2}[A-Z]{3}\d{5}/; // e.g., 22ACB07233

              let detectedName = "";
              let detectedId = "";

              for (let i = 0; i < lines.length; i++) {
                const cleanLine = lines[i].replace(/\s+/g, '');
                if (utarIdPattern.test(cleanLine)) {
                  detectedId = cleanLine;
                  // UTAR Logic: Name is usually the line above the ID
                  detectedName = lines[i - 1] || "Not detected";
                  break;
                }
              }

              setFormData({
                name: detectedName || (lines[0] !== detectedId ? lines[0] : ""),
                studentId: detectedId
              });

            } catch (err) {
              console.error("OCR Error:", err);
            }
          }
          setIsProcessing(false);
        };
      }
    }
  }, [webcamRef]);

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
        <div style={{
          position: "absolute", top: "20%", left: "10%", right: "10%", bottom: "20%",
          border: "2px solid #00ff00", pointerEvents: "none"
        }}></div>
      </div>

      <div>
        <button
          onClick={handleScan}
          disabled={isProcessing}
          style={{ padding: "10px 20px", backgroundColor: "#0056b3", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          {isProcessing ? "Processing..." : "Scan Card"}
        </button>
      </div>

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

        <button onClick={() => alert("Proceeding to Email Verification...")} style={{ width: "100%", padding: "12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", marginTop: "10px" }}>
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