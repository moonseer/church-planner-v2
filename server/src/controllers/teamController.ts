import { Request, Response } from 'express';
import Team from '../models/Team';
import mongoose from 'mongoose';

// @desc    Get all teams for a church
// @route   GET /api/teams
// @access  Private
export const getTeams = async (req: Request, res: Response) => {
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
export const getTeam = async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'name email');

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    // Check if team belongs to user's church
    if (team.church.toString() !== (req as any).user.church.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this team'
      });
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
export const createTeam = async (req: Request, res: Response) => {
  try {
    // Add church from authenticated user
    req.body.church = (req as any).user.church;
    
    // If no leader is specified, set the authenticated user as the leader
    if (!req.body.leader) {
      req.body.leader = (req as any).user.id;
    }

    const team = await Team.create(req.body);

    // Populate leader for the response
    const populatedTeam = await Team.findById(team._id)
      .populate('leader', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTeam
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

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
export const updateTeam = async (req: Request, res: Response) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    // Check if team belongs to user's church
    if (team.church.toString() !== (req as any).user.church.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this team'
      });
    }

    team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('leader', 'name email');

    res.status(200).json({
      success: true,
      data: team
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

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    // Check if team belongs to user's church
    if (team.church.toString() !== (req as any).user.church.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this team'
      });
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