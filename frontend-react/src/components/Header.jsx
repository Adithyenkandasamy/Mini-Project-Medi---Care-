import React from 'react'
import { Heart, User, LogOut } from 'lucide-react'
import './Header.css'

const Header = ({ user }) => {
  return (
    <header className="header">
      <div className="nav-brand">
        <Heart className="brand-icon pulse" />
        <span>Medi Care</span>
      </div>
      
      <nav className="nav-menu">
        <div className="nav-link active">
          <Heart size={18} />
          Chat
        </div>
      </nav>
      
      {user && (
        <div className="user-info">
          <User size={18} />
          <span>{user.name}</span>
        </div>
      )}
    </header>
  )
}

export default Header
