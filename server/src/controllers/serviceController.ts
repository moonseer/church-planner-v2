import { Request, Response } from 'express';
import Service from '../models/Service';
import Event from '../models/Event';
import mongoose from 'mongoose';

// @desc    Get all services for a church
// @route   GET /api/services
// @access  Private
export const getServices = async (req: Request, res: Response) => {
  try {
    // Get query parameters for filtering
    const { startDate, endDate } = req.query;
    
    // Build query
    const query: any = {
      church: (req as any).user.church
    };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate as string) };
    }
    
    const services = await Service.find(query)
      .populate('event', 'title start end')
      .populate('createdBy', 'name email')
      .sort({ date: 1 });
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Private
export const getService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('event', 'title start end')
      .populate('createdBy', 'name email')
      .populate('items.assignedTo', 'name email');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    // Check if service belongs to user's church
    if (service.church.toString() !== (req as any).user.church.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this service'
      });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private
export const createService = async (req: Request, res: Response) => {
  try {
    // Add user's church to request body
    req.body.church = (req as any).user.church;
    req.body.createdBy = (req as any).user.id;
    
    // If event ID is provided, verify it exists and belongs to user's church
    if (req.body.event) {
      const event = await Event.findById(req.body.event);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }
      
      if (event.church.toString() !== (req as any).user.church.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to use this event'
        });
      }
    }
    
    const service = await Service.create(req.body);
    
    // Populate references for the response
    const populatedService = await Service.findById(service._id)
      .populate('event', 'title start end')
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      data: populatedService
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

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
export const updateService = async (req: Request, res: Response) => {
  try {
    let service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    // Check if service belongs to user's church
    if (service.church.toString() !== (req as any).user.church.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this service'
      });
    }
    
    // If event ID is being updated, verify it exists and belongs to user's church
    if (req.body.event && req.body.event !== service.event?.toString()) {
      const event = await Event.findById(req.body.event);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }
      
      if (event.church.toString() !== (req as any).user.church.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to use this event'
        });
      }
    }
    
    // Don't allow changing the church or creator
    delete req.body.church;
    delete req.body.createdBy;
    
    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('event', 'title start end')
      .populate('createdBy', 'name email')
      .populate('items.assignedTo', 'name email');
    
    res.status(200).json({
      success: true,
      data: service
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

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
export const deleteService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    // Check if service belongs to user's church
    if (service.church.toString() !== (req as any).user.church.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this service'
      });
    }
    
    await service.deleteOne();
    
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