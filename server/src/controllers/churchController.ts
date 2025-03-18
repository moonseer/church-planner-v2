import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Church from '../models/Church';
import User from '../models/User';
import ErrorResponse from '../utils/ErrorResponse';

/**
 * @desc    Get all churches
 * @route   GET /api/churches
 * @access  Public
 */
export const getChurches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const churches = await Church.find();

    res.status(200).json({
      success: true,
      count: churches.length,
      churches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single church
 * @route   GET /api/churches/:id
 * @access  Public
 */
export const getChurch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const church = await Church.findById(req.params.id);

    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      church,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new church
 * @route   POST /api/churches
 * @access  Private
 */
export const createChurch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(
        new ErrorResponse('User authentication required', 401)
      );
    }

    // Add user as the church admin and member
    req.body.admins = [req.user.id];
    req.body.members = [req.user.id];

    const church = await Church.create(req.body);

    // Add church to user's churches
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $addToSet: { churches: church._id },
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      church,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update church
 * @route   PUT /api/churches/:id
 * @access  Private
 */
export const updateChurch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let church = await Church.findById(req.params.id);

    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${req.params.id}`, 404)
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

    // Make sure user is church admin
    if (!church.admins.some(id => id.equals(userId)) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this church`,
          403
        )
      );
    }

    church = await Church.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      church,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete church
 * @route   DELETE /api/churches/:id
 * @access  Private
 */
export const deleteChurch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const church = await Church.findById(req.params.id);

    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${req.params.id}`, 404)
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

    // Make sure user is church admin
    if (!church.admins.some(id => id.equals(userId)) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this church`,
          403
        )
      );
    }

    // Remove church from all users' churches array
    await User.updateMany(
      { churches: church._id },
      { $pull: { churches: church._id } }
    );

    // Delete the church
    await church.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get churches for current user
 * @route   GET /api/churches/my-churches
 * @access  Private
 */
export const getMyChurches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(
        new ErrorResponse('User authentication required', 401)
      );
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    const churches = await Church.find({
      _id: { $in: user.churches },
    });

    res.status(200).json({
      success: true,
      count: churches.length,
      churches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add member to church
 * @route   POST /api/churches/:id/members
 * @access  Private
 */
export const addMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const church = await Church.findById(req.params.id);

    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${req.params.id}`, 404)
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

    // Make sure user is church admin
    if (!church.admins.some(id => id.equals(userId)) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to add members to this church`,
          403
        )
      );
    }

    const { memberId } = req.body;

    if (!memberId) {
      return next(new ErrorResponse('Please provide a member ID', 400));
    }

    // Validate memberId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return next(new ErrorResponse('Invalid member ID', 400));
    }

    // Check if user exists
    const user = await User.findById(memberId);

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${memberId}`, 404)
      );
    }

    // Convert to ObjectId for comparison
    const memberObjectId = new mongoose.Types.ObjectId(memberId);

    // Check if user is already a member
    if (church.members.some(id => id.equals(memberObjectId))) {
      return next(
        new ErrorResponse('User is already a member of this church', 400)
      );
    }

    // Add user to church members
    church.members.push(memberObjectId);
    await church.save();

    // Add church to user's churches
    await User.findByIdAndUpdate(
      memberId,
      {
        $addToSet: { churches: church._id },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      church,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove member from church
 * @route   DELETE /api/churches/:id/members/:memberId
 * @access  Private
 */
export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const church = await Church.findById(req.params.id);

    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${req.params.id}`, 404)
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

    // Make sure user is church admin
    if (!church.admins.some(id => id.equals(userId)) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to remove members from this church`,
          403
        )
      );
    }

    const { memberId } = req.params;

    // Convert to ObjectId for comparison
    const memberObjectId = new mongoose.Types.ObjectId(memberId);

    // Check if user is an admin (can't remove admins)
    if (church.admins.some(id => id.equals(memberObjectId))) {
      return next(
        new ErrorResponse('Cannot remove an admin from church members', 400)
      );
    }

    // Check if user is a member
    if (!church.members.some(id => id.equals(memberObjectId))) {
      return next(
        new ErrorResponse('User is not a member of this church', 400)
      );
    }

    // Remove user from church members
    church.members = church.members.filter(
      (id) => !id.equals(memberObjectId)
    );
    await church.save();

    // Remove church from user's churches
    await User.findByIdAndUpdate(
      memberId,
      {
        $pull: { churches: church._id },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      church,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add admin to church
 * @route   POST /api/churches/:id/admins
 * @access  Private
 */
export const addAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const church = await Church.findById(req.params.id);

    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${req.params.id}`, 404)
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

    // Make sure user is church admin
    if (!church.admins.some(id => id.equals(userId)) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to add admins to this church`,
          403
        )
      );
    }

    const { adminId } = req.body;

    if (!adminId) {
      return next(new ErrorResponse('Please provide an admin ID', 400));
    }

    // Validate adminId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return next(new ErrorResponse('Invalid admin ID', 400));
    }

    // Check if user exists
    const user = await User.findById(adminId);

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${adminId}`, 404)
      );
    }

    // Convert to ObjectId for comparison
    const adminObjectId = new mongoose.Types.ObjectId(adminId);

    // Check if user is already an admin
    if (church.admins.some(id => id.equals(adminObjectId))) {
      return next(
        new ErrorResponse('User is already an admin of this church', 400)
      );
    }

    // Add user to church admins
    church.admins.push(adminObjectId);

    // Make sure user is also a member
    if (!church.members.some(id => id.equals(adminObjectId))) {
      church.members.push(adminObjectId);
    }

    await church.save();

    // Add church to user's churches if not already there
    await User.findByIdAndUpdate(
      adminId,
      {
        $addToSet: { churches: church._id },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      church,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove admin from church
 * @route   DELETE /api/churches/:id/admins/:adminId
 * @access  Private
 */
export const removeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const church = await Church.findById(req.params.id);

    if (!church) {
      return next(
        new ErrorResponse(`Church not found with id of ${req.params.id}`, 404)
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

    // Make sure user is church admin
    if (!church.admins.some(id => id.equals(userId)) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to remove admins from this church`,
          403
        )
      );
    }

    const { adminId } = req.params;

    // Can't remove yourself as an admin
    if (adminId === req.user.id) {
      return next(
        new ErrorResponse('Cannot remove yourself as an admin', 400)
      );
    }

    // Convert to ObjectId for comparison
    const adminObjectId = new mongoose.Types.ObjectId(adminId);

    // Check if user is an admin
    if (!church.admins.some(id => id.equals(adminObjectId))) {
      return next(
        new ErrorResponse('User is not an admin of this church', 400)
      );
    }

    // Remove user from church admins
    church.admins = church.admins.filter(
      (id) => !id.equals(adminObjectId)
    );
    await church.save();

    res.status(200).json({
      success: true,
      church,
    });
  } catch (error) {
    next(error);
  }
}; 