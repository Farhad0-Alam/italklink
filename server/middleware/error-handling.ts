import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Standard error response format
export interface ApiError {
  error: string;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
  path: string;
  method: string;
}

// Custom error classes
export class ValidationError extends Error {
  constructor(
    message: string,
    public code: string = 'VALIDATION_ERROR',
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(
    message: string = 'Authentication required',
    public code: string = 'AUTHENTICATION_REQUIRED',
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(
    message: string = 'Insufficient permissions',
    public code: string = 'INSUFFICIENT_PERMISSIONS',
    public statusCode: number = 403
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(
    message: string = 'Resource not found',
    public code: string = 'RESOURCE_NOT_FOUND',
    public statusCode: number = 404
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(
    message: string = 'Resource conflict',
    public code: string = 'RESOURCE_CONFLICT',
    public statusCode: number = 409,
    public details?: any
  ) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class BusinessLogicError extends Error {
  constructor(
    message: string,
    public code: string = 'BUSINESS_LOGIC_ERROR',
    public statusCode: number = 422,
    public details?: any
  ) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

export class ExternalServiceError extends Error {
  constructor(
    message: string,
    public code: string = 'EXTERNAL_SERVICE_ERROR',
    public statusCode: number = 502,
    public service?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details
  console.error('API Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    requestId: req.id,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });

  // Don't send error response if headers already sent
  if (res.headersSent) {
    return next(error);
  }

  let apiError: ApiError;

  // Handle different error types
  if (error instanceof ZodError) {
    // Zod validation errors
    apiError = {
      error: 'Validation Error',
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
      timestamp: new Date().toISOString(),
      requestId: req.id,
      path: req.path,
      method: req.method,
    };
    res.status(400).json(apiError);
  } else if (error instanceof ValidationError) {
    apiError = {
      error: error.message,
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
      requestId: req.id,
      path: req.path,
      method: req.method,
    };
    res.status(error.statusCode).json(apiError);
  } else if (error instanceof AuthenticationError) {
    apiError = {
      error: 'Authentication Required',
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId: req.id,
      path: req.path,
      method: req.method,
    };
    res.status(error.statusCode).json(apiError);
  } else if (error instanceof AuthorizationError) {
    apiError = {
      error: 'Insufficient Permissions',
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId: req.id,
      path: req.path,
      method: req.method,
    };
    res.status(error.statusCode).json(apiError);
  } else if (error instanceof NotFoundError) {
    apiError = {
      error: 'Not Found',
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId: req.id,
      path: req.path,
      method: req.method,
    };
    res.status(error.statusCode).json(apiError);
  } else if (error instanceof ConflictError) {
    apiError = {
      error: 'Conflict',
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
      requestId: req.id,
      path: req.path,
      method: req.method,
    };
    res.status(error.statusCode).json(apiError);
  } else if (error instanceof BusinessLogicError) {
    apiError = {
      error: 'Business Logic Error',
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
      requestId: req.id,
      path: req.path,
      method: req.method,
    };
    res.status(error.statusCode).json(apiError);
  } else if (error instanceof ExternalServiceError) {
    apiError = {
      error: 'External Service Error',
      code: error.code,
      message: error.message,
      details: { service: error.service, ...error.details },
      timestamp: new Date().toISOString(),
      requestId: req.id,
      path: req.path,
      method: req.method,
    };
    res.status(error.statusCode).json(apiError);
  } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
    // Database connection errors
    apiError = {
      error: 'Service Unavailable',
      code: 'DATABASE_CONNECTION_ERROR',
      message: 'Database service is currently unavailable',
      timestamp: new Date().toISOString(),
      requestId: req.id,
      path: req.path,
      method: req.method,
    };
    res.status(503).json(apiError);
  } else if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
    // Database constraint violations
    apiError = {
      error: 'Conflict',
      code: 'DUPLICATE_RESOURCE',
      message: 'Resource already exists',
      timestamp: new Date().toISOString(),
      requestId: req.id,
      path: req.path,
      method: req.method,
    };
    res.status(409).json(apiError);
  } else {
    // Generic server errors
    apiError = {
      error: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
      timestamp: new Date().toISOString(),
      requestId: req.id,
      path: req.path,
      method: req.method,
    };
    res.status(500).json(apiError);
  }
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response) => {
  const apiError: ApiError = {
    error: 'Not Found',
    code: 'ENDPOINT_NOT_FOUND',
    message: `Endpoint ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    requestId: req.id,
    path: req.path,
    method: req.method,
  };
  
  res.status(404).json(apiError);
};

// Async error wrapper to catch errors in async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Standard success response helper
export const successResponse = (
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200,
  metadata?: any
) => {
  const response = {
    success: true,
    message,
    data,
    ...(metadata && { metadata }),
    timestamp: new Date().toISOString(),
  };
  
  res.status(statusCode).json(response);
};

// Pagination response helper
export const paginatedResponse = (
  res: Response,
  data: any[],
  total: number,
  page: number = 1,
  limit: number = 20,
  message: string = 'Success'
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  const response = {
    success: true,
    message,
    data,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasNext,
      hasPrev,
      nextPage: hasNext ? page + 1 : null,
      prevPage: hasPrev ? page - 1 : null,
    },
    timestamp: new Date().toISOString(),
  };
  
  res.status(200).json(response);
};

// Error response helpers for common scenarios
export const validationError = (message: string, details?: any) => {
  return new ValidationError(message, 'VALIDATION_ERROR', 400, details);
};

export const authenticationError = (message?: string) => {
  return new AuthenticationError(message);
};

export const authorizationError = (message?: string) => {
  return new AuthorizationError(message);
};

export const notFoundError = (resource: string, id?: string) => {
  const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
  return new NotFoundError(message, 'RESOURCE_NOT_FOUND');
};

export const conflictError = (message: string, details?: any) => {
  return new ConflictError(message, 'RESOURCE_CONFLICT', 409, details);
};

export const businessLogicError = (message: string, code: string = 'BUSINESS_LOGIC_ERROR', details?: any) => {
  return new BusinessLogicError(message, code, 422, details);
};

export const externalServiceError = (service: string, message: string, details?: any) => {
  return new ExternalServiceError(message, 'EXTERNAL_SERVICE_ERROR', 502, service, details);
};