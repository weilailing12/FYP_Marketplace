from flask import Flask, request, jsonify
import easyocr
import re
from PIL import Image

app = Flask(__name__)

# Load OCR model once (IMPORTANT)
reader = easyocr.Reader(['en'])

@app.route('/ocr', methods=['POST'])
def ocr():
    file = request.files['file']
    file_path = "temp.jpg"
    file.save(file_path)

    # Run OCR
    results = reader.readtext(file_path)

    # Extract text only
    text_lines = [res[1] for res in results]

    print("RAW:", text_lines)

    # Pattern for UTAR ID
    pattern = r"\d{2}[A-Z]{3}\d{5}"

    student_id = ""
    student_name = ""

    for i, line in enumerate(text_lines):
        clean = line.replace(" ", "")

        if re.match(pattern, clean):
            student_id = clean

            if i > 0:
                student_name = text_lines[i - 1]

            break

    # fallback name
    if not student_name:
        for line in text_lines:
            if line.isupper() and len(line) > 5:
                student_name = line
                break

    return jsonify({
        "name": student_name,
        "studentId": student_id
    })

if __name__ == '__main__':
    app.run(debug=True)