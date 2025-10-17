import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import googlemaps
import google.generativeai as genai
from datetime import datetime

# Load environment variables
import dotenv
dotenv.load_dotenv()

app = FastAPI(title="Medi Care API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')

# Initialize Google Maps client
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY) if GOOGLE_MAPS_API_KEY else None

# Pydantic models
class HospitalSearchRequest(BaseModel):
    specialty: str

class LocationRequest(BaseModel):
    latitude: float
    longitude: float

class AddressRequest(BaseModel):
    address: str

class ChatRequest(BaseModel):
    message: str
    user_location: Optional[Dict[str, float]] = None
    user_id: Optional[str] = "user123"  # Default user ID

class ChatMessage(BaseModel):
    id: str
    user_id: str
    message: str
    response: str
    severity_score: int
    timestamp: str
    hospitals: List[Dict] = []

class ChatResponse(BaseModel):
    id: str
    message: str
    response: str
    severity_score: int
    timestamp: str
    hospitals: Optional[List[dict]] = None

def get_nearby_hospitals_for_chat(latitude: float, longitude: float, limit: int = 3):
    """Get nearby hospitals for chat recommendations"""
    try:
        if not gmaps:
            return []
        
        # Search for hospitals near the location
        places_result = gmaps.places_nearby(
            location=(latitude, longitude),
            radius=10000,  # 10km radius
            type='hospital'
        )
        
        hospitals = []
        for place in places_result.get('results', [])[:limit]:
            hospital = {
                'name': place.get('name', 'Unknown Hospital'),
                'address': place.get('vicinity', 'Address not available'),
                'rating': place.get('rating', 0),
                'distance': calculate_distance(
                    latitude, longitude,
                    place['geometry']['location']['lat'],
                    place['geometry']['location']['lng']
                )
            }
            hospitals.append(hospital)
        
        return hospitals
    except Exception as e:
        return []

def analyze_symptoms_with_gemini(symptoms: str, user_location: dict = None):
    """Analyze symptoms using Gemini AI and provide medical advice"""
    try:
        # Enhanced medical AI doctor prompt
        location_context = ""
        if user_location:
            location_context = f"The patient is located at coordinates: {user_location['latitude']}, {user_location['longitude']}. Include nearby hospital recommendations in your response."
        else:
            location_context = "Ask the patient for their location to provide nearby hospital recommendations."
        
        # Check if user is asking about hospitals in a specific location
        symptoms_lower = symptoms.lower()
        if any(word in symptoms_lower for word in ['hospital', 'hospitals']) and any(city in symptoms_lower for city in ['coimbatore', 'chennai', 'bangalore', 'mumbai', 'delhi']):
            # Extract city name
            city = None
            for c in ['coimbatore', 'chennai', 'bangalore', 'mumbai', 'delhi']:
                if c in symptoms_lower:
                    city = c.title()
                    break
            
            # Return specific hospital recommendations for the city
            if city == 'Coimbatore':
                return {
                    'response': f"""Top hospitals in {city}:

1. **Kovai Medical Center (KMCH)**
   📍 Avinashi Road, Coimbatore
   📞 0422-4324324
   ⭐ Multi-specialty hospital with 24/7 emergency

2. **PSG Hospitals**
   📍 Peelamedu, Coimbatore  
   📞 0422-2570170
   ⭐ Teaching hospital with all departments

3. **Ganga Hospital**
   📍 313, Mettupalayam Road, Coimbatore
   📞 0422-2485000
   ⭐ Specialized in orthopedics and trauma

4. **Sri Ramakrishna Hospital**
   📍 395, Sidhapudur, Coimbatore
   📞 0422-2320100
   ⭐ Multi-specialty with advanced facilities

Note: This is AI guidance. Consult a healthcare provider.""",
                    'severity_score': 30,
                    'hospitals': [],
                    'timestamp': datetime.now().strftime("%I:%M %p")
                }
        
        prompt = f"""
        You are Dr. MediCare AI. A patient said: "{symptoms}"
        
        Keep responses SHORT (2-3 sentences max):
        
        1. If symptoms: Brief advice + 1 question
        2. If hospitals: Ask for specific location
        3. Be direct and helpful
        
        {location_context}
        
        End with: "Note: This is AI guidance. Consult a healthcare provider."
        """
        
        response = model.generate_content(prompt)
        ai_response = response.text
        
        # Enhanced severity score extraction
        severity_score = 30  # default
        symptoms_lower = symptoms.lower()
        
        # Emergency symptoms (80-100)
        if any(word in symptoms_lower for word in ['chest pain', 'difficulty breathing', 'shortness of breath', 'severe headache', 'stroke', 'heart attack', 'unconscious', 'bleeding heavily']):
            severity_score = 90
        elif any(word in symptoms_lower for word in ['severe', 'emergency', 'can\'t breathe', 'crushing pain', 'sudden onset']):
            severity_score = 80
        # High priority symptoms (60-79)
        elif any(word in symptoms_lower for word in ['high fever', 'vomiting blood', 'severe pain', 'confusion', 'seizure']):
            severity_score = 70
        elif any(word in symptoms_lower for word in ['fever', 'vomiting', 'severe nausea', 'intense pain']):
            severity_score = 60
        # Moderate symptoms (40-59)
        elif any(word in symptoms_lower for word in ['pain', 'nausea', 'headache', 'dizziness', 'fatigue']):
            severity_score = 50
        elif any(word in symptoms_lower for word in ['cough', 'cold', 'sore throat', 'runny nose']):
            severity_score = 40
        # Mild symptoms (20-39)
        elif any(word in symptoms_lower for word in ['mild', 'slight', 'minor', 'little']):
            severity_score = 25
            
        # Get nearby hospitals if location provided
        hospitals = []
        if user_location and 'latitude' in user_location and 'longitude' in user_location:
            hospitals = get_nearby_hospitals_for_chat(
                user_location['latitude'], 
                user_location['longitude']
            )
            
            # Add hospital recommendations when location is provided
            if hospitals:
                hospital_text = "\n\nNearby hospitals:\n"
                for i, hospital in enumerate(hospitals[:3], 1):  # Limit to 3 hospitals
                    hospital_text += f"{i}. {hospital['name']} ({hospital['distance']:.1f}km)\n"
                    hospital_text += f"   {hospital['address']}\n"
                
                ai_response += hospital_text
        
        return {
            'response': ai_response,
            'severity_score': severity_score,
            'hospitals': hospitals,
            'timestamp': datetime.now().strftime("%I:%M %p")
        }
        
    except Exception as e:
        # Fallback response
        return {
            'response': f"""Hello! I'm Dr. MediCare AI. How are you feeling today? What's bringing you here - are you experiencing any symptoms or health concerns I can help you with?

If you'd like me to recommend hospitals in your area, just let me know your location and I'll find some good options nearby.

Please note: This is AI-generated medical guidance for informational purposes only. Always consult a licensed healthcare provider for proper medical evaluation.""",
            'severity_score': 30,
            'hospitals': [],
            'timestamp': datetime.now().strftime("%I:%M %p")
        }

class User(BaseModel):
    id: str
    name: str
    email: str

# In-memory chat storage (replace with database in production)
chat_storage = {}

# Hardcoded data for testing
HARDCODED_RESPONSES = {
    "headache": {
        "response": "Based on your headache symptoms, here's what I recommend:\n\n🧠 **Assessment**: Headaches can have various causes including stress, dehydration, or tension.\n\n💡 **Immediate Care**:\n- Rest in a dark, quiet room\n- Stay hydrated with water\n- Apply a cold or warm compress\n- Consider over-the-counter pain relievers if needed\n\n⚠️ **Seek medical attention if**:\n- Severe or sudden onset\n- Accompanied by fever, stiff neck, or vision changes\n- Persistent for more than 24 hours\n\n📍 Would you like me to find nearby hospitals or clinics?",
        "severity_score": 25
    },
    "fever": {
        "response": "I understand you're experiencing fever. Here's my assessment:\n\n🌡️ **Fever Management**:\n- Monitor your temperature regularly\n- Stay hydrated with plenty of fluids\n- Rest and avoid strenuous activities\n- Use fever-reducing medications as needed\n\n🚨 **Seek immediate care if**:\n- Temperature above 103°F (39.4°C)\n- Difficulty breathing\n- Persistent vomiting\n- Signs of dehydration\n\n🏥 **Recommendation**: Consider consulting a healthcare provider if fever persists for more than 3 days.",
        "severity_score": 45
    },
    "chest pain": {
        "response": "⚠️ **URGENT ATTENTION NEEDED**\n\nChest pain requires immediate medical evaluation.\n\n🚨 **Immediate Actions**:\n- Stop any physical activity\n- Sit down and rest\n- If you have prescribed nitroglycerin, take as directed\n- Call emergency services if pain is severe\n\n📞 **Call 911 immediately if experiencing**:\n- Crushing or squeezing chest pain\n- Pain radiating to arm, jaw, or back\n- Shortness of breath\n- Nausea or sweating\n\n🏥 **I strongly recommend visiting the nearest emergency room immediately.**",
        "severity_score": 85
    },
    "default": {
        "response": "Thank you for sharing your symptoms with Medi Care. Based on your description, here's my assessment:\n\n🔍 **General Recommendations**:\n- Monitor your symptoms closely\n- Stay hydrated and get adequate rest\n- Maintain a healthy diet\n- Avoid strenuous activities if feeling unwell\n\n💡 **When to seek care**:\n- If symptoms worsen or persist\n- If you develop new concerning symptoms\n- If you have any doubts about your condition\n\n⚠️ **Disclaimer**: This is AI-generated guidance, not a medical diagnosis. Please consult a healthcare professional for proper evaluation.\n\nWould you like me to help you find nearby healthcare facilities?",
        "severity_score": 30
    }
}

HARDCODED_HOSPITALS = [
    {
        "id": "1",
        "name": "City General Hospital",
        "address": "123 Main Street, Downtown",
        "phone": "+1-555-0123",
        "rating": 4.5,
        "distance": "2.3 km",
        "specialties": ["Emergency Care", "Cardiology", "Internal Medicine"],
        "is_open": True
    },
    {
        "id": "2", 
        "name": "Medi Care Medical Center",
        "address": "456 Health Avenue, Medical District",
        "phone": "+1-555-0456",
        "rating": 4.8,
        "distance": "3.1 km",
        "specialties": ["Family Medicine", "Pediatrics", "Orthopedics"],
        "is_open": True
    },
    {
        "id": "3",
        "name": "Emergency Care Clinic",
        "address": "789 Urgent Way, Central Area",
        "phone": "+1-555-0789",
        "rating": 4.2,
        "distance": "1.8 km",
        "specialties": ["Emergency Care", "Urgent Care", "Radiology"],
        "is_open": False
    }
]

# In-memory storage for demo
chat_history = []
current_user = {
    "id": "user123",
    "name": "Adithyen",
    "email": "adithyen@gmail.com"
}

@app.get("/")
async def root():
    return {"message": "Welcome to Medi Care API"}

@app.get("/api/user")
async def get_user():
    return current_user

@app.get("/api/chat/history/{user_id}")
async def get_chat_history(user_id: str):
    """Get chat history for a specific user"""
    user_chats = chat_storage.get(user_id, [])
    return {"history": user_chats}

@app.post("/api/chat/send")
async def send_chat_message(request: ChatRequest):
    """Send a chat message and get AI response"""
    try:
        # Get AI response using Gemini
        ai_result = analyze_symptoms_with_gemini(request.message, request.user_location)
        
        # Create chat response with proper timestamp
        current_time = datetime.now()
        chat_response = {
            "id": f"chat_{current_time.strftime('%Y%m%d_%H%M%S')}",
            "user_id": request.user_id,
            "message": request.message,
            "response": ai_result['response'],
            "severity_score": ai_result['severity_score'],
            "timestamp": current_time.isoformat(),
            "hospitals": ai_result.get('hospitals', [])
        }
        
        # Store chat in memory (persistent across sessions)
        user_id = request.user_id
        if user_id not in chat_storage:
            chat_storage[user_id] = []
        chat_storage[user_id].append(chat_response)
        
        return chat_response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat message: {str(e)}")
        return chat_response

@app.get("/api/hospitals")
async def get_hospitals():
    return {"hospitals": HARDCODED_HOSPITALS}

@app.post("/api/hospitals/search")
async def search_hospitals(request: HospitalSearchRequest):
    # Filter hospitals by specialty (hardcoded for demo)
    filtered_hospitals = [
        hospital for hospital in HARDCODED_HOSPITALS 
        if request.specialty.lower() in [spec.lower() for spec in hospital["specialties"]]
    ]
    
    return {"hospitals": filtered_hospitals}

def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = (math.sin(delta_lat / 2) * math.sin(delta_lat / 2) +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(delta_lng / 2) * math.sin(delta_lng / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return round(distance, 1)

@app.post("/api/hospitals/nearby")
async def find_nearby_hospitals(request: LocationRequest):
    """Find hospitals near given coordinates using Google Maps API"""
    if not gmaps:
        raise HTTPException(status_code=500, detail="Google Maps API not configured")
    
    try:
        # Search for hospitals near the given location
        places_result = gmaps.places_nearby(
            location=(request.latitude, request.longitude),
            radius=5000,  # 5km radius
            type='hospital'
        )
        
        hospitals = []
        for place in places_result.get('results', [])[:2]:  # Get top 2 results
            # Get place details for more information
            place_details = gmaps.place(place['place_id'], fields=[
                'name', 'formatted_address', 'formatted_phone_number', 
                'rating', 'opening_hours', 'geometry'
            ])
            
            details = place_details.get('result', {})
            location = details.get('geometry', {}).get('location', {})
            
            hospital = {
                "id": place['place_id'],
                "name": details.get('name', place.get('name', 'Unknown Hospital')),
                "address": details.get('formatted_address', place.get('vicinity', 'Address not available')),
                "phone": details.get('formatted_phone_number', 'Contact for phone'),
                "rating": details.get('rating', place.get('rating', 4.0)),
                "distance": f"{calculate_distance(request.latitude, request.longitude, location.get('lat', 0), location.get('lng', 0))} km",
                "specialties": ["General Medicine", "Emergency Care"],
                "is_open": details.get('opening_hours', {}).get('open_now', True)
            }
            hospitals.append(hospital)
        
        return {"hospitals": hospitals}
        
    except Exception as e:
        # Fallback to simulated data if API fails
        fallback_hospitals = [
            {
                "id": "fallback1",
                "name": "City General Hospital",
                "address": f"Near {request.latitude:.2f}, {request.longitude:.2f}",
                "phone": "+1-555-0123",
                "rating": 4.6,
                "distance": "1.2 km",
                "specialties": ["Emergency Care", "Cardiology"],
                "is_open": True
            },
            {
                "id": "fallback2",
                "name": "Regional Medical Center",
                "address": f"Near {request.latitude:.2f}, {request.longitude:.2f}",
                "phone": "+1-555-0456",
                "rating": 4.3,
                "distance": "2.8 km",
                "specialties": ["Internal Medicine", "Pediatrics"],
                "is_open": True
            }
        ]
        return {"hospitals": fallback_hospitals}

@app.post("/api/hospitals/by-address")
async def find_hospitals_by_address(request: AddressRequest):
    """Find hospitals near given address using Google Maps API"""
    if not gmaps:
        raise HTTPException(status_code=500, detail="Google Maps API not configured")
    
    try:
        # Geocode the address to get coordinates
        geocode_result = gmaps.geocode(request.address)
        if not geocode_result:
            raise HTTPException(status_code=400, detail="Address not found")
        
        location = geocode_result[0]['geometry']['location']
        lat, lng = location['lat'], location['lng']
        
        # Use the coordinates to find nearby hospitals
        location_request = LocationRequest(latitude=lat, longitude=lng)
        return await find_nearby_hospitals(location_request)
        
    except Exception as e:
        # Fallback to simulated data
        fallback_hospitals = [
            {
                "id": "addr1",
                "name": f"{request.address} General Hospital",
                "address": f"123 Medical Drive, {request.address}",
                "phone": "+1-555-0789",
                "rating": 4.4,
                "distance": "0.8 km",
                "specialties": ["Family Medicine", "Emergency Care"],
                "is_open": True
            },
            {
                "id": "addr2",
                "name": f"{request.address} Medical Center",
                "address": f"456 Health Avenue, {request.address}",
                "phone": "+1-555-0321",
                "rating": 4.1,
                "distance": "1.5 km",
                "specialties": ["Urgent Care", "Radiology"],
                "is_open": True
            }
        ]
        return {"hospitals": fallback_hospitals}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
