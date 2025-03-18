import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChurchForm } from '../features/church/components/ChurchForm';
import { Church, ChurchFormData } from '../features/church/types';
import { churchService } from '../features/church/services/churchService';

/**
 * Church Edit Page - Allows users to edit an existing church
 */
const ChurchEditPage: React.FC = () => {
  const { churchId } = useParams<{ churchId: string }>();
  const navigate = useNavigate();
  const [church, setChurch] = useState<Church | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChurch = async () => {
      if (!churchId) return;
      
      try {
        setIsFetching(true);
        setError(null);
        
        const data = await churchService.getChurchById(churchId);
        setChurch(data);
      } catch (err) {
        console.error(`Error fetching church ${churchId}:`, err);
        setError('Failed to load church details. Please try again later.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchChurch();
  }, [churchId]);

  const handleSubmit = async (formData: ChurchFormData) => {
    if (!churchId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Update church
      await churchService.updateChurch(churchId, formData);
      
      // Redirect to church details page
      navigate(`/churches/${churchId}`);
    } catch (err) {
      console.error('Error updating church:', err);
      setError('Failed to update church. Please try again later.');
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!church && !isFetching) {
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
          to={`/churches/${churchId}`} 
          className="text-indigo-600 hover:text-indigo-500"
        >
          &larr; Back to Church Details
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Church</h1>
        <p className="text-gray-600 mt-2">
          Update the church information below. Fields marked with * are required.
        </p>
      </div>
      
      {church && (
        <ChurchForm
          initialData={church}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error || undefined}
        />
      )}
    </div>
  );
};

export default ChurchEditPage; 