import React from 'react'
import { Bot, User, Thermometer } from 'lucide-react'

const Message = ({ content, sender, timestamp, severityScore }) => {
  const getSeverityClass = (score) => {
    if (score >= 70) return 'severity-high'
    if (score >= 40) return 'severity-medium'
    return 'severity-low'
  }

  const getSeverityText = (score) => {
    if (score >= 70) return 'High - Seek immediate medical attention'
    if (score >= 40) return 'Medium - Consider seeing a doctor'
    return 'Low - Monitor symptoms'
  }

  const formatContent = (text) => {
    if (!text) return ''
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div className={`message ${sender}-message fade-in`}>
      <div className="message-avatar">
        {sender === 'user' ? <User size={20} /> : <Bot size={20} />}
      </div>
      <div className="message-content">
        {formatContent(content)}
        
        {sender === 'bot' && severityScore !== undefined && (
          <div className={`severity-indicator ${getSeverityClass(severityScore)}`}>
            <Thermometer size={16} />
            Severity: {severityScore}/100 - {getSeverityText(severityScore)}
          </div>
        )}
        
        {timestamp && (
          <div className="message-timestamp">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}

export default Message
