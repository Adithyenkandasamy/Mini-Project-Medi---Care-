import React, { useState } from 'react';
import { MapPin, Phone, Clock, Star, ExternalLink } from 'lucide-react';
import { apiService } from '../services/apiService';

interface Hospital {
  name: string;
  address: string;
  phone: string;
  rating: number | string;
  is_open: boolean | null;
  website: string;
  location: {
    lat: number;
    lng: number;
  };
}

const HospitalFinder: React.FC = () => {
  const [location, setLocation] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!location.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await apiService.findNearbyHospitals(location);
      setHospitals(response.hospitals || []);
    } catch (err) {
      setError('Failed to find hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude}, ${longitude}`);
        },
        (error) => {
          setError('Unable to get your location. Please enter manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-medical-200 p-6">
      <h2 className="text-xl font-semibold text-medical-900 mb-6">Find Nearby Hospitals</h2>

      {/* Search */}
      <div className="mb-6">
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location (address, city, or coordinates)"
            className="flex-1 border border-medical-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={getCurrentLocation}
            className="px-4 py-2 border border-medical-300 rounded-md text-sm text-medical-700 hover:bg-medical-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Use Current Location
          </button>
        </div>
        <button
          onClick={handleSearch}
          disabled={!location.trim() || loading}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Find Hospitals'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {hospitals.map((hospital, index) => (
          <div key={index} className="border border-medical-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-medical-900">{hospital.name}</h3>
              <div className="flex items-center space-x-2">
                {hospital.is_open !== null && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hospital.is_open
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {hospital.is_open ? 'Open' : 'Closed'}
                  </span>
                )}
                {typeof hospital.rating === 'number' && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-medical-600">{hospital.rating}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm text-medical-600">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary-600" />
                <span>{hospital.address}</span>
              </div>

              {hospital.phone && hospital.phone !== 'Phone not available' && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-primary-600" />
                  <a href={`tel:${hospital.phone}`} className="text-primary-600 hover:text-primary-700">
                    {hospital.phone}
                  </a>
                </div>
              )}

              {hospital.website && hospital.website !== 'Not available' && (
                <div className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4 text-primary-600" />
                  <a
                    href={hospital.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>

            <div className="mt-3 flex space-x-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  hospital.name + ' ' + hospital.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-md text-sm hover:bg-primary-200 transition-colors"
              >
                View on Maps
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  hospital.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
              >
                Get Directions
              </a>
            </div>
          </div>
        ))}

        {hospitals.length === 0 && !loading && !error && (
          <div className="text-center py-8 text-medical-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-medical-300" />
            <p>Enter a location to find nearby hospitals</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalFinder;
