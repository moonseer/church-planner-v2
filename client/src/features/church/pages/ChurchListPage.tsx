import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChurch } from '../hooks/useChurch';
import { ChurchCard } from '../components/ChurchCard';

/**
 * Page component for displaying a list of churches
 */
const ChurchListPage: React.FC = () => {
  const navigate = useNavigate();
  const { churches, isLoading, error, fetchUserChurches } = useChurch();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter churches based on search term
  const filteredChurches = churches.filter(church => {
    const searchLower = searchTerm.toLowerCase();
    
    // Helper to access nested address property safely
    const getAddressProperty = (property: string) => {
      if (typeof church.address === 'string') {
        return church.address.toLowerCase();
      } else if (church.address && typeof church.address === 'object') {
        return (church.address as any)[property]?.toLowerCase() || '';
      }
      // Fallback to top-level properties for backward compatibility
      return (church as any)[property]?.toLowerCase() || '';
    };
    
    return (
      church.name.toLowerCase().includes(searchLower) ||
      getAddressProperty('city').includes(searchLower) ||
      getAddressProperty('state').includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Churches</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search churches..."
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => navigate('/churches/new')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Create New Church
          </button>
          <button
            onClick={() => fetchUserChurches()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            title="Refresh the list of churches"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredChurches.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          {searchTerm ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No churches match your search</h2>
              <p className="text-gray-600 mb-4">Try a different search term or clear the search</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No churches found</h2>
              <p className="text-gray-600 mb-4">Get started by creating your first church</p>
              <button
                onClick={() => navigate('/churches/new')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create New Church
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChurches.map((church) => (
            <div key={church._id} onClick={() => navigate(`/churches/${church._id}`)}>
              <ChurchCard church={church} showActions={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChurchListPage; 