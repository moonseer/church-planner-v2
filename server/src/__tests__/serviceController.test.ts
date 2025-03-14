import { Request, Response } from 'express';
import { getServices, getService, createService, updateService, deleteService } from '../controllers/serviceController';
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

// Mock Service model before importing it
jest.mock('../models/Service', () => {
  const mockPopulate = jest.fn().mockReturnThis();
  const mockSort = jest.fn().mockReturnThis();
  
  return {
    find: jest.fn().mockReturnValue({
      populate: mockPopulate,
      sort: mockSort,
    }),
    findById: jest.fn().mockReturnValue({
      populate: mockPopulate,
    }),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      populate: mockPopulate,
    }),
    deleteOne: jest.fn().mockResolvedValue({}),
  };
});

// Mock Event model
jest.mock('../models/Event', () => ({
  findById: jest.fn(),
}));

// Import models after mocking
import Service from '../models/Service';
import Event from '../models/Event';

describe('Service Controller', () => {
  let req: Partial<RequestWithUser>;
  let res: Partial<Response>;
  const mockServiceId = 'service123';
  const mockEventId = 'event123';
  const mockChurchId = 'church123';
  const mockUserId = 'user123';

  beforeEach(() => {
    req = {
      params: {},
      query: {},
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
    
    // Reset mock implementations
    const mockFind = Service.find as jest.Mock;
    mockFind.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });
    
    const mockFindById = Service.findById as jest.Mock;
    mockFindById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getServices', () => {
    it('should return all services for a church', async () => {
      // Setup mock services
      const mockServices = [
        {
          _id: mockServiceId,
          title: 'Sunday Service',
          date: new Date('2023-08-20T10:00:00Z'),
          description: 'Regular Sunday service',
          church: mockChurchId,
          event: mockEventId,
          createdBy: mockUserId,
          createdAt: new Date(),
          items: [],
        },
        {
          _id: 'service456',
          title: 'Midweek Service',
          date: new Date('2023-08-23T18:30:00Z'),
          description: 'Midweek evening service',
          church: mockChurchId,
          event: 'event456',
          createdBy: mockUserId,
          createdAt: new Date(),
          items: [],
        },
      ];

      // Mock Service.find chain
      const mockFind = Service.find as jest.Mock;
      const mockPopulateFn = jest.fn().mockReturnThis();
      const mockSortFn = jest.fn().mockResolvedValue(mockServices);
      
      mockFind.mockReturnValue({
        populate: mockPopulateFn,
        sort: mockSortFn,
      });

      // Call the controller function
      await getServices(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.find).toHaveBeenCalledWith({ church: mockChurchId });
      expect(mockPopulateFn).toHaveBeenCalledWith('event', 'title start end');
      expect(mockPopulateFn).toHaveBeenCalledWith('createdBy', 'name email');
      expect(mockSortFn).toHaveBeenCalledWith({ date: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockServices,
      });
    });

    it('should filter services by date range', async () => {
      // Setup query parameters
      req.query = {
        startDate: '2023-08-01',
        endDate: '2023-08-31',
      };

      // Setup mock services (doesn't matter for this test)
      const mockServices = [];

      // Mock Service.find chain
      const mockFind = Service.find as jest.Mock;
      const mockPopulateFn = jest.fn().mockReturnThis();
      const mockSortFn = jest.fn().mockResolvedValue(mockServices);
      
      mockFind.mockReturnValue({
        populate: mockPopulateFn,
        sort: mockSortFn,
      });

      // Call the controller function
      await getServices(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.find).toHaveBeenCalledWith({
        church: mockChurchId,
        date: {
          $gte: expect.any(Date),
          $lte: expect.any(Date),
        },
      });
      expect(mockPopulateFn).toHaveBeenCalledWith('event', 'title start end');
      expect(mockPopulateFn).toHaveBeenCalledWith('createdBy', 'name email');
      expect(mockSortFn).toHaveBeenCalledWith({ date: 1 });
    });

    it('should filter services by start date only', async () => {
      // Setup query parameters
      req.query = {
        startDate: '2023-08-01',
      };

      // Call the controller function
      await getServices(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.find).toHaveBeenCalledWith({
        church: mockChurchId,
        date: {
          $gte: expect.any(Date),
        },
      });
    });

    it('should filter services by end date only', async () => {
      // Setup query parameters
      req.query = {
        endDate: '2023-08-31',
      };

      // Call the controller function
      await getServices(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.find).toHaveBeenCalledWith({
        church: mockChurchId,
        date: {
          $lte: expect.any(Date),
        },
      });
    });

    it('should handle errors', async () => {
      // Mock Service.find to throw an error
      const mockFind = Service.find as jest.Mock;
      mockFind.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await getServices(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.find).toHaveBeenCalledWith({ church: mockChurchId });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('getService', () => {
    it('should return a single service by ID', async () => {
      // Setup request parameter
      req.params = { id: mockServiceId };

      // Setup mock service
      const mockService = {
        _id: mockServiceId,
        title: 'Sunday Service',
        date: new Date('2023-08-20T10:00:00Z'),
        description: 'Regular Sunday service',
        church: {
          toString: () => mockChurchId,
        },
        event: mockEventId,
        createdBy: mockUserId,
        createdAt: new Date(),
        items: [],
      };

      // Mock Service.findById chain
      const mockFindById = Service.findById as jest.Mock;
      const mockPopulateFn = jest.fn().mockReturnThis();
      mockPopulateFn.mockImplementation((field, select) => {
        if (field === 'createdBy') {
          return Promise.resolve(mockService);
        }
        return { populate: mockPopulateFn };
      });
      
      mockFindById.mockReturnValue({
        populate: mockPopulateFn,
      });

      // Call the controller function
      await getService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith(mockServiceId);
      expect(mockPopulateFn).toHaveBeenCalledWith('event', 'title start end');
      expect(mockPopulateFn).toHaveBeenCalledWith('createdBy', 'name email');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockService,
      });
    });

    it('should return 404 if service is not found', async () => {
      // Setup request parameter
      req.params = { id: 'nonexistent' };

      // Mock Service.findById chain to return null
      const mockFindById = Service.findById as jest.Mock;
      const mockPopulateFn = jest.fn().mockReturnThis();
      mockPopulateFn.mockImplementation((field, select) => {
        if (field === 'createdBy') {
          return Promise.resolve(null);
        }
        return { populate: mockPopulateFn };
      });
      
      mockFindById.mockReturnValue({
        populate: mockPopulateFn,
      });

      // Call the controller function
      await getService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Service not found',
      });
    });

    it('should return 403 if service does not belong to user\'s church', async () => {
      // Setup request parameter
      req.params = { id: mockServiceId };

      // Setup mock service with different church ID
      const differentChurchId = 'differentChurch456';
      const mockService = {
        _id: mockServiceId,
        title: 'Sunday Service',
        date: new Date('2023-08-20T10:00:00Z'),
        description: 'Regular Sunday service',
        church: {
          toString: () => differentChurchId,
        },
        event: mockEventId,
        createdBy: mockUserId,
        createdAt: new Date(),
        items: [],
      };

      // Mock Service.findById chain
      const mockFindById = Service.findById as jest.Mock;
      const mockPopulateFn = jest.fn().mockReturnThis();
      mockPopulateFn.mockImplementation((field, select) => {
        if (field === 'createdBy') {
          return Promise.resolve(mockService);
        }
        return { populate: mockPopulateFn };
      });
      
      mockFindById.mockReturnValue({
        populate: mockPopulateFn,
      });

      // Call the controller function
      await getService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith(mockServiceId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this service',
      });
    });

    it('should handle errors', async () => {
      // Setup request parameter
      req.params = { id: mockServiceId };

      // Mock Service.findById to throw an error
      const mockFindById = Service.findById as jest.Mock;
      mockFindById.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await getService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith(mockServiceId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('createService', () => {
    it('should create a new service', async () => {
      // Setup request body
      req.body = {
        title: 'New Service',
        date: new Date('2023-09-03T10:00:00Z'),
        description: 'A new service',
        event: mockEventId,
        items: [
          {
            order: 1,
            title: 'Welcome',
            type: 'other',
            duration: 5,
            notes: 'Brief welcome and announcements',
          },
        ],
      };

      // Setup mock event
      const mockEvent = {
        _id: mockEventId,
        title: 'Sunday Service',
        church: {
          toString: () => mockChurchId,
        },
      };

      // Setup mock created service
      const mockCreatedService = {
        _id: 'newService789',
        ...req.body,
        church: mockChurchId,
        createdBy: mockUserId,
        createdAt: new Date(),
      };

      // Mock Event.findById to return valid event
      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      // Mock Service.create
      (Service.create as jest.Mock).mockResolvedValue(mockCreatedService);

      // Mock Service.findById for population
      const mockFindById = Service.findById as jest.Mock;
      const mockPopulateFn = jest.fn().mockReturnThis();
      mockPopulateFn.mockImplementation((field, select) => {
        if (field === 'createdBy') {
          return Promise.resolve(mockCreatedService);
        }
        return { populate: mockPopulateFn };
      });
      
      mockFindById.mockReturnValue({
        populate: mockPopulateFn,
      });

      // Call the controller function
      await createService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith(mockEventId);
      expect(Service.create).toHaveBeenCalledWith({
        ...req.body,
        church: mockChurchId,
        createdBy: mockUserId,
      });
      expect(Service.findById).toHaveBeenCalledWith(mockCreatedService._id);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedService,
      });
    });

    it('should return 404 if event is not found', async () => {
      // Setup request body
      req.body = {
        title: 'New Service',
        date: new Date('2023-09-03T10:00:00Z'),
        description: 'A new service',
        event: 'nonexistentEvent',
      };

      // Mock Event.findById to return null
      (Event.findById as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await createService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith('nonexistentEvent');
      expect(Service.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Event not found',
      });
    });

    it('should return 403 if event does not belong to user\'s church', async () => {
      // Setup request body
      req.body = {
        title: 'New Service',
        date: new Date('2023-09-03T10:00:00Z'),
        description: 'A new service',
        event: mockEventId,
      };

      // Setup mock event with different church ID
      const differentChurchId = 'differentChurch456';
      const mockEvent = {
        _id: mockEventId,
        title: 'Sunday Service',
        church: {
          toString: () => differentChurchId,
        },
      };

      // Mock Event.findById to return event with different church
      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      // Call the controller function
      await createService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith(mockEventId);
      expect(Service.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to use this event',
      });
    });

    it('should create a service without an event', async () => {
      // Setup request body without event
      req.body = {
        title: 'Standalone Service',
        date: new Date('2023-09-10T10:00:00Z'),
        description: 'A standalone service without an event',
      };

      // Setup mock created service
      const mockCreatedService = {
        _id: 'newService789',
        ...req.body,
        church: mockChurchId,
        createdBy: mockUserId,
        createdAt: new Date(),
      };

      // Mock Service.create
      (Service.create as jest.Mock).mockResolvedValue(mockCreatedService);

      // Mock Service.findById for population
      const mockFindById = Service.findById as jest.Mock;
      const mockPopulateFn = jest.fn().mockReturnThis();
      mockPopulateFn.mockImplementation((field, select) => {
        if (field === 'createdBy') {
          return Promise.resolve(mockCreatedService);
        }
        return { populate: mockPopulateFn };
      });
      
      mockFindById.mockReturnValue({
        populate: mockPopulateFn,
      });

      // Call the controller function
      await createService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).not.toHaveBeenCalled();
      expect(Service.create).toHaveBeenCalledWith({
        ...req.body,
        church: mockChurchId,
        createdBy: mockUserId,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle validation errors', async () => {
      // Setup request body with missing required fields
      req.body = {
        // Missing required title and date
        description: 'Incomplete service',
      };

      // Mock Service.create to throw an error
      (Service.create as jest.Mock).mockImplementation(() => {
        throw new Error('Validation failed: title: Please add a title for the service');
      });

      // Call the controller function
      await createService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.create).toHaveBeenCalledWith({
        ...req.body,
        church: mockChurchId,
        createdBy: mockUserId,
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed: title: Please add a title for the service',
      });
    });
  });

  describe('updateService', () => {
    it('should update a service', async () => {
      // Setup request parameter and body
      req.params = { id: mockServiceId };
      req.body = {
        title: 'Updated Service',
        description: 'Updated description',
      };

      // Setup mock service
      const mockService = {
        _id: mockServiceId,
        title: 'Original Service',
        date: new Date('2023-08-20T10:00:00Z'),
        description: 'Original description',
        church: {
          toString: () => mockChurchId,
        },
        event: mockEventId,
        createdBy: mockUserId,
        createdAt: new Date(),
        items: [],
      };

      // Setup mock updated service
      const mockUpdatedService = {
        ...mockService,
        title: 'Updated Service',
        description: 'Updated description',
      };

      // Mock Service.findById
      const mockFindById = Service.findById as jest.Mock;
      mockFindById.mockResolvedValue(mockService);

      // Mock Service.findByIdAndUpdate
      const mockFindByIdAndUpdate = Service.findByIdAndUpdate as jest.Mock;
      const mockPopulateFn = jest.fn().mockReturnThis();
      mockPopulateFn.mockImplementation((field, select) => {
        if (field === 'createdBy') {
          return Promise.resolve(mockUpdatedService);
        }
        return { populate: mockPopulateFn };
      });
      
      mockFindByIdAndUpdate.mockReturnValue({
        populate: mockPopulateFn,
      });

      // Call the controller function
      await updateService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith(mockServiceId);
      expect(Service.findByIdAndUpdate).toHaveBeenCalledWith(
        mockServiceId,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedService,
      });
    });

    it('should return 404 if service is not found', async () => {
      // Setup request parameter and body
      req.params = { id: 'nonexistent' };
      req.body = {
        title: 'Updated Service',
      };

      // Mock Service.findById to return null
      const mockFindById = Service.findById as jest.Mock;
      mockFindById.mockResolvedValue(null);

      // Call the controller function
      await updateService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith('nonexistent');
      expect(Service.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Service not found',
      });
    });

    it('should return 403 if service does not belong to user\'s church', async () => {
      // Setup request parameter and body
      req.params = { id: mockServiceId };
      req.body = {
        title: 'Updated Service',
      };

      // Setup mock service with different church ID
      const differentChurchId = 'differentChurch456';
      const mockService = {
        _id: mockServiceId,
        title: 'Original Service',
        date: new Date('2023-08-20T10:00:00Z'),
        description: 'Original description',
        church: {
          toString: () => differentChurchId,
        },
        event: mockEventId,
        createdBy: mockUserId,
        createdAt: new Date(),
        items: [],
      };

      // Mock Service.findById
      const mockFindById = Service.findById as jest.Mock;
      mockFindById.mockResolvedValue(mockService);

      // Call the controller function
      await updateService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith(mockServiceId);
      expect(Service.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to update this service',
      });
    });

    it('should verify event belongs to user\'s church when updating with a new event', async () => {
      // Setup request parameter and body with new event
      req.params = { id: mockServiceId };
      req.body = {
        title: 'Updated Service',
        event: 'newEvent456',
      };

      // Setup mock service
      const mockService = {
        _id: mockServiceId,
        title: 'Original Service',
        date: new Date('2023-08-20T10:00:00Z'),
        description: 'Original description',
        church: {
          toString: () => mockChurchId,
        },
        event: mockEventId,
        createdBy: mockUserId,
        createdAt: new Date(),
        items: [],
      };

      // Setup mock event
      const mockEvent = {
        _id: 'newEvent456',
        title: 'New Event',
        church: {
          toString: () => mockChurchId,
        },
      };

      // Mock Service.findById
      const mockFindById = Service.findById as jest.Mock;
      mockFindById.mockResolvedValue(mockService);

      // Mock Event.findById
      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      // Mock Service.findByIdAndUpdate
      const mockUpdatedService = {
        ...mockService,
        title: 'Updated Service',
        event: 'newEvent456',
      };

      const mockFindByIdAndUpdate = Service.findByIdAndUpdate as jest.Mock;
      const mockPopulateFn = jest.fn().mockReturnThis();
      mockPopulateFn.mockImplementation((field, select) => {
        if (field === 'createdBy') {
          return Promise.resolve(mockUpdatedService);
        }
        return { populate: mockPopulateFn };
      });
      
      mockFindByIdAndUpdate.mockReturnValue({
        populate: mockPopulateFn,
      });

      // Call the controller function
      await updateService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith(mockServiceId);
      expect(Event.findById).toHaveBeenCalledWith('newEvent456');
      expect(Service.findByIdAndUpdate).toHaveBeenCalledWith(
        mockServiceId,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if updated event is not found', async () => {
      // Setup request parameter and body with new event
      req.params = { id: mockServiceId };
      req.body = {
        title: 'Updated Service',
        event: 'nonexistentEvent',
      };

      // Setup mock service
      const mockService = {
        _id: mockServiceId,
        title: 'Original Service',
        date: new Date('2023-08-20T10:00:00Z'),
        description: 'Original description',
        church: {
          toString: () => mockChurchId,
        },
        event: mockEventId,
        createdBy: mockUserId,
        createdAt: new Date(),
        items: [],
      };

      // Mock Service.findById
      const mockFindById = Service.findById as jest.Mock;
      mockFindById.mockResolvedValue(mockService);

      // Mock Event.findById to return null
      (Event.findById as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await updateService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith(mockServiceId);
      expect(Event.findById).toHaveBeenCalledWith('nonexistentEvent');
      expect(Service.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Event not found',
      });
    });

    it('should return 403 if updated event does not belong to user\'s church', async () => {
      // Setup request parameter and body with new event
      req.params = { id: mockServiceId };
      req.body = {
        title: 'Updated Service',
        event: 'differentChurchEvent',
      };

      // Setup mock service
      const mockService = {
        _id: mockServiceId,
        title: 'Original Service',
        date: new Date('2023-08-20T10:00:00Z'),
        description: 'Original description',
        church: {
          toString: () => mockChurchId,
        },
        event: mockEventId,
        createdBy: mockUserId,
        createdAt: new Date(),
        items: [],
      };

      // Setup mock event with different church ID
      const differentChurchId = 'differentChurch456';
      const mockEvent = {
        _id: 'differentChurchEvent',
        title: 'Different Church Event',
        church: {
          toString: () => differentChurchId,
        },
      };

      // Mock Service.findById
      const mockFindById = Service.findById as jest.Mock;
      mockFindById.mockResolvedValue(mockService);

      // Mock Event.findById
      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      // Call the controller function
      await updateService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith(mockServiceId);
      expect(Event.findById).toHaveBeenCalledWith('differentChurchEvent');
      expect(Service.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to use this event',
      });
    });

    it('should handle validation errors', async () => {
      // Setup request parameter and body
      req.params = { id: mockServiceId };
      req.body = {
        title: '', // Invalid: empty title
      };

      // Setup mock service
      const mockService = {
        _id: mockServiceId,
        title: 'Original Service',
        date: new Date('2023-08-20T10:00:00Z'),
        description: 'Original description',
        church: {
          toString: () => mockChurchId,
        },
        event: mockEventId,
        createdBy: mockUserId,
        createdAt: new Date(),
        items: [],
      };

      // Mock Service.findById
      const mockFindById = Service.findById as jest.Mock;
      mockFindById.mockResolvedValue(mockService);

      // Mock Service.findByIdAndUpdate to throw a validation error
      const mockFindByIdAndUpdate = Service.findByIdAndUpdate as jest.Mock;
      mockFindByIdAndUpdate.mockImplementation(() => {
        throw new Error('Validation failed: title: Please add a title for the service');
      });

      // Call the controller function
      await updateService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith(mockServiceId);
      expect(Service.findByIdAndUpdate).toHaveBeenCalledWith(
        mockServiceId,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed: title: Please add a title for the service',
      });
    });
  });

  describe('deleteService', () => {
    it('should delete a service', async () => {
      // Setup request parameter
      req.params = { id: mockServiceId };

      // Setup mock service with deleteOne method
      const mockDeleteOne = jest.fn().mockResolvedValue({});
      const mockService = {
        _id: mockServiceId,
        title: 'Service to Delete',
        date: new Date('2023-08-20T10:00:00Z'),
        description: 'This service will be deleted',
        church: {
          toString: () => mockChurchId,
        },
        event: mockEventId,
        createdBy: mockUserId,
        createdAt: new Date(),
        items: [],
        deleteOne: mockDeleteOne,
      };

      // Mock Service.findById
      const mockFindById = Service.findById as jest.Mock;
      mockFindById.mockResolvedValue(mockService);

      // Call the controller function
      await deleteService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith(mockServiceId);
      expect(mockDeleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {},
      });
    });

    it('should return 404 if service is not found', async () => {
      // Setup request parameter
      req.params = { id: 'nonexistent' };

      // Mock Service.findById to return null
      const mockFindById = Service.findById as jest.Mock;
      mockFindById.mockResolvedValue(null);

      // Call the controller function
      await deleteService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Service not found',
      });
    });

    it('should return 403 if service does not belong to user\'s church', async () => {
      // Setup request parameter
      req.params = { id: mockServiceId };

      // Setup mock service with different church ID
      const differentChurchId = 'differentChurch456';
      const mockService = {
        _id: mockServiceId,
        title: 'Service to Delete',
        date: new Date('2023-08-20T10:00:00Z'),
        description: 'This service will be deleted',
        church: {
          toString: () => differentChurchId,
        },
        event: mockEventId,
        createdBy: mockUserId,
        createdAt: new Date(),
        items: [],
      };

      // Mock Service.findById
      const mockFindById = Service.findById as jest.Mock;
      mockFindById.mockResolvedValue(mockService);

      // Call the controller function
      await deleteService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith(mockServiceId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to delete this service',
      });
    });

    it('should handle errors', async () => {
      // Setup request parameter
      req.params = { id: mockServiceId };

      // Mock Service.findById to throw an error
      const mockFindById = Service.findById as jest.Mock;
      mockFindById.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await deleteService(req as RequestWithUser, res as Response);

      // Assertions
      expect(Service.findById).toHaveBeenCalledWith(mockServiceId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });
}); 