import { useState, useEffect, useCallback } from 'react';
import { Church, ChurchFormData } from '../types';
import { churchService } from '../services/churchService';

interface UseChurchProps {
  initialChurchId?: string;
}

export const useChurch = ({ initialChurchId }: UseChurchProps = {}) => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [currentChurch, setCurrentChurch] = useState<Church | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all churches for the user
  const fetchUserChurches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedChurches = await churchService.getMyChurches();
      setChurches(fetchedChurches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch churches');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a single church by ID
  const fetchChurch = useCallback(async (churchId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedChurch = await churchService.getChurchById(churchId);
      setCurrentChurch(fetchedChurch);
      return fetchedChurch;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch church');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new church
  const createChurch = useCallback(async (churchData: ChurchFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newChurch = await churchService.createChurch(churchData);
      setChurches((prev) => [...prev, newChurch]);
      return newChurch;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create church');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing church
  const updateChurch = useCallback(async (churchId: string, churchData: Partial<ChurchFormData>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedChurch = await churchService.updateChurch(churchId, churchData);
      setChurches((prev) => 
        prev.map((church) => (church._id === churchId ? updatedChurch : church))
      );
      if (currentChurch?._id === churchId) {
        setCurrentChurch(updatedChurch);
      }
      return updatedChurch;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update church');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentChurch]);

  // Delete a church
  const deleteChurch = useCallback(async (churchId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await churchService.deleteChurch(churchId);
      setChurches((prev) => prev.filter((church) => church._id !== churchId));
      if (currentChurch?._id === churchId) {
        setCurrentChurch(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete church');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentChurch]);

  // Add a member to a church
  const addMember = useCallback(async (churchId: string, memberId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedChurch = await churchService.addMember(churchId, memberId);
      setChurches((prev) => 
        prev.map((church) => (church._id === churchId ? updatedChurch : church))
      );
      if (currentChurch?._id === churchId) {
        setCurrentChurch(updatedChurch);
      }
      return updatedChurch;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentChurch]);

  // Remove a member from a church
  const removeMember = useCallback(async (churchId: string, memberId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedChurch = await churchService.removeMember(churchId, memberId);
      setChurches((prev) => 
        prev.map((church) => (church._id === churchId ? updatedChurch : church))
      );
      if (currentChurch?._id === churchId) {
        setCurrentChurch(updatedChurch);
      }
      return updatedChurch;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentChurch]);

  // Add an admin to a church
  const addAdmin = useCallback(async (churchId: string, adminId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedChurch = await churchService.addAdmin(churchId, adminId);
      setChurches((prev) => 
        prev.map((church) => (church._id === churchId ? updatedChurch : church))
      );
      if (currentChurch?._id === churchId) {
        setCurrentChurch(updatedChurch);
      }
      return updatedChurch;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add admin');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentChurch]);

  // Remove an admin from a church
  const removeAdmin = useCallback(async (churchId: string, adminId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedChurch = await churchService.removeAdmin(churchId, adminId);
      setChurches((prev) => 
        prev.map((church) => (church._id === churchId ? updatedChurch : church))
      );
      if (currentChurch?._id === churchId) {
        setCurrentChurch(updatedChurch);
      }
      return updatedChurch;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove admin');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentChurch]);

  // Initialize - fetch churches or a specific church if ID is provided
  useEffect(() => {
    if (initialChurchId) {
      fetchChurch(initialChurchId);
    } else {
      fetchUserChurches();
    }
  }, [initialChurchId, fetchChurch, fetchUserChurches]);

  return {
    churches,
    currentChurch,
    isLoading,
    error,
    fetchUserChurches,
    fetchChurch,
    createChurch,
    updateChurch,
    deleteChurch,
    addMember,
    removeMember,
    addAdmin,
    removeAdmin,
  };
}; 