import { Menu, LogOut } from 'lucide-react';
import { getUserData, logout } from '../utils/auth';

const Navbar = ({ toggleSidebar }) => {
  const userData = getUserData();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left: Menu Button (mobile) */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        {/* Center: Welcome Message (desktop) */}
        <div className="hidden lg:block">
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome back, {userData.name?.split(' ')[0] || 'User'}!
          </h2>
        </div>

        {/* Right: User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src={userData.profileImage || 'https://via.placeholder.com/40'}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-200"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/40';
              }}
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">{userData.name}</p>
              <p className="text-xs text-gray-500">{userData.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
