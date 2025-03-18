import React from 'react';
import { Church } from '../types';
import { ChurchCard } from './ChurchCard';

interface ChurchListProps {
  churches: Church[];
  isLoading: boolean;
  onEditChurch?: (church: Church) => void;
  onDeleteChurch?: (church: Church) => void;
}

/**
 * Component that displays a list of churches
 */
export const ChurchList: React.FC<ChurchListProps> = ({
  churches,
  isLoading,
  onEditChurch,
  onDeleteChurch,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (churches.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No Churches Found</h2>
        <p className="text-gray-600">
          There are no churches to display.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {churches.map((church) => (
        <ChurchCard
          key={church._id}
          church={church}
          showActions={!!(onEditChurch || onDeleteChurch)}
          onEdit={onEditChurch}
          onDelete={onDeleteChurch}
        />
      ))}
    </div>
  );
}; 