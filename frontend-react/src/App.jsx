import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import ChatContainer from './components/ChatContainer'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [hospitals, setHospitals] = useState([])

  useEffect(() => {
    // Load user data and chat history on app start
    loadUserData()
    loadChatHistory()
  }, [])

  const loadUserData = async () => {
    // Use hardcoded user data directly
    setUser({
      id: 'user123',
      name: 'Adithyen',
      email: 'adithyen@gmail.com'
    })
  }

  const loadChatHistory = async () => {
    // Use hardcoded chat history for demo
    setChatHistory([])
  }

  const sendMessage = async (message) => {
    try {
      // Get user location if available
      let userLocation = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (error) {
          console.log('Location not available:', error);
        }
      }

      const response = await fetch('http://localhost:8000/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          user_location: userLocation
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      setChatHistory(prev => [...prev, data])
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message to chat
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        message: message,
        response: 'Sorry, I encountered an error. Please try again.',
        severity_score: 0,
        timestamp: new Date().toISOString()
      }])
    }
  }

  return (
    <div className="app">
      <Header user={user} />
      <main className="main-content">
        <div className="chat-layout">
          <ChatContainer 
            user={user}
            chatHistory={chatHistory}
            onSendMessage={sendMessage}
          />
          <Sidebar hospitals={hospitals} onHospitalsUpdate={setHospitals} />
        </div>
      </main>
    </div>
  )
}

export default App
