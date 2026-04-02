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

    const reader = new FileReader();

    reader.onload = async () => {
      const img = new Image();
      img.src = reader.result as string;

      setImagePreview(img.src);

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        if (!ctx) return;

        // ✅ Image enhancement
        ctx.filter = "grayscale(100%) contrast(350%) brightness(110%)";
        ctx.drawImage(img, 0, 0);

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

          // 🔧 Fix OCR mistakes
          const fixOCR = (t: string) => {
            return t
              .replace(/O/g, "0")
              .replace(/I/g, "1")
              .replace(/S/g, "5")
              .replace(/B/g, "8");
          };

          const lines = text
            .split("\n")
            .map(l => l.trim())
            .filter(l => l.length > 3);

          const utarIdPattern = /\d{2}[A-Z]{3}\d{5}/;

          let detectedId = "";
          let detectedName = "";

          for (let i = 0; i < lines.length; i++) {
            const cleanLine = fixOCR(lines[i].replace(/\s+/g, ""));

            if (utarIdPattern.test(cleanLine)) {
              detectedId = cleanLine;
              detectedName = lines[i - 1] || "";
              break;
            }
          }

          // ✅ fallback name detection
          if (!detectedName) {
            const possibleNames = lines.filter(line =>
              /^[A-Z\s]+$/.test(line) && line.length > 5
            );

            detectedName = possibleNames[0] || "";
          }

          setFormData({
            name: detectedName,
            studentId: detectedId
          });

        } catch (err) {
          console.error("OCR Error:", err);
        }

        setIsProcessing(false);
      };
    };

    reader.readAsDataURL(file);
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