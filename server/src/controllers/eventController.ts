import { Request, Response } from 'express';
import Event from '../models/Event';
import mongoose from 'mongoose';

// @desc    Get events for a church with date range filtering
// @route   GET /api/events
// @access  Private
export const getEvents = async (req: Request, res: Response) => {
  try {
    // Get church ID from authenticated user
    const churchId = (req as any).user.church;
    
    // Parse date range from query parameters
    const { start, end } = req.query;
    
    // Build query object
    const query: any = { church: churchId };
    
    // Add date range filtering if provided
    if (start && end) {
      query.start = { $gte: new Date(start as string) };
      query.end = { $lte: new Date(end as string) };
    }
    
    // Find events matching the query
    const events = await Event.find(query)
      .populate('eventType', 'name color')
      .sort({ start: 1 });
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
export const getEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('eventType', 'name color')
      .populate('createdBy', 'name');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    // Check if event belongs to user's church
    if (event.church.toString() !== (req as any).user.church.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this event'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req: Request, res: Response) => {
  try {
    // Add church and user from authenticated user
    req.body.church = (req as any).user.church;
    req.body.createdBy = (req as any).user.id;
    
    // Validate dates
    const startDate = new Date(req.body.start);
    const endDate = new Date(req.body.end);
    
    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        error: 'End date cannot be before start date'
      });
    }
    
    const event = await Event.create(req.body);
    
    // Populate event type for the response
    const populatedEvent = await Event.findById(event._id)
      .populate('eventType', 'name color');
    
    res.status(201).json({
      success: true,
      data: populatedEvent
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req: Request, res: Response) => {
  try {
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    // Check if event belongs to user's church
    if (event.church.toString() !== (req as any).user.church.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this event'
      });
    }
    
    // Validate dates if they are being updated
    if (req.body.start && req.body.end) {
      const startDate = new Date(req.body.start);
      const endDate = new Date(req.body.end);
      
      if (endDate < startDate) {
        return res.status(400).json({
          success: false,
          error: 'End date cannot be before start date'
        });
      }
    }
    
    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('eventType', 'name color');
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    // Check if event belongs to user's church
    if (event.church.toString() !== (req as any).user.church.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this event'
      });
    }
    
    await event.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 