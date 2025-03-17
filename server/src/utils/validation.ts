import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse, HttpStatus } from '@shared/types/api';
import { UserRole } from '@shared/types/auth';
import mongoose from 'mongoose';
import { isObjectIdString } from './typeGuards';

/**
 * Object ID validator for Zod
 */
export const objectIdSchema = z.string().refine(isObjectIdString, {
  message: 'Invalid MongoDB ObjectID format'
});

/**
 * Basic schemas for common types
 */
export const userRoleSchema = z.nativeEnum(UserRole);

export const dateSchema = z.string().or(z.date()).transform((val: string | Date) => {
  if (typeof val === 'string') {
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date;
  }
  return val;
});

/**
 * User-related schemas
 */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  churchName: z.string().min(2),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: userRoleSchema.optional(),
});

/**
 * Church-related schemas
 */
export const churchSchema = z.object({
  name: z.string().min(2),
});

/**
 * Event-related schemas
 */
export const eventSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  location: z.string().optional(),
  church: objectIdSchema,
  eventType: objectIdSchema.optional(),
});

/**
 * Middleware factory to validate request
 * @param schema - Zod schema to validate against
 * @param source - Request property to validate (body, query, params)
 */
export function validateRequest<T extends z.ZodTypeAny>(
  schema: T,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await schema.parseAsync(req[source]);
      // Attach validated data to request
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors into a string array
        const errorMessages = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: errorMessages,
          statusCode: HttpStatus.BAD_REQUEST
        };
        
        return res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
      }
      
      // Unexpected error
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Server error during validation',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      };
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
  };
}

/**
 * Validates data against a schema and returns a typed result
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Tuple with [isValid, validatedData | undefined, errors | undefined]
 */
export function validateData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): [boolean, z.infer<T> | undefined, z.ZodError | undefined] {
  try {
    const validData = schema.parse(data);
    return [true, validData, undefined];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return [false, undefined, error];
    }
    throw error; // Re-throw unexpected errors
  }
} 