import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertTriangle, FileText } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  seriousness_score?: number;
  request_report?: boolean;
  suggest_hospital?: boolean;
}

const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: `Hello ${user?.name || 'there'}! I'm MediGuide AI, your healthcare assistant. How can I help you today? Please describe any symptoms or health concerns you have.`,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await apiService.sendChatMessage(inputMessage, user);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response,
        timestamp: new Date(),
        seriousness_score: response.seriousness_score,
        request_report: response.request_report,
        suggest_hospital: response.suggest_hospital,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSeriousnessColor = (score?: number) => {
    if (!score) return '';
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeriousnessLabel = (score?: number) => {
    if (!score) return '';
    if (score < 30) return 'Low Priority';
    if (score < 60) return 'Moderate';
    return 'High Priority';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-medical-200 h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-medical-200">
        <div className="flex items-center space-x-3">
          <Bot className="h-6 w-6 text-primary-600" />
          <h2 className="text-lg font-semibold text-medical-900">MediGuide AI Chat</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-medical-100 text-medical-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'bot' && (
                  <Bot className="h-4 w-4 mt-1 text-primary-600" />
                )}
                {message.type === 'user' && (
                  <User className="h-4 w-4 mt-1 text-white" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Seriousness Score */}
                  {message.seriousness_score !== undefined && (
                    <div className="mt-2 flex items-center space-x-2">
                      <AlertTriangle className={`h-4 w-4 ${getSeriousnessColor(message.seriousness_score)}`} />
                      <span className={`text-xs font-medium ${getSeriousnessColor(message.seriousness_score)}`}>
                        {getSeriousnessLabel(message.seriousness_score)} ({message.seriousness_score}%)
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {(message.request_report || message.suggest_hospital) && (
                    <div className="mt-2 space-y-1">
                      {message.request_report && (
                        <button className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700">
                          <FileText className="h-3 w-3" />
                          <span>Upload Medical Report</span>
                        </button>
                      )}
                      {message.suggest_hospital && (
                        <button className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Find Nearby Hospitals</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-medical-100 text-medical-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-primary-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-medical-200">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your symptoms or ask a health question..."
            className="flex-1 resize-none border border-medical-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
