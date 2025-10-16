import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Hospitals from './pages/Hospitals';
import Reports from './pages/Reports';
import History from './pages/History';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        
        {/* Profile Setup - Protected */}
        <Route
          path="/profile-setup"
          element={
            <PrivateRoute>
              <ProfileSetup />
            </PrivateRoute>
          }
        />
        
        {/* Dashboard Routes - Protected & Require Profile */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute requireProfile={true}>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/chat" replace />} />
          <Route path="chat" element={<Chat />} />
          <Route path="hospitals" element={<Hospitals />} />
          <Route path="reports" element={<Reports />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
