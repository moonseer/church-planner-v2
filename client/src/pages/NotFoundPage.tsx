import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Not Found Page - Displayed when a route doesn't match any known paths
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl text-indigo-600 mb-4">404</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go back home
          </Link>
          <Link
            to="/churches"
            className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View churches
          </Link>
        </div>
        <div className="mt-12">
          <Link to="/contact" className="text-indigo-600 hover:text-indigo-500">
            Contact support →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 