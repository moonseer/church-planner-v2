import { Request, Response } from 'express';
import { churchService, CreateChurchData, UpdateChurchData } from '../services/churchService';
import { sendSuccessResponse } from '../../../utils/responseUtils';
import { HttpStatus } from '@shared/types/api';

class ChurchController {
  /**
   * Create a new church
   * @route POST /api/churches
   * @access Private
   */
  async createChurch(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const churchData: CreateChurchData = {
      ...req.body,
      createdBy: userId,
    };

    const church = await churchService.createChurch(churchData);

    sendSuccessResponse(res, { church }, HttpStatus.CREATED);
  }

  /**
   * Get all churches
   * @route GET /api/churches
   * @access Private
   */
  async getAllChurches(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await churchService.getAllChurches(limit, page);
    
    sendSuccessResponse(res, result);
  }

  /**
   * Get churches for the current user
   * @route GET /api/churches/user
   * @access Private
   */
  async getMyChurches(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const churches = await churchService.getChurchesForUser(userId);
    
    sendSuccessResponse(res, { churches });
  }

  /**
   * Get a church by ID
   * @route GET /api/churches/:id
   * @access Private
   */
  async getChurch(req: Request, res: Response): Promise<void> {
    const churchId = req.params.id;
    
    const church = await churchService.getChurchById(churchId);
    
    sendSuccessResponse(res, { church });
  }

  /**
   * Update a church
   * @route PUT /api/churches/:id
   * @access Private
   */
  async updateChurch(req: Request, res: Response): Promise<void> {
    const churchId = req.params.id;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const updateData: UpdateChurchData = req.body;
    
    const church = await churchService.updateChurch(churchId, userId, updateData);
    
    sendSuccessResponse(res, { church });
  }

  /**
   * Delete a church
   * @route DELETE /api/churches/:id
   * @access Private
   */
  async deleteChurch(req: Request, res: Response): Promise<void> {
    const churchId = req.params.id;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    await churchService.deleteChurch(churchId, userId);
    
    sendSuccessResponse(res, null, HttpStatus.NO_CONTENT);
  }

  /**
   * Add a member to a church
   * @route POST /api/churches/:id/members
   * @access Private
   */
  async addMember(req: Request, res: Response): Promise<void> {
    const churchId = req.params.id;
    const userId = req.user?.id;
    const { memberId } = req.body;
    
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    if (!memberId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Member ID is required',
      });
      return;
    }

    const church = await churchService.addMember(churchId, userId, memberId);
    
    sendSuccessResponse(res, { church });
  }

  /**
   * Remove a member from a church
   * @route DELETE /api/churches/:id/members/:memberId
   * @access Private
   */
  async removeMember(req: Request, res: Response): Promise<void> {
    const churchId = req.params.id;
    const userId = req.user?.id;
    const { memberId } = req.params;
    
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const church = await churchService.removeMember(churchId, userId, memberId);
    
    sendSuccessResponse(res, { church });
  }

  /**
   * Add an admin to a church
   * @route POST /api/churches/:id/admins
   * @access Private
   */
  async addAdmin(req: Request, res: Response): Promise<void> {
    const churchId = req.params.id;
    const userId = req.user?.id;
    const { adminId } = req.body;
    
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    if (!adminId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Admin ID is required',
      });
      return;
    }

    const church = await churchService.addAdmin(churchId, userId, adminId);
    
    sendSuccessResponse(res, { church });
  }

  /**
   * Remove an admin from a church
   * @route DELETE /api/churches/:id/admins/:adminId
   * @access Private
   */
  async removeAdmin(req: Request, res: Response): Promise<void> {
    const churchId = req.params.id;
    const userId = req.user?.id;
    const { adminId } = req.params;
    
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const church = await churchService.removeAdmin(churchId, userId, adminId);
    
    sendSuccessResponse(res, { church });
  }
}

export const churchController = new ChurchController(); 