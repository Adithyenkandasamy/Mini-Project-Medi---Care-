import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const profileCompleted = localStorage.getItem('profile_completed') === 'true';
      navigate(profileCompleted ? '/dashboard' : '/profile-setup');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">🏥 MediGuide</h1>
          <p className="text-xl text-gray-600">Your AI-Powered Medical Advisory Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <button
            onClick={authAPI.googleLogin}
            className="w-full bg-white border-2 border-gray-300 rounded-lg px-6 py-4 flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-primary transition-all duration-200 text-lg font-semibold"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Advice</h3>
            <p className="text-gray-600">Get instant medical guidance powered by Gemini 2.0</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-3">🏥</div>
            <h3 className="text-lg font-semibold mb-2">Find Hospitals</h3>
            <p className="text-gray-600">Locate nearby hospitals with real-time information</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Severity Analysis</h3>
            <p className="text-gray-600">Understand symptom seriousness with AI scoring</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-3">📁</div>
            <h3 className="text-lg font-semibold mb-2">Upload Reports</h3>
            <p className="text-gray-600">Store and manage your medical documents securely</p>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>⚠️ Medical Disclaimer: MediGuide provides general health information and is NOT a substitute for professional medical advice.</p>
        </div>
      </div>
    </div>
  );
}
