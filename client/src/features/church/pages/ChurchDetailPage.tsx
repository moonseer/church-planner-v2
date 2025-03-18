import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useChurch } from '../hooks/useChurch';

/**
 * Page component for displaying detailed information about a specific church
 */
const ChurchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentChurch, isLoading, error, deleteChurch } = useChurch({ 
    initialChurchId: id 
  });
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Handle church deletion with confirmation
  const handleDeleteChurch = async () => {
    if (!currentChurch || !window.confirm(`Are you sure you want to delete ${currentChurch.name}?`)) {
      return;
    }
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const success = await deleteChurch(currentChurch._id);
      if (success) {
        navigate('/churches');
      } else {
        setDeleteError('Failed to delete church. Please try again.');
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'An error occurred while deleting the church');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && !currentChurch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error || !currentChurch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error || 'Church not found'}
        </div>
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          onClick={() => navigate('/churches')}
        >
          Back to Churches
        </button>
      </div>
    );
  }

  // Extract address details
  const address = typeof currentChurch.address === 'string' 
    ? { street: currentChurch.address, city: '', state: '', zipCode: '' }
    : currentChurch.address;

  // Count members and admins
  const memberCount = Array.isArray(currentChurch.members) ? currentChurch.members.length : 0;
  const adminCount = Array.isArray(currentChurch.admins) ? currentChurch.admins.length : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <button
            className="mr-4 px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            onClick={() => navigate('/churches')}
          >
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{currentChurch.name}</h1>
        </div>
        
        <div className="flex space-x-4">
          <Link
            to={`/churches/${id}/members`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Manage Members
          </Link>
          <Link
            to={`/churches/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={handleDeleteChurch}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {deleteError}
        </div>
      )}

      {/* Church details */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 text-gray-900 font-medium">{currentChurch.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 text-gray-900 font-medium">{currentChurch.email || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <span className="ml-2 text-gray-900 font-medium">{currentChurch.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Website:</span>
                  {currentChurch.website ? (
                    <a 
                      href={currentChurch.website.startsWith('http') ? currentChurch.website : `https://${currentChurch.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      {currentChurch.website}
                    </a>
                  ) : (
                    <span className="ml-2 text-gray-900">Not provided</span>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Location</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500">Address:</span>
                  <span className="ml-2 text-gray-900 font-medium">{address.street}</span>
                </div>
                {address.city && (
                  <div>
                    <span className="text-gray-500">City:</span>
                    <span className="ml-2 text-gray-900 font-medium">{address.city}</span>
                  </div>
                )}
                {address.state && (
                  <div>
                    <span className="text-gray-500">State:</span>
                    <span className="ml-2 text-gray-900 font-medium">{address.state}</span>
                  </div>
                )}
                {address.zipCode && (
                  <div>
                    <span className="text-gray-500">ZIP Code:</span>
                    <span className="ml-2 text-gray-900 font-medium">{address.zipCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {currentChurch.description || 'No description provided.'}
            </p>
          </div>

          {/* Members Summary */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">People</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="rounded-full bg-indigo-100 p-2 mr-3">
                    <span className="text-xl">👥</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Members</p>
                    <p className="text-2xl font-bold text-indigo-700">{memberCount}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Administrators</p>
                    <p className="text-2xl font-bold text-blue-700">{adminCount}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to={`/churches/${id}/members`} 
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Manage church members →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Future: Related events, etc. */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Coming Soon</h2>
        <p className="text-gray-600 mb-4">
          Event management, attendance tracking, and more features are coming to enhance your church planning experience.
        </p>
      </div>
    </div>
  );
};

export default ChurchDetailPage; 