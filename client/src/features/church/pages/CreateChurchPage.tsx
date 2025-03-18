import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChurchForm } from '../components/ChurchForm';
import { ChurchFormData } from '../types';
import { useChurch } from '../hooks/useChurch';

/**
 * Page component for creating a new church
 */
const CreateChurchPage: React.FC = () => {
  const navigate = useNavigate();
  const { createChurch, isLoading, error } = useChurch();

  const handleSubmit = async (data: ChurchFormData) => {
    const church = await createChurch(data);
    if (church) {
      navigate(`/churches/${church._id}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          className="mr-4 px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          onClick={() => navigate('/churches')}
        >
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Church</h1>
      </div>

      <ChurchForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error || undefined}
      />
    </div>
  );
};

export default CreateChurchPage; 