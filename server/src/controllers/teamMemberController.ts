import { Request, Response } from 'express';
import TeamMember from '../models/TeamMember';
import Team from '../models/Team';
import mongoose from 'mongoose';

// @desc    Get all team members for a team
// @route   GET /api/teams/:teamId/members
// @access  Private
export const getTeamMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamId = req.params.teamId;
    
    // Verify team exists and belongs to user's church
    const team = await Team.findById(teamId);
    
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
    
    const teamMembers = await TeamMember.find({ team: teamId })
      .populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      count: teamMembers.length,
      data: teamMembers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single team member
// @route   GET /api/team-members/:id
// @access  Private
export const getTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamMember = await TeamMember.findById(req.params.id)
      .populate('user', 'name email')
      .populate('team', 'name');
    
    if (!teamMember) {
      res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
      return;
    }
    
    // Verify team belongs to user's church
    const team = await Team.findById(teamMember.team);
    
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
        error: 'Not authorized to access this team member'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: teamMember
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add team member
// @route   POST /api/teams/:teamId/members
// @access  Private
export const addTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamId = req.params.teamId;
    
    // Verify team exists and belongs to user's church
    const team = await Team.findById(teamId);
    
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
        error: 'Not authorized to add members to this team'
      });
      return;
    }
    
    // Set team ID in request body
    req.body.team = teamId;
    
    // Check if team member already exists
    const existingMember = await TeamMember.findOne({
      team: teamId,
      user: req.body.user
    });
    
    if (existingMember) {
      res.status(400).json({
        success: false,
        error: 'User is already a member of this team'
      });
      return;
    }
    
    const teamMember = await TeamMember.create(req.body);
    
    // Populate user for the response
    const populatedTeamMember = await TeamMember.findById(teamMember._id)
      .populate('user', 'name email')
      .populate('team', 'name');
    
    res.status(201).json({
      success: true,
      data: populatedTeamMember
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({
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

// @desc    Update team member
// @route   PUT /api/team-members/:id
// @access  Private
export const updateTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    let teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
      return;
    }
    
    // Verify team belongs to user's church
    const team = await Team.findById(teamMember.team);
    
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
        error: 'Not authorized to update this team member'
      });
      return;
    }
    
    // Don't allow changing the team or user
    delete req.body.team;
    delete req.body.user;
    
    teamMember = await TeamMember.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('user', 'name email')
      .populate('team', 'name');
    
    res.status(200).json({
      success: true,
      data: teamMember
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({
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

// @desc    Remove team member
// @route   DELETE /api/team-members/:id
// @access  Private
export const removeTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
      return;
    }
    
    // Verify team belongs to user's church
    const team = await Team.findById(teamMember.team);
    
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
        error: 'Not authorized to remove this team member'
      });
      return;
    }
    
    await teamMember.deleteOne();
    
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