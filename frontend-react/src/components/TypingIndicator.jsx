import React from 'react'
import { Bot } from 'lucide-react'
import './TypingIndicator.css'

const TypingIndicator = () => {
  return (
    <div className="message bot-message typing-indicator fade-in">
      <div className="message-avatar">
        <Bot size={20} />
      </div>
      <div className="message-content">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
