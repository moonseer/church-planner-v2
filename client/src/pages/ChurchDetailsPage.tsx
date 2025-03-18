import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Church } from '../features/church/types';
import { churchService } from '../features/church/services/churchService';

/**
 * Church Details Page - Displays detailed information about a specific church
 */
const ChurchDetailsPage: React.FC = () => {
  const { churchId } = useParams<{ churchId: string }>();
  const navigate = useNavigate();
  const [church, setChurch] = useState<Church | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChurch = async () => {
      if (!churchId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await churchService.getChurchById(churchId);
        setChurch(data);
      } catch (err) {
        console.error(`Error fetching church ${churchId}:`, err);
        setError('Failed to load church details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChurch();
  }, [churchId]);

  const handleDelete = async () => {
    if (!church) return;
    
    if (!window.confirm(`Are you sure you want to delete ${church.name}?`)) {
      return;
    }

    try {
      await churchService.deleteChurch(church._id);
      navigate('/churches');
    } catch (err) {
      console.error('Error deleting church:', err);
      setError('Failed to delete church. Please try again later.');
    }
  };

  // Helper function to format address
  const formatAddress = (church: Church): string => {
    if (typeof church.address === 'string') {
      return church.address;
    }
    
    const { street, city, state, zipCode } = church.address;
    return `${street}, ${city}, ${state} ${zipCode}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error || !church) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error || 'Church not found'}
        </div>
        <Link 
          to="/churches" 
          className="text-indigo-600 hover:text-indigo-500"
        >
          &larr; Back to Churches
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to="/churches" 
          className="text-indigo-600 hover:text-indigo-500"
        >
          &larr; Back to Churches
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{church.name}</h1>
              {church.pastorName && (
                <p className="text-gray-600 mb-4">Pastor: {church.pastorName}</p>
              )}
            </div>
            
            {church.logo && (
              <img 
                src={church.logo} 
                alt={`${church.name} logo`} 
                className="h-20 w-20 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/80x80?text=Logo";
                }}
              />
            )}
          </div>
          
          <div className="border-t border-gray-200 my-4 pt-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">Address:</p>
                <p className="font-medium">{formatAddress(church)}</p>
              </div>
              
              <div>
                {church.phoneNumber && (
                  <div className="mb-2">
                    <p className="text-gray-600 mb-1">Phone:</p>
                    <p className="font-medium">{church.phoneNumber}</p>
                  </div>
                )}
                
                {church.email && (
                  <div className="mb-2">
                    <p className="text-gray-600 mb-1">Email:</p>
                    <p className="font-medium">{church.email}</p>
                  </div>
                )}
                
                {church.website && (
                  <div>
                    <p className="text-gray-600 mb-1">Website:</p>
                    <a 
                      href={church.website.startsWith('http') ? church.website : `https://${church.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      {church.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 my-4 pt-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Service Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">Service Day:</p>
                <p className="font-medium">{church.serviceDay || 'Not specified'}</p>
              </div>
              
              <div>
                <p className="text-gray-600 mb-1">Service Time:</p>
                <p className="font-medium">{church.serviceTime || 'Not specified'}</p>
              </div>
              
              <div>
                <p className="text-gray-600 mb-1">Timezone:</p>
                <p className="font-medium">{church.timezone || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          {church.description && (
            <div className="border-t border-gray-200 my-4 pt-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">About</h2>
              <p className="text-gray-700 whitespace-pre-line">{church.description}</p>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-4">
            <Link
              to={`/churches/${church._id}/edit`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Church
            </Link>
            
            <Link
              to={`/churches/${church._id}/members`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Manage Members
            </Link>
            
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Church
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchDetailsPage; 