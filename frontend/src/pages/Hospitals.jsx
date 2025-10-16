import { useState } from 'react';
import { Search, MapPin, Phone, Star, Globe, ExternalLink, Loader } from 'lucide-react';
import { hospitalAPI } from '../utils/api';
import { getUserData } from '../utils/auth';

const Hospitals = () => {
  const userData = getUserData();
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(5000);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const response = await hospitalAPI.findNearby(location || undefined, radius);
      setHospitals(response.data.hospitals);
    } catch (error) {
      console.error('Error finding hospitals:', error);
      alert('Failed to find hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDirections = (hospital) => {
    if (hospital.location.lat && hospital.location.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${hospital.location.lat},${hospital.location.lng}`,
        '_blank'
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Nearby Hospitals</h1>
        <p className="text-gray-600">Locate healthcare facilities near you</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={`Default: Your saved location`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use your saved location</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius: {(radius / 1000).toFixed(1)} km
              </label>
              <input
                type="range"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                min="1000"
                max="10000"
                step="1000"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 km</span>
                <span>10 km</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search Hospitals
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-12">
          <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Finding nearby hospitals...</p>
        </div>
      )}

      {!loading && searched && hospitals.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-gray-700">No hospitals found in the specified area. Try increasing the search radius.</p>
        </div>
      )}

      {!loading && hospitals.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Found {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''} near you
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {hospitals.map((hospital, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {hospital.name}
                  </h3>
                  {hospital.is_open !== null && (
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        hospital.is_open
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {hospital.is_open ? 'Open' : 'Closed'}
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{hospital.address}</span>
                  </div>

                  {hospital.phone !== 'Phone not available' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                      <a href={`tel:${hospital.phone}`} className="hover:text-primary">
                        {hospital.phone}
                      </a>
                    </div>
                  )}

                  {hospital.rating !== 'No rating' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 flex-shrink-0 text-yellow-400 fill-yellow-400" />
                      <span>{hospital.rating} / 5</span>
                    </div>
                  )}

                  {hospital.website !== 'Not available' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4 flex-shrink-0 text-gray-400" />
                      <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => getDirections(hospital)}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Hospitals;
