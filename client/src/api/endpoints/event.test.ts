import { describe, it, expect, vi, beforeEach } from 'vitest';
import eventApi from './event';
import apiClient from '../client';

// Mock the apiClient
vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Event API', () => {
  const mockEventData = {
    _id: 'event123',
    title: 'Sunday Service',
    description: 'Regular weekly service',
    start: '2023-10-15T10:00:00.000Z',
    end: '2023-10-15T11:30:00.000Z',
    allDay: false,
    location: 'Main Sanctuary',
    eventType: 'service123',
    church: 'church123',
    createdBy: 'user123',
    createdAt: '2023-10-10T14:30:00.000Z',
  };

  const mockSuccessResponse = {
    success: true,
    data: mockEventData,
  };

  const mockMultipleEvents = {
    success: true,
    data: [mockEventData],
    count: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('gets all events', async () => {
      // Mock successful response
      (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockMultipleEvents);
      
      const result = await eventApi.getAll();
      
      expect(apiClient.get).toHaveBeenCalledWith('/events');
      expect(result).toEqual(mockMultipleEvents);
    });
  });

  describe('getByDateRange', () => {
    it('gets events by date range', async () => {
      const startDate = '2023-10-01';
      const endDate = '2023-10-31';
      
      // Mock successful response
      (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockMultipleEvents);
      
      const result = await eventApi.getByDateRange(startDate, endDate);
      
      expect(apiClient.get).toHaveBeenCalledWith(`/events?startDate=${startDate}&endDate=${endDate}`);
      expect(result).toEqual(mockMultipleEvents);
    });
  });

  describe('getById', () => {
    it('gets an event by id', async () => {
      // Mock successful response
      (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockSuccessResponse);
      
      const result = await eventApi.getById('event123');
      
      expect(apiClient.get).toHaveBeenCalledWith('/events/event123');
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('create', () => {
    it('creates a new event', async () => {
      const newEventData = {
        title: 'New Event',
        description: 'A brand new event',
        start: '2023-11-15T10:00:00.000Z',
        end: '2023-11-15T11:30:00.000Z',
        allDay: false,
        location: 'Community Room',
        eventType: 'meeting123',
        church: 'church123',
      };
      
      // Mock successful response
      (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockSuccessResponse);
      
      const result = await eventApi.create(newEventData);
      
      expect(apiClient.post).toHaveBeenCalledWith('/events', newEventData);
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('update', () => {
    it('updates an existing event', async () => {
      const updateData = {
        title: 'Updated Event Title',
        description: 'Updated description',
      };
      
      // Mock successful response
      (apiClient.put as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockSuccessResponse);
      
      const result = await eventApi.update('event123', updateData);
      
      expect(apiClient.put).toHaveBeenCalledWith('/events/event123', updateData);
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('delete', () => {
    it('deletes an event', async () => {
      const deleteResponse = {
        success: true,
        data: {},
      };
      
      // Mock successful response
      (apiClient.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(deleteResponse);
      
      const result = await eventApi.delete('event123');
      
      expect(apiClient.delete).toHaveBeenCalledWith('/events/event123');
      expect(result).toEqual(deleteResponse);
    });
  });
}); 