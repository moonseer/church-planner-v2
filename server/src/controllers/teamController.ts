import { Request, Response } from 'express';
import Team from '../models/Team';
import mongoose from 'mongoose';

// @desc    Get all teams for a church
// @route   GET /api/teams
// @access  Private
export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get church ID from authenticated user
    const churchId = (req as any).user.church;

    const teams = await Team.find({ church: churchId })
      .populate('leader', 'name email');

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
export const getTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'name email');

    if (!team) {
      res.status(404).json({
        success: false,
        error: 'Team not found'
      });
      return;
    }

    // Check if team belongs to user's church
    if (team.church.toString() !== (req as any).user.church.toString()) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to access this team'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new team
// @route   POST /api/teams
// @access  Private
export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add church from authenticated user
    req.body.church = (req as any).user.church;
    
    // If no leader specified, use the current user
    if (!req.body.leader) {
      req.body.leader = (req as any).user.id;
    }
    
    const team = await Team.create(req.body);
    
    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    let team = await Team.findById(req.params.id);
    
    if (!team) {
      res.status(404).json({
        success: false,
        error: 'Team not found'
      });
      return;
    }
    
    // Check if team belongs to user's church
    if (team.church.toString() !== (req as any).user.church.toString()) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to update this team'
      });
      return;
    }
    
    team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      res.status(404).json({
        success: false,
        error: 'Team not found'
      });
      return;
    }
    
    // Check if team belongs to user's church
    if (team.church.toString() !== (req as any).user.church.toString()) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to delete this team'
      });
      return;
    }
    
    await team.deleteOne();
    
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