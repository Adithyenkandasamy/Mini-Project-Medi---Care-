# Medi Care - FastAPI + React Setup

This project has been migrated to use FastAPI backend with React frontend.

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend-react/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx         # Main React app
│   │   └── main.jsx        # React entry point
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite configuration
└── README-FastAPI-React.md  # This file
```

## Quick Start

### 1. Start FastAPI Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API will be available at: http://localhost:8000

### 2. Start React Frontend

```bash
cd frontend-react
npm install
npm run dev
```

The frontend will be available at: http://localhost:3000

## Features

- **FastAPI Backend**: RESTful API with automatic documentation
- **React Frontend**: Modern UI with Vite for fast development
- **Hardcoded Data**: Pre-configured responses for testing
- **Real-time Chat**: Interactive chat interface with typing indicators
- **Hospital Finder**: Integrated hospital recommendations
- **Responsive Design**: Works on desktop and mobile

## API Endpoints

- `GET /` - Welcome message
- `GET /api/user` - Get current user info
- `GET /api/chat/history` - Get chat history
- `POST /api/chat/send` - Send chat message
- `GET /api/hospitals` - Get hospital list
- `POST /api/hospitals/search` - Search hospitals

## Hardcoded Test Data

The application includes hardcoded responses for:
- Headache symptoms
- Fever symptoms  
- Chest pain symptoms
- General health queries

Try typing messages like:
- "I have a headache"
- "I'm running a fever"
- "I have chest pain"
- "I feel unwell"

## Development

- Backend runs on port 8000
- Frontend runs on port 3000
- CORS is configured for cross-origin requests
- Hot reload enabled for both frontend and backend
