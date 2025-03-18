import React from 'react';
import { Link } from 'react-router-dom';
import { Church } from '../types';

interface ChurchCardProps {
  church: Church;
  showActions?: boolean;
  onEdit?: (church: Church) => void;
  onDelete?: (church: Church) => void;
}

/**
 * ChurchCard component for displaying basic church information
 */
export const ChurchCard: React.FC<ChurchCardProps> = ({
  church,
  showActions = true,
  onEdit,
  onDelete,
}) => {
  // Format the address string based on either string or object format
  const formatAddress = () => {
    if (typeof church.address === 'string') {
      // If it's a string, use the old format with top-level properties
      return `${church.address}, ${church.city}, ${church.state} ${church.zipCode}`;
    } else if (typeof church.address === 'object' && church.address) {
      // If it's an object with the new format
      const addr = church.address;
      return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
    }
    // Fallback
    return 'Address not available';
  };

  // Get the phone number from either phoneNumber or phone property
  const phoneNumber = church.phoneNumber || church.phone;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{church.name}</h3>
            <p className="text-gray-600 mt-1">
              {formatAddress()}
            </p>
          </div>
          {church.logo && (
            <img 
              src={church.logo} 
              alt={`${church.name} logo`} 
              className="w-16 h-16 object-contain rounded-full"
            />
          )}
        </div>
        
        <div className="mt-3">
          <p className="text-gray-700">
            <span className="font-medium">Service:</span> {church.serviceDay} at {church.serviceTime}
          </p>
          {church.pastorName && (
            <p className="text-gray-700">
              <span className="font-medium">Pastor:</span> {church.pastorName}
            </p>
          )}
          {phoneNumber && (
            <p className="text-gray-700">
              <span className="font-medium">Phone:</span> {phoneNumber}
            </p>
          )}
        </div>

        {church.description && (
          <p className="mt-3 text-gray-600 line-clamp-2">{church.description}</p>
        )}
      </div>
      
      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
        <Link 
          to={`/churches/${church._id}`}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View Details
        </Link>
        
        {showActions && (
          <div className="flex space-x-2">
            {onEdit && (
              <button 
                onClick={() => onEdit(church)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(church)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 