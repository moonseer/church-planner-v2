import { apiClient } from '../client';
import { ApiResponse, PaginatedResponse, QueryParams } from '@shared/types/api';
import { Event } from '@shared/types/models';

/**
 * Event API service for interacting with the Event Service via the API Gateway
 */
export const eventAPI = {
  /**
   * Get all events for a church (paginated)
   */
  async getEvents(churchId: string, query?: QueryParams): Promise<PaginatedResponse<Event>> {
    return apiClient.get<PaginatedResponse<Event>>(`/churches/${churchId}/events`, query);
  },

  /**
   * Get an event by ID
   */
  async getEvent(churchId: string, eventId: string): Promise<ApiResponse<Event>> {
    return apiClient.get<ApiResponse<Event>>(`/churches/${churchId}/events/${eventId}`);
  },

  /**
   * Create a new event
   */
  async createEvent(churchId: string, eventData: Partial<Event>): Promise<ApiResponse<Event>> {
    return apiClient.post<ApiResponse<Event>>(`/churches/${churchId}/events`, eventData);
  },

  /**
   * Update an event
   */
  async updateEvent(churchId: string, eventId: string, eventData: Partial<Event>): Promise<ApiResponse<Event>> {
    return apiClient.put<ApiResponse<Event>>(`/churches/${churchId}/events/${eventId}`, eventData);
  },

  /**
   * Delete an event
   */
  async deleteEvent(churchId: string, eventId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/churches/${churchId}/events/${eventId}`);
  },

  /**
   * Get upcoming events for a church
   */
  async getUpcomingEvents(churchId: string, limit: number = 5): Promise<PaginatedResponse<Event>> {
    return apiClient.get<PaginatedResponse<Event>>(`/churches/${churchId}/events/upcoming`, { limit });
  },

  /**
   * Get events by date range
   */
  async getEventsByDateRange(
    churchId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<PaginatedResponse<Event>> {
    return apiClient.get<PaginatedResponse<Event>>(`/churches/${churchId}/events/range`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  },

  /**
   * Add attendees to an event
   */
  async addEventAttendees(churchId: string, eventId: string, attendeeIds: string[]): Promise<ApiResponse<Event>> {
    return apiClient.post<ApiResponse<Event>>(
      `/churches/${churchId}/events/${eventId}/attendees`,
      { attendeeIds }
    );
  },

  /**
   * Remove an attendee from an event
   */
  async removeEventAttendee(churchId: string, eventId: string, attendeeId: string): Promise<ApiResponse<Event>> {
    return apiClient.delete<ApiResponse<Event>>(
      `/churches/${churchId}/events/${eventId}/attendees/${attendeeId}`
    );
  },

  /**
   * Get event statistics for a church
   */
  async getEventStats(churchId: string): Promise<ApiResponse<{
    totalEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    averageAttendance: number;
    eventsByType: {
      service: number;
      meeting: number;
      outreach: number;
      social: number;
      other: number;
    };
  }>> {
    return apiClient.get<ApiResponse<any>>(`/churches/${churchId}/events/stats`);
  }
}; 