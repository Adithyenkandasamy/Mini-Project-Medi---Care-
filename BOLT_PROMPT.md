# MediGuide Frontend - Bolt.new Prompt

Create a modern, clean medical advisory web application frontend with the following specifications:

## Design Requirements

### Theme & Style
- Modern, clean medical/healthcare theme
- Color scheme: Primary blue (#4F46E5), white backgrounds, soft gradients
- Professional medical aesthetic with calming colors
- Fully responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Glass morphism effects for cards

### Pages & Components

#### 1. Login Page
- Clean landing page with MediGuide branding
- **"Sign in with Google" button** (prominent, centered)
  - **IMPORTANT**: Button should redirect to: `http://localhost:8000/auth/google`
  - Example: `<button onClick={() => window.location.href = 'http://localhost:8000/auth/google'}>Sign in with Google</button>`
- Feature highlights (4 cards):
  - 🤖 AI-Powered Medical Advice
  - 🏥 Find Nearby Hospitals
  - 📊 Symptom Severity Analysis
  - 📁 Upload Medical Reports
- Medical disclaimer at bottom
- Background: Subtle medical-themed gradient or pattern

**CRITICAL**: Create a `/callback` route in your frontend to handle OAuth response:
```javascript
// /callback page
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  
  if (code) {
    fetch(`http://localhost:8000/auth/callback?${window.location.search.slice(1)}`)
      .then(r => r.json())
      .then(data => {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_name', data.user.name);
        localStorage.setItem('user_email', data.user.email);
        localStorage.setItem('profile_image', data.user.profile_image);
        
        if (!data.user.profile_completed) {
          window.location.href = '/profile-setup';
        } else {
          window.location.href = '/dashboard';
        }
      });
  }
}, []);
```

#### 2. Profile Setup Page
- Form to collect:
  - Age (number input)
  - Gender (dropdown: Male, Female, Other, Prefer not to say)
  - Phone number (tel input with validation)
  - Location preference (text input with placeholder: "City, State")
- Clean form design with proper validation
- Progress indicator
- "Complete Setup" button

#### 3. Dashboard (Main App)
- **Sidebar Navigation:**
  - 💬 Chat
  - 🏥 Nearby Hospitals
  - 📁 My Reports
  - 📜 Chat History
  - 👤 Profile
  
- **Top Navigation Bar:**
  - MediGuide logo
  - User profile image (circular, from Google)
  - User name
  - Logout button

#### 4. Chat Interface
- **IMPORTANT:** Each user has their own isolated chat - chats are user-specific
- When user logs in, load their previous chat history automatically
- Clean chat UI with message bubbles
- User messages: Right-aligned, blue background
- AI responses: Left-aligned, white background with border
- **Seriousness Score Badge:**
  - 0-30%: Green badge "Minor"
  - 31-60%: Yellow badge "Moderate"
  - 61-85%: Orange badge "Serious"
  - 86-100%: Red badge "Critical"
- Text input area with send button
- Auto-scroll to latest message
- Loading indicator while AI responds
- Format AI responses with proper line breaks
- "New Chat" button to start fresh conversation (optional)

#### 5. Hospital Finder
- Search form:
  - Location input (with user's saved location as default)
  - Radius slider (1km - 10km)
  - Search button
- Hospital cards grid (responsive):
  - Hospital name (bold)
  - Open/Closed status badge (green/red)
  - Address with 📍 icon
  - Phone number with 📞 icon
  - Rating with ⭐ icon
  - Website link (if available)
  - "Get Directions" button
- Loading state while searching

#### 6. Reports Upload
- Drag & drop upload area
- File type indicator: PDF, JPG, PNG, DOC, DOCX
- Upload progress bar
- List of uploaded reports:
  - File name with 📄 icon
  - File size
  - Upload date
  - Download/View button
- Grid layout for report cards

#### 7. Chat History
- Timeline view of past conversations
- Each item shows:
  - Seriousness score badge
  - User's message (truncated)
  - AI response (expandable)
  - Timestamp
  - Expand/collapse functionality

#### 8. Profile View
- Display user information:
  - Profile image (large, circular)
  - Name, Email
  - Age, Gender
  - Phone number
  - Location preference
- Edit profile button (optional)

## Technical Implementation

### API Integration

**Base URL:** `http://localhost:8000`

**Authentication Flow:**

**IMPORTANT: The backend handles OAuth redirect automatically!**

```javascript
// 1. Login Button - Simply redirect to backend OAuth endpoint
// The backend will automatically redirect to Google
<button onClick={() => window.location.href = 'http://localhost:8000/auth/google'}>
  Sign in with Google
</button>

// 2. Callback Handler - Create a /callback route in your frontend
// This page will receive the OAuth response from the backend
// URL: /callback (your frontend route)

// In your /callback page component:
useEffect(() => {
  const handleCallback = async () => {
    // Get the current URL which contains the callback data
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      // Exchange code for token by calling backend callback
      const response = await fetch(`http://localhost:8000/auth/callback?code=${code}&state=${urlParams.get('state')}`);
      const data = await response.json();
      
      // Store token and user data
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_name', data.user.name);
      localStorage.setItem('user_email', data.user.email);
      localStorage.setItem('profile_image', data.user.profile_image);
      localStorage.setItem('profile_completed', data.user.profile_completed);
      
      // Redirect based on profile status
      if (!data.user.profile_completed) {
        window.location.href = '/profile-setup';
      } else {
        window.location.href = '/dashboard';
      }
    }
  };
  
  handleCallback();
}, []);

// OR SIMPLER APPROACH - Let backend handle everything:
// Just redirect login button to: http://localhost:8000/auth/google
// Backend will redirect to Google, then back to your frontend with token in URL
```

**API Endpoints:**

```javascript
// All authenticated requests need this header:
headers: {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  'Content-Type': 'application/json'
}

// Profile Setup
POST /api/setup-profile
Body: { age, gender, phone, location_preference }

// Get Profile
GET /api/profile

// Chat
POST /api/chat
Body: { message: "I have a headache and fever" }
Response: { message, response, seriousness_score, timestamp }

// Chat History (automatically filtered by logged-in user)
GET /api/chat/history
Response: { chats: [...] }  // Only returns current user's chats

// Load chat history on component mount
useEffect(() => {
  const loadHistory = async () => {
    const response = await fetch('/api/chat/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setMessages(data.chats);  // Display user's previous chats
  };
  loadHistory();
}, []);

// Find Hospitals
POST /api/nearby-hospitals
Body: { location: "New York, NY", radius: 5000 }
Response: { hospitals: [...] }

// Upload Report
POST /api/upload-report
Body: FormData with file
Content-Type: multipart/form-data

// Get Reports
GET /api/reports
Response: { reports: [...] }
```

### Image Handling

**Profile Images:**
- Fetch from Google OAuth (profile_image URL)
- Display in circular avatar
- Add fallback placeholder if image fails to load
- Lazy loading for performance

**Medical Icons:**
- Use emoji or icon library (Lucide, Heroicons, or Font Awesome)
- Consistent icon style throughout app

**Report Thumbnails:**
- Show file type icons for different formats
- PDF: 📄 icon
- Images: 🖼️ icon with preview
- Documents: 📝 icon

### State Management
- Use React hooks (useState, useEffect) or Vue composition API
- Store auth token in localStorage
- Persist user data in localStorage
- **Load user's chat history on login** - fetch from `/api/chat/history`
- Each user sees only their own chats (backend automatically filters by user_id)
- Handle loading states for all API calls
- Error handling with user-friendly messages

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - Mobile: < 768px (stack sidebar, hamburger menu)
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- Touch-friendly buttons (min 44px height)
- Readable font sizes (16px base)

### Error Handling
- Network errors: Show retry button
- Auth errors: Redirect to login
- Validation errors: Show inline messages
- API errors: Display user-friendly messages

### Loading States
- Skeleton loaders for content
- Spinner for API calls
- Progress bars for uploads
- Disable buttons during processing

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Alt text for images
- Color contrast compliance (WCAG AA)

## Additional Features

### Animations
- Fade in for page transitions
- Slide in for sidebar
- Bounce for buttons on hover
- Smooth scroll for chat messages
- Loading pulse for skeleton screens

### Notifications
- Success toast for actions (upload, profile update)
- Error toast for failures
- Warning toast for high seriousness scores

### Medical Disclaimer
- Display on login page
- Show in footer: "MediGuide provides general health information and is NOT a substitute for professional medical advice."

## Tech Stack Suggestions
- **Framework:** React with Vite or Next.js
- **Styling:** Tailwind CSS
- **Icons:** Lucide React or Heroicons
- **HTTP Client:** Fetch API or Axios
- **Routing:** React Router
- **Notifications:** React Hot Toast or Sonner

## Color Palette
```css
--primary: #4F46E5 (Indigo)
--primary-dark: #4338CA
--secondary: #10B981 (Green)
--danger: #EF4444 (Red)
--warning: #F59E0B (Orange)
--bg: #F9FAFB (Light gray)
--card-bg: #FFFFFF
--text-primary: #111827
--text-secondary: #6B7280
--border: #E5E7EB
```

## File Structure
```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── ChatMessage.jsx
│   ├── HospitalCard.jsx
│   ├── ReportCard.jsx
│   └── SeriousnessScore.jsx
├── pages/
│   ├── Login.jsx
│   ├── ProfileSetup.jsx
│   ├── Dashboard.jsx
│   ├── Chat.jsx
│   ├── Hospitals.jsx
│   ├── Reports.jsx
│   ├── History.jsx
│   └── Profile.jsx
├── utils/
│   ├── api.js (API client)
│   └── auth.js (Auth helpers)
├── App.jsx
└── main.jsx
```

Build a production-ready, beautiful medical advisory application that users will love to use!
