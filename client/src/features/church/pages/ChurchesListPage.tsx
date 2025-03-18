import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Church } from '../types';
import { ChurchList } from '../components/ChurchList';
import { useChurch } from '../hooks/useChurch';

/**
 * Page component for displaying a list of churches the user has access to
 */
const ChurchesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { churches, isLoading, error, deleteChurch } = useChurch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Handle navigation to create new church page
  const handleCreateChurch = () => {
    navigate('/churches/new');
  };

  // Handle navigation to edit church page
  const handleEditChurch = (church: Church) => {
    navigate(`/churches/${church._id}/edit`);
  };

  // Handle church deletion with confirmation
  const handleDeleteChurch = async (church: Church) => {
    if (window.confirm(`Are you sure you want to delete ${church.name}?`)) {
      setIsDeleting(true);
      setDeleteError(null);
      
      try {
        const success = await deleteChurch(church._id);
        if (!success) {
          setDeleteError('Failed to delete church. Please try again.');
        }
      } catch (err) {
        setDeleteError(err instanceof Error ? err.message : 'An error occurred while deleting the church');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Churches</h1>
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          onClick={handleCreateChurch}
        >
          Create New Church
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {deleteError}
        </div>
      )}

      <ChurchList 
        churches={churches}
        isLoading={isLoading || isDeleting}
        onEditChurch={handleEditChurch}
        onDeleteChurch={handleDeleteChurch}
      />
    </div>
  );
};

export default ChurchesListPage; 