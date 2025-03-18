import React from 'react';
import { Outlet, Link } from 'react-router-dom';

/**
 * Authentication layout component for login, register, and password reset pages
 */
const AuthLayout: React.FC = () => {
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
            
            {/* Links */}
            <div className="flex space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} Church Planner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout; 