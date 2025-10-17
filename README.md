# 🏥 MediGuide AI - Intelligent Healthcare Assistant

## 📋 Overview
MediGuide AI is a comprehensive healthcare assistant that combines artificial intelligence with practical healthcare tools to help users:
- Assess symptoms with AI-powered analysis using Google Gemini
- Find nearby hospitals and medical facilities
- Upload and manage medical reports
- Get personalized health recommendations
- Track medical history and consultations

## ✨ Features

### 🤖 AI-Powered Chat Interface
- **Intelligent Symptom Analysis**: Uses Google Gemini AI to evaluate symptoms and provide medical guidance
- **Seriousness Scoring**: Automatically assesses symptom severity (0-100 scale)
- **Personalized Advice**: Considers user profile, age, medical history for tailored recommendations
- **Real-time Chat**: Interactive conversation with typing indicators and message history

### 🏥 Hospital Finder
- **Location-Based Search**: Find nearby hospitals using current location or manual input
- **Detailed Information**: Hospital ratings, contact info, operating hours, and websites
- **Google Maps Integration**: Direct links to maps and directions
- **Real-time Status**: Shows if hospitals are currently open or closed

### 👤 User Management
- **Google OAuth Integration**: Secure authentication with Google accounts
- **Profile Management**: Store personal and medical information
- **Medical History**: Track consultations and health data
- **Privacy Focused**: Secure data handling and user privacy protection

### 📄 Medical Reports
- **File Upload**: Support for PDF, JPG, PNG medical reports
- **Drag & Drop Interface**: Easy file upload with progress indicators
- **File Validation**: Automatic file type and size validation
- **Report Management**: Track uploaded documents and history

## 🛠 Tech Stack

### Backend (FastAPI)
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM for database operations
- **Google Gemini AI**: Advanced AI model for medical advice
- **Google Maps API**: Location services and hospital data
- **JWT Authentication**: Secure token-based authentication
- **SQLite**: Lightweight database for development

### Frontend (React)
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe JavaScript for better development experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: HTTP client for API communication
- **Lucide React**: Beautiful icon library
- **Responsive Design**: Mobile-first, works on all devices

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- Google Cloud Platform account (for API keys)

### 1. Backend Setup
```bash
# Clone and navigate to project
git clone <repository-url>
cd Mini-Project-Medi---Care-

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys (see Environment Variables section)

# Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Security
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=sqlite:///./mediguide.db

# Google APIs
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# AI Services
GEMINI_API_KEY=your_google_gemini_api_key
```

### Getting API Keys

#### Google Gemini AI
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it as `GEMINI_API_KEY` in your `.env` file

#### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API and Places API
3. Create credentials and add as `GOOGLE_MAPS_API_KEY`

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized origins: `http://localhost:3000`
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/google` - Authenticate with Google OAuth token
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile

### Chat Endpoints
- `POST /chat` - Send message to AI assistant
  ```json
  {
    "message": "I have a headache and fever",
    "user_profile": {...}
  }
  ```

### Hospital Endpoints
- `POST /hospitals/nearby` - Find nearby hospitals
  ```json
  {
    "location": "New York, NY",
    "radius": 5000
  }
  ```

### File Upload Endpoints
- `POST /upload-report` - Upload medical report (multipart/form-data)

## 🏗 Project Structure

```
Mini-Project-Medi---Care-/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration settings
├── database.py            # Database models and setup
├── auth.py                # Authentication logic
├── ai_service.py          # AI service integration
├── maps_service.py        # Maps service integration
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── frontend/             # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # React context providers
│   │   ├── services/     # API service functions
│   │   └── App.tsx       # Main application component
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
└── README.md             # This file
```

## 🔒 Security Features
- **JWT Authentication**: Secure token-based authentication
- **Google OAuth**: Industry-standard OAuth 2.0 integration
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS Protection**: Proper CORS configuration for web security
- **File Upload Security**: File type and size validation
- **Environment Variables**: Sensitive data stored securely

## 🚀 Deployment

### Production Deployment
1. **Backend**: Deploy FastAPI using Docker, Heroku, or cloud providers
2. **Frontend**: Build and deploy React app using Netlify, Vercel, or similar
3. **Database**: Use PostgreSQL or cloud database for production
4. **Environment**: Update environment variables for production

### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License.

## 🆘 Support
For support, please create an issue in the GitHub repository or contact the development team.

## 🔮 Future Enhancements
- [ ] Mobile app development (React Native)
- [ ] Advanced AI features (image analysis of medical reports)
- [ ] Telemedicine integration
- [ ] Appointment scheduling
- [ ] Medication reminders
- [ ] Health tracking and analytics
- [ ] Multi-language support
- [ ] Integration with wearable devices
