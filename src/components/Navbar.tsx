import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Car, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-red-700' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

if (

  location.pathname === '/login' || 
  location.pathname === '/signup'
) {
  return null;
}

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Car size={24} />
              <span className="font-bold text-xl">VCS</span>
            </Link>
            {user && (
              <div className="flex space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')} hover:bg-blue-700 transition-colors`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/reports"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/reports')} hover:bg-blue-700 transition-colors`}
                >
                  Reports
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isActive('/profile')} hover:bg-blue-700 transition-colors`}
                >
                  <User size={18} />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-white text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;