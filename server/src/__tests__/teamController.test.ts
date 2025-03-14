import { Request, Response } from 'express';
import { getTeams, getTeam, createTeam, updateTeam, deleteTeam } from '../controllers/teamController';
import mongoose from 'mongoose';

// Extended Request type to include user property
interface RequestWithUser extends Request {
  user?: {
    id: string;
    church: string;
    [key: string]: any;
  };
}

// Mock dependencies
jest.mock('mongoose');

// Mock Team model before importing it
jest.mock('../models/Team', () => {
  return {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
});

// Import Team after mocking it
import Team from '../models/Team';

describe('Team Controller', () => {
  let req: Partial<RequestWithUser>;
  let res: Partial<Response>;
  const mockTeamId = 'team123';
  const mockChurchId = 'church123';
  const mockUserId = 'user123';

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: {
        id: mockUserId,
        church: mockChurchId  // Use string directly
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    // Clear all mock calls
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTeams', () => {
    it('should return all teams for a church', async () => {
      // Setup mock teams
      const mockTeams = [
        {
          _id: mockTeamId,
          name: 'Worship Team',
          description: 'Music and worship',
          leader: {
            _id: mockUserId,
            name: 'John Doe',
            email: 'john@example.com',
          },
          church: mockChurchId,
        },
        {
          _id: 'team456',
          name: 'Tech Team',
          description: 'Audio/Visual',
          leader: {
            _id: mockUserId,
            name: 'John Doe',
            email: 'john@example.com',
          },
          church: mockChurchId,
        },
      ];

      // Mock Team.find
      const mockPopulate = jest.fn().mockResolvedValue(mockTeams);
      (Team.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      // Call the controller function
      await getTeams(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.find).toHaveBeenCalledWith({ church: mockChurchId });
      expect(mockPopulate).toHaveBeenCalledWith('leader', 'name email');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockTeams,
      });
    });

    it('should handle errors', async () => {
      // Mock Team.find to reject with an error
      (Team.find as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await getTeams(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.find).toHaveBeenCalledWith({ church: mockChurchId });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('getTeam', () => {
    it('should return a single team by ID', async () => {
      // Setup request parameter
      req.params = { id: mockTeamId };

      // Setup mock team with proper church toString method
      const mockTeam = {
        _id: mockTeamId,
        name: 'Worship Team',
        description: 'Music and worship',
        leader: {
          _id: mockUserId,
          name: 'John Doe',
          email: 'john@example.com',
        },
        church: {
          toString: () => mockChurchId
        }
      };

      // Mock Team.findById
      (Team.findById as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockTeam)
      }));

      // Call the controller function
      await getTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.findById).toHaveBeenCalledWith(mockTeamId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTeam,
      });
    });

    it('should return 404 if team is not found', async () => {
      // Setup request parameter
      req.params = { id: 'nonexistent' };

      // Mock Team.findById to return null
      (Team.findById as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(null)
      }));

      // Call the controller function
      await getTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Team not found',
      });
    });

    it('should return 403 if team does not belong to user\'s church', async () => {
      // Setup request parameter
      req.params = { id: mockTeamId };

      // Setup mock team with different church ID
      const differentChurchId = 'differentChurch456';
      const mockTeam = {
        _id: mockTeamId,
        name: 'Worship Team',
        description: 'Music and worship',
        leader: mockUserId,
        church: {
          toString: () => differentChurchId
        }
      };

      // Mock Team.findById
      (Team.findById as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockTeam)
      }));

      // Call the controller function
      await getTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.findById).toHaveBeenCalledWith(mockTeamId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this team',
      });
    });

    it('should handle errors', async () => {
      // Setup request parameter
      req.params = { id: mockTeamId };

      // Mock Team.findById to throw an error
      (Team.findById as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await getTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.findById).toHaveBeenCalledWith(mockTeamId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('createTeam', () => {
    it('should create a new team', async () => {
      // Setup request body
      req.body = {
        name: 'Hospitality Team',
        description: 'Welcome guests',
        leader: mockUserId,
      };

      // Setup mock created team
      const mockTeam = {
        _id: 'newTeam789',
        name: 'Hospitality Team',
        description: 'Welcome guests',
        leader: mockUserId,
        church: mockChurchId,
      };

      // Mock Team.create
      (Team.create as jest.Mock).mockResolvedValue(mockTeam);

      // Call the controller function
      await createTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.create).toHaveBeenCalledWith({
        name: 'Hospitality Team',
        description: 'Welcome guests',
        leader: mockUserId,
        church: mockChurchId,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTeam,
      });
    });

    it('should set the authenticated user as leader if not specified', async () => {
      // Setup request body without leader
      req.body = {
        name: 'Hospitality Team',
        description: 'Welcome guests',
      };

      // Setup mock created team
      const mockTeam = {
        _id: 'newTeam789',
        name: 'Hospitality Team',
        description: 'Welcome guests',
        leader: mockUserId,
        church: mockChurchId,
      };

      // Mock Team.create
      (Team.create as jest.Mock).mockResolvedValue(mockTeam);

      // Call the controller function
      await createTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.create).toHaveBeenCalledWith({
        name: 'Hospitality Team',
        description: 'Welcome guests',
        leader: mockUserId,
        church: mockChurchId,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTeam,
      });
    });

    it('should handle validation errors', async () => {
      // Setup request body
      req.body = {
        description: 'Welcome guests',
        // Missing required name
      };

      // Mock Team.create to throw a validation error
      (Team.create as jest.Mock).mockImplementation(() => {
        throw new Error('Validation failed');
      });

      // Call the controller function
      await createTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
      });
    });
  });

  describe('updateTeam', () => {
    it('should update a team', async () => {
      // Setup request parameter and body
      req.params = { id: mockTeamId };
      req.body = {
        name: 'Updated Team Name',
        description: 'Updated description',
      };

      // Setup mock team
      const mockTeam = {
        _id: mockTeamId,
        name: 'Original Team Name',
        description: 'Original description',
        leader: mockUserId,
        church: {
          toString: () => mockChurchId
        }
      };

      // Setup mock updated team
      const mockUpdatedTeam = {
        _id: mockTeamId,
        name: 'Updated Team Name',
        description: 'Updated description',
        leader: mockUserId,
        church: mockChurchId,
      };

      // Mock Team.findById
      (Team.findById as jest.Mock).mockResolvedValue(mockTeam);

      // Mock Team.findByIdAndUpdate
      (Team.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedTeam);

      // Call the controller function
      await updateTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.findById).toHaveBeenCalledWith(mockTeamId);
      expect(Team.findByIdAndUpdate).toHaveBeenCalledWith(
        mockTeamId,
        {
          name: 'Updated Team Name',
          description: 'Updated description',
        },
        {
          new: true,
          runValidators: true,
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedTeam,
      });
    });

    it('should return 404 if team is not found', async () => {
      // Setup request parameter
      req.params = { id: 'nonexistent' };
      req.body = {
        name: 'Updated Team Name',
      };

      // Mock Team.findById to return null
      (Team.findById as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await updateTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Team not found',
      });
    });

    it('should return 403 if user is not authorized to update the team', async () => {
      // Setup request parameter
      req.params = { id: mockTeamId };
      req.body = {
        name: 'Updated Team Name',
      };

      // Setup mock team with different church ID
      const differentChurchId = 'differentChurch456';
      const mockTeam = {
        _id: mockTeamId,
        name: 'Original Team Name',
        leader: mockUserId,
        church: {
          toString: () => differentChurchId
        }
      };

      // Mock Team.findById
      (Team.findById as jest.Mock).mockResolvedValue(mockTeam);

      // Call the controller function
      await updateTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.findById).toHaveBeenCalledWith(mockTeamId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to update this team',
      });
    });

    it('should handle validation errors', async () => {
      // Setup request parameter and body
      req.params = { id: mockTeamId };
      req.body = {
        name: 'Updated Team Name',
      };

      // Setup mock team
      const mockTeam = {
        _id: mockTeamId,
        name: 'Original Team Name',
        leader: mockUserId,
        church: {
          toString: () => mockChurchId
        }
      };

      // Mock Team.findById
      (Team.findById as jest.Mock).mockResolvedValue(mockTeam);

      // Mock Team.findByIdAndUpdate to throw a validation error
      (Team.findByIdAndUpdate as jest.Mock).mockImplementation(() => {
        throw new Error('Validation failed');
      });

      // Call the controller function
      await updateTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.findById).toHaveBeenCalledWith(mockTeamId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
      });
    });
  });

  describe('deleteTeam', () => {
    it('should delete a team', async () => {
      // Setup request parameter
      req.params = { id: mockTeamId };

      // Create a mock delete function
      const mockDeleteOne = jest.fn().mockResolvedValue({});

      // Setup mock team
      const mockTeam = {
        _id: mockTeamId,
        name: 'Team to Delete',
        leader: mockUserId,
        church: {
          toString: () => mockChurchId
        },
        deleteOne: mockDeleteOne
      };

      // Mock Team.findById
      (Team.findById as jest.Mock).mockResolvedValue(mockTeam);

      // Call the controller function
      await deleteTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.findById).toHaveBeenCalledWith(mockTeamId);
      expect(mockDeleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {},
      });
    });

    it('should return 404 if team is not found', async () => {
      // Setup request parameter
      req.params = { id: 'nonexistent' };

      // Mock Team.findById to return null
      (Team.findById as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await deleteTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Team not found',
      });
    });

    it('should return 403 if user is not authorized to delete the team', async () => {
      // Setup request parameter
      req.params = { id: mockTeamId };

      // Setup mock team with different church ID
      const differentChurchId = 'differentChurch456';
      const mockTeam = {
        _id: mockTeamId,
        name: 'Team to Delete',
        leader: mockUserId,
        church: {
          toString: () => differentChurchId
        }
      };

      // Mock Team.findById
      (Team.findById as jest.Mock).mockResolvedValue(mockTeam);

      // Call the controller function
      await deleteTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.findById).toHaveBeenCalledWith(mockTeamId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to delete this team',
      });
    });

    it('should handle errors', async () => {
      // Setup request parameter
      req.params = { id: mockTeamId };

      // Mock Team.findById to throw an error
      (Team.findById as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller function
      await deleteTeam(req as RequestWithUser, res as Response);

      // Assertions
      expect(Team.findById).toHaveBeenCalledWith(mockTeamId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });
}); 