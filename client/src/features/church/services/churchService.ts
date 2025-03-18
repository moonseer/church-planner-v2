import { Church, ChurchFormData, ChurchResponse, ChurchesResponse } from '../types';

const API_BASE_URL = '/api';

/**
 * Service for handling church-related API requests
 */
export const churchService = {
  /**
   * Get all churches
   */
  async getChurches(): Promise<Church[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/churches`);
      
      if (!response.ok) {
        throw new Error(`Error fetching churches: ${response.statusText}`);
      }
      
      const data: ChurchesResponse = await response.json();
      return data.churches;
    } catch (error) {
      console.error('Error fetching churches:', error);
      throw error;
    }
  },
  
  /**
   * Get churches for the current user
   */
  async getMyChurches(): Promise<Church[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/churches/my-churches`);
      
      if (!response.ok) {
        throw new Error(`Error fetching user churches: ${response.statusText}`);
      }
      
      const data: ChurchesResponse = await response.json();
      return data.churches;
    } catch (error) {
      console.error('Error fetching user churches:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific church by ID
   */
  async getChurchById(churchId: string): Promise<Church> {
    try {
      const response = await fetch(`${API_BASE_URL}/churches/${churchId}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching church: ${response.statusText}`);
      }
      
      const data: ChurchResponse = await response.json();
      return data.church;
    } catch (error) {
      console.error(`Error fetching church ${churchId}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new church
   */
  async createChurch(churchData: ChurchFormData): Promise<Church> {
    try {
      const response = await fetch(`${API_BASE_URL}/churches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(churchData),
      });
      
      if (!response.ok) {
        throw new Error(`Error creating church: ${response.statusText}`);
      }
      
      const data: ChurchResponse = await response.json();
      return data.church;
    } catch (error) {
      console.error('Error creating church:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing church
   */
  async updateChurch(churchId: string, churchData: Partial<ChurchFormData>): Promise<Church> {
    try {
      const response = await fetch(`${API_BASE_URL}/churches/${churchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(churchData),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating church: ${response.statusText}`);
      }
      
      const data: ChurchResponse = await response.json();
      return data.church;
    } catch (error) {
      console.error(`Error updating church ${churchId}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a church
   */
  async deleteChurch(churchId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/churches/${churchId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting church: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error deleting church ${churchId}:`, error);
      throw error;
    }
  },
  
  /**
   * Add a member to a church
   */
  async addMember(churchId: string, memberId: string): Promise<Church> {
    try {
      const response = await fetch(`${API_BASE_URL}/churches/${churchId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId }),
      });
      
      if (!response.ok) {
        throw new Error(`Error adding member: ${response.statusText}`);
      }
      
      const data: ChurchResponse = await response.json();
      return data.church;
    } catch (error) {
      console.error(`Error adding member to church ${churchId}:`, error);
      throw error;
    }
  },
  
  /**
   * Remove a member from a church
   */
  async removeMember(churchId: string, memberId: string): Promise<Church> {
    try {
      const response = await fetch(`${API_BASE_URL}/churches/${churchId}/members/${memberId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error removing member: ${response.statusText}`);
      }
      
      const data: ChurchResponse = await response.json();
      return data.church;
    } catch (error) {
      console.error(`Error removing member from church ${churchId}:`, error);
      throw error;
    }
  },
  
  /**
   * Add an admin to a church
   */
  async addAdmin(churchId: string, adminId: string): Promise<Church> {
    try {
      const response = await fetch(`${API_BASE_URL}/churches/${churchId}/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId }),
      });
      
      if (!response.ok) {
        throw new Error(`Error adding admin: ${response.statusText}`);
      }
      
      const data: ChurchResponse = await response.json();
      return data.church;
    } catch (error) {
      console.error(`Error adding admin to church ${churchId}:`, error);
      throw error;
    }
  },
  
  /**
   * Remove an admin from a church
   */
  async removeAdmin(churchId: string, adminId: string): Promise<Church> {
    try {
      const response = await fetch(`${API_BASE_URL}/churches/${churchId}/admins/${adminId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error removing admin: ${response.statusText}`);
      }
      
      const data: ChurchResponse = await response.json();
      return data.church;
    } catch (error) {
      console.error(`Error removing admin from church ${churchId}:`, error);
      throw error;
    }
  },
}; 