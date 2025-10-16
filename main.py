from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os
import shutil
from datetime import datetime
from google_auth_oauthlib.flow import Flow

from database import get_db, init_db, User, Chat, Report
from auth import create_access_token, get_current_user, verify_google_token
from ai_service import ai_service
from maps_service import maps_service
from config import get_settings

settings = get_settings()

# Initialize FastAPI app
app = FastAPI(
    title="MediGuide API", 
    description="Medical Advisory Platform - Backend API", 
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    print("✓ Database initialized")
    print("✓ MediGuide API is ready")
    print(f"✓ API Documentation: http://localhost:8000/docs")

# Pydantic models
class ProfileSetup(BaseModel):
    age: int
    gender: str
    phone: str
    location_preference: str

class ChatRequest(BaseModel):
    message: str

class HospitalRequest(BaseModel):
    location: Optional[str] = None
    radius: Optional[int] = 5000

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Welcome to MediGuide API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/api/health"
    }

# Google OAuth2 Routes
@app.get("/auth/google")
async def google_login():
    """Redirect to Google OAuth2 login"""
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
            }
        },
        scopes=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    
    return {"authorization_url": authorization_url, "state": state}

@app.get("/auth/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    """Handle Google OAuth2 callback - Returns JWT token"""
    try:
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
                }
            },
            scopes=[
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile"
            ]
        )
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        flow.fetch_token(code=code)
        
        credentials = flow.credentials
        user_info = verify_google_token(credentials.token)
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to verify Google token")
        
        # Check if user exists
        user = db.query(User).filter(User.email == user_info['email']).first()
        
        if not user:
            # Create new user
            user = User(
                email=user_info['email'],
                name=user_info.get('name', ''),
                profile_image=user_info.get('picture', ''),
                google_id=user_info['id']
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")

# Profile Setup Route
@app.post("/api/setup-profile")
async def setup_profile(
    profile: ProfileSetup,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Setup user profile with age, gender, phone, and location"""
    current_user.age = profile.age
    current_user.gender = profile.gender
    current_user.phone = profile.phone
    current_user.location_preference = profile.location_preference
    current_user.profile_completed = True
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Profile setup completed successfully",
        "user": {
            "name": current_user.name,
            "email": current_user.email,
            "age": current_user.age,
            "gender": current_user.gender,
            "phone": current_user.phone,
            "location_preference": current_user.location_preference
        }
    }

# Get current user profile
@app.get("/api/profile")
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

# Chatbot Route
@app.post("/api/chat")
async def chat(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chat with AI for medical advice and get seriousness score"""
    # Get user profile for context
    user_profile = {
        "age": current_user.age,
        "gender": current_user.gender,
        "location_preference": current_user.location_preference
    }
    
    # Evaluate seriousness
    seriousness_score = ai_service.evaluate_seriousness(chat_request.message)
    
    # Get medical advice
    response_text = ai_service.get_medical_advice(chat_request.message, user_profile)
    
    # Save chat to database
    chat_entry = Chat(
        user_id=current_user.id,
        message=chat_request.message,
        response=response_text,
        seriousness_score=seriousness_score
    )
    db.add(chat_entry)
    db.commit()
    
    return {
        "message": chat_request.message,
        "response": response_text,
        "seriousness_score": seriousness_score,
        "timestamp": chat_entry.timestamp.isoformat()
    }

# Get chat history
@app.get("/api/chat/history")
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's chat history"""
    chats = db.query(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.timestamp.desc()).limit(50).all()
    
    return {
        "chats": [
            {
                "id": chat.id,
                "message": chat.message,
                "response": chat.response,
                "seriousness_score": chat.seriousness_score,
                "timestamp": chat.timestamp.isoformat()
            }
            for chat in chats
        ]
    }

# File Upload Route
@app.post("/api/upload-report")
async def upload_report(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload medical report file"""
    # Validate file type
    allowed_extensions = {'.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Create unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{current_user.id}_{timestamp}_{file.filename}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Save file
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get file size
    file_size = os.path.getsize(filepath)
    
    # Save to database
    report = Report(
        user_id=current_user.id,
        filename=file.filename,
        filepath=filepath,
        file_size=file_size
    )
    db.add(report)
    db.commit()
    
    return {
        "message": "Report uploaded successfully",
        "filename": file.filename,
        "file_size": file_size,
        "uploaded_at": report.uploaded_at.isoformat()
    }

# Get user's uploaded reports
@app.get("/api/reports")
async def get_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's uploaded reports"""
    reports = db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.uploaded_at.desc()).all()
    
    return {
        "reports": [
            {
                "id": report.id,
                "filename": report.filename,
                "file_size": report.file_size,
                "uploaded_at": report.uploaded_at.isoformat()
            }
            for report in reports
        ]
    }

# Nearby Hospitals Route
@app.post("/api/nearby-hospitals")
async def nearby_hospitals(
    request: HospitalRequest,
    current_user: User = Depends(get_current_user)
):
    """Find nearby hospitals using Google Maps API"""
    # Use user's location preference if not provided
    location = request.location or current_user.location_preference
    
    if not location:
        raise HTTPException(status_code=400, detail="Location is required")
    
    hospitals = maps_service.find_nearby_hospitals(location, request.radius)
    
    return {
        "location": location,
        "hospitals": hospitals,
        "count": len(hospitals)
    }

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
