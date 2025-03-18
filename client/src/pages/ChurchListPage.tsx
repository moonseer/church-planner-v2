import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Church } from '../features/church/types';
import { churchService } from '../features/church/services/churchService';
import { ChurchList } from '../features/church/components/ChurchList';
import { useAuth } from '../features/auth/hooks/useAuth';

/**
 * Church List Page - Displays a list of churches the user has access to
 */
const ChurchListPage: React.FC = () => {
  const { user } = useAuth();
  const [churches, setChurches] = useState<Church[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChurches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get churches from API
        const data = await churchService.getMyChurches();
        setChurches(data);
      } catch (err) {
        console.error('Error fetching churches:', err);
        setError('Failed to load churches. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChurches();
  }, []);

  const handleDeleteChurch = async (church: Church) => {
    if (!window.confirm(`Are you sure you want to delete ${church.name}?`)) {
      return;
    }

    try {
      await churchService.deleteChurch(church._id);
      setChurches(prev => prev.filter(c => c._id !== church._id));
    } catch (err) {
      console.error('Error deleting church:', err);
      setError('Failed to delete church. Please try again later.');
    }
  };

  // Helper function to safely get address property
  const getAddressProperty = (church: Church, prop: string): string => {
    if (typeof church.address === 'string') {
      return '';
    }
    return (church.address as any)?.[prop] || '';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Churches</h1>
        <Link
          to="/churches/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add New Church
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <ChurchList
        churches={churches}
        isLoading={isLoading}
        onEditChurch={(church) => {}}
        onDeleteChurch={handleDeleteChurch}
      />
    </div>
  );
};

export default ChurchListPage; 