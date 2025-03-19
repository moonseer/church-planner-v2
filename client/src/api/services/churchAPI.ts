import { apiClient } from '../client';
import { ApiResponse, PaginatedResponse, QueryParams } from '@shared/types/api';
import { Church } from '@shared/types/models';

/**
 * Church API service for interacting with the Church Service via the API Gateway
 */
export const churchAPI = {
  /**
   * Get all churches (paginated)
   */
  async getChurches(query?: QueryParams): Promise<PaginatedResponse<Church>> {
    return apiClient.get<PaginatedResponse<Church>>('/churches', query);
  },

  /**
   * Get a church by ID
   */
  async getChurch(id: string): Promise<ApiResponse<Church>> {
    return apiClient.get<ApiResponse<Church>>(`/churches/${id}`);
  },

  /**
   * Create a new church
   */
  async createChurch(churchData: Partial<Church>): Promise<ApiResponse<Church>> {
    return apiClient.post<ApiResponse<Church>>('/churches', churchData);
  },

  /**
   * Update a church
   */
  async updateChurch(id: string, churchData: Partial<Church>): Promise<ApiResponse<Church>> {
    return apiClient.put<ApiResponse<Church>>(`/churches/${id}`, churchData);
  },

  /**
   * Delete a church
   */
  async deleteChurch(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/churches/${id}`);
  },

  /**
   * Get churches for the current user
   */
  async getMyChurches(): Promise<PaginatedResponse<Church>> {
    return apiClient.get<PaginatedResponse<Church>>('/churches/my-churches');
  },

  /**
   * Add an admin to a church
   */
  async addChurchAdmin(churchId: string, adminId: string): Promise<ApiResponse<Church>> {
    return apiClient.post<ApiResponse<Church>>(`/churches/${churchId}/admins`, { adminId });
  },

  /**
   * Remove an admin from a church
   */
  async removeChurchAdmin(churchId: string, adminId: string): Promise<ApiResponse<Church>> {
    return apiClient.delete<ApiResponse<Church>>(`/churches/${churchId}/admins/${adminId}`);
  }
}; 