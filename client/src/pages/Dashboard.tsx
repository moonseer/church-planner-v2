import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { useChurch } from '../features/church/hooks/useChurch';

/**
 * Dashboard component - Main user dashboard showing summary information
 */
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { churches, fetchUserChurches, isLoading, error } = useChurch();
  const [stats, setStats] = useState({
    totalChurches: 0,
    recentActivity: [],
    upcomingEvents: []
  });

  useEffect(() => {
    fetchUserChurches();
    // Later, we would fetch other dashboard data here
  }, [fetchUserChurches]);

  // This would be replaced with actual data in a real implementation
  useEffect(() => {
    if (churches) {
      setStats({
        totalChurches: churches.length,
        recentActivity: [],
        upcomingEvents: []
      });
    }
  }, [churches]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Welcome section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Welcome, {user?.name || 'User'}!
        </h2>
        <p className="text-gray-600">
          Here's an overview of your church management activities and upcoming events.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Churches stat */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-indigo-100 p-3 mr-4">
              <span className="text-2xl">⛪</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Your Churches</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalChurches}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/churches" 
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View all churches →
            </Link>
          </div>
        </div>

        {/* Members stat (placeholder) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Members</h3>
              <p className="text-3xl font-bold text-green-600">--</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 italic">Coming soon</p>
          </div>
        </div>

        {/* Events stat (placeholder) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <span className="text-2xl">📆</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Upcoming Events</h3>
              <p className="text-3xl font-bold text-purple-600">--</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 italic">Coming soon</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/churches/new"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
          >
            <span className="text-2xl mb-2">➕</span>
            <span className="text-gray-800 font-medium text-center">Add New Church</span>
          </Link>
          
          <Link
            to="/churches"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
          >
            <span className="text-2xl mb-2">🔍</span>
            <span className="text-gray-800 font-medium text-center">Manage Churches</span>
          </Link>
          
          <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg opacity-60 cursor-not-allowed">
            <span className="text-2xl mb-2">📅</span>
            <span className="text-gray-800 font-medium text-center">Schedule Event</span>
          </div>
          
          <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg opacity-60 cursor-not-allowed">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-gray-800 font-medium text-center">View Reports</span>
          </div>
        </div>
      </div>

      {/* Recent churches */}
      {churches.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Churches</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {churches.slice(0, 5).map((church) => (
                  <tr key={church._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {church.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof church.address === 'string' 
                        ? church.address 
                        : `${church.address.city}, ${church.address.state}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/churches/${church._id}`} 
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/churches/${church._id}/edit`} 
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {churches.length > 5 && (
              <div className="mt-4 text-right">
                <Link 
                  to="/churches" 
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View all churches →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 