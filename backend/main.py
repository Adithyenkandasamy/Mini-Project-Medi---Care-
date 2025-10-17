from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime
import json

app = FastAPI(title="Medi Care API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    id: str
    message: str
    response: str
    severity_score: int
    timestamp: str
    hospitals: Optional[List[dict]] = None

class User(BaseModel):
    id: str
    name: str
    email: str

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

@app.get("/api/chat/history")
async def get_chat_history():
    return {"history": chat_history}

@app.post("/api/chat/send", response_model=ChatResponse)
async def send_message(message: ChatMessage):
    user_message = message.message.lower().strip()
    
    # Simple keyword matching for hardcoded responses
    response_data = HARDCODED_RESPONSES["default"]
    
    if any(keyword in user_message for keyword in ["headache", "head pain", "migraine"]):
        response_data = HARDCODED_RESPONSES["headache"]
    elif any(keyword in user_message for keyword in ["fever", "temperature", "hot"]):
        response_data = HARDCODED_RESPONSES["fever"]
    elif any(keyword in user_message for keyword in ["chest pain", "chest hurt", "heart"]):
        response_data = HARDCODED_RESPONSES["chest pain"]
    
    # Create response
    chat_response = ChatResponse(
        id=f"msg_{len(chat_history) + 1}",
        message=message.message,
        response=response_data["response"],
        severity_score=response_data["severity_score"],
        timestamp=datetime.now().isoformat(),
        hospitals=HARDCODED_HOSPITALS if response_data["severity_score"] >= 40 else None
    )
    
    # Add to history
    chat_history.append(chat_response.dict())
    
    return chat_response

@app.get("/api/hospitals")
async def get_hospitals():
    return {"hospitals": HARDCODED_HOSPITALS}

@app.post("/api/hospitals/search")
async def search_hospitals(query: dict):
    # Return filtered hospitals based on query
    location = query.get("location", "")
    specialty = query.get("specialty", "")
    
    filtered_hospitals = HARDCODED_HOSPITALS
    
    if specialty:
        filtered_hospitals = [
            h for h in filtered_hospitals 
            if any(specialty.lower() in s.lower() for s in h["specialties"])
        ]
    
    return {"hospitals": filtered_hospitals}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
