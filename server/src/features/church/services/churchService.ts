import { Types } from 'mongoose';
import Church, { IChurch } from '../models/Church';
import ApiError from '../../../utils/ApiError';
import { toObjectId } from '../../../utils/typeGuards';

export type CreateChurchData = {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  timezone: string;
  serviceDay: string;
  serviceTime: string;
  pastorName?: string;
  description?: string;
  logo?: string;
  createdBy: string;
};

export type UpdateChurchData = Partial<CreateChurchData>;

class ChurchService {
  /**
   * Create a new church
   */
  async createChurch(data: CreateChurchData): Promise<IChurch> {
    const createdById = toObjectId(data.createdBy);
    if (!createdById) {
      throw new ApiError(400, 'Invalid creator ID format');
    }

    // Create a new church with the creator as the first admin and member
    const church = await Church.create({
      ...data,
      createdBy: createdById,
      admins: [createdById],
      members: [createdById],
    });

    return church;
  }

  /**
   * Get all churches
   */
  async getAllChurches(limit = 10, page = 1, query = {}): Promise<{ churches: IChurch[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    const churches = await Church.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .exec();

    const total = await Church.countDocuments(query);

    return {
      churches,
      total,
      page,
      limit,
    };
  }

  /**
   * Get churches for a specific user (as member or admin)
   */
  async getChurchesForUser(userId: string): Promise<IChurch[]> {
    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
      throw new ApiError(400, 'Invalid user ID format');
    }

    const churches = await Church.find({
      $or: [
        { members: userObjectId },
        { admins: userObjectId },
      ],
    }).sort({ createdAt: -1 });

    return churches;
  }

  /**
   * Get church by ID
   */
  async getChurchById(churchId: string): Promise<IChurch> {
    if (!Types.ObjectId.isValid(churchId)) {
      throw new ApiError(400, 'Invalid church ID format');
    }

    const church = await Church.findById(churchId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .populate('admins', 'name email');

    if (!church) {
      throw new ApiError(404, 'Church not found');
    }

    return church;
  }

  /**
   * Update church
   */
  async updateChurch(churchId: string, userId: string, updateData: UpdateChurchData): Promise<IChurch> {
    if (!Types.ObjectId.isValid(churchId)) {
      throw new ApiError(400, 'Invalid church ID format');
    }

    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
      throw new ApiError(400, 'Invalid user ID format');
    }

    // Check if church exists and user is an admin
    const church = await Church.findOne({
      _id: churchId,
      admins: userObjectId,
    });

    if (!church) {
      throw new ApiError(404, 'Church not found or you do not have permission to update it');
    }

    // Update the church
    Object.assign(church, updateData);
    await church.save();

    return church;
  }

  /**
   * Delete church
   */
  async deleteChurch(churchId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(churchId)) {
      throw new ApiError(400, 'Invalid church ID format');
    }

    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
      throw new ApiError(400, 'Invalid user ID format');
    }

    // Check if church exists and user is either the creator or an admin
    const church = await Church.findOne({
      _id: churchId,
      $or: [
        { createdBy: userObjectId },
        { admins: userObjectId },
      ],
    });

    if (!church) {
      throw new ApiError(404, 'Church not found or you do not have permission to delete it');
    }

    // Only the original creator can delete the church
    if (church.createdBy.toString() !== userId) {
      throw new ApiError(403, 'Only the church creator can delete the church');
    }

    await Church.deleteOne({ _id: churchId });
  }

  /**
   * Add a member to a church
   */
  async addMember(churchId: string, adminId: string, memberId: string): Promise<IChurch> {
    if (!Types.ObjectId.isValid(churchId) || !Types.ObjectId.isValid(memberId)) {
      throw new ApiError(400, 'Invalid ID format');
    }

    const adminObjectId = toObjectId(adminId);
    const memberObjectId = toObjectId(memberId);
    
    if (!adminObjectId || !memberObjectId) {
      throw new ApiError(400, 'Invalid ID format');
    }

    // Check if church exists and user is an admin
    const church = await Church.findOne({
      _id: churchId,
      admins: adminObjectId,
    });

    if (!church) {
      throw new ApiError(404, 'Church not found or you do not have permission to add members');
    }

    // Check if user is already a member
    const isMember = church.members.some(id => id.toString() === memberId);
    if (isMember) {
      throw new ApiError(400, 'User is already a member of this church');
    }

    // Add the member
    church.members.push(memberObjectId);
    await church.save();

    return church;
  }

  /**
   * Remove a member from a church
   */
  async removeMember(churchId: string, adminId: string, memberId: string): Promise<IChurch> {
    if (!Types.ObjectId.isValid(churchId) || !Types.ObjectId.isValid(memberId)) {
      throw new ApiError(400, 'Invalid ID format');
    }

    const adminObjectId = toObjectId(adminId);
    if (!adminObjectId) {
      throw new ApiError(400, 'Invalid admin ID format');
    }

    // Check if church exists and user is an admin
    const church = await Church.findOne({
      _id: churchId,
      admins: adminObjectId,
    });

    if (!church) {
      throw new ApiError(404, 'Church not found or you do not have permission to remove members');
    }

    // Check if user is a member
    const isMember = church.members.some(id => id.toString() === memberId);
    if (!isMember) {
      throw new ApiError(400, 'User is not a member of this church');
    }

    // Remove the member
    church.members = church.members.filter(id => id.toString() !== memberId);
    await church.save();

    return church;
  }

  /**
   * Add an admin to a church
   */
  async addAdmin(churchId: string, currentAdminId: string, newAdminId: string): Promise<IChurch> {
    if (!Types.ObjectId.isValid(churchId) || !Types.ObjectId.isValid(newAdminId)) {
      throw new ApiError(400, 'Invalid ID format');
    }

    const currentAdminObjectId = toObjectId(currentAdminId);
    const newAdminObjectId = toObjectId(newAdminId);
    
    if (!currentAdminObjectId || !newAdminObjectId) {
      throw new ApiError(400, 'Invalid ID format');
    }

    // Check if church exists and current user is an admin
    const church = await Church.findOne({
      _id: churchId,
      admins: currentAdminObjectId,
    });

    if (!church) {
      throw new ApiError(404, 'Church not found or you do not have permission to add admins');
    }

    // Check if user is already an admin
    const isAdmin = church.admins.some(id => id.toString() === newAdminId);
    if (isAdmin) {
      throw new ApiError(400, 'User is already an admin of this church');
    }

    // Add the user as a member if they're not already
    const isMember = church.members.some(id => id.toString() === newAdminId);
    if (!isMember) {
      church.members.push(newAdminObjectId);
    }

    // Add the admin
    church.admins.push(newAdminObjectId);
    await church.save();

    return church;
  }

  /**
   * Remove an admin from a church
   */
  async removeAdmin(churchId: string, currentAdminId: string, adminToRemoveId: string): Promise<IChurch> {
    if (!Types.ObjectId.isValid(churchId) || !Types.ObjectId.isValid(adminToRemoveId)) {
      throw new ApiError(400, 'Invalid ID format');
    }

    const currentAdminObjectId = toObjectId(currentAdminId);
    if (!currentAdminObjectId) {
      throw new ApiError(400, 'Invalid admin ID format');
    }

    // Check if church exists and current user is an admin or creator
    const church = await Church.findOne({
      _id: churchId,
      admins: currentAdminObjectId,
    });

    if (!church) {
      throw new ApiError(404, 'Church not found or you do not have permission to remove admins');
    }

    // Creator cannot be removed as admin
    if (church.createdBy.toString() === adminToRemoveId) {
      throw new ApiError(403, 'The church creator cannot be removed as an admin');
    }

    // Cannot remove yourself if you're the only admin
    if (currentAdminId === adminToRemoveId && church.admins.length === 1) {
      throw new ApiError(403, 'Cannot remove yourself as the only admin');
    }

    // Remove the admin
    church.admins = church.admins.filter(id => id.toString() !== adminToRemoveId);
    await church.save();

    return church;
  }
}

export const churchService = new ChurchService(); 