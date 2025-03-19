import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event';
import Service from '../models/Service';
import { ApiResponse } from '../utils/apiResponse';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorMiddleware';
import config from '../config';

/**
 * Get calendar events for a specific date range
 * Can include both events and services
 */
export const getCalendarEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate, churchId } = req.query;
    
    // Validate required parameters
    if (!startDate || !endDate) {
      next(new AppError('Start date and end date are required', 400));
      return;
    }
    
    // Parse dates
    const start = new Date(startDate.toString());
    const end = new Date(endDate.toString());
    
    // Validate date range
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      next(new AppError('Invalid date format. Please use ISO format (YYYY-MM-DD)', 400));
      return;
    }
    
    // Build filter
    const filter: any = {
      startDate: { $gte: start },
      endDate: { $lte: end },
      isActive: true
    };
    
    // Add church ID filter if provided
    if (churchId && mongoose.Types.ObjectId.isValid(churchId.toString())) {
      filter.churchId = new mongoose.Types.ObjectId(churchId.toString());
    }
    
    // Get events
    const events = await Event.find(filter)
      .select('_id title description eventType startDate endDate allDay location status visibility color tags')
      .sort({ startDate: 1 });
    
    logger.debug(`Retrieved ${events.length} events for calendar between ${start.toISOString()} and ${end.toISOString()}`);
    
    ApiResponse.success(res, {
      startDate: start,
      endDate: end,
      events: events.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        type: event.eventType,
        start: event.startDate,
        end: event.endDate,
        allDay: event.allDay,
        location: event.location.name,
        status: event.status,
        visibility: event.visibility,
        color: event.color,
        tags: event.tags
      }))
    });
  } catch (err) {
    logger.error('Error retrieving calendar events:', err);
    next(new AppError('Error retrieving calendar events', 500));
  }
};

/**
 * Generate an iCalendar feed for all events of a church
 */
export const generateICalFeed = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { churchId } = req.params;
    
    // Validate church ID
    if (!mongoose.Types.ObjectId.isValid(churchId)) {
      next(new AppError('Invalid church ID format', 400));
      return;
    }
    
    // Get events for the next 6 months
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);
    
    const events = await Event.find({
      churchId: new mongoose.Types.ObjectId(churchId),
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
      isActive: true,
      visibility: { $in: ['public', 'church'] }
    }).sort({ startDate: 1 });
    
    // Generate iCalendar content
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ChurchPlanner//Events Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Church Events',
      'X-WR-TIMEZONE:UTC'
    ];
    
    // Add each event
    for (const event of events) {
      // Format dates for iCal (YYYYMMDDTHHmmssZ)
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      const startDate = formatDate(event.startDate);
      const endDate = formatDate(event.endDate);
      const now = formatDate(new Date());
      
      // Add event to iCal
      icalContent = icalContent.concat([
        'BEGIN:VEVENT',
        `UID:${event._id}@churchplanner.app`,
        `DTSTAMP:${now}`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ''}`,
        `LOCATION:${event.location.name || ''}`,
        `STATUS:${event.status === 'published' ? 'CONFIRMED' : 'TENTATIVE'}`,
        'END:VEVENT'
      ]);
    }
    
    // Close calendar
    icalContent.push('END:VCALENDAR');
    
    // Set headers for iCal file download
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="church-events-${churchId}.ics"`);
    
    // Send iCal content
    res.send(icalContent.join('\r\n'));
    
    logger.info(`Generated iCal feed for church ${churchId} with ${events.length} events`);
  } catch (err) {
    logger.error(`Error generating iCal feed for church ${req.params.churchId}:`, err);
    next(new AppError('Error generating iCal feed', 500));
  }
};

/**
 * Synchronize events with an external calendar (webhook endpoint)
 */
export const handleExternalCalendarWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { provider } = req.params;
    const webhookData = req.body;
    
    logger.debug(`Received webhook from ${provider} calendar provider`, { data: webhookData });
    
    // Different handling based on calendar provider
    switch (provider) {
      case 'google':
        // Handle Google Calendar webhook
        // This would need to be implemented based on Google's webhook format
        logger.info('Processing Google Calendar webhook');
        break;
        
      case 'microsoft':
        // Handle Microsoft/Outlook webhook
        // This would need to be implemented based on Microsoft's webhook format
        logger.info('Processing Microsoft Calendar webhook');
        break;
        
      default:
        next(new AppError(`Unsupported calendar provider: ${provider}`, 400));
        return;
    }
    
    // Acknowledge the webhook
    ApiResponse.success(res, { message: 'Webhook processed successfully' });
  } catch (err) {
    logger.error(`Error processing ${req.params.provider} calendar webhook:`, err);
    next(new AppError('Error processing calendar webhook', 500));
  }
};

/**
 * Export events to various calendar formats
 */
export const exportEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { churchId } = req.params;
    const { format, startDate, endDate } = req.query;
    
    // Validate parameters
    if (!format) {
      next(new AppError('Export format is required', 400));
      return;
    }
    
    if (!mongoose.Types.ObjectId.isValid(churchId)) {
      next(new AppError('Invalid church ID format', 400));
      return;
    }
    
    // Parse date range
    const start = startDate ? new Date(startDate.toString()) : new Date();
    const end = endDate ? new Date(endDate.toString()) : new Date();
    
    // Default to 3 months if no end date provided
    if (!endDate) {
      end.setMonth(end.getMonth() + 3);
    }
    
    // Get events
    const events = await Event.find({
      churchId: new mongoose.Types.ObjectId(churchId),
      startDate: { $gte: start },
      endDate: { $lte: end },
      isActive: true
    }).sort({ startDate: 1 });
    
    // Handle different export formats
    switch (format.toString().toLowerCase()) {
      case 'ical':
      case 'ics':
        // We already have an ical export function
        return generateICalFeed(req, res, next);
        
      case 'json':
        // Export as JSON
        ApiResponse.success(res, { events });
        break;
        
      case 'csv':
        // Generate CSV
        const csvRows = [
          // CSV header
          ['Event ID', 'Title', 'Description', 'Start Date', 'End Date', 'Location', 'Status'].join(',')
        ];
        
        // Add each event as a CSV row
        for (const event of events) {
          csvRows.push([
            event._id,
            `"${event.title.replace(/"/g, '""')}"`, // Escape quotes in CSV
            `"${(event.description || '').replace(/"/g, '""')}"`,
            event.startDate.toISOString(),
            event.endDate.toISOString(),
            `"${event.location.name || ''}"`,
            event.status
          ].join(','));
        }
        
        // Set headers for CSV file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="church-events-${churchId}.csv"`);
        
        // Send CSV content
        res.send(csvRows.join('\r\n'));
        break;
        
      default:
        next(new AppError(`Unsupported export format: ${format}`, 400));
        return;
    }
    
    logger.info(`Exported ${events.length} events for church ${churchId} in ${format} format`);
  } catch (err) {
    logger.error(`Error exporting events for church ${req.params.churchId}:`, err);
    next(new AppError('Error exporting events', 500));
  }
}; 