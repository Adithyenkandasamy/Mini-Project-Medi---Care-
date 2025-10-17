import React, { useState, useEffect } from 'react'
import ChatContainer from './components/ChatContainer'
import Login from './components/Login'
import Register from './components/Register'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('medicare_token')
    const userData = localStorage.getItem('medicare_user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
        loadChatHistory(parsedUser.id)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('medicare_token')
        localStorage.removeItem('medicare_user')
      }
    }
  }, [])

  const loadChatHistory = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/chat/history/${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.history && Array.isArray(data.history)) {
          setMessages(data.history)
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    loadChatHistory(userData.id)
  }

  const handleRegister = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    loadChatHistory(userData.id)
  }

  const handleLogout = () => {
    localStorage.removeItem('medicare_token')
    localStorage.removeItem('medicare_user')
    setUser(null)
    setIsAuthenticated(false)
    setMessages([])
  }

  const sendMessage = async (message, location = null) => {
    if (!user) return

    const userMessage = {
      id: Date.now().toString(),
      message,
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('http://localhost:8000/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          user_location: location,
          user_id: user.id
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage = {
          id: data.id,
          message: data.response,
          isUser: false,
          timestamp: data.timestamp,
          severityScore: data.severity_score,
          hospitals: data.hospitals
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now().toString(),
        message: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="App">
        {authMode === 'login' ? (
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        ) : (
          <Register 
            onRegister={handleRegister}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="App">
      <div className="main-content">
        <ChatContainer 
          messages={messages} 
          onSendMessage={sendMessage}
          user={user}
          onLogout={handleLogout}
        />
      </div>
    </div>
  )
}

export default App
