import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChurchForm } from '../components/ChurchForm';
import { ChurchFormData } from '../types';
import { useChurch } from '../hooks/useChurch';

/**
 * Page component for editing an existing church
 */
const EditChurchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentChurch, isLoading, error, updateChurch } = useChurch({ 
    initialChurchId: id 
  });

  const handleSubmit = async (data: ChurchFormData) => {
    if (!id) return;
    
    const church = await updateChurch(id, data);
    if (church) {
      navigate(`/churches/${church._id}`);
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

  if (error && !currentChurch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
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

  if (!currentChurch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
          Church not found
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          className="mr-4 px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          onClick={() => navigate(`/churches/${id}`)}
        >
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Church</h1>
      </div>

      <ChurchForm 
        initialData={{
          ...currentChurch,
          _id: currentChurch._id,
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error || undefined}
      />
    </div>
  );
};

export default EditChurchPage; 