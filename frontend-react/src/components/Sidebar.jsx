import React from 'react'
import { Building2, MapPin, Phone, Globe, Star } from 'lucide-react'
import './Sidebar.css'

const Sidebar = ({ hospitals }) => {
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

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3>
          <Building2 size={20} />
          Quick Actions
        </h3>
        <div className="quick-actions">
          <button className="action-btn">
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
