import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserData } from '../utils/auth';

const PrivateRoute = ({ children, requireProfile = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const userData = getUserData();
  if (requireProfile && !userData.profileCompleted) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};

export default PrivateRoute;
