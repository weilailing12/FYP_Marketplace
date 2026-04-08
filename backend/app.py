import io
import os
import re
from dataclasses import dataclass

import cv2
import numpy as np
import pytesseract
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image


app = Flask(__name__)
CORS(app)


@dataclass
class OcrResult:
    name: str
    studentId: str
    rawText: str


def _preprocess_for_ocr(bgr: np.ndarray) -> np.ndarray:
    """
    Produce a high-contrast image for text OCR.
    This is intentionally conservative (works across many ID cards).
    """
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    # Upscale for small / blurry photos
    h, w = gray.shape[:2]
    scale = 1.75 if max(h, w) < 1400 else 1.25
    gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

    # Reduce noise while keeping edges
    gray = cv2.bilateralFilter(gray, 9, 75, 75)

    # Adaptive threshold handles uneven lighting on cards
    thr = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        10,
    )

    # A little morphology to connect broken characters
    kernel = np.ones((2, 2), np.uint8)
    thr = cv2.morphologyEx(thr, cv2.MORPH_CLOSE, kernel, iterations=1)

    return thr


def _tesseract_text(img: np.ndarray) -> str:
    # psm 6 assumes a block of text; works well for most cards.
    cfg = "--oem 3 --psm 6"
    text = pytesseract.image_to_string(img, config=cfg)
    return text


def _normalize_lines(text: str) -> list[str]:
    text = text.replace("\r", "\n")
    lines = [re.sub(r"\s+", " ", ln).strip() for ln in text.split("\n")]
    return [ln for ln in lines if ln]


def _extract_student_id(lines: list[str]) -> str:
    # Common patterns: digits-only (7-12), or prefixed labels.
    joined = "\n".join(lines)

    label_patterns = [
        r"(?:student\s*id|student\s*no|id\s*no|matric\s*no|registration\s*no)\s*[:#]?\s*([A-Z0-9\-]{6,20})",
    ]
    for pat in label_patterns:
        m = re.search(pat, joined, flags=re.IGNORECASE)
        if m:
            return m.group(1).strip().replace(" ", "")

    # Fallback: first long-ish number token
    m = re.search(r"\b(\d{7,12})\b", joined)
    if m:
        return m.group(1)

    # Another fallback: alphanumeric ID token
    m = re.search(r"\b([A-Z]{1,3}\d{5,12})\b", joined, flags=re.IGNORECASE)
    if m:
        return m.group(1)

    return ""


def _extract_name(lines: list[str]) -> str:
    joined = "\n".join(lines)

    # Try explicit labels first
    label_patterns = [
        r"(?:name|full\s*name)\s*[:#]?\s*([A-Z][A-Z\s\.\-']{2,})",
    ]
    for pat in label_patterns:
        m = re.search(pat, joined, flags=re.IGNORECASE)
        if m:
            cand = re.sub(r"\s{2,}", " ", m.group(1)).strip()
            # Stop at obvious trailing labels
            cand = re.split(r"\b(student|id|department|faculty|dob|date)\b", cand, flags=re.IGNORECASE)[0].strip()
            if len(cand) >= 3:
                return _titlecase_name(cand)

    # Heuristic: pick the "most name-like" line:
    # - contains 2-5 words
    # - mostly letters/spaces, not too many digits
    best = ""
    best_score = -1
    for ln in lines:
        if re.search(r"\d", ln):
            continue
        words = [w for w in re.split(r"\s+", ln) if w]
        if not (2 <= len(words) <= 5):
            continue
        if any(w.lower() in {"student", "university", "faculty", "department", "valid", "issued"} for w in words):
            continue
        if not re.fullmatch(r"[A-Za-z\s\.\-']+", ln):
            continue
        score = len(ln)
        if score > best_score:
            best_score = score
            best = ln

    return _titlecase_name(best) if best else ""


def _titlecase_name(s: str) -> str:
    s = s.strip()
    if not s:
        return ""
    # Preserve things like O'Neil, Mary-Jane.
    parts = []
    for token in re.split(r"(\s+)", s):
        if token.isspace():
            parts.append(token)
            continue
        if not token:
            continue
        # Lower everything then cap first letter
        low = token.lower()
        parts.append(low[:1].upper() + low[1:])
    return "".join(parts)


def _run_ocr(image_bytes: bytes) -> OcrResult:
    pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    rgb = np.array(pil)
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)

    pre = _preprocess_for_ocr(bgr)
    raw = _tesseract_text(pre)
    lines = _normalize_lines(raw)

    student_id = _extract_student_id(lines)
    name = _extract_name(lines)

    return OcrResult(name=name, studentId=student_id, rawText=raw)


@app.post("/ocr")
def ocr():
    if "file" not in request.files:
        return jsonify({"error": "missing file"}), 400

    f = request.files["file"]
    image_bytes = f.read()
    if not image_bytes:
        return jsonify({"error": "empty file"}), 400

    try:
        result = _run_ocr(image_bytes)
        return jsonify(
            {
                "name": result.name,
                "studentId": result.studentId,
                "rawText": result.rawText,
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # If Tesseract isn't on PATH, set it like:
    # pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="127.0.0.1", port=port, debug=True)