import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Activity, Loader } from 'lucide-react';
import { profileAPI } from '../utils/api';
import { getUserData } from '../utils/auth';

const Profile = () => {
  const userData = getUserData();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">View your personal and medical information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-8 text-white">
          <div className="flex items-center gap-6">
            <img
              src={userData.profileImage || 'https://via.placeholder.com/100'}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/100';
              }}
            />
            <div>
              <h2 className="text-2xl font-bold mb-1">{profile?.name}</h2>
              <p className="text-blue-100 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {profile?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-8">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Age</label>
                <p className="text-gray-900 font-semibold">{profile?.age || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900 font-semibold">{profile?.gender || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <p className="text-gray-900 font-semibold">{profile?.phone || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <p className="text-gray-900 font-semibold">{profile?.location_preference || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Medical Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Blood Group</label>
                <p className="text-gray-900 font-semibold">{profile?.blood_group || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Height</label>
                <p className="text-gray-900 font-semibold">
                  {profile?.height ? `${profile.height} cm` : 'Not specified'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Weight</label>
                <p className="text-gray-900 font-semibold">
                  {profile?.weight ? `${profile.weight} kg` : 'Not specified'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Allergies</label>
                <p className="text-gray-900 font-semibold">{profile?.allergies || 'None reported'}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Chronic Conditions</label>
                <p className="text-gray-900 font-semibold">
                  {profile?.chronic_conditions || 'None reported'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Medications</label>
                <p className="text-gray-900 font-semibold">
                  {profile?.current_medications || 'None reported'}
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Name</label>
                <p className="text-gray-900 font-semibold">
                  {profile?.emergency_contact || 'Not specified'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                <p className="text-gray-900 font-semibold">
                  {profile?.emergency_contact_phone || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
