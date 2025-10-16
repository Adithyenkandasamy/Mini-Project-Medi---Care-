# MediGuide - Medical Advisory Platform

A full-stack web application that provides AI-powered medical advice, symptom analysis, hospital finder, and medical report management.

## Features

- 🔐 **Google OAuth2 Authentication** - Secure login with Google account
- 👤 **Profile Management** - Collect user information (age, gender, phone, location)
- 🤖 **AI Medical Chatbot** - Get medical advice using Gemini or OpenAI API
- 📊 **Seriousness Evaluation** - Automatic symptom severity scoring (0-100%)
- 🏥 **Hospital Finder** - Find nearby hospitals with real-time open/closed status
- 📁 **Report Upload** - Upload and manage medical reports (PDF, images, documents)
- 📜 **Chat History** - View past conversations and severity scores
- 💬 **Real-time Chat Interface** - Interactive medical advisory chat

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database management
- **SQLite** - Lightweight database
- **Google OAuth2** - Authentication
- **Gemini/OpenAI API** - AI-powered medical advice
- **Google Maps API** - Hospital location services

### API Features
- **RESTful API** - Clean, well-documented endpoints
- **OpenAPI/Swagger** - Interactive API documentation
- **JWT Authentication** - Secure token-based auth

## Installation

### Prerequisites
- Python 3.8+
- Google Cloud Console account (for OAuth2 and Maps API)
- Gemini API key or OpenAI API key

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Mini-Project-Medi---Care-
```

### Step 2: Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 3: Install Dependencies

**Using uv (Recommended):**
```bash
uv sync
```

**Or using pip:**
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your API keys:
```env
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback

# AI API Keys (Choose one or both)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Application Settings
SECRET_KEY=your_secret_key_for_jwt_here
DATABASE_URL=sqlite:///./mediguide.db
UPLOAD_DIR=uploads/reports
```

### Step 5: Set Up Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:8000/auth/callback`
7. Copy Client ID and Client Secret to `.env`

### Step 6: Get API Keys

**For Gemini API:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to `.env` as `GEMINI_API_KEY`

**For OpenAI API:**
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key
3. Add to `.env` as `OPENAI_API_KEY`

**For Google Maps API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Places API" and "Geocoding API"
3. Create API key in Credentials
4. Add to `.env` as `GOOGLE_MAPS_API_KEY`

### Step 7: Generate Secret Key
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
Copy the output to `SECRET_KEY` in `.env`

## Running the Application

### Using uv (Recommended)
```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Using Python directly
```bash
python main.py
```

### Using uvicorn
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Root**: `http://localhost:8000`
- **API Documentation (Swagger)**: `http://localhost:8000/docs`
- **API Documentation (ReDoc)**: `http://localhost:8000/redoc`

## Project Structure

```
Mini-Project-Medi---Care-/
├── main.py                 # FastAPI application and routes
├── config.py              # Configuration and settings
├── database.py            # Database models and setup
├── auth.py                # Authentication logic
├── ai_service.py          # AI integration (Gemini/OpenAI)
├── maps_service.py        # Google Maps integration
├── requirements.txt       # Python dependencies
├── pyproject.toml         # Project configuration for uv
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── uploads/              # Uploaded medical reports
    └── reports/
```

## Database Schema

### Users Table
- `id` - Primary key
- `email` - User email (unique)
- `name` - User full name
- `profile_image` - Profile picture URL
- `google_id` - Google account ID
- `age` - User age
- `gender` - User gender
- `phone` - Phone number
- `location_preference` - Preferred location
- `profile_completed` - Profile completion status
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Chats Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `message` - User's message
- `response` - AI response
- `seriousness_score` - Symptom severity score (0-100)
- `timestamp` - Chat timestamp

### Reports Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `filename` - Original filename
- `filepath` - Stored file path
- `file_size` - File size in bytes
- `uploaded_at` - Upload timestamp

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth2 login
- `GET /auth/callback` - OAuth2 callback handler

### Profile
- `POST /api/setup-profile` - Complete user profile
- `GET /api/profile` - Get current user profile

### Chat
- `POST /api/chat` - Send message and get AI response
- `GET /api/chat/history` - Get chat history

### Reports
- `POST /api/upload-report` - Upload medical report
- `GET /api/reports` - Get user's uploaded reports

### Hospitals
- `POST /api/nearby-hospitals` - Find nearby hospitals

### Health
- `GET /api/health` - Health check endpoint

## API Usage Guide

### Authentication Flow
1. **GET /auth/google** - Get Google OAuth2 authorization URL
2. **GET /auth/callback?code=...** - Exchange code for JWT token
3. Use the JWT token in `Authorization: Bearer <token>` header for all subsequent requests

### Example API Calls

**1. Setup Profile:**
```bash
curl -X POST http://localhost:8000/api/setup-profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"age": 30, "gender": "Male", "phone": "+1234567890", "location_preference": "New York, NY"}'
```

**2. Chat with AI:**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "I have a headache and fever"}'
```

**3. Find Nearby Hospitals:**
```bash
curl -X POST http://localhost:8000/api/nearby-hospitals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"location": "New York, NY", "radius": 5000}'
```

**4. Upload Medical Report:**
```bash
curl -X POST http://localhost:8000/api/upload-report \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/report.pdf"
```

Visit `http://localhost:8000/docs` for interactive API documentation.

## Security Features

- JWT-based authentication
- Secure password hashing (if extended)
- Environment variable protection
- CORS middleware configuration
- Input validation with Pydantic

## Disclaimer

⚠️ **Important**: MediGuide provides general health information and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Acknowledgments

- FastAPI for the excellent web framework
- Google for OAuth2, Maps, and Gemini APIs
- OpenAI for GPT models
- The open-source community