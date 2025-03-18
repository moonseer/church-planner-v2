import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Church } from '../features/church/types';
import { churchService } from '../features/church/services/churchService';
import { useAuth } from '../features/auth/hooks/useAuth';

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

/**
 * Church Members Page - Displays and manages members of a specific church
 */
const ChurchMembersPage: React.FC = () => {
  const { churchId } = useParams<{ churchId: string }>();
  const { user } = useAuth();
  const [church, setChurch] = useState<Church | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChurchAndMembers = async () => {
      if (!churchId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real app, this would be a single API call to get church with members
        const churchData = await churchService.getChurchById(churchId);
        setChurch(churchData);
        
        // This is a placeholder - in a real app, you would fetch real members
        // Simulating members data for demonstration
        const mockMembers: Member[] = [
          {
            _id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Admin',
            joinedAt: new Date(2022, 0, 15).toISOString(),
          },
          {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'Member',
            joinedAt: new Date(2022, 1, 20).toISOString(),
          },
          {
            _id: '3',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'Member',
            joinedAt: new Date(2022, 2, 10).toISOString(),
          },
        ];
        
        setMembers(mockMembers);
      } catch (err) {
        console.error(`Error fetching church ${churchId}:`, err);
        setError('Failed to load church members. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChurchAndMembers();
  }, [churchId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!churchId || !newMemberEmail.trim()) return;
    
    try {
      setAddingMember(true);
      setAddMemberError(null);
      
      // In a real app, you would make an API call to add a member
      // For now, we're simulating it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new member to the list (simulated)
      const newMember: Member = {
        _id: Date.now().toString(),
        name: newMemberEmail.split('@')[0], // Simulated name from email
        email: newMemberEmail,
        role: 'Member',
        joinedAt: new Date().toISOString(),
      };
      
      setMembers(prev => [...prev, newMember]);
      setNewMemberEmail('');
    } catch (err) {
      console.error('Error adding member:', err);
      setAddMemberError('Failed to add member. Please try again.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!churchId || !window.confirm('Are you sure you want to remove this member?')) {
      return;
    }
    
    try {
      // In a real app, you would make an API call to remove the member
      // For now, we're just updating the state
      setMembers(prev => prev.filter(member => member._id !== memberId));
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member. Please try again later.');
    }
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
          to={`/churches/${churchId}`} 
          className="text-indigo-600 hover:text-indigo-500"
        >
          &larr; Back to Church Details
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{church.name} - Members</h1>
        <p className="text-gray-600 mt-2">
          Manage church members and their roles
        </p>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add New Member</h2>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="newMemberEmail" className="sr-only">Member Email</label>
              <input
                type="email"
                id="newMemberEmail"
                placeholder="Enter member's email address"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={addingMember}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={addingMember || !newMemberEmail.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {addingMember ? 'Adding...' : 'Add Member'}
            </button>
          </form>
          
          {addMemberError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {addMemberError}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Church Members</h2>
        </div>
        
        {members.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No members found for this church.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{member.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">{member.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.role === 'Admin' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {
                            // Toggle role between Admin and Member
                            setMembers(prev => 
                              prev.map(m => 
                                m._id === member._id 
                                  ? { ...m, role: m.role === 'Admin' ? 'Member' : 'Admin' } 
                                  : m
                              )
                            );
                          }}
                        >
                          {member.role === 'Admin' ? 'Make Member' : 'Make Admin'}
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChurchMembersPage; 