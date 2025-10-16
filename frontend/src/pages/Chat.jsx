import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI, reportAPI } from '../utils/api';

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    // Load chat history
    chatAPI.getHistory()
      .then(res => setMessages(res.data.chats || []))
      .catch(err => console.error('Failed to load history:', err));
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getSeriousnessBadge = (score) => {
    if (score <= 30) return { text: 'Minor', color: 'bg-green-100 text-green-800' };
    if (score <= 60) return { text: 'Moderate', color: 'bg-yellow-100 text-yellow-800' };
    if (score <= 85) return { text: 'Serious', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Critical', color: 'bg-red-100 text-red-800' };
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => reportAPI.upload(file));
      const results = await Promise.all(uploadPromises);
      
      const fileInfo = results.map((res, idx) => ({
        name: files[idx].name,
        url: res.data.filepath
      }));
      
      setUploadedFiles([...uploadedFiles, ...fileInfo]);
      alert(`${files.length} file(s) uploaded successfully!`);
    } catch (error) {
      alert('Failed to upload files: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && uploadedFiles.length === 0) || loading) return;

    let userMessage = input;
    
    // Add file references to message
    if (uploadedFiles.length > 0) {
      const fileList = uploadedFiles.map(f => f.name).join(', ');
      userMessage += `\n\n📎 Attached files: ${fileList}`;
    }

    setInput('');
    const currentFiles = [...uploadedFiles];
    setUploadedFiles([]);
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage(userMessage);
      setMessages([...messages, { ...res.data, files: currentFiles }]);
    } catch (error) {
      alert('Failed to send message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-primary"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-primary">💬 AI Medical Chat</h1>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-xl mb-2">👋 Hello! How can I help you today?</p>
              <p className="text-sm">Describe your symptoms and I'll provide medical guidance.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-primary text-white rounded-lg px-4 py-2 max-w-md">
                  {msg.message}
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 max-w-md">
                  {msg.seriousness_score !== null && (
                    <div className="mb-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getSeriousnessBadge(msg.seriousness_score).color}`}>
                        {getSeriousnessBadge(msg.seriousness_score).text} ({msg.seriousness_score}%)
                      </span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.response}</div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(msg.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="bg-blue-50 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <span>📎 {file.name}</span>
                  <button
                    onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Upload files"
            >
              {uploading ? '⏳' : '📎'}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Describe your symptoms, ask about hospitals, or upload medical reports..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || (!input.trim() && uploadedFiles.length === 0)}
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            💡 Ask me about symptoms, request hospital recommendations, or upload medical reports
          </p>
        </div>
      </div>
    </div>
  );
}
