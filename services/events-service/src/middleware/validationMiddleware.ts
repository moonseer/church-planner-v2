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
    return ApiResponse.badRequest(res, 'Validation Error', errorMessages);
  };
};

/**
 * Common schemas for reuse in other schemas
 */
export const commonSchemas = {
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid ID format'
  }),

  location: Joi.object({
    name: Joi.string().required().max(100).messages({
      'string.empty': 'Location name is required',
      'string.max': 'Location name cannot exceed 100 characters'
    }),
    address: Joi.string().max(200),
    city: Joi.string().max(100),
    state: Joi.string().max(100),
    zipCode: Joi.string().max(20),
    country: Joi.string().max(100),
    isVirtual: Joi.boolean().default(false),
    virtualLink: Joi.string().uri().allow('').max(500).messages({
      'string.uri': 'Virtual link must be a valid URL'
    }),
    notes: Joi.string().max(500)
  }),

  recurrencePattern: Joi.object({
    frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'custom').required().messages({
      'string.empty': 'Frequency is required',
      'any.only': 'Frequency must be one of: daily, weekly, monthly, custom'
    }),
    interval: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Interval must be a number',
      'number.min': 'Interval must be at least 1'
    }),
    daysOfWeek: Joi.array().items(Joi.number().integer().min(0).max(6)).messages({
      'number.min': 'Day of week must be between 0 and 6',
      'number.max': 'Day of week must be between 0 and 6'
    }),
    daysOfMonth: Joi.array().items(Joi.number().integer().min(1).max(31)).messages({
      'number.min': 'Day of month must be between 1 and 31',
      'number.max': 'Day of month must be between 1 and 31'
    }),
    monthsOfYear: Joi.array().items(Joi.number().integer().min(1).max(12)).messages({
      'number.min': 'Month must be between 1 and 12',
      'number.max': 'Month must be between 1 and 12'
    }),
    endDate: Joi.date().greater('now').messages({
      'date.greater': 'End date must be in the future'
    }),
    count: Joi.number().integer().min(1).messages({
      'number.base': 'Count must be a number',
      'number.min': 'Count must be at least 1'
    })
  }),

  resource: Joi.object({
    type: Joi.string().valid('document', 'link', 'image', 'video', 'other').required().messages({
      'string.empty': 'Resource type is required',
      'any.only': 'Resource type must be one of: document, link, image, video, other'
    }),
    name: Joi.string().required().max(100).messages({
      'string.empty': 'Resource name is required',
      'string.max': 'Resource name cannot exceed 100 characters'
    }),
    url: Joi.string().uri().required().messages({
      'string.empty': 'Resource URL is required',
      'string.uri': 'Resource URL must be a valid URL'
    }),
    description: Joi.string().max(500),
    isPublic: Joi.boolean().default(true)
  }),

  teamMember: Joi.object({
    memberId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.empty': 'Member ID is required',
      'string.pattern.base': 'Invalid member ID format'
    }),
    role: Joi.string().required().max(100).messages({
      'string.empty': 'Team member role is required',
      'string.max': 'Role cannot exceed 100 characters'
    }),
    responsibilities: Joi.array().items(Joi.string().max(100)),
    isLeader: Joi.boolean().default(false)
  }),

  attendee: Joi.object({
    memberId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
      'string.pattern.base': 'Invalid member ID format'
    }),
    name: Joi.string().max(100),
    email: Joi.string().email().messages({
      'string.email': 'Please provide a valid email address'
    }),
    status: Joi.string().valid('registered', 'attended', 'absent', 'cancelled').default('registered').messages({
      'any.only': 'Status must be one of: registered, attended, absent, cancelled'
    }),
    checkInTime: Joi.date(),
    checkOutTime: Joi.date(),
    notes: Joi.string().max(500)
  }).custom((value, helpers) => {
    // Either memberId OR (name AND email) must be provided
    if (!value.memberId && (!value.name || !value.email)) {
      return helpers.error('any.custom', { message: 'Either member ID or both name and email are required' });
    }
    return value;
  })
};

/**
 * Event validation schemas
 */
export const eventSchemas = {
  // Create event validation schema
  createEvent: Joi.object({
    churchId: commonSchemas.objectId.required().messages({
      'any.required': 'Church ID is required'
    }),
    title: Joi.string().required().max(100).messages({
      'string.empty': 'Event title is required',
      'string.max': 'Event title cannot exceed 100 characters'
    }),
    description: Joi.string().max(2000),
    eventType: Joi.string().valid('service', 'meeting', 'class', 'outreach', 'social', 'other').required().messages({
      'string.empty': 'Event type is required',
      'any.only': 'Event type must be one of: service, meeting, class, outreach, social, other'
    }),
    category: Joi.string().max(50),
    startDate: Joi.date().required().messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),
    endDate: Joi.date().required().min(Joi.ref('startDate')).messages({
      'date.base': 'End date must be a valid date',
      'any.required': 'End date is required',
      'date.min': 'End date must be after or equal to start date'
    }),
    allDay: Joi.boolean().default(false),
    timezone: Joi.string().default('UTC'),
    location: commonSchemas.location.required(),
    recurrence: commonSchemas.recurrencePattern,
    status: Joi.string().valid('draft', 'published', 'cancelled', 'completed').default('draft').messages({
      'any.only': 'Status must be one of: draft, published, cancelled, completed'
    }),
    visibility: Joi.string().valid('public', 'church', 'team', 'private').default('church').messages({
      'any.only': 'Visibility must be one of: public, church, team, private'
    }),
    capacity: Joi.number().integer().min(0).messages({
      'number.base': 'Capacity must be a number',
      'number.min': 'Capacity cannot be negative'
    }),
    registrationRequired: Joi.boolean().default(false),
    registrationDeadline: Joi.date().when('registrationRequired', {
      is: true,
      then: Joi.date().less(Joi.ref('startDate')).messages({
        'date.less': 'Registration deadline must be before the event start date'
      })
    }),
    resources: Joi.array().items(commonSchemas.resource),
    team: Joi.array().items(commonSchemas.teamMember),
    tags: Joi.array().items(Joi.string().max(50)),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).messages({
      'string.pattern.base': 'Color must be a valid hex color code (e.g., #FF5733)'
    }),
    isSeriesTemplate: Joi.boolean().default(false)
  }),

  // Update event validation schema (similar to create but all fields optional)
  updateEvent: Joi.object({
    title: Joi.string().max(100).messages({
      'string.max': 'Event title cannot exceed 100 characters'
    }),
    description: Joi.string().max(2000),
    eventType: Joi.string().valid('service', 'meeting', 'class', 'outreach', 'social', 'other').messages({
      'any.only': 'Event type must be one of: service, meeting, class, outreach, social, other'
    }),
    category: Joi.string().max(50),
    startDate: Joi.date().messages({
      'date.base': 'Start date must be a valid date'
    }),
    endDate: Joi.date().min(Joi.ref('startDate')).messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after or equal to start date'
    }),
    allDay: Joi.boolean(),
    timezone: Joi.string(),
    location: commonSchemas.location,
    recurrence: commonSchemas.recurrencePattern,
    status: Joi.string().valid('draft', 'published', 'cancelled', 'completed').messages({
      'any.only': 'Status must be one of: draft, published, cancelled, completed'
    }),
    visibility: Joi.string().valid('public', 'church', 'team', 'private').messages({
      'any.only': 'Visibility must be one of: public, church, team, private'
    }),
    capacity: Joi.number().integer().min(0).messages({
      'number.base': 'Capacity must be a number',
      'number.min': 'Capacity cannot be negative'
    }),
    registrationRequired: Joi.boolean(),
    registrationDeadline: Joi.date().when('registrationRequired', {
      is: true,
      then: Joi.date().less(Joi.ref('startDate')).messages({
        'date.less': 'Registration deadline must be before the event start date'
      })
    }),
    resources: Joi.array().items(commonSchemas.resource),
    team: Joi.array().items(commonSchemas.teamMember),
    tags: Joi.array().items(Joi.string().max(50)),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).messages({
      'string.pattern.base': 'Color must be a valid hex color code (e.g., #FF5733)'
    }),
    isSeriesTemplate: Joi.boolean(),
    isActive: Joi.boolean()
  }),

  // Add team member schema
  addTeamMember: Joi.object({
    memberId: commonSchemas.objectId.required().messages({
      'any.required': 'Member ID is required'
    }),
    role: Joi.string().required().max(100).messages({
      'string.empty': 'Team member role is required',
      'string.max': 'Role cannot exceed 100 characters'
    }),
    responsibilities: Joi.array().items(Joi.string().max(100)),
    isLeader: Joi.boolean().default(false)
  }),

  // Add attendee schema
  addAttendee: Joi.object({
    memberId: commonSchemas.objectId.messages({
      'string.pattern.base': 'Invalid member ID format'
    }),
    name: Joi.string().max(100),
    email: Joi.string().email().messages({
      'string.email': 'Please provide a valid email address'
    }),
    status: Joi.string().valid('registered', 'attended', 'absent', 'cancelled').default('registered').messages({
      'any.only': 'Status must be one of: registered, attended, absent, cancelled'
    }),
    notes: Joi.string().max(500)
  }).custom((value, helpers) => {
    // Either memberId OR (name AND email) must be provided
    if (!value.memberId && (!value.name || !value.email)) {
      return helpers.error('any.custom', { message: 'Either member ID or both name and email are required' });
    }
    return value;
  }),

  // Update attendee status schema
  updateAttendeeStatus: Joi.object({
    status: Joi.string().valid('registered', 'attended', 'absent', 'cancelled').required().messages({
      'string.empty': 'Status is required',
      'any.only': 'Status must be one of: registered, attended, absent, cancelled'
    }),
    checkInTime: Joi.date(),
    checkOutTime: Joi.date(),
    notes: Joi.string().max(500)
  }),

  // Event query validation schema for filtering
  eventQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    churchId: commonSchemas.objectId,
    startDate: Joi.date(),
    endDate: Joi.date(),
    type: Joi.string().valid('service', 'meeting', 'class', 'outreach', 'social', 'other'),
    status: Joi.string().valid('draft', 'published', 'cancelled', 'completed'),
    search: Joi.string().max(100),
    tag: Joi.string().max(50),
    isTemplate: Joi.boolean(),
    sort: Joi.string().valid('startDate', 'title', 'createdAt').default('startDate'),
    order: Joi.string().valid('asc', 'desc').default('asc')
  })
};

/**
 * Service validation schemas
 */
export const serviceSchemas = {
  // Create service schema
  createService: Joi.object({
    churchId: commonSchemas.objectId.required().messages({
      'any.required': 'Church ID is required'
    }),
    name: Joi.string().required().max(100).messages({
      'string.empty': 'Service name is required',
      'string.max': 'Service name cannot exceed 100 characters'
    }),
    description: Joi.string().max(1000),
    location: Joi.object({
      name: Joi.string().required().max(100).messages({
        'string.empty': 'Location name is required',
        'string.max': 'Location name cannot exceed 100 characters'
      }),
      address: Joi.string().max(200),
      virtualLink: Joi.string().uri().allow('').max(500).messages({
        'string.uri': 'Virtual link must be a valid URL'
      }),
      isVirtual: Joi.boolean().default(false)
    }).required(),
    schedules: Joi.array().items(
      Joi.object({
        dayOfWeek: Joi.number().integer().min(0).max(6).required().messages({
          'number.base': 'Day of week must be a number',
          'number.min': 'Day of week must be between 0 and 6',
          'number.max': 'Day of week must be between 0 and 6',
          'any.required': 'Day of week is required'
        }),
        startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
          'string.pattern.base': 'Start time must be in HH:MM format (e.g., 09:30)',
          'any.required': 'Start time is required'
        }),
        endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
          'string.pattern.base': 'End time must be in HH:MM format (e.g., 11:00)',
          'any.required': 'End time is required'
        }),
        name: Joi.string().max(100),
        isActive: Joi.boolean().default(true)
      })
    ).when('isTemplate', {
      is: false,
      then: Joi.array().min(1).messages({
        'array.min': 'At least one schedule is required for non-template services'
      }),
      otherwise: Joi.array()
    }),
    components: Joi.array().items(
      Joi.object({
        name: Joi.string().required().max(100).messages({
          'string.empty': 'Component name is required',
          'string.max': 'Component name cannot exceed 100 characters'
        }),
        description: Joi.string().max(500),
        duration: Joi.number().integer().min(1).required().messages({
          'number.base': 'Duration must be a number',
          'number.min': 'Duration must be at least 1 minute',
          'any.required': 'Duration is required'
        }),
        order: Joi.number().integer().min(0).required().messages({
          'number.base': 'Order must be a number',
          'number.min': 'Order must be a non-negative number',
          'any.required': 'Order is required'
        }),
        type: Joi.string().valid('worship', 'prayer', 'sermon', 'communion', 'offering', 'announcement', 'other').required().messages({
          'string.empty': 'Component type is required',
          'any.only': 'Component type must be one of: worship, prayer, sermon, communion, offering, announcement, other'
        }),
        resources: Joi.array().items(Joi.string()),
        leader: commonSchemas.objectId,
        notes: Joi.string().max(500)
      })
    ),
    isTemplate: Joi.boolean().default(false),
    templateName: Joi.string().max(100).when('isTemplate', {
      is: true,
      then: Joi.string().required().messages({
        'string.empty': 'Template name is required when creating a template'
      }),
      otherwise: Joi.string().allow(null, '')
    }),
    tags: Joi.array().items(Joi.string().max(50))
  }),

  // Update service schema (similar to create but all fields optional)
  updateService: Joi.object({
    name: Joi.string().max(100).messages({
      'string.max': 'Service name cannot exceed 100 characters'
    }),
    description: Joi.string().max(1000),
    location: Joi.object({
      name: Joi.string().max(100).messages({
        'string.max': 'Location name cannot exceed 100 characters'
      }),
      address: Joi.string().max(200),
      virtualLink: Joi.string().uri().allow('').max(500).messages({
        'string.uri': 'Virtual link must be a valid URL'
      }),
      isVirtual: Joi.boolean()
    }),
    schedules: Joi.array().items(
      Joi.object({
        dayOfWeek: Joi.number().integer().min(0).max(6).messages({
          'number.base': 'Day of week must be a number',
          'number.min': 'Day of week must be between 0 and 6',
          'number.max': 'Day of week must be between 0 and 6'
        }),
        startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
          'string.pattern.base': 'Start time must be in HH:MM format (e.g., 09:30)'
        }),
        endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
          'string.pattern.base': 'End time must be in HH:MM format (e.g., 11:00)'
        }),
        name: Joi.string().max(100),
        isActive: Joi.boolean()
      })
    ),
    components: Joi.array().items(
      Joi.object({
        name: Joi.string().max(100).messages({
          'string.max': 'Component name cannot exceed 100 characters'
        }),
        description: Joi.string().max(500),
        duration: Joi.number().integer().min(1).messages({
          'number.base': 'Duration must be a number',
          'number.min': 'Duration must be at least 1 minute'
        }),
        order: Joi.number().integer().min(0).messages({
          'number.base': 'Order must be a number',
          'number.min': 'Order must be a non-negative number'
        }),
        type: Joi.string().valid('worship', 'prayer', 'sermon', 'communion', 'offering', 'announcement', 'other').messages({
          'any.only': 'Component type must be one of: worship, prayer, sermon, communion, offering, announcement, other'
        }),
        resources: Joi.array().items(Joi.string()),
        leader: commonSchemas.objectId,
        notes: Joi.string().max(500)
      })
    ),
    isTemplate: Joi.boolean(),
    templateName: Joi.string().max(100),
    tags: Joi.array().items(Joi.string().max(50)),
    isActive: Joi.boolean()
  }),

  // Service query validation schema for filtering
  serviceQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    churchId: commonSchemas.objectId,
    name: Joi.string().max(100),
    isTemplate: Joi.boolean(),
    templateName: Joi.string().max(100),
    isActive: Joi.boolean(),
    dayOfWeek: Joi.number().integer().min(0).max(6).messages({
      'number.base': 'Day of week must be a number',
      'number.min': 'Day of week must be between 0 and 6',
      'number.max': 'Day of week must be between 0 and 6'
    }),
    sort: Joi.string().valid('name', 'createdAt').default('name'),
    order: Joi.string().valid('asc', 'desc').default('asc')
  })
}; 