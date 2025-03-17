import { Request, Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse, HttpStatus } from '@shared/types/api';
import { IEventDocument } from '@shared/types/mongoose';
import { validateData, eventSchema } from '../utils/validation';
import Event from '../models/Event';
import mongoose from 'mongoose';
import { toObjectId } from '../utils/typeGuards';

/**
 * Get all events
 * @route GET /api/events
 */
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user's church from auth middleware
    const churchId = req.user?.church;
    if (!churchId) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Church not found in user profile',
        statusCode: HttpStatus.BAD_REQUEST
      };
      res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
      return;
    }

    // Convert churchId to ObjectId
    const churchObjectId = toObjectId(churchId);
    if (!churchObjectId) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Invalid church ID format',
        statusCode: HttpStatus.BAD_REQUEST
      };
      res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
      return;
    }

    // Find all events for the church
    const events = await Event.find({ church: churchObjectId })
      .sort({ startDate: 1 })
      .populate('eventType');

    const response: ApiSuccessResponse<IEventDocument[]> = {
      success: true,
      data: events,
      count: events.length
    };

    res.status(HttpStatus.OK).json(response);
  } catch (error) {
    console.error('Error fetching events:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Error fetching events',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR
    };
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
};

/**
 * Get a single event by ID
 * @route GET /api/events/:id
 */
export const getEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const churchId = req.user?.church;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Invalid event ID format',
        statusCode: HttpStatus.BAD_REQUEST
      };
      res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
      return;
    }

    // Find event with security check for church
    const event = await Event.findOne({
      _id: id,
      church: churchId
    }).populate('eventType');

    if (!event) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Event not found',
        statusCode: HttpStatus.NOT_FOUND
      };
      res.status(HttpStatus.NOT_FOUND).json(errorResponse);
      return;
    }

    const response: ApiSuccessResponse<IEventDocument> = {
      success: true,
      data: event
    };

    res.status(HttpStatus.OK).json(response);
  } catch (error) {
    console.error('Error fetching event:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Error fetching event',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR
    };
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
};

/**
 * Create a new event
 * @route POST /api/events
 */
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body with Zod
    const [isValid, validatedData, validationErrors] = validateData(eventSchema, req.body);

    if (!isValid || !validatedData) {
      // Format validation errors
      const errorMessages = validationErrors?.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ) || ['Invalid event data'];
      
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: errorMessages,
        statusCode: HttpStatus.BAD_REQUEST
      };
      
      res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
      return;
    }

    // Always use the church from authenticated user for security
    const churchId = req.user?.church;
    if (!churchId) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Church not found in user profile',
        statusCode: HttpStatus.BAD_REQUEST
      };
      res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
      return;
    }
    
    // Security check - override church in body with user's church
    const eventData = {
      ...validatedData,
      church: churchId
    };

    // Create the event
    const newEvent = await Event.create(eventData);
    
    const response: ApiSuccessResponse<IEventDocument> = {
      success: true,
      data: newEvent
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    console.error('Error creating event:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Error creating event',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR
    };
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
};

/**
 * Update an event
 * @route PUT /api/events/:id
 */
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const churchId = req.user?.church;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Invalid event ID format',
        statusCode: HttpStatus.BAD_REQUEST
      };
      res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
      return;
    }

    // Validate request body with Zod
    const [isValid, validatedData, validationErrors] = validateData(eventSchema, req.body);

    if (!isValid || !validatedData) {
      // Format validation errors
      const errorMessages = validationErrors?.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ) || ['Invalid event data'];
      
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: errorMessages,
        statusCode: HttpStatus.BAD_REQUEST
      };
      
      res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
      return;
    }

    // Security check - override church in body with user's church
    const eventData = {
      ...validatedData,
      church: churchId
    };

    // Find and update with security check for church
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id, church: churchId },
      eventData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Event not found or you don\'t have permission to update it',
        statusCode: HttpStatus.NOT_FOUND
      };
      res.status(HttpStatus.NOT_FOUND).json(errorResponse);
      return;
    }

    const response: ApiSuccessResponse<IEventDocument> = {
      success: true,
      data: updatedEvent
    };

    res.status(HttpStatus.OK).json(response);
  } catch (error) {
    console.error('Error updating event:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Error updating event',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR
    };
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
};

/**
 * Delete an event
 * @route DELETE /api/events/:id
 */
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const churchId = req.user?.church;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Invalid event ID format',
        statusCode: HttpStatus.BAD_REQUEST
      };
      res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
      return;
    }

    // Find and delete with security check for church
    const deletedEvent = await Event.findOneAndDelete({ 
      _id: id, 
      church: churchId 
    });

    if (!deletedEvent) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Event not found or you don\'t have permission to delete it',
        statusCode: HttpStatus.NOT_FOUND
      };
      res.status(HttpStatus.NOT_FOUND).json(errorResponse);
      return;
    }

    res.status(HttpStatus.NO_CONTENT).json({
      success: true,
      data: null
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Error deleting event',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR
    };
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}; 