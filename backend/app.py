from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import re
import io

pytesseract.pytesseract.tesseract_cmd = r'C:\Users\User\AppData\Local\Programs\Tesseract-OCR'
app = Flask(__name__)
# This allows your React app (running on a different port) to talk to Flask
CORS(app) 

@app.route('/ocr', methods=['POST'])
def process_ocr():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    
    try:
        # Open the image file
        image = Image.open(io.BytesIO(file.read()))

        # 1. Extract all text from the image
        raw_text = pytesseract.image_to_string(image)
        
        # Clean up the text into a list of non-empty lines
        lines = [line.strip() for line in raw_text.split('\n') if line.strip()]

        student_id = ""
        name = ""

        # 2. Look for the UTAR ID format (e.g., 22ACB07233)
        # Regex explanation: 2 digits, 3 letters, 5 digits
        id_pattern = re.compile(r'\d{2}[A-Z]{3}\d{5}')

        for i, line in enumerate(lines):
            match = id_pattern.search(line)
            if match:
                student_id = match.group(0)
                # On this specific ID card, the name is usually the line right above the ID
                if i > 0:
                    name = lines[i-1]
                break
        
        # Fallback: if it didn't find the alphanumeric one, look for the 7-digit one under the barcode
        if not student_id:
             backup_pattern = re.compile(r'\b\d{7}\b')
             for line in lines:
                 backup_match = backup_pattern.search(line)
                 if backup_match:
                     student_id = backup_match.group(0)
                     break

        return jsonify({
            "name": name,
            "studentId": student_id,
            "rawText": raw_text # Keeping this here so you can debug the OCR output!
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Runs on http://127.0.0.1:5000
    app.run(debug=True, port=5000)