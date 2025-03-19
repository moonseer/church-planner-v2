import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Event, { IEvent, IAttendee } from '../models/Event';
import { ApiResponse } from '../utils/apiResponse';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorMiddleware';
import config from '../config';

// Extend Express Request type to include user property added by auth middleware
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        churchId?: string;
      };
    }
  }
}

/**
 * Get all events with pagination, filtering, and sorting
 */
export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page?.toString() || '1', 10);
    const limit = parseInt(req.query.limit?.toString() || config.pagination.defaultLimit.toString(), 10);
    const skip = (page - 1) * limit;
    
    // Build filter object based on query parameters
    const filter: any = { isActive: true };
    
    // Filter by church ID
    if (req.query.churchId) {
      filter.churchId = new mongoose.Types.ObjectId(req.query.churchId.toString());
    }
    
    // Filter by date range
    if (req.query.startDate) {
      filter.startDate = { $gte: new Date(req.query.startDate.toString()) };
    }
    
    if (req.query.endDate) {
      filter.endDate = { $lte: new Date(req.query.endDate.toString()) };
    }
    
    // Filter by event type
    if (req.query.type) {
      filter.eventType = req.query.type;
    }
    
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filter by tag
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }
    
    // Filter by template
    if (req.query.isTemplate !== undefined) {
      filter.isSeriesTemplate = req.query.isTemplate === 'true';
    }
    
    // Text search
    if (req.query.search) {
      filter.$text = { $search: req.query.search.toString() };
    }
    
    // Determine sort options
    const sortField = req.query.sort?.toString() || 'startDate';
    const sortOrder = req.query.order?.toString() === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortField]: sortOrder };
    
    // Execute query with pagination
    const events = await Event.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('team.memberId', 'firstName lastName email')
      .select('-__v');
    
    // Get total count for pagination
    const total = await Event.countDocuments(filter);
    
    logger.debug(`Retrieved ${events.length} events (page ${page}, limit ${limit}, total ${total})`);
    
    ApiResponse.success(res, {
      events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error('Error retrieving events:', err);
    next(new AppError('Error retrieving events', 500));
  }
};

/**
 * Get a single event by ID
 */
export const getEventById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid event ID format', 400));
      return;
    }
    
    // Find event by ID
    const event = await Event.findById(id)
      .populate('team.memberId', 'firstName lastName email')
      .select('-__v');
    
    if (!event) {
      next(new AppError('Event not found', 404));
      return;
    }
    
    logger.debug(`Retrieved event: ${id}`);
    ApiResponse.success(res, event);
  } catch (err) {
    logger.error(`Error retrieving event ${req.params.id}:`, err);
    next(new AppError('Error retrieving event', 500));
  }
};

/**
 * Create a new event
 */
export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    // Add created/updated by fields
    req.body.createdBy = userId;
    req.body.updatedBy = userId;
    
    // Create event
    const event = await Event.create(req.body);
    
    logger.info(`Event created: ${event._id} by user ${userId}`);
    ApiResponse.created(res, event);
  } catch (err: any) {
    logger.error('Error creating event:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      next(new AppError(messages.join(', '), 400));
      return;
    }
    
    next(new AppError('Error creating event', 500));
  }
};

/**
 * Update an event
 */
export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid event ID format', 400));
      return;
    }
    
    // Add updated by field
    req.body.updatedBy = userId;
    
    // Find and update event
    const event = await Event.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      next(new AppError('Event not found', 404));
      return;
    }
    
    logger.info(`Event updated: ${id} by user ${userId}`);
    ApiResponse.success(res, event);
  } catch (err: any) {
    logger.error(`Error updating event ${req.params.id}:`, err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      next(new AppError(messages.join(', '), 400));
      return;
    }
    
    next(new AppError('Error updating event', 500));
  }
};

/**
 * Delete an event (soft delete)
 */
export const deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid event ID format', 400));
      return;
    }
    
    // Soft delete by setting isActive to false
    const event = await Event.findByIdAndUpdate(
      id,
      { isActive: false, updatedBy: req.user?.id },
      { new: true }
    );
    
    if (!event) {
      next(new AppError('Event not found', 404));
      return;
    }
    
    logger.info(`Event soft deleted: ${id} by user ${req.user?.id}`);
    ApiResponse.success(res, { message: 'Event deleted successfully' });
  } catch (err) {
    logger.error(`Error deleting event ${req.params.id}:`, err);
    next(new AppError('Error deleting event', 500));
  }
};

/**
 * Hard delete an event (administrative function)
 */
export const hardDeleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid event ID format', 400));
      return;
    }
    
    // Hard delete event
    const event = await Event.findByIdAndDelete(id);
    
    if (!event) {
      next(new AppError('Event not found', 404));
      return;
    }
    
    logger.info(`Event hard deleted: ${id} by user ${req.user?.id}`);
    ApiResponse.success(res, { message: 'Event permanently deleted' });
  } catch (err) {
    logger.error(`Error hard deleting event ${req.params.id}:`, err);
    next(new AppError('Error deleting event', 500));
  }
};

/**
 * Get events by church ID
 */
export const getEventsByChurch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { churchId } = req.params;
    const page = parseInt(req.query.page?.toString() || '1', 10);
    const limit = parseInt(req.query.limit?.toString() || config.pagination.defaultLimit.toString(), 10);
    const skip = (page - 1) * limit;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(churchId)) {
      next(new AppError('Invalid church ID format', 400));
      return;
    }
    
    // Build filter object
    const filter: any = { 
      churchId: new mongoose.Types.ObjectId(churchId),
      isActive: true 
    };
    
    // Filter by date range
    if (req.query.startDate) {
      filter.startDate = { $gte: new Date(req.query.startDate.toString()) };
    }
    
    if (req.query.endDate) {
      filter.endDate = { $lte: new Date(req.query.endDate.toString()) };
    }
    
    // Filter by event type
    if (req.query.type) {
      filter.eventType = req.query.type;
    }
    
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Determine sort options
    const sortField = req.query.sort?.toString() || 'startDate';
    const sortOrder = req.query.order?.toString() === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortField]: sortOrder };
    
    // Execute query with pagination
    const events = await Event.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    // Get total count for pagination
    const total = await Event.countDocuments(filter);
    
    logger.debug(`Retrieved ${events.length} events for church ${churchId}`);
    
    ApiResponse.success(res, {
      events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error(`Error retrieving events for church ${req.params.churchId}:`, err);
    next(new AppError('Error retrieving church events', 500));
  }
};

/**
 * Add team member to event
 */
export const addTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid event ID format', 400));
      return;
    }
    
    // Find event
    const event = await Event.findById(id);
    
    if (!event) {
      next(new AppError('Event not found', 404));
      return;
    }
    
    // Check if member already exists in team
    const existingMember = event.team.find(
      (member) => member.memberId.toString() === req.body.memberId
    );
    
    if (existingMember) {
      next(new AppError('Member already exists in event team', 400));
      return;
    }
    
    // Add team member
    event.team.push(req.body);
    event.updatedBy = new mongoose.Types.ObjectId(req.user?.id);
    
    await event.save();
    
    logger.info(`Team member ${req.body.memberId} added to event ${id} by user ${req.user?.id}`);
    ApiResponse.success(res, event);
  } catch (err: any) {
    logger.error(`Error adding team member to event ${req.params.id}:`, err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      next(new AppError(messages.join(', '), 400));
      return;
    }
    
    next(new AppError('Error adding team member to event', 500));
  }
};

/**
 * Update team member in event
 */
export const updateTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, memberId } = req.params;
    
    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(memberId)) {
      next(new AppError('Invalid ID format', 400));
      return;
    }
    
    // Find event
    const event = await Event.findById(id);
    
    if (!event) {
      next(new AppError('Event not found', 404));
      return;
    }
    
    // Find team member index
    const memberIndex = event.team.findIndex(
      (member) => member.memberId.toString() === memberId
    );
    
    if (memberIndex === -1) {
      next(new AppError('Team member not found in event', 404));
      return;
    }
    
    // Update team member
    Object.assign(event.team[memberIndex], req.body);
    event.updatedBy = new mongoose.Types.ObjectId(req.user?.id);
    
    await event.save();
    
    logger.info(`Team member ${memberId} updated in event ${id} by user ${req.user?.id}`);
    ApiResponse.success(res, event);
  } catch (err: any) {
    logger.error(`Error updating team member in event ${req.params.id}:`, err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      next(new AppError(messages.join(', '), 400));
      return;
    }
    
    next(new AppError('Error updating team member in event', 500));
  }
};

/**
 * Remove team member from event
 */
export const removeTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, memberId } = req.params;
    
    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(memberId)) {
      next(new AppError('Invalid ID format', 400));
      return;
    }
    
    // Find event and update by removing team member
    const event = await Event.findByIdAndUpdate(
      id,
      {
        $pull: { team: { memberId: new mongoose.Types.ObjectId(memberId) } },
        updatedBy: new mongoose.Types.ObjectId(req.user?.id)
      },
      { new: true }
    );
    
    if (!event) {
      next(new AppError('Event not found', 404));
      return;
    }
    
    logger.info(`Team member ${memberId} removed from event ${id} by user ${req.user?.id}`);
    ApiResponse.success(res, event);
  } catch (err) {
    logger.error(`Error removing team member from event ${req.params.id}:`, err);
    next(new AppError('Error removing team member from event', 500));
  }
};

/**
 * Register an attendee for an event
 */
export const registerAttendee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid event ID format', 400));
      return;
    }
    
    // Find event
    const event = await Event.findById(id);
    
    if (!event) {
      next(new AppError('Event not found', 404));
      return;
    }
    
    // Check if registration is closed
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      next(new AppError('Registration for this event is closed', 400));
      return;
    }
    
    // Check if event is at capacity
    if (event.capacity) {
      const registeredCount = event.attendees.filter(
        attendee => attendee.status === 'registered' || attendee.status === 'attended'
      ).length;
      
      if (registeredCount >= event.capacity) {
        next(new AppError('Event is at full capacity', 400));
        return;
      }
    }
    
    // Check if attendee is already registered
    const existingAttendee = event.attendees.find(
      (attendee) => 
        (attendee.memberId && attendee.memberId.toString() === req.body.memberId) ||
        (attendee.email && attendee.email === req.body.email)
    );
    
    if (existingAttendee) {
      next(new AppError('Attendee is already registered for this event', 400));
      return;
    }
    
    // Add status if not provided
    if (!req.body.status) {
      req.body.status = 'registered';
    }
    
    // Add attendee
    const attendee: IAttendee = req.body;
    event.attendees.push(attendee);
    event.updatedBy = new mongoose.Types.ObjectId(req.user?.id);
    
    await event.save();
    
    logger.info(`Attendee registered for event ${id}`);
    ApiResponse.success(res, event);
  } catch (err: any) {
    logger.error(`Error registering attendee for event ${req.params.id}:`, err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      next(new AppError(messages.join(', '), 400));
      return;
    }
    
    next(new AppError('Error registering attendee for event', 500));
  }
};

/**
 * Update attendee status (check-in, cancel, etc.)
 */
export const updateAttendeeStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, attendeeId } = req.params;
    const { status, checkInTime, checkOutTime, notes } = req.body;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid event ID format', 400));
      return;
    }
    
    // Find event
    const event = await Event.findById(id);
    
    if (!event) {
      next(new AppError('Event not found', 404));
      return;
    }
    
    // Find attendee
    const attendeeIndex = event.attendees.findIndex(
      (a) => a._id && a._id.toString() === attendeeId
    );
    
    if (attendeeIndex === -1) {
      next(new AppError('Attendee not found', 404));
      return;
    }
    
    // Update attendee status
    event.attendees[attendeeIndex].status = status;
    
    // Update check-in/check-out times if provided
    if (checkInTime) {
      event.attendees[attendeeIndex].checkInTime = new Date(checkInTime);
    }
    
    if (checkOutTime) {
      event.attendees[attendeeIndex].checkOutTime = new Date(checkOutTime);
    }
    
    // Update notes if provided
    if (notes) {
      event.attendees[attendeeIndex].notes = notes;
    }
    
    event.updatedBy = new mongoose.Types.ObjectId(req.user?.id);
    
    await event.save();
    
    logger.info(`Attendee ${attendeeId} status updated to ${status} for event ${id}`);
    ApiResponse.success(res, event);
  } catch (err: any) {
    logger.error(`Error updating attendee status for event ${req.params.id}:`, err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      next(new AppError(messages.join(', '), 400));
      return;
    }
    
    next(new AppError('Error updating attendee status', 500));
  }
};

/**
 * Remove attendee from event
 */
export const removeAttendee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, attendeeId } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid event ID format', 400));
      return;
    }
    
    // Find event and remove attendee
    const event = await Event.findByIdAndUpdate(
      id,
      {
        $pull: { attendees: { _id: new mongoose.Types.ObjectId(attendeeId) } },
        updatedBy: new mongoose.Types.ObjectId(req.user?.id)
      },
      { new: true }
    );
    
    if (!event) {
      next(new AppError('Event not found', 404));
      return;
    }
    
    logger.info(`Attendee ${attendeeId} removed from event ${id}`);
    ApiResponse.success(res, event);
  } catch (err) {
    logger.error(`Error removing attendee from event ${req.params.id}:`, err);
    next(new AppError('Error removing attendee from event', 500));
  }
};

/**
 * Get attendance report for an event
 */
export const getAttendanceReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid event ID format', 400));
      return;
    }
    
    // Find event
    const event = await Event.findById(id)
      .populate('attendees.memberId', 'firstName lastName email')
      .select('title startDate endDate attendees');
    
    if (!event) {
      next(new AppError('Event not found', 404));
      return;
    }
    
    // Generate attendance stats
    const total = event.attendees.length;
    const registered = event.attendees.filter(a => a.status === 'registered').length;
    const attended = event.attendees.filter(a => a.status === 'attended').length;
    const absent = event.attendees.filter(a => a.status === 'absent').length;
    const cancelled = event.attendees.filter(a => a.status === 'cancelled').length;
    
    const report = {
      event: {
        id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate
      },
      stats: {
        total,
        registered,
        attended,
        absent,
        cancelled,
        attendanceRate: total > 0 ? Math.round((attended / total) * 100) : 0
      },
      attendees: event.attendees
    };
    
    logger.debug(`Generated attendance report for event ${id}`);
    ApiResponse.success(res, report);
  } catch (err) {
    logger.error(`Error generating attendance report for event ${req.params.id}:`, err);
    next(new AppError('Error generating attendance report', 500));
  }
};

/**
 * Create recurring events from a template or existing event
 */
export const createRecurringEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { recurrence, startDate, endDate } = req.body;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid event ID format', 400));
      return;
    }
    
    // Find template event
    const templateEvent = await Event.findById(id);
    
    if (!templateEvent) {
      next(new AppError('Event template not found', 404));
      return;
    }
    
    // Validate required fields
    if (!recurrence || !recurrence.frequency || !startDate) {
      next(new AppError('Recurrence pattern and start date are required', 400));
      return;
    }
    
    // Calculate event dates based on recurrence pattern
    const eventDates = calculateRecurringDates(
      new Date(startDate),
      endDate ? new Date(endDate) : undefined,
      recurrence
    );
    
    if (eventDates.length === 0) {
      next(new AppError('No event dates generated from recurrence pattern', 400));
      return;
    }
    
    // Create events
    const createdEvents: IEvent[] = [];
    const userId = req.user?.id;
    
    for (const date of eventDates) {
      // Calculate end date based on template event duration
      const duration = templateEvent.endDate.getTime() - templateEvent.startDate.getTime();
      const eventEndDate = new Date(date.getTime() + duration);
      
      // Clone the template event
      const eventData = {
        ...templateEvent.toObject(),
        _id: undefined, // Let MongoDB generate a new ID
        startDate: date,
        endDate: eventEndDate,
        parentEventId: templateEvent._id,
        isSeriesTemplate: false,
        createdBy: userId,
        updatedBy: userId,
        createdAt: undefined,
        updatedAt: undefined,
        attendees: [],
        status: 'draft'
      };
      
      const newEvent = await Event.create(eventData);
      createdEvents.push(newEvent);
    }
    
    logger.info(`Created ${createdEvents.length} recurring events from template ${id}`);
    ApiResponse.success(res, {
      message: `${createdEvents.length} recurring events created successfully`,
      events: createdEvents.map(e => ({
        id: e._id,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate
      }))
    });
  } catch (err) {
    logger.error(`Error creating recurring events from template ${req.params.id}:`, err);
    next(new AppError('Error creating recurring events', 500));
  }
};

/**
 * Helper function to calculate recurring dates based on recurrence pattern
 */
function calculateRecurringDates(
  startDate: Date,
  endDate: Date | undefined,
  recurrence: {
    frequency: string;
    interval: number;
    daysOfWeek?: number[];
    daysOfMonth?: number[];
    monthsOfYear?: number[];
    count?: number;
  }
): Date[] {
  const dates: Date[] = [];
  const { frequency, interval, count } = recurrence;
  
  // Default to 52 occurrences (about 1 year) if count and endDate not specified
  const maxCount = count || 52;
  const maxDate = endDate || new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
  
  let currentDate = new Date(startDate);
  let occurrences = 0;
  
  while (currentDate <= maxDate && occurrences < maxCount) {
    dates.push(new Date(currentDate));
    occurrences++;
    
    // Calculate next date based on frequency
    switch (frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval);
        break;
        
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * interval));
        break;
        
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + interval);
        break;
        
      case 'custom':
        // Handle custom recurrence pattern
        if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
          // Weekly pattern with specific days
          let found = false;
          
          // Start from the day after
          currentDate.setDate(currentDate.getDate() + 1);
          
          // Look for the next matching day of week
          for (let i = 0; i < 7 && !found; i++) {
            if (recurrence.daysOfWeek.includes(currentDate.getDay())) {
              found = true;
            } else {
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
          
          // If no matching day found, default to next week
          if (!found) {
            currentDate.setDate(currentDate.getDate() + 7);
          }
        } else if (recurrence.daysOfMonth && recurrence.daysOfMonth.length > 0) {
          // Monthly pattern with specific days
          const currentDay = currentDate.getDate();
          let nextDay: number | null = null;
          
          // Find the next day of month
          for (const day of recurrence.daysOfMonth) {
            if (day > currentDay) {
              nextDay = day;
              break;
            }
          }
          
          if (nextDay) {
            // Next day is in this month
            currentDate.setDate(nextDay);
          } else {
            // Move to first day of next month
            currentDate.setMonth(currentDate.getMonth() + 1);
            currentDate.setDate(recurrence.daysOfMonth[0]);
          }
        } else {
          // Default to weekly if custom but no specific pattern
          currentDate.setDate(currentDate.getDate() + 7);
        }
        break;
        
      default:
        // Default to weekly
        currentDate.setDate(currentDate.getDate() + 7);
    }
  }
  
  return dates;
} 