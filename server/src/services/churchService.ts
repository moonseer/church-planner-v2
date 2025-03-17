import mongoose from 'mongoose';
import Church from '../models/Church';
import { IChurchDocument } from '@shared/types/mongoose';
import BaseService from './baseService';

/**
 * Service class for handling church-related operations
 */
class ChurchService extends BaseService<IChurchDocument> {
  constructor() {
    super(Church);
  }

  /**
   * Get all churches
   * @returns Array of all churches
   */
  async getAllChurches(): Promise<IChurchDocument[]> {
    return await Church.find();
  }

  /**
   * Get a single church by ID
   * @param id Church ID
   * @returns Church document or null if not found
   */
  async getChurchById(id: string): Promise<IChurchDocument | null> {
    return await Church.findById(id);
  }

  /**
   * Create a new church
   * @param churchData Church data to create
   * @returns Created church document
   */
  async createChurch(churchData: Partial<IChurchDocument>): Promise<IChurchDocument> {
    return await Church.create(churchData);
  }

  /**
   * Update an existing church
   * @param id Church ID
   * @param churchData Updated church data
   * @returns Updated church document or null if not found
   */
  async updateChurch(id: string, churchData: Partial<IChurchDocument>): Promise<IChurchDocument | null> {
    return await Church.findByIdAndUpdate(id, churchData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete a church
   * @param id Church ID
   * @returns Deleted church document or null if not found
   */
  async deleteChurch(id: string): Promise<IChurchDocument | null> {
    return await Church.findByIdAndDelete(id);
  }

  /**
   * Find churches by name (case-insensitive partial match)
   * @param name Name to search for
   * @returns Array of matching churches
   */
  async findChurchesByName(name: string): Promise<IChurchDocument[]> {
    return await Church.find({
      name: { $regex: name, $options: 'i' },
    });
  }

  /**
   * Check if a church exists by ID
   * @param id Church ID
   * @returns Boolean indicating if church exists
   */
  async churchExists(id: string): Promise<boolean> {
    const count = await Church.countDocuments({ _id: id });
    return count > 0;
  }

  /**
   * Get all churches associated with a user
   * @param userId User ID
   * @returns Array of churches
   */
  async getChurchesByUserId(userId: string): Promise<IChurchDocument[]> {
    // This will be populated when we have user-church association
    // For now, just return all churches
    return await this.getAll();
  }
}

export default new ChurchService(); 