import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Church from '../models/Church';
import ChurchMember from '../models/ChurchMember';
import ErrorResponse from '../utils/ErrorResponse';

// @desc    Get members for a church
// @route   GET /api/churches/:churchId/members
// @access  Private
export const getChurchMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { churchId } = req.params;

    // Check if church exists
    const church = await Church.findById(churchId);
    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${churchId}`, 404)
      );
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(
        new ErrorResponse('User authentication required', 401)
      );
    }

    // Convert string id to ObjectId for includes comparison
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Check if user is authorized to view members
    if (!church.members.some(id => id.equals(userId)) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view members of this church`,
          403
        )
      );
    }

    const members = await ChurchMember.find({ church: churchId });

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single church member
// @route   GET /api/churches/:churchId/members/:id
// @access  Private
export const getChurchMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { churchId, id } = req.params;

    // Check if church exists
    const church = await Church.findById(churchId);
    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${churchId}`, 404)
      );
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(
        new ErrorResponse('User authentication required', 401)
      );
    }

    // Convert string id to ObjectId for includes comparison
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Check if user is authorized to view members
    if (!church.members.some(id => id.equals(userId)) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view members of this church`,
          403
        )
      );
    }

    const member = await ChurchMember.findOne({
      _id: id,
      church: churchId,
    });

    if (!member) {
      return next(
        new ErrorResponse(`Member not found with id of ${id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create church member
// @route   POST /api/churches/:churchId/members
// @access  Private
export const createChurchMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { churchId } = req.params;
    
    // Set church ID in request body
    req.body.church = churchId;

    // Check if church exists
    const church = await Church.findById(churchId);
    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${churchId}`, 404)
      );
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(
        new ErrorResponse('User authentication required', 401)
      );
    }

    // Convert string id to ObjectId for includes comparison
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Check if user is authorized to add members
    if (!church.admins.some(id => id.equals(userId)) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to add members to this church`,
          403
        )
      );
    }

    // Create member
    const member = await ChurchMember.create(req.body);

    res.status(201).json({
      success: true,
      member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update church member
// @route   PUT /api/churches/:churchId/members/:id
// @access  Private
export const updateChurchMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { churchId, id } = req.params;

    // Check if church exists
    const church = await Church.findById(churchId);
    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${churchId}`, 404)
      );
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(
        new ErrorResponse('User authentication required', 401)
      );
    }

    // Convert string id to ObjectId for includes comparison
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Check if user is authorized to update members
    if (!church.admins.some(id => id.equals(userId)) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update members of this church`,
          403
        )
      );
    }

    // Find and update member
    let member = await ChurchMember.findOne({
      _id: id,
      church: churchId,
    });

    if (!member) {
      return next(
        new ErrorResponse(`Member not found with id of ${id}`, 404)
      );
    }

    member = await ChurchMember.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete church member
// @route   DELETE /api/churches/:churchId/members/:id
// @access  Private
export const deleteChurchMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { churchId, id } = req.params;

    // Check if church exists
    const church = await Church.findById(churchId);
    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${churchId}`, 404)
      );
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(
        new ErrorResponse('User authentication required', 401)
      );
    }

    // Convert string id to ObjectId for includes comparison
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Check if user is authorized to delete members
    if (!church.admins.some(id => id.equals(userId)) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete members of this church`,
          403
        )
      );
    }

    // Find and delete member
    const member = await ChurchMember.findOne({
      _id: id,
      church: churchId,
    });

    if (!member) {
      return next(
        new ErrorResponse(`Member not found with id of ${id}`, 404)
      );
    }

    await member.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get member statistics for a church
// @route   GET /api/churches/:churchId/members/stats
// @access  Private
export const getMemberStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { churchId } = req.params;

    // Check if church exists
    const church = await Church.findById(churchId);
    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${churchId}`, 404)
      );
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(
        new ErrorResponse('User authentication required', 401)
      );
    }

    // Convert string id to ObjectId for includes comparison
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Check if user is authorized to view stats
    if (!church.admins.some(id => id.equals(userId)) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view stats of this church`,
          403
        )
      );
    }

    // Get total members count
    const totalMembers = await ChurchMember.countDocuments({ church: churchId });

    // Get active members count (members who attended at least one event in the last 30 days)
    // This is a placeholder - the actual implementation would depend on the attendance tracking system
    const activeMembers = totalMembers; // Placeholder

    // Get members by gender
    const genderStats = await ChurchMember.aggregate([
      { $match: { church: new mongoose.Types.ObjectId(churchId) } },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
    ]);

    // Get members by age group
    const ageStats = await ChurchMember.aggregate([
      { $match: { church: new mongoose.Types.ObjectId(churchId) } },
      {
        $project: {
          ageGroup: {
            $switch: {
              branches: [
                { case: { $lte: ['$age', 12] }, then: 'Children (0-12)' },
                { case: { $lte: ['$age', 18] }, then: 'Teens (13-18)' },
                { case: { $lte: ['$age', 30] }, then: 'Young Adults (19-30)' },
                { case: { $lte: ['$age', 50] }, then: 'Adults (31-50)' },
                { case: { $lte: ['$age', 70] }, then: 'Seniors (51-70)' },
              ],
              default: 'Elderly (71+)',
            },
          },
        },
      },
      { $group: { _id: '$ageGroup', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        genderStats,
        ageStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search church members
// @route   GET /api/churches/:churchId/members/search
// @access  Private
export const searchChurchMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { churchId } = req.params;
    const { query } = req.query;

    // Check if church exists
    const church = await Church.findById(churchId);
    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${churchId}`, 404)
      );
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(
        new ErrorResponse('User authentication required', 401)
      );
    }

    // Convert string id to ObjectId for includes comparison
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Check if user is authorized to search members
    if (!church.members.some(id => id.equals(userId)) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to search members of this church`,
          403
        )
      );
    }

    // Search members by name, email, or phone
    const members = await ChurchMember.find({
      church: churchId,
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ],
    });

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    next(error);
  }
}; 