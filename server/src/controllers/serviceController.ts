import { Request, Response } from 'express';
import Service from '../models/Service';
import Event from '../models/Event';
import mongoose from 'mongoose';

// @desc    Get all services for a church
// @route   GET /api/services
// @access  Private
export const getServices = async (req: Request, res: Response): Promise<void> => {
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
export const getService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('event', 'title start end')
      .populate('createdBy', 'name email');
    
    if (!service) {
      res.status(404).json({
        success: false,
        error: 'Service not found'
      });
      return;
    }
    
    // Check if service belongs to user's church
    if (service.church.toString() !== (req as any).user.church.toString()) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to access this service'
      });
      return;
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
export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add church from authenticated user
    req.body.church = (req as any).user.church;
    
    // Add user who created the service
    req.body.createdBy = (req as any).user.id;
    
    // If there's an event ID, validate it exists
    if (req.body.event) {
      const event = await Event.findById(req.body.event);
      
      if (!event) {
        res.status(404).json({
          success: false,
          error: 'Event not found'
        });
        return;
      }
      
      // Check if event belongs to user's church
      if (event.church.toString() !== (req as any).user.church.toString()) {
        res.status(403).json({
          success: false,
          error: 'Not authorized to use this event'
        });
        return;
      }
    }
    
    const service = await Service.create(req.body);
    
    // Populate related fields for response
    const populatedService = await Service.findById(service._id)
      .populate('event', 'title start end')
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      data: populatedService
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    let service = await Service.findById(req.params.id);
    
    if (!service) {
      res.status(404).json({
        success: false,
        error: 'Service not found'
      });
      return;
    }
    
    // Check if service belongs to user's church
    if (service.church.toString() !== (req as any).user.church.toString()) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to update this service'
      });
      return;
    }
    
    // If there's an event ID, validate it exists
    if (req.body.event) {
      const event = await Event.findById(req.body.event);
      
      if (!event) {
        res.status(404).json({
          success: false,
          error: 'Event not found'
        });
        return;
      }
      
      // Check if event belongs to user's church
      if (event.church.toString() !== (req as any).user.church.toString()) {
        res.status(403).json({
          success: false,
          error: 'Not authorized to use this event'
        });
        return;
      }
    }
    
    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('event', 'title start end')
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      res.status(404).json({
        success: false,
        error: 'Service not found'
      });
      return;
    }
    
    // Check if service belongs to user's church
    if (service.church.toString() !== (req as any).user.church.toString()) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to delete this service'
      });
      return;
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