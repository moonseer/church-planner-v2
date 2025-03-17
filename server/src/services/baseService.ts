import mongoose, { Model, Document } from 'mongoose';
import { BaseDocument, Identifiable } from '@shared/types/mongoose';

/**
 * Read operations interface
 */
export interface IReadOperations<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  exists(id: string): Promise<boolean>;
  findByField(field: keyof T, value: any): Promise<T[]>;
}

/**
 * Write operations interface
 */
export interface IWriteOperations<T> {
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<T | null>;
}

/**
 * CRUD operations interface - combines read and write operations
 */
export interface ICrudOperations<T> extends IReadOperations<T>, IWriteOperations<T> {
  // Combined interface for all CRUD operations
}

/**
 * Base service class providing common CRUD operations for MongoDB models
 */
export default abstract class BaseService<T extends BaseDocument> implements ICrudOperations<T> {
  protected model: Model<T>;

  /**
   * Create a new BaseService instance
   * @param model Mongoose model
   */
  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Get all documents
   * @returns Array of all documents
   */
  async getAll(): Promise<T[]> {
    return await this.model.find();
  }

  /**
   * Get a single document by ID
   * @param id Document ID
   * @returns Document or null if not found
   */
  async getById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  /**
   * Create a new document
   * @param data Document data to create
   * @returns Created document
   */
  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  /**
   * Update an existing document
   * @param id Document ID
   * @param data Updated document data
   * @returns Updated document or null if not found
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete a document
   * @param id Document ID
   * @returns Deleted document or null if not found
   */
  async delete(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  /**
   * Check if a document exists by ID
   * @param id Document ID
   * @returns Boolean indicating if document exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.model.countDocuments({ _id: new mongoose.Types.ObjectId(id) });
    return count > 0;
  }

  /**
   * Find documents by field value
   * @param field Field name
   * @param value Field value
   * @returns Array of matching documents
   */
  async findByField(field: keyof T, value: any): Promise<T[]> {
    const query: any = {};
    query[field] = value;
    return await this.model.find(query);
  }
} 