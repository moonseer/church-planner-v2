import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Home page component - landing page for the application
 */
const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero section */}
      <section className="relative bg-indigo-700 py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-indigo-600 opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                Simplify Your Church Management
              </h1>
              <p className="text-xl text-indigo-100 mb-8 max-w-lg mx-auto md:mx-0">
                Streamline operations, engage your congregation, and focus on what matters most.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-white text-indigo-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
                >
                  Get Started
                </Link>
                <Link
                  to="/about"
                  className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="/images/church-illustration.svg"
                alt="Church management illustration"
                className="max-w-full rounded-lg shadow-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/600x400?text=Church+Planner';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Church Planner?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-indigo-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Church Management</h3>
              <p className="text-gray-600">
                Manage multiple churches, members, and resources with an intuitive, easy-to-use interface.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-indigo-600 text-4xl mb-4">📆</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Event Planning</h3>
              <p className="text-gray-600">
                Create, organize, and track church events and services with powerful scheduling tools.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-indigo-600 text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Member Management</h3>
              <p className="text-gray-600">
                Keep track of your congregation, manage roles, and improve communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of churches already using Church Planner to streamline their operations.
          </p>
          <Link
            to="/register"
            className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
          >
            Sign Up for Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 