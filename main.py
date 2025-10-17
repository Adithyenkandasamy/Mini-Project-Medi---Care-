from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import services
from ai_service import ai_service
from maps_service import maps_service
from auth import verify_google_token, create_access_token, get_current_user
from database import get_db, init_db, User, Chat, Report

app = FastAPI(title="MediGuide AI", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    user_profile: Optional[dict] = None

class ChatResponse(BaseModel):
    response: str
    seriousness_score: float
    request_report: bool
    suggest_hospital: bool

class HospitalRequest(BaseModel):
    location: str
    radius: Optional[int] = 5000

class GoogleAuthRequest(BaseModel):
    token: str

class UserProfile(BaseModel):
    name: str
    email: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    location_preference: Optional[str] = None

@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {"message": "MediGuide AI Backend", "status": "running"}

@app.post("/auth/google")
async def google_auth(auth_request: GoogleAuthRequest):
    """Authenticate user with Google token"""
    user_info = verify_google_token(auth_request.token)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Create or get user from database
    db = next(get_db())
    user = db.query(User).filter(User.email == user_info["email"]).first()
    
    if not user:
        user = User(
            email=user_info["email"],
            name=user_info.get("name", ""),
            profile_image=user_info.get("picture", ""),
            google_id=user_info.get("sub", "")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create access token
    access_token = create_access_token({"user_id": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "profile_image": user.profile_image,
            "profile_completed": user.profile_completed
        }
    }

@app.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "profile_image": current_user.profile_image,
        "age": current_user.age,
        "gender": current_user.gender,
        "phone": current_user.phone,
        "location_preference": current_user.location_preference,
        "profile_completed": current_user.profile_completed
    }

@app.put("/profile")
async def update_profile(
    profile: UserProfile,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update user profile"""
    current_user.name = profile.name
    current_user.age = profile.age
    current_user.gender = profile.gender
    current_user.phone = profile.phone
    current_user.location_preference = profile.location_preference
    current_user.profile_completed = True
    
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Profile updated successfully"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Process chat message and return AI response"""
    
    # Get user profile for context
    user_profile = {
        "age": current_user.age,
        "gender": current_user.gender,
        "phone": current_user.phone,
        "location_preference": current_user.location_preference,
        "blood_group": current_user.blood_group,
        "height": current_user.height,
        "weight": current_user.weight,
        "allergies": current_user.allergies,
        "chronic_conditions": current_user.chronic_conditions,
        "current_medications": current_user.current_medications
    }
    
    # Evaluate seriousness and get AI response
    seriousness_score = ai_service.evaluate_seriousness(chat_request.message)
    response_text = ai_service.get_medical_advice(chat_request.message, user_profile)
    
    # Determine if report upload or hospital search is needed
    request_report = any(word in chat_request.message.lower() for word in ['report', 'upload', 'scan', 'lab'])
    suggest_hospital = seriousness_score > 60 or 'hospital' in response_text.lower()
    
    # Save chat to database
    chat_entry = Chat(
        user_id=current_user.id,
        message=chat_request.message,
        response=response_text,
        seriousness_score=seriousness_score
    )
    db.add(chat_entry)
    db.commit()
    
    return ChatResponse(
        response=response_text,
        seriousness_score=seriousness_score,
        request_report=request_report,
        suggest_hospital=suggest_hospital
    )

@app.post("/hospitals/nearby")
async def get_nearby_hospitals(
    hospital_request: HospitalRequest,
    current_user: User = Depends(get_current_user)
):
    """Get nearby hospitals using Maps API"""
    hospitals = maps_service.find_nearby_hospitals(
        hospital_request.location,
        hospital_request.radius
    )
    
    return {
        "location": hospital_request.location,
        "hospitals": hospitals,
        "count": len(hospitals)
    }

@app.post("/upload-report")
async def upload_report(
    # File upload will be handled separately
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Upload medical report"""
    # This endpoint would handle file uploads
    # For now, return a placeholder response
    return {"message": "Report upload endpoint - implement file handling"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
