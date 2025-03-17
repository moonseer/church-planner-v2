import { Request, Response } from 'express';
import { IChurchDocument } from '@shared/types/mongoose';
import { HttpStatus } from '@shared/types/api';
import { sendSuccessResponse, sendErrorResponse, handleError } from '../utils/responseUtils';
import churchService from '../services/churchService';

/**
 * @desc    Get all churches
 * @route   GET /api/churches
 * @access  Public
 */
export const getChurches = async (req: Request, res: Response): Promise<void> => {
  try {
    const churches = await churchService.getAll();
    sendSuccessResponse(res, churches, HttpStatus.OK, churches.length);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Create new church
 * @route   POST /api/churches
 * @access  Private (Admin only)
 */
export const createChurch = async (req: Request, res: Response): Promise<void> => {
  try {
    const church = await churchService.create(req.body);
    sendSuccessResponse(res, church, HttpStatus.CREATED);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Get single church
 * @route   GET /api/churches/:id
 * @access  Public
 */
export const getChurch = async (req: Request, res: Response): Promise<void> => {
  try {
    const church = await churchService.getById(req.params.id);
    
    if (!church) {
      sendErrorResponse(res, 'Church not found', HttpStatus.NOT_FOUND);
      return;
    }
    
    sendSuccessResponse(res, church);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Update church
 * @route   PUT /api/churches/:id
 * @access  Private (Admin only)
 */
export const updateChurch = async (req: Request, res: Response): Promise<void> => {
  try {
    const church = await churchService.update(req.params.id, req.body);
    
    if (!church) {
      sendErrorResponse(res, 'Church not found', HttpStatus.NOT_FOUND);
      return;
    }
    
    sendSuccessResponse(res, church);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Delete church
 * @route   DELETE /api/churches/:id
 * @access  Private (Admin only)
 */
export const deleteChurch = async (req: Request, res: Response): Promise<void> => {
  try {
    const church = await churchService.delete(req.params.id);
    
    if (!church) {
      sendErrorResponse(res, 'Church not found', HttpStatus.NOT_FOUND);
      return;
    }
    
    sendSuccessResponse(res, {}, HttpStatus.OK);
  } catch (error) {
    handleError(res, error);
  }
}; 