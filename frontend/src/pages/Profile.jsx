import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../utils/api';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    profileAPI.getProfile()
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load profile</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-primary"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-primary">👤 My Profile</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <img
              src={profile.profile_image}
              alt={profile.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary"
            />
            <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-gray-600">{profile.email}</p>
          </div>

          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-semibold">{profile.age || 'Not set'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-semibold">{profile.gender || 'Not set'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold">{profile.phone || 'Not set'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{profile.location_preference || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-2">Account Status</h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  profile.profile_completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.profile_completed ? '✓ Profile Complete' : '⚠ Profile Incomplete'}
                </span>
              </div>
            </div>

            {!profile.profile_completed && (
              <button
                onClick={() => navigate('/profile-setup')}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Complete Profile
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
