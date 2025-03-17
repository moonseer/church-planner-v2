import apiClient from '../client';
import { IEventDocument } from '@shared/types/mongoose';

/**
 * Event API endpoints
 */
const eventApi = {
  /**
   * Get all events
   */
  getAll: () => {
    return apiClient.get<IEventDocument[]>('/events');
  },

  /**
   * Get events by date range
   * @param startDate Start date
   * @param endDate End date
   */
  getByDateRange: (startDate: string, endDate: string) => {
    return apiClient.get<IEventDocument[]>(
      `/events?startDate=${startDate}&endDate=${endDate}`
    );
  },

  /**
   * Get a single event by ID
   * @param id Event ID
   */
  getById: (id: string) => {
    return apiClient.get<IEventDocument>(`/events/${id}`);
  },

  /**
   * Create a new event
   * @param eventData Event data to create
   */
  create: (eventData: Partial<IEventDocument>) => {
    return apiClient.post<IEventDocument, Partial<IEventDocument>>(
      '/events',
      eventData
    );
  },

  /**
   * Update an existing event
   * @param id Event ID
   * @param eventData Updated event data
   */
  update: (id: string, eventData: Partial<IEventDocument>) => {
    return apiClient.put<IEventDocument, Partial<IEventDocument>>(
      `/events/${id}`,
      eventData
    );
  },

  /**
   * Delete an event
   * @param id Event ID
   */
  delete: (id: string) => {
    return apiClient.delete<Record<string, never>>(`/events/${id}`);
  },
};

export default eventApi; 