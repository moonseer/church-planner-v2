import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Church from '../models/Church';
import { IUserDocument, IChurchDocument } from '@shared/types/mongoose';
import { UserRole } from '@shared/types/auth';
import BaseService from './baseService';

/**
 * Service class for handling user-related operations
 */
class UserService extends BaseService<IUserDocument> {
  constructor() {
    super(User);
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User document or null if not found
   */
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return await User.findOne({ email });
  }

  /**
   * Create a new user with hashed password
   * @param userData User data
   * @param churchId Optional church ID to associate with the user
   * @returns Created user document
   */
  async createUser(
    userData: { name: string; email: string; password: string; role?: UserRole },
    churchId?: string
  ): Promise<IUserDocument> {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create user
    return await User.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || UserRole.USER,
      church: churchId ? new mongoose.Types.ObjectId(churchId) : undefined,
    });
  }

  /**
   * Find a user by ID and populate church data
   * @param id User ID
   * @returns User document with populated church or null if not found
   */
  async findUserWithChurch(id: string): Promise<IUserDocument | null> {
    return await User.findById(id).populate('church', 'name');
  }

  /**
   * Check if a user's password matches
   * @param userId User ID
   * @param password Password to check
   * @returns Boolean indicating if password matches
   */
  async checkPassword(userId: string, password: string): Promise<boolean> {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return false;
    }
    
    return await bcrypt.compare(password, user.password);
  }

  /**
   * Update user's church
   * @param userId User ID
   * @param churchId Church ID
   * @returns Updated user document or null if not found
   */
  async updateUserChurch(userId: string, churchId: string): Promise<IUserDocument | null> {
    return await User.findByIdAndUpdate(
      userId,
      { church: new mongoose.Types.ObjectId(churchId) },
      { new: true }
    );
  }

  /**
   * Get all users by church ID
   * @param churchId Church ID
   * @returns Array of users belonging to the church
   */
  async getUsersByChurch(churchId: string): Promise<IUserDocument[]> {
    return await User.find({ church: new mongoose.Types.ObjectId(churchId) });
  }
}

export default new UserService(); 