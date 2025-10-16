import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../utils/api';

export default function History() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    chatAPI.getHistory()
      .then(res => setChats(res.data.chats || []))
      .catch(err => console.error('Failed to load history:', err));
  }, [navigate]);

  const getSeriousnessBadge = (score) => {
    if (score <= 30) return { text: 'Minor', color: 'bg-green-100 text-green-800' };
    if (score <= 60) return { text: 'Moderate', color: 'bg-yellow-100 text-yellow-800' };
    if (score <= 85) return { text: 'Serious', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Critical', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-primary"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-primary">📜 Chat History</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {chats.length > 0 ? (
          <div className="space-y-4">
            {chats.map((chat) => (
              <div key={chat.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === chat.id ? null : chat.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {chat.seriousness_score !== null && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeriousnessBadge(chat.seriousness_score).color}`}>
                            {getSeriousnessBadge(chat.seriousness_score).text} ({chat.seriousness_score}%)
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(chat.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 mb-1">
                        {chat.message.length > 100 ? chat.message.substring(0, 100) + '...' : chat.message}
                      </p>
                      {expandedId !== chat.id && (
                        <p className="text-sm text-gray-600">
                          {chat.response.length > 150 ? chat.response.substring(0, 150) + '...' : chat.response}
                        </p>
                      )}
                    </div>
                    <button className="text-gray-400 hover:text-primary">
                      {expandedId === chat.id ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {expandedId === chat.id && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Your Message:</p>
                        <p className="text-gray-800">{chat.message}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">AI Response:</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{chat.response}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-xl">📭 No chat history yet</p>
            <p className="text-sm mt-2">Start a conversation to see your history here</p>
            <button
              onClick={() => navigate('/chat')}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Start Chat
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
