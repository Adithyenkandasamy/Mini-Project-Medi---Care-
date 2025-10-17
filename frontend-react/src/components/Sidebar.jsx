import React from 'react'
import { Building2, MapPin, Phone, Globe, Star } from 'lucide-react'
import './Sidebar.css'

const Sidebar = ({ hospitals, onHospitalsUpdate }) => {
  // Add hardcoded hospitals for initial display
  const defaultHospitals = [
    {
      id: "default1",
      name: "Medi Care General Hospital",
      address: "456 Health Avenue, Medical District",
      phone: "+1-555-0456",
      rating: 4.8,
      distance: "3.1 km",
      specialties: ["Family Medicine", "Pediatrics", "Orthopedics"],
      is_open: true
    },
    {
      id: "default2",
      name: "Emergency Medical Center",
      address: "789 Urgent Way, Central Area",
      phone: "+1-555-0789",
      rating: 4.2,
      distance: "1.8 km",
      specialties: ["Emergency Care", "Urgent Care", "Radiology"],
      is_open: true
    }
  ]

  const displayHospitals = hospitals && hospitals.length > 0 ? hospitals : defaultHospitals

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`
  }

  const handleDirections = (address) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank')
  }

  const handleWebsite = (website) => {
    window.open(website, '_blank')
  }

  const handleFindHospitals = () => {
    // Check if geolocation is available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          findNearbyHospitals(latitude, longitude)
        },
        (error) => {
          console.error('Error getting location:', error)
          // Fallback to manual location input
          const location = prompt('Please enter your location (city, address, or zip code):')
          if (location) {
            findHospitalsByAddress(location)
          }
        }
      )
    } else {
      // Fallback to manual location input
      const location = prompt('Geolocation not supported. Please enter your location (city, address, or zip code):')
      if (location) {
        findHospitalsByAddress(location)
      }
    }
  }

  const findNearbyHospitals = async (lat, lng) => {
    try {
      // Call backend API instead of direct Google Maps
      const response = await fetch('/api/hospitals/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (onHospitalsUpdate) {
          onHospitalsUpdate(data.hospitals)
        }
      } else {
        throw new Error('API request failed')
      }
    } catch (error) {
      console.error('Error finding nearby hospitals:', error)
      // Fallback to simulated data if API fails
      const nearbyHospitals = [
        {
          id: "nearby1",
          name: "City General Hospital",
          address: `Near ${Math.round(lat * 100) / 100}, ${Math.round(lng * 100) / 100}`,
          phone: "+1-555-0123",
          rating: 4.6,
          distance: "1.2 km",
          specialties: ["Emergency Care", "Cardiology"],
          is_open: true
        },
        {
          id: "nearby2",
          name: "Regional Medical Center",
          address: `Near ${Math.round(lat * 100) / 100}, ${Math.round(lng * 100) / 100}`,
          phone: "+1-555-0456",
          rating: 4.3,
          distance: "2.8 km",
          specialties: ["Internal Medicine", "Pediatrics"],
          is_open: true
        }
      ]
      
      if (onHospitalsUpdate) {
        onHospitalsUpdate(nearbyHospitals)
      }
    }
  }

  const findHospitalsByAddress = async (address) => {
    try {
      // Call backend API for address-based search
      const response = await fetch('/api/hospitals/by-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (onHospitalsUpdate) {
          onHospitalsUpdate(data.hospitals)
        }
      } else {
        throw new Error('API request failed')
      }
    } catch (error) {
      console.error('Error finding hospitals by address:', error)
      // Fallback to simulated data
      const hospitalsByAddress = [
        {
          id: "addr1",
          name: `${address} General Hospital`,
          address: `123 Medical Drive, ${address}`,
          phone: "+1-555-0789",
          rating: 4.4,
          distance: "0.8 km",
          specialties: ["Family Medicine", "Emergency Care"],
          is_open: true
        },
        {
          id: "addr2",
          name: `${address} Medical Center`,
          address: `456 Health Avenue, ${address}`,
          phone: "+1-555-0321",
          rating: 4.1,
          distance: "1.5 km",
          specialties: ["Urgent Care", "Radiology"],
          is_open: true
        }
      ]
      
      if (onHospitalsUpdate) {
        onHospitalsUpdate(hospitalsByAddress)
      }
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3>
          <Building2 size={20} />
          Quick Actions
        </h3>
        <div className="quick-actions">
          <button className="action-btn" onClick={handleFindHospitals}>
            <MapPin size={16} />
            Find Hospitals
          </button>
          <button className="action-btn">
            <Building2 size={16} />
            Emergency Care
          </button>
          <button className="action-btn">
            <Phone size={16} />
            Call Ambulance
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <h3>
          <Building2 size={20} />
          Nearby Hospitals
        </h3>
        <div className="hospital-list">
          {displayHospitals.map((hospital) => (
              <div key={hospital.id} className="hospital-card fade-in">
                <div className="hospital-header">
                  <div>
                    <div className="hospital-name">{hospital.name}</div>
                    <div className="hospital-rating">
                      <Star size={14} />
                      {hospital.rating || 'N/A'}
                    </div>
                  </div>
                  <div className={`hospital-status ${hospital.is_open ? 'open' : 'closed'}`}>
                    {hospital.is_open ? '🟢 Open' : '🔴 Closed'}
                  </div>
                </div>
                
                <div className="hospital-info">
                  <div className="info-item">
                    <MapPin size={14} />
                    {hospital.address}
                  </div>
                  <div className="info-item">
                    <span>📍 {hospital.distance} away</span>
                  </div>
                  {hospital.phone && (
                    <div className="info-item">
                      <Phone size={14} />
                      {hospital.phone}
                    </div>
                  )}
                </div>

                {hospital.specialties && (
                  <div className="hospital-specialties">
                    {hospital.specialties.slice(0, 2).map((specialty, index) => (
                      <span key={index} className="specialty-tag">
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}

                <div className="hospital-actions">
                  {hospital.phone && (
                    <button 
                      className="hospital-btn btn-call"
                      onClick={() => handleCall(hospital.phone)}
                    >
                      <Phone size={14} />
                      Call
                    </button>
                  )}
                  <button 
                    className="hospital-btn btn-directions"
                    onClick={() => handleDirections(hospital.address)}
                  >
                    <MapPin size={14} />
                    Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}

export default Sidebar
