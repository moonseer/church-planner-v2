import { describe, it, expect, vi, beforeEach } from 'vitest';
import churchApi from './church';
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

describe('Church API', () => {
  const mockChurchData = {
    _id: 'church123',
    name: 'First Baptist Church',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
    phone: '555-123-4567',
    email: 'info@firstbaptist.org',
    website: 'https://www.firstbaptist.org',
  };

  const mockSuccessResponse = {
    success: true,
    data: mockChurchData,
  };

  const mockMultipleChurches = {
    success: true,
    data: [mockChurchData],
    count: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('gets all churches', async () => {
      // Mock successful response
      (apiClient.get as vi.Mock).mockResolvedValueOnce(mockMultipleChurches);
      
      const result = await churchApi.getAll();
      
      expect(apiClient.get).toHaveBeenCalledWith('/churches');
      expect(result).toEqual(mockMultipleChurches);
    });
  });

  describe('getById', () => {
    it('gets a church by id', async () => {
      // Mock successful response
      (apiClient.get as vi.Mock).mockResolvedValueOnce(mockSuccessResponse);
      
      const result = await churchApi.getById('church123');
      
      expect(apiClient.get).toHaveBeenCalledWith('/churches/church123');
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('create', () => {
    it('creates a new church', async () => {
      const newChurchData = {
        name: 'New Church',
        address: '456 Church St',
        city: 'Newtown',
        state: 'NY',
        zip: '67890',
      };
      
      // Mock successful response
      (apiClient.post as vi.Mock).mockResolvedValueOnce(mockSuccessResponse);
      
      const result = await churchApi.create(newChurchData);
      
      expect(apiClient.post).toHaveBeenCalledWith('/churches', newChurchData);
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('update', () => {
    it('updates an existing church', async () => {
      const updateData = {
        name: 'Updated Church Name',
      };
      
      // Mock successful response
      (apiClient.put as vi.Mock).mockResolvedValueOnce(mockSuccessResponse);
      
      const result = await churchApi.update('church123', updateData);
      
      expect(apiClient.put).toHaveBeenCalledWith('/churches/church123', updateData);
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('delete', () => {
    it('deletes a church', async () => {
      const deleteResponse = {
        success: true,
        data: {},
      };
      
      // Mock successful response
      (apiClient.delete as vi.Mock).mockResolvedValueOnce(deleteResponse);
      
      const result = await churchApi.delete('church123');
      
      expect(apiClient.delete).toHaveBeenCalledWith('/churches/church123');
      expect(result).toEqual(deleteResponse);
    });
  });
}); 