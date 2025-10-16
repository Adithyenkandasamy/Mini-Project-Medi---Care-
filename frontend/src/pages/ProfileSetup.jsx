import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../utils/api';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    phone: '',
    location_preference: '',
    blood_group: '',
    height: '',
    weight: '',
    allergies: '',
    chronic_conditions: '',
    current_medications: '',
    emergency_contact: '',
    emergency_contact_phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Give a moment for localStorage to be set from OAuth callback
    const checkAuth = setTimeout(() => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Please login first');
        navigate('/');
        return;
      }

      // Pre-fill location if available
      const savedLocation = localStorage.getItem('location_preference');
      if (savedLocation) {
        setFormData(prev => ({ ...prev, location_preference: savedLocation }));
      }
    }, 100);

    return () => clearTimeout(checkAuth);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await profileAPI.setupProfile({
        ...formData,
        age: parseInt(formData.age),
      });
      localStorage.setItem('profile_completed', 'true');
      localStorage.setItem('location_preference', formData.location_preference);
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile setup error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired. Please login again.');
        localStorage.clear();
        navigate('/');
      } else {
        alert('Failed to setup profile: ' + (error.response?.data?.detail || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 my-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Complete Your Medical Profile</h1>
        <p className="text-gray-600 mb-6">Please provide detailed information for better medical guidance</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="50"
                  max="300"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="170"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="70"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📞 Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location_preference}
                  onChange={(e) => setFormData({ ...formData, location_preference: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="City, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🏥 Medical History</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="2"
                  placeholder="List any known allergies (e.g., Penicillin, Peanuts, Latex)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions</label>
                <textarea
                  value={formData.chronic_conditions}
                  onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="2"
                  placeholder="List any chronic conditions (e.g., Diabetes, Hypertension, Asthma)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                <textarea
                  value={formData.current_medications}
                  onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="2"
                  placeholder="List current medications with dosage (e.g., Metformin 500mg twice daily)"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 text-lg"
          >
            {loading ? 'Saving Medical Profile...' : 'Complete Medical Profile'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            * Required fields. Your medical information is encrypted and secure.
          </p>
        </form>
      </div>
    </div>
  );
}
