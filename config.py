from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Google OAuth2
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/callback"
    
    # AI API Keys
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    # Google Maps API
    GOOGLE_MAPS_API_KEY: str
    
    # Application Settings
    SECRET_KEY: str
    DATABASE_URL: str = "sqlite:///./mediguide.db"
    UPLOAD_DIR: str = "uploads/reports"
    
    # JWT Settings
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
