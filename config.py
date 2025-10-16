from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Google OAuth2
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/callback"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # AI API Key
    GEMINI_API_KEY: str
    
    # Google Maps API
    GOOGLE_MAPS_API_KEY: str
    
    # Application Settings
    SECRET_KEY: str
    DATABASE_URL: str = "sqlite:///./mediguide.db"  # SQLite by default, can use PostgreSQL
    UPLOAD_DIR: str = "uploads/reports"
    
    # JWT Settings
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
