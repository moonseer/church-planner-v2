import { Request, Response } from 'express';
import EventType from '../models/EventType';
import mongoose from 'mongoose';

// @desc    Get all event types for a church
// @route   GET /api/event-types
// @access  Private
export const getEventTypes = async (req: Request, res: Response) => {
  try {
    // Get church ID from authenticated user
    const churchId = (req as any).user.church;

    const eventTypes = await EventType.find({ church: churchId });

    res.status(200).json({
      success: true,
      count: eventTypes.length,
      data: eventTypes
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single event type
// @route   GET /api/event-types/:id
// @access  Private
export const getEventType = async (req: Request, res: Response) => {
  try {
    const eventType = await EventType.findById(req.params.id);

    if (!eventType) {
      return res.status(404).json({
        success: false,
        error: 'Event type not found'
      });
    }

    // Check if event type belongs to user's church
    if (eventType.church.toString() !== (req as any).user.church.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this event type'
      });
    }

    res.status(200).json({
      success: true,
      data: eventType
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new event type
// @route   POST /api/event-types
// @access  Private
export const createEventType = async (req: Request, res: Response) => {
  try {
    // Add church from authenticated user
    req.body.church = (req as any).user.church;

    const eventType = await EventType.create(req.body);

    res.status(201).json({
      success: true,
      data: eventType
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

// @desc    Update event type
// @route   PUT /api/event-types/:id
// @access  Private
export const updateEventType = async (req: Request, res: Response) => {
  try {
    let eventType = await EventType.findById(req.params.id);

    if (!eventType) {
      return res.status(404).json({
        success: false,
        error: 'Event type not found'
      });
    }

    // Check if event type belongs to user's church
    if (eventType.church.toString() !== (req as any).user.church.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this event type'
      });
    }

    eventType = await EventType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: eventType
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

// @desc    Delete event type
// @route   DELETE /api/event-types/:id
// @access  Private
export const deleteEventType = async (req: Request, res: Response) => {
  try {
    const eventType = await EventType.findById(req.params.id);

    if (!eventType) {
      return res.status(404).json({
        success: false,
        error: 'Event type not found'
      });
    }

    // Check if event type belongs to user's church
    if (eventType.church.toString() !== (req as any).user.church.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this event type'
      });
    }

    await eventType.deleteOne();

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