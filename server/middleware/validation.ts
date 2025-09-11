import type { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from './error-handling';

// Common validation schemas
export const commonSchemas = {
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),
  
  // Pagination parameters
  pagination: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number')
      .optional()
      .transform(val => val ? Math.max(1, parseInt(val)) : 1),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number')
      .optional()
      .transform(val => val ? Math.min(Math.max(1, parseInt(val)), 100) : 20),
  }),

  // Date/time validation
  datetime: z.string().datetime('Invalid datetime format'),
  
  // Email validation with stricter rules
  email: z.string().email('Invalid email format')
    .max(254, 'Email too long')
    .refine(email => !email.includes('+'), 'Email aliases not allowed'),
  
  // Password validation with security requirements
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  // Phone number validation
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),

  // URL validation
  url: z.string().url('Invalid URL format').optional(),

  // Timezone validation
  timezone: z.string()
    .min(1, 'Timezone is required')
    .refine(tz => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    }, 'Invalid timezone'),

  // File upload validation
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
    buffer: z.instanceof(Buffer),
  }),

  // Search and filter parameters
  search: z.object({
    q: z.string().max(100, 'Search query too long').optional(),
    status: z.enum(['active', 'inactive', 'pending', 'cancelled']).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    sortBy: z.string().max(50).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};

// Business rule validations
export const businessValidations = {
  // Appointment booking validations
  appointmentTime: z.string().datetime()
    .refine(dateStr => {
      const appointmentDate = new Date(dateStr);
      const now = new Date();
      const maxAdvance = new Date();
      maxAdvance.setMonth(maxAdvance.getMonth() + 6); // 6 months advance

      return appointmentDate > now && appointmentDate <= maxAdvance;
    }, 'Appointment must be between now and 6 months in the future'),

  // Duration validation (15 minutes to 8 hours)
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours')
    .refine(duration => duration % 15 === 0, 'Duration must be in 15-minute increments'),

  // Price validation (in cents)
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(100000000, 'Price too high') // $1,000,000 max
    .int('Price must be an integer'),

  // Team size validation
  teamSize: z.number()
    .min(1, 'Team must have at least 1 member')
    .max(100, 'Team cannot exceed 100 members'),

  // Event type name validation
  eventTypeName: z.string()
    .min(3, 'Event type name must be at least 3 characters')
    .max(100, 'Event type name too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Event type name contains invalid characters'),

  // Slug validation
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9\-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .refine(slug => !slug.startsWith('-') && !slug.endsWith('-'), 'Slug cannot start or end with hyphen'),
};

// Comprehensive appointment validation schema
export const appointmentValidationSchemas = {
  create: z.object({
    eventTypeId: commonSchemas.uuid,
    attendeeName: z.string().min(1, 'Attendee name is required').max(100),
    attendeeEmail: commonSchemas.email,
    attendeePhone: commonSchemas.phone,
    startTime: businessValidations.appointmentTime,
    timezone: commonSchemas.timezone,
    notes: z.string().max(1000, 'Notes too long').optional(),
    customFields: z.record(z.string(), z.any()).optional(),
  }),

  update: z.object({
    attendeeName: z.string().min(1).max(100).optional(),
    attendeeEmail: commonSchemas.email.optional(),
    attendeePhone: commonSchemas.phone,
    startTime: businessValidations.appointmentTime.optional(),
    timezone: commonSchemas.timezone.optional(),
    notes: z.string().max(1000).optional(),
    customFields: z.record(z.string(), z.any()).optional(),
    status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled']).optional(),
  }),

  reschedule: z.object({
    startTime: businessValidations.appointmentTime,
    timezone: commonSchemas.timezone,
    reason: z.string().max(500, 'Reason too long').optional(),
  }),

  bulkAction: z.object({
    appointmentIds: z.array(commonSchemas.uuid).min(1).max(50),
    action: z.enum(['confirm', 'cancel', 'complete', 'reschedule']),
    reason: z.string().max(500).optional(),
    newStartTime: z.string().datetime().optional(),
  }),
};

// Event type validation schemas
export const eventTypeValidationSchemas = {
  create: z.object({
    name: businessValidations.eventTypeName,
    slug: businessValidations.slug,
    description: z.string().max(500, 'Description too long').optional(),
    duration: businessValidations.duration,
    price: businessValidations.price.optional(),
    currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
    isActive: z.boolean().default(true),
    isPublic: z.boolean().default(true),
    requiresConfirmation: z.boolean().default(false),
    maxAdvanceBooking: z.number().min(1).max(365).default(60), // days
    minAdvanceBooking: z.number().min(0).max(48).default(0), // hours
    bufferTimeBefore: z.number().min(0).max(120).default(0), // minutes
    bufferTimeAfter: z.number().min(0).max(120).default(0), // minutes
    maxBookingsPerDay: z.number().min(1).max(50).optional(),
    bookingQuestions: z.array(z.object({
      question: z.string().min(1).max(200),
      type: z.enum(['text', 'email', 'phone', 'textarea', 'select', 'multiselect']),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
    })).optional(),
    cancellationPolicy: z.object({
      enabled: z.boolean().default(false),
      hoursBeforeEvent: z.number().min(1).max(168).default(24), // 1-168 hours
      refundPercentage: z.number().min(0).max(100).default(100),
    }).optional(),
  }),

  update: z.object({
    name: businessValidations.eventTypeName.optional(),
    description: z.string().max(500).optional(),
    duration: businessValidations.duration.optional(),
    price: businessValidations.price.optional(),
    currency: z.string().length(3).optional(),
    isActive: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    requiresConfirmation: z.boolean().optional(),
    maxAdvanceBooking: z.number().min(1).max(365).optional(),
    minAdvanceBooking: z.number().min(0).max(48).optional(),
    bufferTimeBefore: z.number().min(0).max(120).optional(),
    bufferTimeAfter: z.number().min(0).max(120).optional(),
    maxBookingsPerDay: z.number().min(1).max(50).optional(),
    bookingQuestions: z.array(z.object({
      question: z.string().min(1).max(200),
      type: z.enum(['text', 'email', 'phone', 'textarea', 'select', 'multiselect']),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
    })).optional(),
    cancellationPolicy: z.object({
      enabled: z.boolean(),
      hoursBeforeEvent: z.number().min(1).max(168),
      refundPercentage: z.number().min(0).max(100),
    }).optional(),
  }),
};

// User validation schemas
export const userValidationSchemas = {
  register: z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: commonSchemas.email,
    password: commonSchemas.password,
    timezone: commonSchemas.timezone.optional(),
    acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms of service'),
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),

  updateProfile: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    profileImageUrl: commonSchemas.url,
    timezone: commonSchemas.timezone.optional(),
    phone: commonSchemas.phone,
    bio: z.string().max(500, 'Bio too long').optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
};

// Team validation schemas
export const teamValidationSchemas = {
  create: z.object({
    name: z.string().min(3, 'Team name must be at least 3 characters').max(100),
    description: z.string().max(500).optional(),
    companyName: z.string().max(100).optional(),
    companyWebsite: commonSchemas.url,
    companyAddress: z.string().max(200).optional(),
    defaultBrandColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
    defaultAccentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
    teamLogo: commonSchemas.url,
  }),

  invite: z.object({
    email: commonSchemas.email,
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    role: z.enum(['owner', 'admin', 'member']).default('member'),
    title: z.string().max(100).optional(),
    department: z.string().max(100).optional(),
    phone: commonSchemas.phone,
  }),

  updateMember: z.object({
    role: z.enum(['owner', 'admin', 'member']).optional(),
    title: z.string().max(100).optional(),
    department: z.string().max(100).optional(),
    phone: commonSchemas.phone,
    isActive: z.boolean().optional(),
  }),
};

// Payment validation schemas
export const paymentValidationSchemas = {
  createIntent: z.object({
    appointmentId: commonSchemas.uuid,
    eventTypeId: commonSchemas.uuid,
    amount: businessValidations.price,
    currency: z.string().length(3).default('USD'),
    customerEmail: commonSchemas.email,
    customerName: z.string().min(1).max(100),
    metadata: z.record(z.string(), z.string()).optional(),
  }),

  refund: z.object({
    paymentId: commonSchemas.uuid,
    amount: businessValidations.price.optional(),
    reason: z.enum(['requested_by_customer', 'duplicate', 'fraudulent']).optional(),
    internalNote: z.string().max(500).optional(),
  }),
};

// Middleware factory for request validation
export const validateRequest = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[source];
      const validatedData = schema.parse(dataToValidate);
      
      // Replace the request data with validated and transformed data
      req[source] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
      } else {
        next(new ValidationError('Validation failed', 'VALIDATION_ERROR', 400, error));
      }
    }
  };
};

// Middleware factory for custom business logic validation
export const validateBusinessRules = (validator: (data: any) => Promise<boolean | string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await validator(req.body);
      
      if (result === true) {
        next();
      } else {
        const message = typeof result === 'string' ? result : 'Business rule validation failed';
        next(new ValidationError(message, 'BUSINESS_RULE_VIOLATION', 422));
      }
    } catch (error) {
      next(new ValidationError('Business rule validation error', 'BUSINESS_RULE_ERROR', 422, error));
    }
  };
};

// File upload validation middleware
export const validateFileUpload = (options: {
  allowedMimeTypes?: string[];
  maxSize?: number;
  required?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { allowedMimeTypes = [], maxSize = 10 * 1024 * 1024, required = false } = options;
    
    if (!req.file && required) {
      return next(new ValidationError('File upload is required', 'FILE_REQUIRED', 400));
    }
    
    if (!req.file && !required) {
      return next();
    }
    
    const file = req.file;
    
    // Check file size
    if (file.size > maxSize) {
      return next(new ValidationError(
        `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
        'FILE_TOO_LARGE',
        400
      ));
    }
    
    // Check MIME type
    if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
      return next(new ValidationError(
        `File type ${file.mimetype} not allowed`,
        'INVALID_FILE_TYPE',
        400
      ));
    }
    
    // Additional security checks
    const suspiciousExtensions = ['.exe', '.scr', '.bat', '.cmd', '.com', '.pif'];
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    
    if (suspiciousExtensions.includes(fileExtension)) {
      return next(new ValidationError(
        'File type not allowed for security reasons',
        'SECURITY_FILE_TYPE_BLOCKED',
        400
      ));
    }
    
    next();
  };
};

// Cross-field validation helpers
export const crossFieldValidation = {
  // Ensure end time is after start time
  validateTimeRange: (startField: string, endField: string) => {
    return z.object({}).refine((data: any) => {
      const start = new Date(data[startField]);
      const end = new Date(data[endField]);
      return end > start;
    }, {
      message: 'End time must be after start time',
      path: [endField],
    });
  },

  // Ensure at least one field is provided for updates
  requireAtLeastOne: (fields: string[]) => {
    return z.object({}).refine((data: any) => {
      return fields.some(field => data[field] !== undefined);
    }, {
      message: `At least one of the following fields is required: ${fields.join(', ')}`,
    });
  },

  // Conditional validation
  conditionalRequired: (conditionField: string, requiredField: string, conditionValue: any) => {
    return z.object({}).refine((data: any) => {
      if (data[conditionField] === conditionValue && !data[requiredField]) {
        return false;
      }
      return true;
    }, {
      message: `${requiredField} is required when ${conditionField} is ${conditionValue}`,
      path: [requiredField],
    });
  },
};