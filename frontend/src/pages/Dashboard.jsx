import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { profileAPI } from '../utils/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    const userName = localStorage.getItem('user_name');
    const userEmail = localStorage.getItem('user_email');
    const profileImage = localStorage.getItem('profile_image');

    setUser({ name: userName, email: userEmail, profile_image: profileImage });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-primary">🏥 MediGuide</h1>
          </div>
          <div className="flex items-center gap-4">
            <img
              src={user.profile_image}
              alt={user.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="text-right">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Welcome back, {user.name.split(' ')[0]}! 👋</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/chat"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">AI Chat</h3>
            <p className="text-gray-600">Get medical advice and symptom analysis</p>
          </Link>

          <Link
            to="/hospitals"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-5xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold mb-2">Find Hospitals</h3>
            <p className="text-gray-600">Locate nearby medical facilities</p>
          </Link>

          <Link
            to="/reports"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-5xl mb-4">📁</div>
            <h3 className="text-xl font-semibold mb-2">My Reports</h3>
            <p className="text-gray-600">Upload and manage medical documents</p>
          </Link>

          <Link
            to="/history"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-5xl mb-4">📜</div>
            <h3 className="text-xl font-semibold mb-2">Chat History</h3>
            <p className="text-gray-600">View your past conversations</p>
          </Link>

          <Link
            to="/profile"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-xl font-semibold mb-2">Profile</h3>
            <p className="text-gray-600">View and update your information</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
