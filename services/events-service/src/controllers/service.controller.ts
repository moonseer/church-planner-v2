import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Service, { IService } from '../models/Service';
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
 * Get all services with pagination, filtering, and sorting
 */
export const getAllServices = async (
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
    
    // Filter by name
    if (req.query.name) {
      filter.name = { $regex: req.query.name.toString(), $options: 'i' };
    }
    
    // Filter by template status
    if (req.query.isTemplate !== undefined) {
      filter.isTemplate = req.query.isTemplate === 'true';
    }
    
    // Filter by template name
    if (req.query.templateName) {
      filter.templateName = { $regex: req.query.templateName.toString(), $options: 'i' };
    }
    
    // Filter by day of week
    if (req.query.dayOfWeek !== undefined) {
      filter['schedules.dayOfWeek'] = parseInt(req.query.dayOfWeek.toString(), 10);
    }
    
    // Determine sort options
    const sortField = req.query.sort?.toString() || 'name';
    const sortOrder = req.query.order?.toString() === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortField]: sortOrder };
    
    // Execute query with pagination
    const services = await Service.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('components.leader', 'firstName lastName email')
      .select('-__v');
    
    // Get total count for pagination
    const total = await Service.countDocuments(filter);
    
    logger.debug(`Retrieved ${services.length} services (page ${page}, limit ${limit}, total ${total})`);
    
    ApiResponse.success(res, {
      services,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error('Error retrieving services:', err);
    next(new AppError('Error retrieving services', 500));
  }
};

/**
 * Get a single service by ID
 */
export const getServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid service ID format', 400));
      return;
    }
    
    // Find service by ID
    const service = await Service.findById(id)
      .populate('components.leader', 'firstName lastName email')
      .select('-__v');
    
    if (!service) {
      next(new AppError('Service not found', 404));
      return;
    }
    
    logger.debug(`Retrieved service: ${id}`);
    ApiResponse.success(res, service);
  } catch (err) {
    logger.error(`Error retrieving service ${req.params.id}:`, err);
    next(new AppError('Error retrieving service', 500));
  }
};

/**
 * Create a new service
 */
export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    // Add created/updated by fields
    req.body.createdBy = userId;
    req.body.updatedBy = userId;
    
    // Create service
    const service = await Service.create(req.body);
    
    logger.info(`Service created: ${service._id} by user ${userId}`);
    ApiResponse.created(res, service);
  } catch (err: any) {
    logger.error('Error creating service:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      next(new AppError(messages.join(', '), 400));
      return;
    }
    
    next(new AppError('Error creating service', 500));
  }
};

/**
 * Update a service
 */
export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid service ID format', 400));
      return;
    }
    
    // Add updated by field
    req.body.updatedBy = userId;
    
    // Find and update service
    const service = await Service.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!service) {
      next(new AppError('Service not found', 404));
      return;
    }
    
    logger.info(`Service updated: ${id} by user ${userId}`);
    ApiResponse.success(res, service);
  } catch (err: any) {
    logger.error(`Error updating service ${req.params.id}:`, err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      next(new AppError(messages.join(', '), 400));
      return;
    }
    
    next(new AppError('Error updating service', 500));
  }
};

/**
 * Delete a service (soft delete)
 */
export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid service ID format', 400));
      return;
    }
    
    // Soft delete by setting isActive to false
    const service = await Service.findByIdAndUpdate(
      id,
      { isActive: false, updatedBy: req.user?.id },
      { new: true }
    );
    
    if (!service) {
      next(new AppError('Service not found', 404));
      return;
    }
    
    logger.info(`Service soft deleted: ${id} by user ${req.user?.id}`);
    ApiResponse.success(res, { message: 'Service deleted successfully' });
  } catch (err) {
    logger.error(`Error deleting service ${req.params.id}:`, err);
    next(new AppError('Error deleting service', 500));
  }
};

/**
 * Get services by church ID
 */
export const getServicesByChurch = async (
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
    
    // Filter by template status
    if (req.query.isTemplate !== undefined) {
      filter.isTemplate = req.query.isTemplate === 'true';
    }
    
    // Filter by day of week
    if (req.query.dayOfWeek !== undefined) {
      filter['schedules.dayOfWeek'] = parseInt(req.query.dayOfWeek.toString(), 10);
    }
    
    // Determine sort options
    const sortField = req.query.sort?.toString() || 'name';
    const sortOrder = req.query.order?.toString() === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortField]: sortOrder };
    
    // Execute query with pagination
    const services = await Service.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    // Get total count for pagination
    const total = await Service.countDocuments(filter);
    
    logger.debug(`Retrieved ${services.length} services for church ${churchId}`);
    
    ApiResponse.success(res, {
      services,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error(`Error retrieving services for church ${req.params.churchId}:`, err);
    next(new AppError('Error retrieving church services', 500));
  }
};

/**
 * Add service component
 */
export const addServiceComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid service ID format', 400));
      return;
    }
    
    // Find service
    const service = await Service.findById(id);
    
    if (!service) {
      next(new AppError('Service not found', 404));
      return;
    }
    
    // Add component
    service.components.push(req.body);
    
    // Sort components by order
    service.components.sort((a, b) => a.order - b.order);
    
    service.updatedBy = new mongoose.Types.ObjectId(req.user?.id);
    
    await service.save();
    
    logger.info(`Service component added to service ${id} by user ${req.user?.id}`);
    ApiResponse.success(res, service);
  } catch (err: any) {
    logger.error(`Error adding component to service ${req.params.id}:`, err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      next(new AppError(messages.join(', '), 400));
      return;
    }
    
    next(new AppError('Error adding component to service', 500));
  }
};

/**
 * Update service component
 */
export const updateServiceComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, componentId } = req.params;
    
    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid service ID format', 400));
      return;
    }
    
    // Find service
    const service = await Service.findById(id);
    
    if (!service) {
      next(new AppError('Service not found', 404));
      return;
    }
    
    // Find component index
    const componentIndex = service.components.findIndex(
      (component) => component._id?.toString() === componentId
    );
    
    if (componentIndex === -1) {
      next(new AppError('Component not found in service', 404));
      return;
    }
    
    // Update component
    Object.assign(service.components[componentIndex], req.body);
    
    // Sort components by order if order was updated
    if (req.body.order !== undefined) {
      service.components.sort((a, b) => a.order - b.order);
    }
    
    service.updatedBy = new mongoose.Types.ObjectId(req.user?.id);
    
    await service.save();
    
    logger.info(`Service component ${componentId} updated in service ${id} by user ${req.user?.id}`);
    ApiResponse.success(res, service);
  } catch (err: any) {
    logger.error(`Error updating component in service ${req.params.id}:`, err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      next(new AppError(messages.join(', '), 400));
      return;
    }
    
    next(new AppError('Error updating component in service', 500));
  }
};

/**
 * Remove service component
 */
export const removeServiceComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, componentId } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid service ID format', 400));
      return;
    }
    
    // Find service and remove component
    const service = await Service.findByIdAndUpdate(
      id,
      {
        $pull: { components: { _id: new mongoose.Types.ObjectId(componentId) } },
        updatedBy: new mongoose.Types.ObjectId(req.user?.id)
      },
      { new: true }
    );
    
    if (!service) {
      next(new AppError('Service not found', 404));
      return;
    }
    
    logger.info(`Component ${componentId} removed from service ${id} by user ${req.user?.id}`);
    ApiResponse.success(res, service);
  } catch (err) {
    logger.error(`Error removing component from service ${req.params.id}:`, err);
    next(new AppError('Error removing component from service', 500));
  }
};

/**
 * Add service schedule
 */
export const addServiceSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid service ID format', 400));
      return;
    }
    
    // Find service
    const service = await Service.findById(id);
    
    if (!service) {
      next(new AppError('Service not found', 404));
      return;
    }
    
    // Check if schedule with same day and time already exists
    const existingSchedule = service.schedules.find(
      (schedule) => 
        schedule.dayOfWeek === req.body.dayOfWeek && 
        schedule.startTime === req.body.startTime
    );
    
    if (existingSchedule) {
      next(new AppError('A schedule with this day and start time already exists', 400));
      return;
    }
    
    // Add schedule
    service.schedules.push(req.body);
    
    // Sort schedules by day and time
    service.schedules.sort((a, b) => {
      if (a.dayOfWeek === b.dayOfWeek) {
        return a.startTime.localeCompare(b.startTime);
      }
      return a.dayOfWeek - b.dayOfWeek;
    });
    
    service.updatedBy = new mongoose.Types.ObjectId(req.user?.id);
    
    await service.save();
    
    logger.info(`Service schedule added to service ${id} by user ${req.user?.id}`);
    ApiResponse.success(res, service);
  } catch (err: any) {
    logger.error(`Error adding schedule to service ${req.params.id}:`, err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      next(new AppError(messages.join(', '), 400));
      return;
    }
    
    next(new AppError('Error adding schedule to service', 500));
  }
};

/**
 * Update service schedule
 */
export const updateServiceSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, scheduleId } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid service ID format', 400));
      return;
    }
    
    // Find service
    const service = await Service.findById(id);
    
    if (!service) {
      next(new AppError('Service not found', 404));
      return;
    }
    
    // Find schedule index
    const scheduleIndex = service.schedules.findIndex(
      (schedule) => schedule._id?.toString() === scheduleId
    );
    
    if (scheduleIndex === -1) {
      next(new AppError('Schedule not found in service', 404));
      return;
    }
    
    // Check if update would create a duplicate schedule
    if (req.body.dayOfWeek !== undefined || req.body.startTime !== undefined) {
      const newDayOfWeek = req.body.dayOfWeek !== undefined ? 
        req.body.dayOfWeek : service.schedules[scheduleIndex].dayOfWeek;
        
      const newStartTime = req.body.startTime !== undefined ? 
        req.body.startTime : service.schedules[scheduleIndex].startTime;
        
      const duplicateSchedule = service.schedules.find((schedule, index) => 
        index !== scheduleIndex && 
        schedule.dayOfWeek === newDayOfWeek && 
        schedule.startTime === newStartTime
      );
      
      if (duplicateSchedule) {
        next(new AppError('A schedule with this day and start time already exists', 400));
        return;
      }
    }
    
    // Update schedule
    Object.assign(service.schedules[scheduleIndex], req.body);
    
    // Sort schedules by day and time
    service.schedules.sort((a, b) => {
      if (a.dayOfWeek === b.dayOfWeek) {
        return a.startTime.localeCompare(b.startTime);
      }
      return a.dayOfWeek - b.dayOfWeek;
    });
    
    service.updatedBy = new mongoose.Types.ObjectId(req.user?.id);
    
    await service.save();
    
    logger.info(`Service schedule ${scheduleId} updated in service ${id} by user ${req.user?.id}`);
    ApiResponse.success(res, service);
  } catch (err: any) {
    logger.error(`Error updating schedule in service ${req.params.id}:`, err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      next(new AppError(messages.join(', '), 400));
      return;
    }
    
    next(new AppError('Error updating schedule in service', 500));
  }
};

/**
 * Remove service schedule
 */
export const removeServiceSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, scheduleId } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid service ID format', 400));
      return;
    }
    
    // Find service
    const service = await Service.findById(id);
    
    if (!service) {
      next(new AppError('Service not found', 404));
      return;
    }
    
    // Check if it's the last schedule for a non-template service
    if (!service.isTemplate && service.schedules.length <= 1) {
      next(new AppError('Cannot remove the last schedule from a non-template service', 400));
      return;
    }
    
    // Find service and remove schedule
    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        $pull: { schedules: { _id: new mongoose.Types.ObjectId(scheduleId) } },
        updatedBy: new mongoose.Types.ObjectId(req.user?.id)
      },
      { new: true }
    );
    
    logger.info(`Schedule ${scheduleId} removed from service ${id} by user ${req.user?.id}`);
    ApiResponse.success(res, updatedService);
  } catch (err) {
    logger.error(`Error removing schedule from service ${req.params.id}:`, err);
    next(new AppError('Error removing schedule from service', 500));
  }
};

/**
 * Create events from service template
 */
export const createEventsFromService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { startDate, endDate, occurrences } = req.body;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid service ID format', 400));
      return;
    }
    
    // Validate required fields
    if (!startDate) {
      next(new AppError('Start date is required', 400));
      return;
    }
    
    // Find service
    const service = await Service.findById(id);
    
    if (!service) {
      next(new AppError('Service not found', 404));
      return;
    }
    
    // Check if service has schedules
    if (service.schedules.length === 0) {
      next(new AppError('Service has no schedules defined', 400));
      return;
    }
    
    // Import Event model here to avoid circular dependency
    const Event = require('../models/Event').default;
    
    // Calculate dates for events based on service schedules
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    const maxOccurrences = occurrences || 52; // Default to 1 year of weekly services
    
    // Get day of week names for logging
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Create events for each schedule
    const createdEvents = [];
    let currentDate = new Date(start);
    let createdCount = 0;
    
    // Continue until we hit end date or max occurrences
    while ((!end || currentDate <= end) && createdCount < maxOccurrences) {
      // Get day of week for current date (0-6, where 0 is Sunday)
      const currentDayOfWeek = currentDate.getDay();
      
      // Find schedules for this day of week
      const matchingSchedules = service.schedules.filter(
        schedule => schedule.dayOfWeek === currentDayOfWeek && schedule.isActive
      );
      
      // Create an event for each matching schedule
      for (const schedule of matchingSchedules) {
        // Parse schedule times
        const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
        
        // Create event start and end dates
        const eventStartDate = new Date(currentDate);
        eventStartDate.setHours(startHour, startMinute, 0, 0);
        
        const eventEndDate = new Date(currentDate);
        eventEndDate.setHours(endHour, endMinute, 0, 0);
        
        // If end time is before start time, assume it ends on the next day
        if (eventEndDate < eventStartDate) {
          eventEndDate.setDate(eventEndDate.getDate() + 1);
        }
        
        // Create event data
        const eventData = {
          churchId: service.churchId,
          title: schedule.name || service.name,
          description: service.description,
          eventType: 'service',
          startDate: eventStartDate,
          endDate: eventEndDate,
          allDay: false,
          timezone: config.timezones.default,
          location: {
            name: service.location.name,
            address: service.location.address,
            isVirtual: service.location.isVirtual,
            virtualLink: service.location.virtualLink
          },
          status: 'published',
          visibility: 'public',
          registrationRequired: false,
          resources: [],
          team: [],
          attendees: [],
          tags: [...service.tags, 'service'],
          isSeriesTemplate: false,
          createdBy: req.user?.id,
          updatedBy: req.user?.id
        };
        
        // Create the event
        const event = await Event.create(eventData);
        createdEvents.push(event);
        
        logger.info(`Created event ${event._id} from service ${id} for ${dayNames[currentDayOfWeek]} ${eventStartDate.toISOString()}`);
      }
      
      // If we created any events for this day, increment the count
      if (matchingSchedules.length > 0) {
        createdCount++;
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    ApiResponse.success(res, {
      message: `Created ${createdEvents.length} events from service template`,
      count: createdEvents.length,
      events: createdEvents.map(event => ({
        id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate
      }))
    });
  } catch (err) {
    logger.error(`Error creating events from service ${req.params.id}:`, err);
    next(new AppError('Error creating events from service', 500));
  }
}; 