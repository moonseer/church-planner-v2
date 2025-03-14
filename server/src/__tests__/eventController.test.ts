import { Request, Response } from 'express';
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from '../controllers/eventController';
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

// Mock Event model before importing it
jest.mock('../models/Event', () => {
  return {
    find: jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        sort: jest.fn().mockImplementation(function() {
          return Promise.resolve([]);  // Default empty array, will be overridden in tests
        })
      }))
    })),
    findById: jest.fn().mockReturnThis(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    deleteOne: jest.fn(),
    populate: jest.fn().mockReturnThis(),
  };
});

// Import Event after mocking
import Event from '../models/Event';

describe('Event Controller', () => {
  let req: Partial<RequestWithUser>;
  let res: Partial<Response>;
  const mockEventId = 'event123';
  const mockChurchId = 'church123';
  const mockUserId = 'user123';
  const mockEventTypeId = 'eventType123';

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {},
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

  describe('getEvents', () => {
    it('should return all events for a church', async () => {
      // Setup mock events
      const mockEvents = [
        {
          _id: mockEventId,
          title: 'Sunday Service',
          description: 'Weekly worship service',
          start: new Date('2025-01-01T10:00:00'),
          end: new Date('2025-01-01T12:00:00'),
          allDay: false,
          location: 'Main Sanctuary',
          eventType: {
            _id: mockEventTypeId,
            name: 'Service',
            color: '#FF0000'
          },
          church: mockChurchId,
          createdBy: mockUserId,
          createdAt: new Date(),
        },
        {
          _id: 'event456',
          title: 'Youth Group',
          description: 'Weekly youth meeting',
          start: new Date('2025-01-02T18:00:00'),
          end: new Date('2025-01-02T20:00:00'),
          allDay: false,
          location: 'Youth Room',
          eventType: {
            _id: 'eventType456',
            name: 'Youth',
            color: '#0000FF'
          },
          church: mockChurchId,
          createdBy: mockUserId,
          createdAt: new Date(),
        },
      ];

      // Create a mock implementation of the chain
      const mockSort = jest.fn().mockResolvedValue(mockEvents);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      (Event.find as jest.Mock).mockReturnValue({ populate: mockPopulate });

      // Call the controller function
      await getEvents(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.find).toHaveBeenCalledWith({ church: mockChurchId });
      expect(mockPopulate).toHaveBeenCalledWith('eventType', 'name color');
      expect(mockSort).toHaveBeenCalledWith({ start: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockEvents,
      });
    });

    it('should filter events by date range if provided', async () => {
      // Setup query parameters with date range
      req.query = {
        start: '2025-01-01T00:00:00',
        end: '2025-01-31T23:59:59'
      };

      // Setup mock events
      const mockEvents = [
        {
          _id: mockEventId,
          title: 'Sunday Service',
          description: 'Weekly worship service',
          start: new Date('2025-01-05T10:00:00'),
          end: new Date('2025-01-05T12:00:00'),
          allDay: false,
          location: 'Main Sanctuary',
          eventType: {
            _id: mockEventTypeId,
            name: 'Service',
            color: '#FF0000'
          },
          church: mockChurchId,
          createdBy: mockUserId,
          createdAt: new Date(),
        }
      ];

      // Create a mock implementation of the chain
      const mockSort = jest.fn().mockResolvedValue(mockEvents);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      (Event.find as jest.Mock).mockReturnValue({ populate: mockPopulate });

      // Call the controller function
      await getEvents(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.find).toHaveBeenCalledWith({
        church: mockChurchId,
        start: { $gte: new Date(req.query.start as string) },
        end: { $lte: new Date(req.query.end as string) }
      });
      expect(mockPopulate).toHaveBeenCalledWith('eventType', 'name color');
      expect(mockSort).toHaveBeenCalledWith({ start: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockEvents,
      });
    });

    it('should handle errors', async () => {
      // Mock Event.find to throw an error
      (Event.find as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await getEvents(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('getEvent', () => {
    it('should return a single event by ID', async () => {
      // Setup request parameter
      req.params = { id: mockEventId };

      // Setup mock event
      const mockEvent = {
        _id: mockEventId,
        title: 'Sunday Service',
        description: 'Weekly worship service',
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T12:00:00'),
        allDay: false,
        location: 'Main Sanctuary',
        eventType: {
          _id: mockEventTypeId,
          name: 'Service',
          color: '#FF0000'
        },
        church: {
          toString: () => mockChurchId
        },
        createdBy: {
          _id: mockUserId,
          name: 'John Doe'
        },
        createdAt: new Date(),
      };

      // Mock the chain of Event methods
      (Event.findById as jest.Mock).mockReturnThis();
      (Event.populate as jest.Mock).mockReturnThis();
      const secondPopulate = jest.fn().mockResolvedValue(mockEvent);
      (Event.populate as jest.Mock).mockReturnValue({
        populate: secondPopulate
      });

      // Call the controller function
      await getEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith(mockEventId);
      expect(Event.populate).toHaveBeenCalledWith('eventType', 'name color');
      expect(secondPopulate).toHaveBeenCalledWith('createdBy', 'name');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockEvent,
      });
    });

    it('should return 404 if event is not found', async () => {
      // Setup request parameter
      req.params = { id: 'nonexistent' };

      // Mock Event.findById to return null
      (Event.findById as jest.Mock).mockReturnThis();
      (Event.populate as jest.Mock).mockReturnThis();
      const secondPopulate = jest.fn().mockResolvedValue(null);
      (Event.populate as jest.Mock).mockReturnValue({
        populate: secondPopulate
      });

      // Call the controller function
      await getEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Event not found',
      });
    });

    it('should return 403 if event does not belong to user\'s church', async () => {
      // Setup request parameter
      req.params = { id: mockEventId };

      // Setup mock event with different church ID
      const differentChurchId = 'differentChurch456';
      const mockEvent = {
        _id: mockEventId,
        title: 'Sunday Service',
        description: 'Weekly worship service',
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T12:00:00'),
        allDay: false,
        location: 'Main Sanctuary',
        eventType: mockEventTypeId,
        church: {
          toString: () => differentChurchId
        },
        createdBy: mockUserId,
        createdAt: new Date(),
      };

      // Mock the chain of Event methods
      (Event.findById as jest.Mock).mockReturnThis();
      (Event.populate as jest.Mock).mockReturnThis();
      const secondPopulate = jest.fn().mockResolvedValue(mockEvent);
      (Event.populate as jest.Mock).mockReturnValue({
        populate: secondPopulate
      });

      // Call the controller function
      await getEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith(mockEventId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this event',
      });
    });

    it('should handle errors', async () => {
      // Setup request parameter
      req.params = { id: mockEventId };

      // Mock Event.findById to throw an error
      (Event.findById as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await getEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith(mockEventId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      // Setup request body
      req.body = {
        title: 'New Event',
        description: 'Test event description',
        start: new Date('2025-02-01T14:00:00'),
        end: new Date('2025-02-01T16:00:00'),
        allDay: false,
        location: 'Conference Room',
        eventType: mockEventTypeId,
      };

      // Setup mock created event
      const mockEvent = {
        _id: 'newEvent789',
        ...req.body,
        church: mockChurchId,
        createdBy: mockUserId,
        createdAt: new Date(),
      };

      // Setup mock populated event
      const mockPopulatedEvent = {
        ...mockEvent,
        eventType: {
          _id: mockEventTypeId,
          name: 'Meeting',
          color: '#00FF00'
        },
        createdBy: {
          _id: mockUserId,
          name: 'John Doe'
        }
      };

      // Mock Event.create
      (Event.create as jest.Mock).mockResolvedValue(mockEvent);

      // Mock Event.findById
      (Event.findById as jest.Mock).mockReturnThis();
      (Event.populate as jest.Mock).mockReturnThis();
      const secondPopulate = jest.fn().mockResolvedValue(mockPopulatedEvent);
      (Event.populate as jest.Mock).mockReturnValue({
        populate: secondPopulate
      });

      // Call the controller function
      await createEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.create).toHaveBeenCalledWith({
        ...req.body,
        church: mockChurchId,
        createdBy: mockUserId,
      });
      expect(Event.findById).toHaveBeenCalledWith(mockEvent._id);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPopulatedEvent,
      });
    });

    it('should handle validation errors', async () => {
      // Setup request body with missing required fields
      req.body = {
        title: 'Incomplete Event',
        // Missing required fields: start, end, eventType
      };

      // Mock Event.create to throw a validation error
      (Event.create as jest.Mock).mockImplementation(() => {
        throw new Error('Validation failed: start, end, eventType');
      });

      // Call the controller function
      await createEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.create).toHaveBeenCalledWith({
        ...req.body,
        church: mockChurchId,
        createdBy: mockUserId,
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed: start, end, eventType',
      });
    });
  });

  describe('updateEvent', () => {
    it('should update an event', async () => {
      // Setup request parameter and body
      req.params = { id: mockEventId };
      req.body = {
        title: 'Updated Event Title',
        description: 'Updated description',
        location: 'Updated Location',
      };

      // Setup mock event
      const mockEvent = {
        _id: mockEventId,
        title: 'Old Event Title',
        description: 'Old description',
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T12:00:00'),
        allDay: false,
        location: 'Old Location',
        eventType: mockEventTypeId,
        church: {
          toString: () => mockChurchId
        },
        createdBy: mockUserId,
        createdAt: new Date(),
        deleteOne: jest.fn(),
      };

      // Setup mock updated event
      const mockUpdatedEvent = {
        ...mockEvent,
        title: 'Updated Event Title',
        description: 'Updated description',
        location: 'Updated Location',
        eventType: {
          _id: mockEventTypeId,
          name: 'Service',
          color: '#FF0000'
        },
        createdBy: {
          _id: mockUserId,
          name: 'John Doe'
        },
      };

      // Mock Event.findById
      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      // Mock Event.findByIdAndUpdate
      (Event.findByIdAndUpdate as jest.Mock).mockReturnThis();
      (Event.populate as jest.Mock).mockReturnThis();
      const secondPopulate = jest.fn().mockResolvedValue(mockUpdatedEvent);
      (Event.populate as jest.Mock).mockReturnValue({
        populate: secondPopulate
      });

      // Call the controller function
      await updateEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith(mockEventId);
      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(
        mockEventId,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedEvent,
      });
    });

    it('should return 404 if event is not found', async () => {
      // Setup request parameter
      req.params = { id: 'nonexistent' };
      req.body = {
        title: 'Updated Event Title',
      };

      // Mock Event.findById to return null
      (Event.findById as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await updateEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Event not found',
      });
    });

    it('should return 403 if user is not authorized to update the event', async () => {
      // Setup request parameter
      req.params = { id: mockEventId };
      req.body = {
        title: 'Updated Event Title',
      };

      // Setup mock event with different church ID
      const differentChurchId = 'differentChurch456';
      const mockEvent = {
        _id: mockEventId,
        title: 'Old Event Title',
        description: 'Old description',
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T12:00:00'),
        allDay: false,
        location: 'Old Location',
        eventType: mockEventTypeId,
        church: {
          toString: () => differentChurchId
        },
        createdBy: mockUserId,
        createdAt: new Date(),
      };

      // Mock Event.findById
      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      // Call the controller function
      await updateEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith(mockEventId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to update this event',
      });
    });

    it('should handle validation errors', async () => {
      // Setup request parameter and body
      req.params = { id: mockEventId };
      req.body = {
        start: 'invalid-date', // Invalid date format
      };

      // Setup mock event
      const mockEvent = {
        _id: mockEventId,
        title: 'Event Title',
        description: 'Description',
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T12:00:00'),
        allDay: false,
        location: 'Location',
        eventType: mockEventTypeId,
        church: {
          toString: () => mockChurchId
        },
        createdBy: mockUserId,
        createdAt: new Date(),
      };

      // Mock Event.findById
      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      // Mock Event.findByIdAndUpdate to throw a validation error
      (Event.findByIdAndUpdate as jest.Mock).mockImplementation(() => {
        throw new Error('Validation failed: start must be a valid date');
      });

      // Call the controller function
      await updateEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith(mockEventId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed: start must be a valid date',
      });
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      // Setup request parameter
      req.params = { id: mockEventId };

      // Setup mock event with deleteOne method
      const mockDeleteOne = jest.fn().mockResolvedValue({});
      const mockEvent = {
        _id: mockEventId,
        title: 'Event to Delete',
        description: 'This event will be deleted',
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T12:00:00'),
        allDay: false,
        location: 'Somewhere',
        eventType: mockEventTypeId,
        church: {
          toString: () => mockChurchId
        },
        createdBy: mockUserId,
        createdAt: new Date(),
        deleteOne: mockDeleteOne
      };

      // Mock Event.findById
      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      // Call the controller function
      await deleteEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith(mockEventId);
      expect(mockDeleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {},
      });
    });

    it('should return 404 if event is not found', async () => {
      // Setup request parameter
      req.params = { id: 'nonexistent' };

      // Mock Event.findById to return null
      (Event.findById as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await deleteEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Event not found',
      });
    });

    it('should return 403 if user is not authorized to delete the event', async () => {
      // Setup request parameter
      req.params = { id: mockEventId };

      // Setup mock event with different church ID
      const differentChurchId = 'differentChurch456';
      const mockEvent = {
        _id: mockEventId,
        title: 'Event to Delete',
        description: 'This event will be deleted',
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T12:00:00'),
        allDay: false,
        location: 'Somewhere',
        eventType: mockEventTypeId,
        church: {
          toString: () => differentChurchId
        },
        createdBy: mockUserId,
        createdAt: new Date(),
      };

      // Mock Event.findById
      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      // Call the controller function
      await deleteEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith(mockEventId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to delete this event',
      });
    });

    it('should handle errors', async () => {
      // Setup request parameter
      req.params = { id: mockEventId };

      // Mock Event.findById to throw an error
      (Event.findById as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await deleteEvent(req as RequestWithUser, res as Response);

      // Assertions
      expect(Event.findById).toHaveBeenCalledWith(mockEventId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });
}); 