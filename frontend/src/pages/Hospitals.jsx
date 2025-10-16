import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hospitalAPI } from '../utils/api';

export default function Hospitals() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(5000);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    // Load user's location preference
    const savedLocation = localStorage.getItem('location_preference');
    if (savedLocation) setLocation(savedLocation);
  }, [navigate]);

  const handleSearch = async () => {
    if (!location.trim()) {
      alert('Please enter a location');
      return;
    }

    setLoading(true);
    try {
      const res = await hospitalAPI.findNearby(location, radius);
      setHospitals(res.data.hospitals || []);
    } catch (error) {
      alert('Failed to find hospitals: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-primary">🏥 Find Hospitals</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State or Address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius: {(radius / 1000).toFixed(1)} km
              </label>
              <input
                type="range"
                min="1000"
                max="10000"
                step="1000"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="mt-4 w-full md:w-auto px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Hospitals'}
          </button>
        </div>

        {hospitals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hospital, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">{hospital.name}</h3>
                  {hospital.open_now !== undefined && (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      hospital.open_now ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {hospital.open_now ? 'Open' : 'Closed'}
                    </span>
                  )}
                </div>

                {hospital.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{hospital.rating}</span>
                    {hospital.user_ratings_total && (
                      <span className="text-sm text-gray-500">({hospital.user_ratings_total})</span>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  {hospital.address && (
                    <p className="flex items-start gap-2">
                      <span>📍</span>
                      <span className="text-gray-600">{hospital.address}</span>
                    </p>
                  )}

                  {hospital.phone && (
                    <p className="flex items-center gap-2">
                      <span>📞</span>
                      <a href={`tel:${hospital.phone}`} className="text-primary hover:underline">
                        {hospital.phone}
                      </a>
                    </p>
                  )}

                  {hospital.website && (
                    <p className="flex items-center gap-2">
                      <span>🌐</span>
                      <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Website
                      </a>
                    </p>
                  )}
                </div>

                {hospital.place_id && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name)}&query_place_id=${hospital.place_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block w-full text-center px-4 py-2 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Get Directions
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && hospitals.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-xl">🔍 Search for hospitals near you</p>
            <p className="text-sm mt-2">Enter your location and click search to find nearby medical facilities</p>
          </div>
        )}
      </main>
    </div>
  );
}
