import { Request, Response } from 'express';
import { getChurches, createChurch, getChurch, updateChurch, deleteChurch } from '../controllers/churchController';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('mongoose');

// Mock Church model before importing it
jest.mock('../models/Church', () => {
  return {
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };
});

// Import Church after mocking
import Church from '../models/Church';

describe('Church Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const mockChurchId = 'church123';

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    // Clear all mock calls
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getChurches', () => {
    it('should return all churches', async () => {
      // Setup mock churches
      const mockChurches = [
        {
          _id: mockChurchId,
          name: 'First Baptist Church',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345',
          phone: '555-123-4567',
          email: 'info@firstbaptist.org',
          website: 'https://firstbaptist.org',
          createdAt: new Date(),
        },
        {
          _id: 'church456',
          name: 'Grace Community Church',
          address: '456 Oak Ave',
          city: 'Somewhere',
          state: 'TX',
          zip: '67890',
          phone: '555-987-6543',
          email: 'info@gracecommunity.org',
          website: 'https://gracecommunity.org',
          createdAt: new Date(),
        },
      ];

      // Mock Church.find
      (Church.find as jest.Mock).mockResolvedValue(mockChurches);

      // Call the controller function
      await getChurches(req as Request, res as Response);

      // Assertions
      expect(Church.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockChurches,
      });
    });

    it('should handle errors', async () => {
      // Mock Church.find to throw an error
      (Church.find as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await getChurches(req as Request, res as Response);

      // Assertions
      expect(Church.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('createChurch', () => {
    it('should create a new church', async () => {
      // Setup request body
      req.body = {
        name: 'New Church',
        address: '789 Pine St',
        city: 'Newtown',
        state: 'NY',
        zip: '10001',
        phone: '555-111-2222',
        email: 'info@newchurch.org',
        website: 'https://newchurch.org',
      };

      // Setup mock created church
      const mockChurch = {
        _id: 'newChurch789',
        ...req.body,
        createdAt: new Date(),
      };

      // Mock Church.create
      (Church.create as jest.Mock).mockResolvedValue(mockChurch);

      // Call the controller function
      await createChurch(req as Request, res as Response);

      // Assertions
      expect(Church.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockChurch,
      });
    });

    it('should handle validation errors', async () => {
      // Setup request body with missing required fields
      req.body = {
        name: 'Incomplete Church',
        // Missing required address, city, state, zip
      };

      // Mock Church.create to throw a validation error
      (Church.create as jest.Mock).mockImplementation(() => {
        throw new Error('Validation failed: address, city, state, zip');
      });

      // Call the controller function
      await createChurch(req as Request, res as Response);

      // Assertions
      expect(Church.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed: address, city, state, zip',
      });
    });
  });

  describe('getChurch', () => {
    it('should return a single church by ID', async () => {
      // Setup request parameter
      req.params = { id: mockChurchId };

      // Setup mock church
      const mockChurch = {
        _id: mockChurchId,
        name: 'First Baptist Church',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        phone: '555-123-4567',
        email: 'info@firstbaptist.org',
        website: 'https://firstbaptist.org',
        createdAt: new Date(),
      };

      // Mock Church.findById
      (Church.findById as jest.Mock).mockResolvedValue(mockChurch);

      // Call the controller function
      await getChurch(req as Request, res as Response);

      // Assertions
      expect(Church.findById).toHaveBeenCalledWith(mockChurchId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockChurch,
      });
    });

    it('should return 404 if church is not found', async () => {
      // Setup request parameter
      req.params = { id: 'nonexistent' };

      // Mock Church.findById to return null
      (Church.findById as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await getChurch(req as Request, res as Response);

      // Assertions
      expect(Church.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Church not found',
      });
    });

    it('should handle errors', async () => {
      // Setup request parameter
      req.params = { id: mockChurchId };

      // Mock Church.findById to throw an error
      (Church.findById as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await getChurch(req as Request, res as Response);

      // Assertions
      expect(Church.findById).toHaveBeenCalledWith(mockChurchId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('updateChurch', () => {
    it('should update a church', async () => {
      // Setup request parameter and body
      req.params = { id: mockChurchId };
      req.body = {
        name: 'Updated Church Name',
        address: 'Updated Address',
        phone: '555-999-8888',
      };

      // Setup mock updated church
      const mockUpdatedChurch = {
        _id: mockChurchId,
        name: 'Updated Church Name',
        address: 'Updated Address',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        phone: '555-999-8888',
        email: 'info@firstbaptist.org',
        website: 'https://firstbaptist.org',
        createdAt: new Date(),
      };

      // Mock Church.findByIdAndUpdate
      (Church.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedChurch);

      // Call the controller function
      await updateChurch(req as Request, res as Response);

      // Assertions
      expect(Church.findByIdAndUpdate).toHaveBeenCalledWith(
        mockChurchId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedChurch,
      });
    });

    it('should return 404 if church is not found', async () => {
      // Setup request parameter
      req.params = { id: 'nonexistent' };
      req.body = {
        name: 'Updated Church Name',
      };

      // Mock Church.findByIdAndUpdate to return null
      (Church.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await updateChurch(req as Request, res as Response);

      // Assertions
      expect(Church.findByIdAndUpdate).toHaveBeenCalledWith(
        'nonexistent',
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Church not found',
      });
    });

    it('should handle validation errors', async () => {
      // Setup request parameter and body
      req.params = { id: mockChurchId };
      req.body = {
        email: 'invalid-email', // Invalid email format
      };

      // Mock Church.findByIdAndUpdate to throw a validation error
      (Church.findByIdAndUpdate as jest.Mock).mockImplementation(() => {
        throw new Error('Validation failed: email must be valid');
      });

      // Call the controller function
      await updateChurch(req as Request, res as Response);

      // Assertions
      expect(Church.findByIdAndUpdate).toHaveBeenCalledWith(
        mockChurchId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed: email must be valid',
      });
    });
  });

  describe('deleteChurch', () => {
    it('should delete a church', async () => {
      // Setup request parameter
      req.params = { id: mockChurchId };

      // Setup mock church
      const mockChurch = {
        _id: mockChurchId,
        name: 'Church to Delete',
        address: '123 Delete St',
        city: 'Deleteville',
        state: 'DL',
        zip: '00000',
      };

      // Mock Church.findByIdAndDelete
      (Church.findByIdAndDelete as jest.Mock).mockResolvedValue(mockChurch);

      // Call the controller function
      await deleteChurch(req as Request, res as Response);

      // Assertions
      expect(Church.findByIdAndDelete).toHaveBeenCalledWith(mockChurchId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {},
      });
    });

    it('should return 404 if church is not found', async () => {
      // Setup request parameter
      req.params = { id: 'nonexistent' };

      // Mock Church.findByIdAndDelete to return null
      (Church.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await deleteChurch(req as Request, res as Response);

      // Assertions
      expect(Church.findByIdAndDelete).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Church not found',
      });
    });

    it('should handle errors', async () => {
      // Setup request parameter
      req.params = { id: mockChurchId };

      // Mock Church.findByIdAndDelete to throw an error
      (Church.findByIdAndDelete as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await deleteChurch(req as Request, res as Response);

      // Assertions
      expect(Church.findByIdAndDelete).toHaveBeenCalledWith(mockChurchId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });
}); 