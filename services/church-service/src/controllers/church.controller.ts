import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Church, { IChurch } from '../models/Church';

// Get all churches with pagination, filtering, and sorting
export const getAllChurches = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page?.toString() || '1', 10);
    const limit = parseInt(req.query.limit?.toString() || '10', 10);
    const skip = (page - 1) * limit;
    
    // Create a filter object for querying
    const filter: any = { isActive: true };
    
    // Add name filter if provided
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }
    
    // Add location filters if provided
    if (req.query.city) {
      filter['address.city'] = { $regex: req.query.city, $options: 'i' };
    }
    
    if (req.query.state) {
      filter['address.state'] = { $regex: req.query.state, $options: 'i' };
    }
    
    if (req.query.denomination) {
      filter.denomination = { $regex: req.query.denomination, $options: 'i' };
    }
    
    // Determine sort order
    let sortBy = { name: 1 }; // Default sort by name ascending
    if (req.query.sort) {
      const sortField = req.query.sort.toString();
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      sortBy = { [sortField]: sortOrder };
    }
    
    // Execute query with pagination
    const churches = await Church.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    // Get total count for pagination
    const total = await Church.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: churches.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: churches
    });
  } catch (err) {
    console.error('Error getting churches:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get a single church by ID
export const getChurch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid church ID'
      });
      return;
    }
    
    // Find the church by ID
    const church = await Church.findById(id);
    
    // If no church is found
    if (!church) {
      res.status(404).json({
        success: false,
        error: 'Church not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: church
    });
  } catch (err) {
    console.error('Error getting church:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Create a new church
export const createChurch = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for user in request (added by auth middleware)
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }
    
    const { name, description, email, address, admins, ...rest } = req.body;
    
    // Validate required fields
    if (!name || !description || !email || !address) {
      res.status(400).json({
        success: false,
        error: 'Please provide name, description, email, and address'
      });
      return;
    }
    
    // Add the current user as the owner if admins not provided
    const churchAdmins = admins || [{
      userId,
      role: 'owner',
      name: req.user?.name || 'Church Owner',
      email: req.user?.email || email,
      addedAt: new Date()
    }];
    
    // Create the church
    const church = await Church.create({
      name,
      description,
      email,
      address,
      admins: churchAdmins,
      ...rest
    });
    
    res.status(201).json({
      success: true,
      data: church
    });
  } catch (err: any) {
    console.error('Error creating church:', err);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      res.status(400).json({
        success: false,
        error: messages
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Update a church
export const updateChurch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid church ID'
      });
      return;
    }
    
    // Check if church exists
    const church = await Church.findById(id);
    if (!church) {
      res.status(404).json({
        success: false,
        error: 'Church not found'
      });
      return;
    }
    
    // Update the church with the new data
    const updatedChurch = await Church.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedChurch
    });
  } catch (err: any) {
    console.error('Error updating church:', err);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      res.status(400).json({
        success: false,
        error: messages
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Delete a church (soft delete)
export const deleteChurch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid church ID'
      });
      return;
    }
    
    // Check if church exists
    const church = await Church.findById(id);
    if (!church) {
      res.status(404).json({
        success: false,
        error: 'Church not found'
      });
      return;
    }
    
    // Soft delete by setting isActive to false
    const updatedChurch = await Church.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedChurch
    });
  } catch (err) {
    console.error('Error deleting church:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Hard delete a church (for admins only)
export const hardDeleteChurch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid church ID'
      });
      return;
    }
    
    // Check if church exists
    const church = await Church.findById(id);
    if (!church) {
      res.status(404).json({
        success: false,
        error: 'Church not found'
      });
      return;
    }
    
    // Perform hard delete
    await Church.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error hard deleting church:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 