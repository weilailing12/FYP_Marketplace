from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import pytesseract
from PIL import Image
import re
import io
import os

pytesseract.pytesseract.tesseract_cmd = r'C:\Users\User\AppData\Local\Programs\Tesseract-OCR\tesseract.exe' # Update this path to where Tesseract is installed on your machine
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///marketplace.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
# This allows your React app (running on a different port) to talk to Flask
CORS(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    university = db.Column(db.String(100))
    course = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    bio = db.Column(db.Text)
    profile_image = db.Column(db.String(200))
    is_club = db.Column(db.Boolean, default=False)
    club_name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(200))
    category = db.Column(db.String(50))
    product_type = db.Column(db.String(20))  # 'secondhand' or 'clubmerch'
    club_name = db.Column(db.String(100))
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='active')  # active, sold
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    seller = db.relationship('User', backref=db.backref('products', lazy=True))

class Purchase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    price = db.Column(db.Float, nullable=False)
    promo_code = db.Column(db.String(50))
    discount_amount = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    buyer = db.relationship('User', backref=db.backref('purchases', lazy=True))
    product = db.relationship('Product', backref=db.backref('purchases', lazy=True))

class AnalyticsEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
    event_type = db.Column(db.String(20))  # view, click, purchase
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('analytics_events', lazy=True))
    product = db.relationship('Product', backref=db.backref('analytics_events', lazy=True))

class PromoCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    discount_percent = db.Column(db.Integer, nullable=False)
    expiry_date = db.Column(db.DateTime)
    usage_limit = db.Column(db.Integer)
    used_count = db.Column(db.Integer, default=0)
    club_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # club user id
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    club = db.relationship('User', backref=db.backref('promo_codes', lazy=True))

class BulletinPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50))  # announcement, event, general, academic
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    importance = db.Column(db.String(20), default='normal')  # high, normal, low
    image = db.Column(db.String(200))
    expiry_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    author = db.relationship('User', backref=db.backref('bulletin_posts', lazy=True))

# Create database tables
with app.app_context():
    db.create_all() 

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

# Analytics endpoints
@app.route('/analytics/log', methods=['POST'])
def log_analytics():
    data = request.json
    event = AnalyticsEvent(
        user_id=data.get('user_id'),
        product_id=data.get('product_id'),
        event_type=data['event_type']
    )
    db.session.add(event)
    db.session.commit()
    return jsonify({"message": "Event logged"}), 201

@app.route('/analytics/dashboard/<int:user_id>', methods=['GET'])
def get_analytics(user_id):
    # Get user's products
    products = Product.query.filter_by(seller_id=user_id).all()
    product_ids = [p.id for p in products]
    
    analytics = {}
    for product in products:
        views = AnalyticsEvent.query.filter_by(product_id=product.id, event_type='view').count()
        clicks = AnalyticsEvent.query.filter_by(product_id=product.id, event_type='click').count()
        sales = Purchase.query.filter_by(product_id=product.id).count()
        analytics[product.id] = {
            'title': product.title,
            'views': views,
            'clicks': clicks,
            'sales': sales
        }
    
    # Monthly sales for clubs
    if products and products[0].product_type == 'clubmerch':
        monthly_sales = db.session.query(
            db.func.strftime('%Y-%m', Purchase.created_at),
            db.func.count(Purchase.id)
        ).filter(Purchase.product_id.in_(product_ids)).group_by(
            db.func.strftime('%Y-%m', Purchase.created_at)
        ).all()
        monthly_sales = [{'month': m, 'sales': s} for m, s in monthly_sales]
        
        # Top selling items
        top_items = db.session.query(
            Product.title,
            db.func.count(Purchase.id).label('sales_count')
        ).join(Purchase).filter(Product.id.in_(product_ids)).group_by(Product.id).order_by(
            db.desc('sales_count')
        ).limit(5).all()
        top_items = [{'title': t, 'sales': s} for t, s in top_items]
    else:
        monthly_sales = []
        top_items = []
    
    return jsonify({
        'product_analytics': analytics,
        'monthly_sales': monthly_sales,
        'top_items': top_items
    })

# Promo code endpoints
@app.route('/promo/create', methods=['POST'])
def create_promo():
    data = request.json
    promo = PromoCode(
        code=data['code'],
        discount_percent=data['discount_percent'],
        expiry_date=datetime.fromisoformat(data['expiry_date']) if data.get('expiry_date') else None,
        usage_limit=data.get('usage_limit'),
        club_id=data['club_id']
    )
    db.session.add(promo)
    db.session.commit()
    return jsonify({"message": "Promo code created", "id": promo.id}), 201

@app.route('/promo/validate', methods=['POST'])
def validate_promo():
    data = request.json
    code = data['code']
    promo = PromoCode.query.filter_by(code=code).first()
    if not promo:
        return jsonify({"valid": False, "error": "Invalid code"}), 400
    if promo.expiry_date and promo.expiry_date < datetime.utcnow():
        return jsonify({"valid": False, "error": "Code expired"}), 400
    if promo.usage_limit and promo.used_count >= promo.usage_limit:
        return jsonify({"valid": False, "error": "Code usage limit reached"}), 400
    return jsonify({"valid": True, "discount_percent": promo.discount_percent}), 200

@app.route('/promo/use', methods=['POST'])
def use_promo():
    data = request.json
    code = data['code']
    promo = PromoCode.query.filter_by(code=code).first()
    if promo:
        promo.used_count += 1
        db.session.commit()
    return jsonify({"message": "Code used"}), 200

# Bulletin board endpoints
@app.route('/bulletin/posts', methods=['GET'])
def get_bulletin_posts():
    status = request.args.get('status', 'approved')
    posts = BulletinPost.query.filter_by(status=status).order_by(BulletinPost.created_at.desc()).all()
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'content': p.content,
        'category': p.category,
        'author': p.author.name if p.author else 'Unknown',
        'importance': p.importance,
        'image': p.image,
        'created_at': p.created_at.isoformat()
    } for p in posts])

@app.route('/bulletin/create', methods=['POST'])
def create_bulletin_post():
    data = request.json
    post = BulletinPost(
        title=data['title'],
        content=data['content'],
        category=data['category'],
        author_id=data['author_id'],
        importance=data.get('importance', 'normal'),
        image=data.get('image'),
        expiry_date=datetime.fromisoformat(data['expiry_date']) if data.get('expiry_date') else None
    )
    db.session.add(post)
    db.session.commit()
    return jsonify({"message": "Post created", "id": post.id}), 201

@app.route('/bulletin/moderate/<int:post_id>', methods=['PUT'])
def moderate_post(post_id):
    data = request.json
    post = BulletinPost.query.get_or_404(post_id)
    post.status = data['status']
    db.session.commit()
    return jsonify({"message": "Post moderated"}), 200

if __name__ == '__main__':
    # Runs on http://127.0.0.1:5000
    app.run(debug=True, port=5000)