import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../utils/apiResponse';

/**
 * Validate request data against a Joi schema
 * @param schema Joi schema to validate against
 * @param property Request property to validate ('body', 'query', 'params')
 */
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (!error) {
      return next();
    }

    const errorMessages = error.details.map(detail => detail.message);
    return ApiResponse.badRequest(res, errorMessages.join(', '));
  };
};

/**
 * Church validation schemas
 */
export const churchSchemas = {
  // Create church validation schema
  createChurch: Joi.object({
    name: Joi.string().trim().max(100).required()
      .messages({
        'string.max': 'Church name cannot be more than 100 characters',
        'any.required': 'Church name is required'
      }),
    description: Joi.string().max(1000).required()
      .messages({
        'string.max': 'Description cannot be more than 1000 characters',
        'any.required': 'Church description is required' 
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/).optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    website: Joi.string().uri().optional()
      .messages({
        'string.uri': 'Please provide a valid website URL'
      }),
    denomination: Joi.string().optional(),
    yearFounded: Joi.number()
      .min(1500).max(new Date().getFullYear())
      .optional()
      .messages({
        'number.min': 'Year must be after 1500',
        'number.max': 'Year cannot be in the future'
      }),
    size: Joi.number().min(0).optional(),
    logo: Joi.string().optional(),
    bannerImage: Joi.string().optional(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().default('USA'),
      coordinates: Joi.object({
        latitude: Joi.number(),
        longitude: Joi.number()
      }).optional()
    }).required().messages({
      'any.required': 'Church address is required'
    }),
    serviceSchedule: Joi.array().items(
      Joi.object({
        day: Joi.string().valid(
          'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ).required(),
        time: Joi.string().required(),
        description: Joi.string().optional()
      })
    ).optional(),
    admins: Joi.array().items(
      Joi.object({
        userId: Joi.string().required(),
        role: Joi.string().valid('owner', 'admin').default('admin'),
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        addedAt: Joi.date().default(Date.now)
      })
    ).optional(),
    socialMedia: Joi.array().items(
      Joi.object({
        platform: Joi.string().required(),
        url: Joi.string().required(),
        username: Joi.string().optional()
      })
    ).optional(),
    isActive: Joi.boolean().default(true)
  }),

  // Update church validation schema - similar to create but all fields optional
  updateChurch: Joi.object({
    name: Joi.string().trim().max(100).optional()
      .messages({
        'string.max': 'Church name cannot be more than 100 characters'
      }),
    description: Joi.string().max(1000).optional()
      .messages({
        'string.max': 'Description cannot be more than 1000 characters'
      }),
    email: Joi.string().email().optional()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/).optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    website: Joi.string().uri().optional()
      .messages({
        'string.uri': 'Please provide a valid website URL'
      }),
    denomination: Joi.string().optional(),
    yearFounded: Joi.number()
      .min(1500).max(new Date().getFullYear())
      .optional()
      .messages({
        'number.min': 'Year must be after 1500',
        'number.max': 'Year cannot be in the future'
      }),
    size: Joi.number().min(0).optional(),
    logo: Joi.string().optional(),
    bannerImage: Joi.string().optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional(),
      coordinates: Joi.object({
        latitude: Joi.number(),
        longitude: Joi.number()
      }).optional()
    }).optional(),
    serviceSchedule: Joi.array().items(
      Joi.object({
        day: Joi.string().valid(
          'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ).required(),
        time: Joi.string().required(),
        description: Joi.string().optional()
      })
    ).optional(),
    admins: Joi.array().items(
      Joi.object({
        userId: Joi.string().required(),
        role: Joi.string().valid('owner', 'admin').default('admin'),
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        addedAt: Joi.date().default(Date.now)
      })
    ).optional(),
    socialMedia: Joi.array().items(
      Joi.object({
        platform: Joi.string().required(),
        url: Joi.string().required(),
        username: Joi.string().optional()
      })
    ).optional(),
    isActive: Joi.boolean().optional()
  }),

  // Church query validation schema for filtering
  churchQuery: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    name: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    denomination: Joi.string().optional(),
    sort: Joi.string().valid('name', 'createdAt', 'updatedAt', 'size').default('name'),
    order: Joi.string().valid('asc', 'desc').default('asc')
  })
}; 