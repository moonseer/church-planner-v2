import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth';

/**
 * Main layout component for authenticated and public pages
 * Includes header, navigation, and footer
 */
const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo and site name */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-indigo-600 text-2xl">⛪</span>
              <span className="font-bold text-xl text-gray-900">Church Planner</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-indigo-600 transition-colors">
                Home
              </Link>
              {user && (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/churches" className="text-gray-700 hover:text-indigo-600 transition-colors">
                    Churches
                  </Link>
                </>
              )}
            </nav>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors">
                    <span>{user.name}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu (visible on small screens) */}
      <div className="md:hidden bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-2">
          <nav className="flex justify-around">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors py-2">
              Home
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-indigo-600 transition-colors py-2"
                >
                  Dashboard
                </Link>
                <Link
                  to="/churches"
                  className="text-gray-600 hover:text-indigo-600 transition-colors py-2"
                >
                  Churches
                </Link>
              </>
            )}
            {!user && (
              <Link
                to="/login"
                className="text-gray-600 hover:text-indigo-600 transition-colors py-2"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-grow bg-gray-50">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Church Planner</h3>
              <p className="text-gray-400">
                Streamline your church operations with our comprehensive church management system.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-400">
                Have questions or feedback? We'd love to hear from you.
              </p>
              <Link
                to="/contact"
                className="mt-2 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Church Planner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 