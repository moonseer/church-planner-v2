import { IUserDocument, IChurchDocument, IEventDocument, IEventTypeDocument, ITeamDocument, IServiceDocument } from '@shared/types/mongoose';
import { UserRole } from '@shared/types/auth';
import mongoose from 'mongoose';

/**
 * Type guard to check if a value is a string
 */
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

/**
 * Type guard to check if a value is a number
 */
export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

/**
 * Type guard to check if a value is a boolean
 */
export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

/**
 * Type guard to check if a value is a MongoDB ObjectId
 */
export const isObjectId = (value: unknown): value is mongoose.Types.ObjectId => {
  return value instanceof mongoose.Types.ObjectId;
};

/**
 * Type guard to check if a value is a valid ObjectId string
 */
export const isObjectIdString = (value: unknown): value is string => {
  return isString(value) && mongoose.Types.ObjectId.isValid(value);
};

/**
 * Type guard to check if a value is a valid UserRole
 */
export const isUserRole = (value: unknown): value is UserRole => {
  return isString(value) && Object.values(UserRole).includes(value as UserRole);
};

/**
 * Type guard to check if a value is a User document
 */
export const isUserDocument = (value: unknown): value is IUserDocument => {
  return (
    value !== null &&
    typeof value === 'object' &&
    '_id' in value &&
    'name' in value &&
    'email' in value &&
    'role' in value
  );
};

/**
 * Type guard to check if a value is a Church document
 */
export const isChurchDocument = (value: unknown): value is IChurchDocument => {
  return (
    value !== null &&
    typeof value === 'object' &&
    '_id' in value &&
    'name' in value
  );
};

/**
 * Convert value to ObjectId safely
 * @param value - Value to convert
 * @returns ObjectId or null if invalid
 */
export const toObjectId = (value: string | mongoose.Types.ObjectId | undefined | null): mongoose.Types.ObjectId | null => {
  if (!value) return null;

  if (isObjectId(value)) return value;

  if (isString(value) && mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }

  return null;
};

/**
 * Parse a string into a date, returning null if invalid
 */
export const parseDate = (dateString: unknown): Date | null => {
  if (!isString(dateString)) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}; 