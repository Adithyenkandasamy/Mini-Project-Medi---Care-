import React, { useState, useRef, useEffect } from 'react'
import { Send, MapPin, Mic, MicOff, LogOut, User, Bot } from 'lucide-react'
import Message from './Message'
import './ChatContainer.css'

const ChatContainer = ({ messages, onSendMessage, user, onLogout }) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || isTyping) return

    const userMessage = message.trim()
    setMessage('')
    setIsTyping(true)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      await onSendMessage(userMessage)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          <h1>🏥 Medi Care AI Doctor</h1>
          <p>Your personal healthcare assistant</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <User size={20} />
            <span>{user?.name}</span>
          </div>
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {/* Welcome Message */}
        <div className="message bot-message welcome-message fade-in">
          <div className="message-avatar">
            <Bot size={20} />
          </div>
          <div className="message-content">
            <p>Hello {user?.name || 'there'}! 👋</p>
            <p>I'm your AI healthcare assistant. I can help you:</p>
            <ul>
              <li>🔍 Analyze your symptoms</li>
              <li>🏥 Find nearby hospitals</li>
              <li>💊 Provide medical advice</li>
              <li>📊 Assess symptom severity</li>
            </ul>
            <p>How are you feeling today? Please describe any symptoms you're experiencing.</p>
          </div>
        </div>

        {/* Chat History */}
        {messages.map((msg, index) => (
          <Message
            key={msg.id || index}
            content={msg.message}
            sender={msg.isUser ? "user" : "bot"}
            timestamp={msg.timestamp}
            severityScore={msg.severityScore}
          />
        ))}

        {/* Sample messages for demo */}
        {messages.length === 0 && (
          <div className="sample-messages">
            <p style={{textAlign: 'center', color: '#666', margin: '2rem 0'}}>
              Try these sample messages:
            </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center'}}>
              <button 
                className="sample-btn"
                onClick={() => {
                  setMessage("I have a headache")
                  setTimeout(() => {
                    const event = { preventDefault: () => {} }
                    handleSubmit(event)
                  }, 100)
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '20px',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                "I have a headache"
              </button>
              <button 
                className="sample-btn"
                onClick={() => {
                  setMessage("I'm running a fever")
                  setTimeout(() => {
                    const event = { preventDefault: () => {} }
                    handleSubmit(event)
                  }, 100)
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '20px',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                "I'm running a fever"
              </button>
              <button 
                className="sample-btn"
                onClick={() => {
                  setMessage("hospitals in coimbatore")
                  setTimeout(() => {
                    const event = { preventDefault: () => {} }
                    handleSubmit(event)
                  }, 100)
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '20px',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                "hospitals in coimbatore"
              </button>
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="message bot-message">
            <div className="message-avatar">
              <Bot size={20} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-form">
          <div className="input-group">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms..."
              rows="1"
              maxLength="1000"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!message.trim() || isTyping}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatContainer
