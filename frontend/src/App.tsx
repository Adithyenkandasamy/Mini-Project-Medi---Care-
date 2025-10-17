import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, MapPin, Upload, User, LogOut } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import HospitalFinder from './components/HospitalFinder';
import ProfileModal from './components/ProfileModal';
import AuthModal from './components/AuthModal';
import FileUpload from './components/FileUpload';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-medical-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-medical-900">MediGuide AI</h1>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center space-x-2 text-medical-700 hover:text-primary-600"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block">{user.name}</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-medical-700 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {user ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-medical-100 p-1 rounded-lg mb-6 max-w-lg">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-medical-600 hover:text-medical-900'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'hospitals'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-medical-600 hover:text-medical-900'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Hospitals</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-medical-600 hover:text-medical-900'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {activeTab === 'chat' && <ChatInterface />}
              {activeTab === 'hospitals' && <HospitalFinder />}
              {activeTab === 'upload' && (
                <div className="bg-white rounded-lg shadow-sm border border-medical-200 p-6">
                  <h2 className="text-xl font-semibold text-medical-900 mb-6">Upload Medical Reports</h2>
                  <FileUpload onUploadComplete={(filename) => console.log('Uploaded:', filename)} />
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-medical-200">
                <h3 className="text-lg font-semibold text-medical-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg border border-medical-200 hover:bg-medical-50 transition-colors"
                  >
                    <Upload className="h-5 w-5 text-primary-600" />
                    <span className="text-medical-700">Upload Report</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('hospitals')}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg border border-medical-200 hover:bg-medical-50 transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-primary-600" />
                    <span className="text-medical-700">Find Hospitals</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <AuthModal />
      )}

      {/* Modals */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
