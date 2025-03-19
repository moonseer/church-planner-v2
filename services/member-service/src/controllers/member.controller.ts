import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Member, { IMember, IChurchRelationship } from '../models/Member';
import { ApiResponse } from '../utils/apiResponse';
import logger from '../utils/logger';
import { AppError } from '../utils/errorHandler';

// Get all members with pagination, filtering, and sorting
export const getAllMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page?.toString() || '1', 10);
    const limit = parseInt(req.query.limit?.toString() || '10', 10);
    const skip = (page - 1) * limit;
    
    // Create a filter object for querying
    const filter: any = { isActive: true };
    
    // Add name filter if provided
    if (req.query.name) {
      const nameQuery = req.query.name.toString();
      filter.$or = [
        { firstName: { $regex: nameQuery, $options: 'i' } },
        { lastName: { $regex: nameQuery, $options: 'i' } },
        { preferredName: { $regex: nameQuery, $options: 'i' } }
      ];
    }
    
    // Add email filter if provided
    if (req.query.email) {
      filter['contact.email'] = { $regex: req.query.email, $options: 'i' };
    }
    
    // Filter by church ID if provided
    if (req.query.churchId) {
      filter['churches.churchId'] = new mongoose.Types.ObjectId(req.query.churchId.toString());
    }
    
    // Filter by church membership status if provided
    if (req.query.status) {
      filter['churches.status'] = req.query.status;
    }
    
    // Filter by church role if provided
    if (req.query.role) {
      filter['churches.roles'] = req.query.role;
    }
    
    // Filter by ministry if provided
    if (req.query.ministry) {
      filter['churches.ministries'] = req.query.ministry;
    }
    
    // Filter by group if provided
    if (req.query.group) {
      filter['churches.groups'] = req.query.group;
    }
    
    // Explicitly filter by isActive if provided
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    // Determine sort order
    let sortBy: any = { lastName: 1, firstName: 1 }; // Default sort by last name, first name
    if (req.query.sort) {
      const sortField = req.query.sort.toString();
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      sortBy = { [sortField]: sortOrder };
    }
    
    // Execute query with pagination
    const members = await Member.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    // Get total count for pagination
    const total = await Member.countDocuments(filter);
    
    logger.debug(`Retrieved ${members.length} members (page ${page}, limit ${limit}, total ${total})`);
    ApiResponse.success(res, {
      members,
      count: members.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (err) {
    logger.error('Error getting members:', err);
    ApiResponse.serverError(res, 'Error retrieving members', err);
  }
};

// Get a single member by ID
export const getMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.badRequest(res, 'Invalid member ID format');
      return;
    }
    
    // Find the member by ID
    const member = await Member.findById(id);
    
    // If no member is found
    if (!member) {
      ApiResponse.notFound(res, 'Member not found');
      return;
    }
    
    logger.debug(`Retrieved member: ${id}`);
    ApiResponse.success(res, member);
  } catch (err) {
    logger.error(`Error getting member ${req.params.id}:`, err);
    ApiResponse.serverError(res, 'Error retrieving member', err);
  }
};

// Create a new member
export const createMember = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for user in request (added by auth middleware)
    const userId = req.user?.id;
    if (!userId && req.body.userId !== 'system') {
      ApiResponse.unauthorized(res, 'User not authenticated');
      return;
    }
    
    // Check if a member with this userId already exists
    const existingMember = await Member.findOne({ userId: req.body.userId });
    if (existingMember) {
      ApiResponse.conflict(res, 'A member profile already exists for this user');
      return;
    }
    
    // Check if email is already in use
    const emailExists = await Member.findOne({ 'contact.email': req.body.contact.email });
    if (emailExists) {
      ApiResponse.conflict(res, 'Email address is already in use by another member');
      return;
    }
    
    // Create the member
    const member = await Member.create(req.body);
    
    logger.info(`Created new member: ${member._id} for user ${req.body.userId}`);
    ApiResponse.created(res, member);
  } catch (err: any) {
    logger.error('Error creating member:', err);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      ApiResponse.badRequest(res, messages.join(', '));
      return;
    }
    
    ApiResponse.serverError(res, 'Error creating member', err);
  }
};

// Update a member
export const updateMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.badRequest(res, 'Invalid member ID format');
      return;
    }
    
    // Check if member exists
    const member = await Member.findById(id);
    if (!member) {
      ApiResponse.notFound(res, 'Member not found');
      return;
    }
    
    // If updating email, check if the new email is already in use by another member
    if (req.body.contact?.email && req.body.contact.email !== member.contact.email) {
      const emailExists = await Member.findOne({ 
        'contact.email': req.body.contact.email,
        _id: { $ne: id }
      });
      
      if (emailExists) {
        ApiResponse.conflict(res, 'Email address is already in use by another member');
        return;
      }
    }
    
    // Update the member with the new data
    const updatedMember = await Member.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    logger.info(`Updated member: ${id}`);
    ApiResponse.success(res, updatedMember);
  } catch (err: any) {
    logger.error(`Error updating member ${req.params.id}:`, err);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error: any) => error.message);
      ApiResponse.badRequest(res, messages.join(', '));
      return;
    }
    
    ApiResponse.serverError(res, 'Error updating member', err);
  }
};

// Delete a member (soft delete)
export const deleteMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.badRequest(res, 'Invalid member ID format');
      return;
    }
    
    // Check if member exists
    const member = await Member.findById(id);
    if (!member) {
      ApiResponse.notFound(res, 'Member not found');
      return;
    }
    
    // Soft delete by setting isActive to false
    const updatedMember = await Member.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    logger.info(`Soft-deleted member: ${id}`);
    ApiResponse.success(res, updatedMember, 'Member successfully deactivated');
  } catch (err) {
    logger.error(`Error deleting member ${req.params.id}:`, err);
    ApiResponse.serverError(res, 'Error deleting member', err);
  }
};

// Hard delete a member (for admins only)
export const hardDeleteMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.badRequest(res, 'Invalid member ID format');
      return;
    }
    
    // Check if member exists
    const member = await Member.findById(id);
    if (!member) {
      ApiResponse.notFound(res, 'Member not found');
      return;
    }
    
    // Perform hard delete
    await Member.findByIdAndDelete(id);
    
    logger.info(`Hard-deleted member: ${id}`);
    ApiResponse.success(res, null, 'Member permanently deleted');
  } catch (err) {
    logger.error(`Error hard-deleting member ${req.params.id}:`, err);
    ApiResponse.serverError(res, 'Error permanently deleting member', err);
  }
};

// Add a church relationship
export const addChurchRelationship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const churchRelationship = req.body;
    
    // Validate the member ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.badRequest(res, 'Invalid member ID format');
      return;
    }
    
    // Validate the church ID
    if (!mongoose.Types.ObjectId.isValid(churchRelationship.churchId)) {
      ApiResponse.badRequest(res, 'Invalid church ID format');
      return;
    }
    
    // Find the member
    const member = await Member.findById(id);
    if (!member) {
      ApiResponse.notFound(res, 'Member not found');
      return;
    }
    
    // Check if relationship with this church already exists
    const existingRelationship = member.churches.find(
      (church) => church.churchId.toString() === churchRelationship.churchId
    );
    
    if (existingRelationship) {
      ApiResponse.conflict(res, 'Relationship with this church already exists');
      return;
    }
    
    // Add the new church relationship
    member.churches.push(churchRelationship as IChurchRelationship);
    await member.save();
    
    logger.info(`Added church relationship for member ${id} with church ${churchRelationship.churchId}`);
    ApiResponse.success(res, member, 'Church relationship added successfully');
  } catch (err) {
    logger.error(`Error adding church relationship for member ${req.params.id}:`, err);
    ApiResponse.serverError(res, 'Error adding church relationship', err);
  }
};

// Update a church relationship
export const updateChurchRelationship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, churchId } = req.params;
    const updates = req.body;
    
    // Validate the member ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.badRequest(res, 'Invalid member ID format');
      return;
    }
    
    // Validate the church ID
    if (!mongoose.Types.ObjectId.isValid(churchId)) {
      ApiResponse.badRequest(res, 'Invalid church ID format');
      return;
    }
    
    // Find the member
    const member = await Member.findById(id);
    if (!member) {
      ApiResponse.notFound(res, 'Member not found');
      return;
    }
    
    // Find the church relationship index
    const relationshipIndex = member.churches.findIndex(
      (church) => church.churchId.toString() === churchId
    );
    
    if (relationshipIndex === -1) {
      ApiResponse.notFound(res, 'Church relationship not found');
      return;
    }
    
    // Update the church relationship
    Object.keys(updates).forEach((key) => {
      member.churches[relationshipIndex][key as keyof IChurchRelationship] = updates[key];
    });
    
    await member.save();
    
    logger.info(`Updated church relationship for member ${id} with church ${churchId}`);
    ApiResponse.success(res, member, 'Church relationship updated successfully');
  } catch (err) {
    logger.error(`Error updating church relationship for member ${req.params.id}:`, err);
    ApiResponse.serverError(res, 'Error updating church relationship', err);
  }
};

// Remove a church relationship
export const removeChurchRelationship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, churchId } = req.params;
    
    // Validate the member ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.badRequest(res, 'Invalid member ID format');
      return;
    }
    
    // Validate the church ID
    if (!mongoose.Types.ObjectId.isValid(churchId)) {
      ApiResponse.badRequest(res, 'Invalid church ID format');
      return;
    }
    
    // Find the member
    const member = await Member.findById(id);
    if (!member) {
      ApiResponse.notFound(res, 'Member not found');
      return;
    }
    
    // Remove the church relationship
    const initialLength = member.churches.length;
    member.churches = member.churches.filter(
      (church) => church.churchId.toString() !== churchId
    );
    
    if (member.churches.length === initialLength) {
      ApiResponse.notFound(res, 'Church relationship not found');
      return;
    }
    
    await member.save();
    
    logger.info(`Removed church relationship for member ${id} with church ${churchId}`);
    ApiResponse.success(res, member, 'Church relationship removed successfully');
  } catch (err) {
    logger.error(`Error removing church relationship for member ${req.params.id}:`, err);
    ApiResponse.serverError(res, 'Error removing church relationship', err);
  }
};

// Get members by church ID
export const getMembersByChurch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { churchId } = req.params;
    const page = parseInt(req.query.page?.toString() || '1', 10);
    const limit = parseInt(req.query.limit?.toString() || '10', 10);
    const skip = (page - 1) * limit;
    
    // Validate the church ID
    if (!mongoose.Types.ObjectId.isValid(churchId)) {
      ApiResponse.badRequest(res, 'Invalid church ID format');
      return;
    }
    
    // Create filter for active members of the specified church
    const filter = { 
      'churches.churchId': new mongoose.Types.ObjectId(churchId),
      isActive: true
    };
    
    // Add status filter if provided
    if (req.query.status) {
      filter['churches.status'] = req.query.status;
    }
    
    // Determine sort order
    let sortBy: any = { lastName: 1, firstName: 1 }; // Default sort by last name, first name
    if (req.query.sort) {
      const sortField = req.query.sort.toString();
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      sortBy = { [sortField]: sortOrder };
    }
    
    // Execute query with pagination
    const members = await Member.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    // Get total count for pagination
    const total = await Member.countDocuments(filter);
    
    logger.debug(`Retrieved ${members.length} members for church ${churchId}`);
    ApiResponse.success(res, {
      members,
      count: members.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (err) {
    logger.error(`Error getting members for church ${req.params.churchId}:`, err);
    ApiResponse.serverError(res, 'Error retrieving members for church', err);
  }
}; 