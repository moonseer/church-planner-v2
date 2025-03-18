import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChurch } from '../hooks/useChurch';
import { ChurchUser } from '../types';

/**
 * Page component for managing church members and admins
 */
const ChurchMembersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentChurch, isLoading, error, addMember, removeMember, addAdmin, removeAdmin } = useChurch({ 
    initialChurchId: id 
  });
  
  const [newMemberId, setNewMemberId] = useState('');
  const [newAdminId, setNewAdminId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newMemberId.trim()) return;
    
    setActionLoading(true);
    setActionError(null);
    
    try {
      await addMember(id, newMemberId.trim());
      setNewMemberId('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!id || !window.confirm('Are you sure you want to remove this member?')) return;
    
    setActionLoading(true);
    setActionError(null);
    
    try {
      await removeMember(id, memberId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newAdminId.trim()) return;
    
    setActionLoading(true);
    setActionError(null);
    
    try {
      await addAdmin(id, newAdminId.trim());
      setNewAdminId('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (!id || !window.confirm('Are you sure you want to remove this admin?')) return;
    
    setActionLoading(true);
    setActionError(null);
    
    try {
      await removeAdmin(id, adminId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to remove admin');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to render a user from string ID or object
  const renderUser = (user: string | ChurchUser) => {
    if (typeof user === 'string') {
      return <span className="text-gray-700">User ID: {user}</span>;
    }
    
    return (
      <div className="flex items-center">
        <span className="font-medium">{user.name}</span>
        <span className="ml-2 text-gray-500">{user.email}</span>
      </div>
    );
  };

  // Extract members and admins arrays
  const members = Array.isArray(currentChurch.members) ? currentChurch.members : [];
  const admins = Array.isArray(currentChurch.admins) ? currentChurch.admins : [];
  
  // Get admin IDs as strings for comparison
  const adminIds = admins.map(admin => 
    typeof admin === 'string' ? admin : admin._id
  );
  
  // Creator ID as string
  const creatorId = typeof currentChurch.createdBy === 'string' 
    ? currentChurch.createdBy 
    : currentChurch.createdBy._id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          className="mr-4 px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          onClick={() => navigate(`/churches/${id}`)}
        >
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Manage Church Members</h1>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Members Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Members</h2>
          
          <form onSubmit={handleAddMember} className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                placeholder="User ID to add as member"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={actionLoading}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                disabled={actionLoading || !newMemberId.trim()}
              >
                Add
              </button>
            </div>
          </form>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {members.length === 0 ? (
              <p className="text-gray-500">No members yet.</p>
            ) : (
              members.map((member, index) => {
                const memberId = typeof member === 'string' ? member : member._id;
                const isAdmin = adminIds.includes(memberId);
                const isCreator = memberId === creatorId;
                
                return (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex-grow">
                      {renderUser(member)}
                      <div className="mt-1 flex space-x-2">
                        {isAdmin && (
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Admin
                          </span>
                        )}
                        {isCreator && (
                          <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                            Creator
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!isCreator && (
                      <button
                        onClick={() => handleRemoveMember(memberId)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                        disabled={actionLoading}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Admins Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Administrators</h2>
          
          <form onSubmit={handleAddAdmin} className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={newAdminId}
                onChange={(e) => setNewAdminId(e.target.value)}
                placeholder="User ID to add as admin"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={actionLoading}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                disabled={actionLoading || !newAdminId.trim()}
              >
                Add
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Note: Adding an admin automatically adds them as a member if they aren't already.
            </p>
          </form>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {admins.length === 0 ? (
              <p className="text-gray-500">No administrators yet.</p>
            ) : (
              admins.map((admin, index) => {
                const adminId = typeof admin === 'string' ? admin : admin._id;
                const isCreator = adminId === creatorId;
                
                return (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex-grow">
                      {renderUser(admin)}
                      {isCreator && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          Creator
                        </span>
                      )}
                    </div>
                    
                    {!isCreator && (
                      <button
                        onClick={() => handleRemoveAdmin(adminId)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                        disabled={actionLoading}
                      >
                        Revoke Admin
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchMembersPage; 