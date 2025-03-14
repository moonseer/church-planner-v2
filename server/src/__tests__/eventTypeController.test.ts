import { Request, Response } from 'express';
import { getEventTypes, getEventType, createEventType, updateEventType, deleteEventType } from '../controllers/eventTypeController';
import mongoose from 'mongoose';

// Extended Request type to include user property
interface RequestWithUser extends Request {
  user?: {
    id: string;
    church: string;
    [key: string]: any;
  };
}

// Mock dependencies
jest.mock('mongoose');

// Mock EventType model before importing it
jest.mock('../models/EventType', () => {
  return {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  };
});

// Import EventType after mocking
import EventType from '../models/EventType';

describe('EventType Controller', () => {
  let req: Partial<RequestWithUser>;
  let res: Partial<Response>;
  const mockEventTypeId = 'eventType123';
  const mockChurchId = 'church123';
  const mockUserId = 'user123';

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: {
        id: mockUserId,
        church: mockChurchId
      },
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

  describe('getEventTypes', () => {
    it('should return all event types for a church', async () => {
      // Setup mock event types
      const mockEventTypes = [
        {
          _id: mockEventTypeId,
          name: 'Sunday Service',
          color: '#FF0000',
          description: 'Regular Sunday worship service',
          church: mockChurchId,
          createdAt: new Date(),
        },
        {
          _id: 'eventType456',
          name: 'Youth Group',
          color: '#0000FF',
          description: 'Weekly youth meetings',
          church: mockChurchId,
          createdAt: new Date(),
        },
      ];

      // Mock EventType.find
      (EventType.find as jest.Mock).mockResolvedValue(mockEventTypes);

      // Call the controller function
      await getEventTypes(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.find).toHaveBeenCalledWith({ church: mockChurchId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockEventTypes,
      });
    });

    it('should handle errors', async () => {
      // Mock EventType.find to throw an error
      (EventType.find as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await getEventTypes(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.find).toHaveBeenCalledWith({ church: mockChurchId });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('getEventType', () => {
    it('should return a single event type by ID', async () => {
      // Setup request parameter
      req.params = { id: mockEventTypeId };

      // Setup mock event type
      const mockEventType = {
        _id: mockEventTypeId,
        name: 'Sunday Service',
        color: '#FF0000',
        description: 'Regular Sunday worship service',
        church: {
          toString: () => mockChurchId
        },
        createdAt: new Date(),
      };

      // Mock EventType.findById
      (EventType.findById as jest.Mock).mockResolvedValue(mockEventType);

      // Call the controller function
      await getEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.findById).toHaveBeenCalledWith(mockEventTypeId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockEventType,
      });
    });

    it('should return 404 if event type is not found', async () => {
      // Setup request parameter
      req.params = { id: 'nonexistent' };

      // Mock EventType.findById to return null
      (EventType.findById as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await getEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Event type not found',
      });
    });

    it('should return 403 if event type does not belong to user\'s church', async () => {
      // Setup request parameter
      req.params = { id: mockEventTypeId };

      // Setup mock event type with different church ID
      const differentChurchId = 'differentChurch456';
      const mockEventType = {
        _id: mockEventTypeId,
        name: 'Sunday Service',
        color: '#FF0000',
        description: 'Regular Sunday worship service',
        church: {
          toString: () => differentChurchId
        },
        createdAt: new Date(),
      };

      // Mock EventType.findById
      (EventType.findById as jest.Mock).mockResolvedValue(mockEventType);

      // Call the controller function
      await getEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.findById).toHaveBeenCalledWith(mockEventTypeId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this event type',
      });
    });

    it('should handle errors', async () => {
      // Setup request parameter
      req.params = { id: mockEventTypeId };

      // Mock EventType.findById to throw an error
      (EventType.findById as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await getEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.findById).toHaveBeenCalledWith(mockEventTypeId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('createEventType', () => {
    it('should create a new event type', async () => {
      // Setup request body
      req.body = {
        name: 'New Event Type',
        color: '#00FF00',
        description: 'A new type of event',
      };

      // Setup mock created event type
      const mockEventType = {
        _id: 'newEventType789',
        ...req.body,
        church: mockChurchId,
        createdAt: new Date(),
      };

      // Mock EventType.create
      (EventType.create as jest.Mock).mockResolvedValue(mockEventType);

      // Call the controller function
      await createEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.create).toHaveBeenCalledWith({
        ...req.body,
        church: mockChurchId,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockEventType,
      });
    });

    it('should handle validation errors', async () => {
      // Setup request body with missing required fields
      req.body = {
        // Missing required name and color
        description: 'Incomplete event type',
      };

      // Create a fake ValidationError-like structure
      const validationError = {
        name: 'ValidationError',
        errors: {
          name: { message: 'Please add a name for the event type' },
          color: { message: 'Please add a color for the event type' },
        },
      };

      // Mock EventType.create to throw a validation error
      (EventType.create as jest.Mock).mockImplementation(() => {
        throw validationError;
      });

      // Call the controller function
      await createEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.create).toHaveBeenCalledWith({
        ...req.body,
        church: mockChurchId,
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: ['Please add a name for the event type', 'Please add a color for the event type'],
      });
    });

    it('should handle other errors', async () => {
      // Setup request body
      req.body = {
        name: 'Error Test',
        color: '#FF00FF',
      };

      // Mock EventType.create to throw a non-validation error
      (EventType.create as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await createEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.create).toHaveBeenCalledWith({
        ...req.body,
        church: mockChurchId,
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('updateEventType', () => {
    it('should update an event type', async () => {
      // Setup request parameter and body
      req.params = { id: mockEventTypeId };
      req.body = {
        name: 'Updated Event Type',
        color: '#FF00FF',
        description: 'Updated description',
      };

      // Setup mock event type
      const mockEventType = {
        _id: mockEventTypeId,
        name: 'Original Event Type',
        color: '#FF0000',
        description: 'Original description',
        church: {
          toString: () => mockChurchId
        },
        createdAt: new Date(),
      };

      // Setup mock updated event type
      const mockUpdatedEventType = {
        ...mockEventType,
        name: 'Updated Event Type',
        color: '#FF00FF',
        description: 'Updated description',
      };

      // Mock EventType.findById
      (EventType.findById as jest.Mock).mockResolvedValue(mockEventType);

      // Mock EventType.findByIdAndUpdate
      (EventType.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedEventType);

      // Call the controller function
      await updateEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.findById).toHaveBeenCalledWith(mockEventTypeId);
      expect(EventType.findByIdAndUpdate).toHaveBeenCalledWith(
        mockEventTypeId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedEventType,
      });
    });

    it('should return 404 if event type is not found', async () => {
      // Setup request parameter and body
      req.params = { id: 'nonexistent' };
      req.body = {
        name: 'Updated Event Type',
      };

      // Mock EventType.findById to return null
      (EventType.findById as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await updateEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Event type not found',
      });
    });

    it('should return 403 if user is not authorized to update the event type', async () => {
      // Setup request parameter and body
      req.params = { id: mockEventTypeId };
      req.body = {
        name: 'Updated Event Type',
      };

      // Setup mock event type with different church ID
      const differentChurchId = 'differentChurch456';
      const mockEventType = {
        _id: mockEventTypeId,
        name: 'Original Event Type',
        color: '#FF0000',
        description: 'Original description',
        church: {
          toString: () => differentChurchId
        },
        createdAt: new Date(),
      };

      // Mock EventType.findById
      (EventType.findById as jest.Mock).mockResolvedValue(mockEventType);

      // Call the controller function
      await updateEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.findById).toHaveBeenCalledWith(mockEventTypeId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to update this event type',
      });
    });

    it('should handle validation errors', async () => {
      // Setup request parameter and body
      req.params = { id: mockEventTypeId };
      req.body = {
        color: 'invalid-color', // Invalid color format
      };

      // Setup mock event type
      const mockEventType = {
        _id: mockEventTypeId,
        name: 'Event Type',
        color: '#FF0000',
        description: 'Description',
        church: {
          toString: () => mockChurchId
        },
        createdAt: new Date(),
      };

      // Create a fake ValidationError-like structure
      const validationError = {
        name: 'ValidationError',
        errors: {
          color: { message: 'Please use a valid hex color' },
        },
      };

      // Mock EventType.findById
      (EventType.findById as jest.Mock).mockResolvedValue(mockEventType);

      // Mock EventType.findByIdAndUpdate to throw a validation error
      (EventType.findByIdAndUpdate as jest.Mock).mockImplementation(() => {
        throw validationError;
      });

      // Call the controller function
      await updateEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.findById).toHaveBeenCalledWith(mockEventTypeId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: ['Please use a valid hex color'],
      });
    });

    it('should handle other errors', async () => {
      // Setup request parameter and body
      req.params = { id: mockEventTypeId };
      req.body = {
        name: 'Updated Event Type',
      };

      // Setup mock event type
      const mockEventType = {
        _id: mockEventTypeId,
        name: 'Event Type',
        color: '#FF0000',
        description: 'Description',
        church: {
          toString: () => mockChurchId
        },
        createdAt: new Date(),
      };

      // Mock EventType.findById
      (EventType.findById as jest.Mock).mockResolvedValue(mockEventType);

      // Mock EventType.findByIdAndUpdate to throw a non-validation error
      (EventType.findByIdAndUpdate as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await updateEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.findById).toHaveBeenCalledWith(mockEventTypeId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('deleteEventType', () => {
    it('should delete an event type', async () => {
      // Setup request parameter
      req.params = { id: mockEventTypeId };

      // Setup mock event type with deleteOne method
      const mockDeleteOne = jest.fn().mockResolvedValue({});
      const mockEventType = {
        _id: mockEventTypeId,
        name: 'Event Type to Delete',
        color: '#FF0000',
        description: 'This event type will be deleted',
        church: {
          toString: () => mockChurchId
        },
        createdAt: new Date(),
        deleteOne: mockDeleteOne
      };

      // Mock EventType.findById
      (EventType.findById as jest.Mock).mockResolvedValue(mockEventType);

      // Call the controller function
      await deleteEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.findById).toHaveBeenCalledWith(mockEventTypeId);
      expect(mockDeleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {},
      });
    });

    it('should return 404 if event type is not found', async () => {
      // Setup request parameter
      req.params = { id: 'nonexistent' };

      // Mock EventType.findById to return null
      (EventType.findById as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await deleteEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Event type not found',
      });
    });

    it('should return 403 if user is not authorized to delete the event type', async () => {
      // Setup request parameter
      req.params = { id: mockEventTypeId };

      // Setup mock event type with different church ID
      const differentChurchId = 'differentChurch456';
      const mockEventType = {
        _id: mockEventTypeId,
        name: 'Event Type to Delete',
        color: '#FF0000',
        description: 'This event type will be deleted',
        church: {
          toString: () => differentChurchId
        },
        createdAt: new Date(),
      };

      // Mock EventType.findById
      (EventType.findById as jest.Mock).mockResolvedValue(mockEventType);

      // Call the controller function
      await deleteEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.findById).toHaveBeenCalledWith(mockEventTypeId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to delete this event type',
      });
    });

    it('should handle errors', async () => {
      // Setup request parameter
      req.params = { id: mockEventTypeId };

      // Mock EventType.findById to throw an error
      (EventType.findById as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await deleteEventType(req as RequestWithUser, res as Response);

      // Assertions
      expect(EventType.findById).toHaveBeenCalledWith(mockEventTypeId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });
}); 