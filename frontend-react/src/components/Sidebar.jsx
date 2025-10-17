import React, { useState } from 'react'
import { Building2, MapPin, Phone, Star, Zap, Truck, Navigation } from 'lucide-react'
import './Sidebar.css'

const Sidebar = ({ hospitals, onHospitalsUpdate }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleFindHospitals = async () => {
    setIsLoading(true)
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            
            const response = await fetch('http://localhost:8000/api/hospitals/nearby', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ latitude, longitude }),
            })

            if (response.ok) {
              const data = await response.json()
              onHospitalsUpdate(data.hospitals || [])
            }
            setIsLoading(false)
          },
          (error) => {
            console.error('Error getting location:', error)
            setIsLoading(false)
          }
        )
      }
    } catch (error) {
      console.error('Error finding hospitals:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3>
          <Zap size={20} />
          Quick Actions
        </h3>
        <div className="quick-actions">
          <button className="action-btn" onClick={handleFindHospitals} disabled={isLoading}>
            <MapPin size={16} />
            {isLoading ? 'Finding...' : 'Find Hospitals'}
          </button>
          <button className="action-btn">
            <Phone size={16} />
            Emergency Care
          </button>
          <button className="action-btn">
            <Truck size={16} />
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
          {hospitals && hospitals.length > 0 ? (
            hospitals.map((hospital, index) => (
              <div key={index} className="hospital-card">
                <div className="hospital-header">
                  <div>
                    <h4 className="hospital-name">{hospital.name}</h4>
                    <div className="hospital-status">
                      <span className={`status-indicator ${hospital.status === 'Open' ? 'open' : 'closed'}`}>
                        {hospital.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="hospital-rating">
                    <Star size={14} fill="currentColor" />
                    <span>{hospital.rating || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="hospital-details">
                  <div className="detail-item">
                    <MapPin size={14} />
                    <span>{hospital.address}</span>
                  </div>
                  <div className="detail-item">
                    <Navigation size={14} />
                    <span>{hospital.distance} away</span>
                  </div>
                  <div className="detail-item">
                    <Phone size={14} />
                    <span>{hospital.phone || 'Not available'}</span>
                  </div>
                </div>

                {hospital.specialties && (
                  <div className="hospital-specialties">
                    {hospital.specialties.slice(0, 2).map((specialty, idx) => (
                      <span key={idx} className="specialty-tag">
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}

                <div className="hospital-actions">
                  <button className="hospital-btn call-btn">
                    <Phone size={14} />
                    Call
                  </button>
                  <button className="hospital-btn directions-btn">
                    <Navigation size={14} />
                    Directions
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-hospitals">
              <Building2 size={24} />
              <p>No hospitals found</p>
              <p>Click "Find Hospitals" to search nearby</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
