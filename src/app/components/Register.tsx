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
    if (!webcamRef.current) return;

    setIsProcessing(true);

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setIsProcessing(false);
      return;
    }

    const img = new Image();
    img.src = imageSrc;

    img.onload = async () => {
      // ✅ Create bigger canvas (improves OCR a LOT)
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 1200;
      canvas.height = 400;

      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // ✅ Strong image enhancement
      ctx.filter = "grayscale(100%) contrast(400%) brightness(120%)";

      // ✅ Safer crop (less chance cut text)
      ctx.drawImage(
        img,
        80,   // x
        80,   // y
        600,  // width
        250,  // height
        0,
        0,
        canvas.width,
        canvas.height
      );

      const processedImage = canvas.toDataURL("image/jpeg");

      try {
        const { data: { text } } = await Tesseract.recognize(
          processedImage,
          "eng",
          {
            tessedit_pageseg_mode: 6,
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 "
          } as any
        );

        console.log("OCR RAW:", text);

        // ✅ Fix common OCR mistakes
        const fixOCR = (t: string) => {
          return t
            .replace(/O/g, "0")
            .replace(/I/g, "1")
            .replace(/S/g, "5")
            .replace(/B/g, "8");
        };

        // ✅ Clean lines
        const lines = text
          .split("\n")
          .map(l => l.trim())
          .filter(l => l.length > 3);

        console.log("LINES:", lines);

        const utarIdPattern = /\d{2}[A-Z]{3}\d{5}/;

        let detectedId = "";
        let detectedName = "";

        for (let i = 0; i < lines.length; i++) {
          const cleanLine = fixOCR(lines[i].replace(/\s+/g, ""));

          if (utarIdPattern.test(cleanLine)) {
            detectedId = cleanLine;

            // ✅ Try get name above
            if (i > 0) detectedName = lines[i - 1];

            break;
          }
        }

        // ✅ Fallback: find best name candidate
        if (!detectedName) {
          const possibleNames = lines.filter(line =>
            /^[A-Z\s]+$/.test(line) && line.length > 5
          );

          detectedName = possibleNames[0] || "";
        }

        console.log("FINAL:", { detectedName, detectedId });

        setFormData({
          name: detectedName,
          studentId: detectedId
        });

      } catch (err) {
        console.error("OCR Error:", err);
      }

      setIsProcessing(false);
    };

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