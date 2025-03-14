import { Request, Response } from 'express';
import Church from '../models/Church';

// @desc    Get all churches
// @route   GET /api/churches
// @access  Public
export const getChurches = async (req: Request, res: Response) => {
  try {
    const churches = await Church.find();
    res.status(200).json({
      success: true,
      count: churches.length,
      data: churches,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Create new church
// @route   POST /api/churches
// @access  Private (Admin only)
export const createChurch = async (req: Request, res: Response) => {
  try {
    const church = await Church.create(req.body);
    
    res.status(201).json({
      success: true,
      data: church,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get single church
// @route   GET /api/churches/:id
// @access  Public
export const getChurch = async (req: Request, res: Response) => {
  try {
    const church = await Church.findById(req.params.id);
    
    if (!church) {
      return res.status(404).json({
        success: false,
        error: 'Church not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: church,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update church
// @route   PUT /api/churches/:id
// @access  Private (Admin only)
export const updateChurch = async (req: Request, res: Response) => {
  try {
    const church = await Church.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!church) {
      return res.status(404).json({
        success: false,
        error: 'Church not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: church,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete church
// @route   DELETE /api/churches/:id
// @access  Private (Admin only)
export const deleteChurch = async (req: Request, res: Response) => {
  try {
    const church = await Church.findByIdAndDelete(req.params.id);
    
    if (!church) {
      return res.status(404).json({
        success: false,
        error: 'Church not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}; 