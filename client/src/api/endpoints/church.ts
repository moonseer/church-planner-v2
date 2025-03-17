import apiClient from '../client';
import { IChurchDocument } from '@shared/types/mongoose';

/**
 * Church API endpoints
 */
const churchApi = {
  /**
   * Get all churches
   */
  getAll: () => {
    return apiClient.get<IChurchDocument[]>('/churches');
  },

  /**
   * Get a single church by ID
   * @param id Church ID
   */
  getById: (id: string) => {
    return apiClient.get<IChurchDocument>(`/churches/${id}`);
  },

  /**
   * Create a new church
   * @param churchData Church data to create
   */
  create: (churchData: Partial<IChurchDocument>) => {
    return apiClient.post<IChurchDocument, Partial<IChurchDocument>>(
      '/churches',
      churchData
    );
  },

  /**
   * Update an existing church
   * @param id Church ID
   * @param churchData Updated church data
   */
  update: (id: string, churchData: Partial<IChurchDocument>) => {
    return apiClient.put<IChurchDocument, Partial<IChurchDocument>>(
      `/churches/${id}`,
      churchData
    );
  },

  /**
   * Delete a church
   * @param id Church ID
   */
  delete: (id: string) => {
    return apiClient.delete<Record<string, never>>(`/churches/${id}`);
  },
};

export default churchApi; 