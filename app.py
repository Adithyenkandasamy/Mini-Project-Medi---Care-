from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import re
import json
import requests
from datetime import datetime, timedelta
import googlemaps
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-this')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///mediguide.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Initialize Google Maps client
try:
    gmaps = googlemaps.Client(key=os.getenv('GOOGLE_MAPS_API_KEY'))
except Exception as e:
    print(f"Google Maps initialization failed: {e}")
    gmaps = None

# Create upload folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    phone = db.Column(db.String(20))
    location = db.Column(db.String(200))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    insurance = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('ChatMessage', backref='user', lazy=True)
    consultations = db.relationship('Consultation', backref='user', lazy=True)
    documents = db.relationship('MedicalDocument', backref='user', lazy=True)
    reminders = db.relationship('Reminder', backref='user', lazy=True)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    severity_score = db.Column(db.Integer, default=0)
    extracted_symptoms = db.Column(db.Text)  # JSON string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Consultation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    symptoms = db.Column(db.Text, nullable=False)
    severity_score = db.Column(db.Integer, nullable=False)
    diagnosis = db.Column(db.Text)
    recommended_action = db.Column(db.String(50))  # home_remedy, doctor_visit, emergency
    recommended_hospitals = db.Column(db.Text)  # JSON string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class MedicalDocument(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50))
    file_size = db.Column(db.Integer)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.Text)

class Reminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    reminder_type = db.Column(db.String(50))  # medication, appointment, checkup
    scheduled_time = db.Column(db.DateTime, nullable=False)
    is_sent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Symptom Analysis Functions
def extract_symptoms(text):
    """Extract symptoms from user input using regex patterns"""
    symptoms = []
    
    # Common symptom patterns
    symptom_patterns = {
        'fever': r'\b(fever|temperature|hot|burning up)\b',
        'headache': r'\b(headache|head pain|migraine)\b',
        'cough': r'\b(cough|coughing)\b',
        'sore_throat': r'\b(sore throat|throat pain)\b',
        'nausea': r'\b(nausea|nauseous|sick|vomit)\b',
        'dizziness': r'\b(dizzy|dizziness|lightheaded)\b',
        'chest_pain': r'\b(chest pain|chest hurt)\b',
        'shortness_of_breath': r'\b(shortness of breath|can\'t breathe|breathing problem)\b',
        'fatigue': r'\b(tired|fatigue|exhausted|weak)\b',
        'stomach_pain': r'\b(stomach pain|stomach ache|abdominal pain)\b',
        'back_pain': r'\b(back pain|backache)\b',
        'joint_pain': r'\b(joint pain|arthritis|stiff)\b',
        'rash': r'\b(rash|skin irritation|itchy)\b',
        'swelling': r'\b(swelling|swollen|bloated)\b'
    }
    
    text_lower = text.lower()
    for symptom, pattern in symptom_patterns.items():
        if re.search(pattern, text_lower):
            symptoms.append(symptom)
    
    return symptoms

def calculate_severity_score(symptoms, text):
    """Calculate severity score based on symptoms and context"""
    base_score = 0
    
    # Severity weights for different symptoms
    severity_weights = {
        'chest_pain': 30,
        'shortness_of_breath': 25,
        'severe_headache': 20,
        'high_fever': 15,
        'nausea': 10,
        'dizziness': 15,
        'stomach_pain': 10,
        'back_pain': 8,
        'joint_pain': 5,
        'rash': 5,
        'fatigue': 5,
        'cough': 8,
        'sore_throat': 5,
        'swelling': 12
    }
    
    # Calculate base score from symptoms
    for symptom in symptoms:
        base_score += severity_weights.get(symptom, 5)
    
    # Context-based modifiers
    text_lower = text.lower()
    
    # Emergency keywords
    emergency_keywords = ['emergency', 'urgent', 'severe', 'intense', 'unbearable', 'can\'t breathe', 'chest pain']
    for keyword in emergency_keywords:
        if keyword in text_lower:
            base_score += 20
    
    # Duration modifiers
    if any(word in text_lower for word in ['days', 'weeks', 'chronic']):
        base_score += 10
    
    # Intensity modifiers
    if any(word in text_lower for word in ['very', 'extremely', 'really', 'badly']):
        base_score += 15
    
    return min(base_score, 100)  # Cap at 100

def get_medical_advice(symptoms, severity_score, user_profile=None):
    """Generate medical advice based on symptoms and severity"""
    
    if severity_score >= 70:
        advice = "⚠️ **URGENT**: Your symptoms suggest you need immediate medical attention. Please visit the nearest emergency room or call emergency services right away."
        action = "emergency"
    elif severity_score >= 40:
        advice = "🏥 **Doctor Consultation Recommended**: Your symptoms warrant a visit to a healthcare professional. Please schedule an appointment with a doctor soon."
        action = "doctor_visit"
    else:
        advice = "🏠 **Home Care**: Your symptoms appear mild. Try rest, hydration, and over-the-counter remedies. Monitor your condition and seek medical help if symptoms worsen."
        action = "home_remedy"
    
    # Add specific advice based on symptoms
    if 'fever' in symptoms:
        advice += "\n\n🌡️ **Fever Care**: Stay hydrated, rest, and consider fever-reducing medication if temperature is high."
    
    if 'headache' in symptoms:
        advice += "\n\n🧠 **Headache Relief**: Try rest in a dark room, stay hydrated, and consider pain relievers if needed."
    
    if 'cough' in symptoms:
        advice += "\n\n😷 **Cough Care**: Stay hydrated, use throat lozenges, and avoid irritants. See a doctor if persistent."
    
    return advice, action

def get_hospital_specialization(symptoms):
    """Map symptoms to medical specializations"""
    specialization_map = {
        'chest_pain': ['cardiology', 'emergency'],
        'shortness_of_breath': ['pulmonology', 'cardiology', 'emergency'],
        'headache': ['neurology', 'internal medicine'],
        'stomach_pain': ['gastroenterology', 'internal medicine'],
        'back_pain': ['orthopedics', 'neurology'],
        'joint_pain': ['rheumatology', 'orthopedics'],
        'rash': ['dermatology'],
        'fever': ['internal medicine', 'emergency']
    }
    
    specializations = set()
    for symptom in symptoms:
        if symptom in specialization_map:
            specializations.update(specialization_map[symptom])
    
    return list(specializations) if specializations else ['internal medicine']

# Hospital Search and Recommendation
def search_nearby_hospitals(location, radius=5000):
    """Search for nearby hospitals using Google Places API"""
    if not gmaps:
        # Fallback hospital data
        return get_fallback_hospitals()
    
    try:
        # Geocode the location
        geocode_result = gmaps.geocode(location)
        if not geocode_result:
            return get_fallback_hospitals()
        
        lat_lng = geocode_result[0]['geometry']['location']
        
        # Search for hospitals
        places_result = gmaps.places_nearby(
            location=lat_lng,
            radius=radius,
            type='hospital'
        )
        
        hospitals = []
        for place in places_result.get('results', [])[:10]:  # Limit to 10 results
            hospital_details = get_hospital_details(place['place_id'])
            
            hospital = {
                'name': place['name'],
                'rating': place.get('rating', 0),
                'address': place.get('vicinity', ''),
                'distance': calculate_distance(lat_lng, place['geometry']['location']),
                'place_id': place['place_id'],
                'phone': hospital_details.get('phone', ''),
                'website': hospital_details.get('website', ''),
                'opening_hours': hospital_details.get('opening_hours', {}),
                'is_open': hospital_details.get('is_open', None)
            }
            hospitals.append(hospital)
        
        return hospitals
    
    except Exception as e:
        print(f"Error searching hospitals: {e}")
        return get_fallback_hospitals()

def get_hospital_details(place_id):
    """Get detailed information about a hospital"""
    if not gmaps:
        return {}
    
    try:
        details = gmaps.place(place_id, fields=['formatted_phone_number', 'website', 'opening_hours'])
        result = details.get('result', {})
        
        return {
            'phone': result.get('formatted_phone_number', ''),
            'website': result.get('website', ''),
            'opening_hours': result.get('opening_hours', {}),
            'is_open': result.get('opening_hours', {}).get('open_now', None)
        }
    except Exception as e:
        print(f"Error getting hospital details: {e}")
        return {}

def calculate_distance(point1, point2):
    """Calculate distance between two points (simplified)"""
    # This is a simplified calculation - in production, use proper geospatial calculations
    lat_diff = abs(point1['lat'] - point2['lat'])
    lng_diff = abs(point1['lng'] - point2['lng'])
    return round((lat_diff + lng_diff) * 111, 1)  # Rough km conversion

def get_fallback_hospitals():
    """Fallback hospital data when API is not available"""
    return [
        {
            'name': 'City General Hospital',
            'rating': 4.2,
            'address': '123 Main St, Downtown',
            'distance': 2.5,
            'phone': '+1-555-0123',
            'website': 'https://citygeneral.com',
            'is_open': True
        },
        {
            'name': 'Metro Medical Center',
            'rating': 4.5,
            'address': '456 Health Ave, Midtown',
            'distance': 3.8,
            'phone': '+1-555-0456',
            'website': 'https://metromedical.com',
            'is_open': True
        },
        {
            'name': 'Emergency Care Hospital',
            'rating': 4.0,
            'address': '789 Emergency Blvd, Uptown',
            'distance': 5.2,
            'phone': '+1-555-0789',
            'website': 'https://emergencycare.com',
            'is_open': True
        }
    ]

def recommend_hospitals(hospitals, symptoms, severity_score, specializations):
    """Recommend best hospitals based on multiple factors"""
    scored_hospitals = []
    
    for hospital in hospitals:
        score = 0
        
        # Rating score (0-40 points)
        score += hospital.get('rating', 0) * 8
        
        # Distance score (0-30 points, closer is better)
        distance = hospital.get('distance', 10)
        if distance <= 2:
            score += 30
        elif distance <= 5:
            score += 20
        elif distance <= 10:
            score += 10
        
        # Availability score (0-20 points)
        if hospital.get('is_open') is True:
            score += 20
        elif hospital.get('is_open') is None:
            score += 10  # Unknown status
        
        # Emergency capability (0-10 points)
        if severity_score >= 70:
            if 'emergency' in hospital.get('name', '').lower():
                score += 10
        
        hospital['recommendation_score'] = score
        scored_hospitals.append(hospital)
    
    # Sort by score and return top 5
    scored_hospitals.sort(key=lambda x: x['recommendation_score'], reverse=True)
    return scored_hospitals[:5]

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('chat'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'message': 'Email already registered'})
        
        # Create new user
        user = User(
            email=data['email'],
            name=data['name'],
            password_hash=generate_password_hash(data['password'])
        )
        
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        return jsonify({'success': True, 'message': 'Registration successful'})
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        
        user = User.query.filter_by(email=data['email']).first()
        
        if user and check_password_hash(user.password_hash, data['password']):
            login_user(user, remember=data.get('remember', False))
            return jsonify({'success': True, 'message': 'Login successful'})
        else:
            return jsonify({'success': False, 'message': 'Invalid email or password'})
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/chat')
@login_required
def chat():
    return render_template('chat.html', user=current_user)

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html', user=current_user)

@app.route('/api/chat_history')
@login_required
def get_chat_history():
    messages = ChatMessage.query.filter_by(user_id=current_user.id).order_by(ChatMessage.timestamp).all()
    
    history = []
    for msg in messages:
        history.append({
            'id': msg.id,
            'message': msg.message,
            'response': msg.response,
            'severity_score': msg.severity_score,
            'timestamp': msg.timestamp.isoformat()
        })
    
    return jsonify(history)

@app.route('/api/send_message', methods=['POST'])
@login_required
def send_message():
    data = request.get_json()
    user_message = data.get('message', '').strip()
    
    if not user_message:
        return jsonify({'error': 'Message cannot be empty'}), 400
    
    # Extract symptoms and calculate severity
    symptoms = extract_symptoms(user_message)
    severity_score = calculate_severity_score(symptoms, user_message)
    
    # Generate medical advice
    advice, recommended_action = get_medical_advice(symptoms, severity_score, current_user)
    
    # Get hospital recommendations if needed
    hospitals = []
    if severity_score >= 40 or 'hospital' in user_message.lower():
        user_location = current_user.location or "New York, NY"  # Default location
        hospitals = search_nearby_hospitals(user_location)
        
        if hospitals:
            specializations = get_hospital_specialization(symptoms)
            hospitals = recommend_hospitals(hospitals, symptoms, severity_score, specializations)
    
    # Save to database
    chat_message = ChatMessage(
        user_id=current_user.id,
        message=user_message,
        response=advice,
        severity_score=severity_score,
        extracted_symptoms=json.dumps(symptoms)
    )
    db.session.add(chat_message)
    
    # Save consultation record
    consultation = Consultation(
        user_id=current_user.id,
        symptoms=json.dumps(symptoms),
        severity_score=severity_score,
        diagnosis=advice,
        recommended_action=recommended_action,
        recommended_hospitals=json.dumps(hospitals)
    )
    db.session.add(consultation)
    
    db.session.commit()
    
    return jsonify({
        'response': advice,
        'severity_score': severity_score,
        'symptoms': symptoms,
        'recommended_action': recommended_action,
        'hospitals': hospitals,
        'message_id': chat_message.id
    })

@app.route('/api/hospitals')
@login_required
def get_hospitals():
    location = request.args.get('location', current_user.location or 'New York, NY')
    radius = int(request.args.get('radius', 5000))
    
    hospitals = search_nearby_hospitals(location, radius)
    return jsonify(hospitals)

@app.route('/api/upload_document', methods=['POST'])
@login_required
def upload_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Save to database
        document = MedicalDocument(
            user_id=current_user.id,
            filename=filename,
            original_filename=file.filename,
            file_type=file.content_type,
            file_size=os.path.getsize(file_path),
            description=request.form.get('description', '')
        )
        db.session.add(document)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Document uploaded successfully',
            'document_id': document.id
        })

@app.route('/api/update_profile', methods=['POST'])
@login_required
def update_profile():
    data = request.get_json()
    
    current_user.name = data.get('name', current_user.name)
    current_user.age = data.get('age', current_user.age)
    current_user.gender = data.get('gender', current_user.gender)
    current_user.phone = data.get('phone', current_user.phone)
    current_user.location = data.get('location', current_user.location)
    current_user.insurance = data.get('insurance', current_user.insurance)
    
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Profile updated successfully'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
