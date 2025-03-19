/**
 * Data validation utilities for Church Planner Microservices
 */

import { createBadRequestError } from './error';

/**
 * Validates an email address
 * @param email The email address to validate
 * @returns True if valid, false if invalid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password (minimum 6 characters)
 * @param password The password to validate
 * @returns True if valid, false if invalid
 */
export const isValidPassword = (password: string): boolean => {
  return typeof password === 'string' && password.length >= 6;
};

/**
 * Validates a MongoDB ObjectId
 * @param id The ID to validate
 * @returns True if valid, false if invalid
 */
export const isValidObjectId = (id: string): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validates if all required fields are present
 * @param data The data object to validate
 * @param requiredFields Array of required field names
 * @returns An array of missing field names, empty if all fields are present
 */
export const getMissingFields = (data: Record<string, any>, requiredFields: string[]): string[] => {
  return requiredFields.filter(field => !data[field]);
};

/**
 * Throws an error if required fields are missing
 * @param data The data object to validate
 * @param requiredFields Array of required field names
 * @throws BadRequestError if any fields are missing
 */
export const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]): void => {
  const missingFields = getMissingFields(data, requiredFields);
  
  if (missingFields.length > 0) {
    const fieldList = missingFields.join(', ');
    throw createBadRequestError(`Missing required fields: ${fieldList}`);
  }
};

/**
 * Throws an error if the email format is invalid
 * @param email The email to validate
 * @throws BadRequestError if email is invalid
 */
export const validateEmail = (email: string): void => {
  if (!isValidEmail(email)) {
    throw createBadRequestError('Invalid email format');
  }
};

/**
 * Throws an error if the password doesn't meet requirements
 * @param password The password to validate
 * @throws BadRequestError if password is invalid
 */
export const validatePassword = (password: string): void => {
  if (!isValidPassword(password)) {
    throw createBadRequestError('Password must be at least 6 characters long');
  }
};

/**
 * Throws an error if the ID format is invalid
 * @param id The ID to validate
 * @throws BadRequestError if ID is invalid
 */
export const validateObjectId = (id: string): void => {
  if (!isValidObjectId(id)) {
    throw createBadRequestError('Invalid ID format');
  }
}; 