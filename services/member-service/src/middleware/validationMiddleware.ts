import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../utils/apiResponse';
import logger from '../utils/logger';

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
    logger.debug(`Validation error: ${errorMessages.join(', ')}`);
    return ApiResponse.badRequest(res, errorMessages.join(', '));
  };
};

/**
 * Member validation schemas
 */
export const memberSchemas = {
  // Create member validation schema
  createMember: Joi.object({
    userId: Joi.string().required()
      .messages({
        'any.required': 'User ID is required'
      }),
    firstName: Joi.string().required().trim().max(50)
      .messages({
        'string.max': 'First name cannot be more than 50 characters',
        'any.required': 'First name is required'
      }),
    lastName: Joi.string().required().trim().max(50)
      .messages({
        'string.max': 'Last name cannot be more than 50 characters',
        'any.required': 'Last name is required'
      }),
    middleName: Joi.string().trim().max(50).optional(),
    preferredName: Joi.string().trim().max(50).optional(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer not to say').optional(),
    birthdate: Joi.date().optional()
      .max(new Date())
      .messages({
        'date.max': 'Birthdate cannot be in the future'
      }),
    profileImage: Joi.string().uri().optional()
      .messages({
        'string.uri': 'Profile image must be a valid URL'
      }),
    contact: Joi.object({
      email: Joi.string().email().required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/).optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number'
        }),
      alternatePhone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/).optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number'
        }),
      address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.string().required(),
        country: Joi.string().default('USA')
      }).optional(),
      emergencyContact: Joi.object({
        name: Joi.string().required(),
        relationship: Joi.string().required(),
        phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/).required()
          .messages({
            'string.pattern.base': 'Please provide a valid phone number'
          })
      }).optional()
    }).required()
      .messages({
        'any.required': 'Contact information is required'
      }),
    family: Joi.object({
      maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed').optional(),
      spouseName: Joi.string().optional(),
      spouseId: Joi.string().optional(),
      children: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          birthdate: Joi.date().optional(),
          memberId: Joi.string().optional()
        })
      ).optional()
    }).optional(),
    churches: Joi.array().items(
      Joi.object({
        churchId: Joi.string().required(),
        status: Joi.string().valid('active', 'inactive', 'former').default('active'),
        joinDate: Joi.date().default(Date.now),
        endDate: Joi.date().optional(),
        roles: Joi.array().items(Joi.string()).default(['member']),
        ministries: Joi.array().items(Joi.string()).optional(),
        groups: Joi.array().items(Joi.string()).optional(),
        notes: Joi.string().optional()
      })
    ).optional(),
    baptismDate: Joi.date().optional(),
    membershipDate: Joi.date().optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    interests: Joi.array().items(Joi.string()).optional(),
    professionalBackground: Joi.string().optional(),
    notes: Joi.string().optional(),
    isActive: Joi.boolean().default(true)
  }),

  // Update member validation schema - similar to create but all fields optional
  updateMember: Joi.object({
    firstName: Joi.string().trim().max(50).optional()
      .messages({
        'string.max': 'First name cannot be more than 50 characters'
      }),
    lastName: Joi.string().trim().max(50).optional()
      .messages({
        'string.max': 'Last name cannot be more than 50 characters'
      }),
    middleName: Joi.string().trim().max(50).optional(),
    preferredName: Joi.string().trim().max(50).optional(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer not to say').optional(),
    birthdate: Joi.date().optional()
      .max(new Date())
      .messages({
        'date.max': 'Birthdate cannot be in the future'
      }),
    profileImage: Joi.string().uri().optional()
      .messages({
        'string.uri': 'Profile image must be a valid URL'
      }),
    contact: Joi.object({
      email: Joi.string().email().optional()
        .messages({
          'string.email': 'Please provide a valid email address'
        }),
      phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/).optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number'
        }),
      alternatePhone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/).optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number'
        }),
      address: Joi.object({
        street: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        zipCode: Joi.string().optional(),
        country: Joi.string().optional()
      }).optional(),
      emergencyContact: Joi.object({
        name: Joi.string().optional(),
        relationship: Joi.string().optional(),
        phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/).optional()
          .messages({
            'string.pattern.base': 'Please provide a valid phone number'
          })
      }).optional()
    }).optional(),
    family: Joi.object({
      maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed').optional(),
      spouseName: Joi.string().optional(),
      spouseId: Joi.string().optional(),
      children: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          birthdate: Joi.date().optional(),
          memberId: Joi.string().optional()
        })
      ).optional()
    }).optional(),
    baptismDate: Joi.date().optional(),
    membershipDate: Joi.date().optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    interests: Joi.array().items(Joi.string()).optional(),
    professionalBackground: Joi.string().optional(),
    notes: Joi.string().optional(),
    isActive: Joi.boolean().optional()
  }),

  // Add church relationship validation schema
  addChurchRelationship: Joi.object({
    churchId: Joi.string().required(),
    status: Joi.string().valid('active', 'inactive', 'former').default('active'),
    joinDate: Joi.date().default(Date.now),
    roles: Joi.array().items(Joi.string()).default(['member']),
    ministries: Joi.array().items(Joi.string()).optional(),
    groups: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional()
  }),

  // Update church relationship validation schema
  updateChurchRelationship: Joi.object({
    status: Joi.string().valid('active', 'inactive', 'former').optional(),
    endDate: Joi.date().optional(),
    roles: Joi.array().items(Joi.string()).optional(),
    ministries: Joi.array().items(Joi.string()).optional(),
    groups: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional()
  }),

  // Member query validation schema for filtering
  memberQuery: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    name: Joi.string().optional(),
    email: Joi.string().optional(),
    churchId: Joi.string().optional(),
    status: Joi.string().valid('active', 'inactive', 'former').optional(),
    role: Joi.string().optional(),
    ministry: Joi.string().optional(),
    group: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    sort: Joi.string().valid('firstName', 'lastName', 'createdAt', 'updatedAt').default('lastName'),
    order: Joi.string().valid('asc', 'desc').default('asc')
  })
}; 