import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChurchForm } from '../features/church/components/ChurchForm';
import { ChurchFormData } from '../features/church/types';
import { churchService } from '../features/church/services/churchService';

/**
 * Church Create Page - Allows users to create a new church
 */
const ChurchCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: ChurchFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create new church
      const newChurch = await churchService.createChurch(formData);
      
      // Redirect to church details page
      navigate(`/churches/${newChurch._id}`);
    } catch (err) {
      console.error('Error creating church:', err);
      setError('Failed to create church. Please try again later.');
      setIsLoading(false);
    }
  };

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
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create a New Church</h1>
        <p className="text-gray-600 mt-2">
          Fill out the form below to create a new church. Fields marked with * are required.
        </p>
      </div>
      
      <ChurchForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error || undefined}
      />
    </div>
  );
};

export default ChurchCreatePage; 