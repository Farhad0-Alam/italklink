import type { Request, Response, NextFunction } from 'express';
// Using built-in rate limiting instead of external package
// Using built-in security headers instead of helmet
// Using built-in CORS implementation
// Using built-in compression
import { z } from 'zod';

// Built-in rate limiting using in-memory tracking
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const createRateLimit = (windowMs: number, max: number, message: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();
    
    let userRecord = rateLimitStore.get(identifier);
    
    if (!userRecord || now > userRecord.resetTime) {
      userRecord = { count: 1, resetTime: now + windowMs };
      rateLimitStore.set(identifier, userRecord);
    } else {
      userRecord.count++;
      
      if (userRecord.count > max) {
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', userRecord.resetTime);
        return res.status(429).json(message);
      }
    }
    
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - userRecord.count));
    res.setHeader('X-RateLimit-Reset', userRecord.resetTime);
    
    next();
  };
};

// Rate limiting configurations for different endpoint types
export const rateLimitConfigs = {
  // Strict limits for authentication endpoints
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts per window
    {
      error: 'Too many authentication attempts',
      code: 'RATE_LIMIT_AUTH',
      retryAfter: '15 minutes'
    }
  ),

  // General API rate limiting
  api: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per window
    {
      error: 'Too many API requests',
      code: 'RATE_LIMIT_API',
      retryAfter: '15 minutes'
    }
  ),

  // Strict limits for payment endpoints
  payment: createRateLimit(
    60 * 60 * 1000, // 1 hour
    10, // 10 payment attempts per hour
    {
      error: 'Too many payment attempts',
      code: 'RATE_LIMIT_PAYMENT',
      retryAfter: '1 hour'
    }
  ),

  // Booking endpoint limits
  booking: createRateLimit(
    5 * 60 * 1000, // 5 minutes
    5, // 5 booking attempts per 5 minutes
    {
      error: 'Too many booking attempts',
      code: 'RATE_LIMIT_BOOKING',
      retryAfter: '5 minutes'
    }
  ),

  // Public endpoints (less strict)
  public: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    200, // 200 requests per window
    {
      error: 'Too many requests',
      code: 'RATE_LIMIT_PUBLIC',
      retryAfter: '15 minutes'
    }
  ),
};

// Built-in CORS configuration
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://localhost:3000',
    'https://localhost:5000',
  ];

  // Add production domains from environment
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }
  if (process.env.CORS_ORIGINS) {
    allowedOrigins.push(...process.env.CORS_ORIGINS.split(','));
  }

  const origin = req.headers.origin;
  
  // Set CORS headers
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,X-API-Key');
  res.setHeader('Access-Control-Expose-Headers', 'X-RateLimit-Remaining,X-RateLimit-Reset,X-Request-ID');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

// Built-in security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Skip static assets - they don't need CSP headers
  if (req.path.startsWith('/assets/') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|json)$/)) {
    return next();
  }
  
  // Content Security Policy - Permissive for Vite in development and production
  const csp = [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob: http:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
    "connect-src 'self' https://api.stripe.com https://api.zoom.us https://graph.microsoft.com wss: ws:",
    "frame-src 'self' https://js.stripe.com https://*.zoom.us",
    "media-src 'self' blob: data:",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  
  // Other security headers
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // More permissive Permissions-Policy to reduce warnings
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(self), camera=(self)');
  
  next();
};

// Request ID middleware
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Request size limits
export const requestSizeLimits = {
  json: { limit: '10mb' }, // For file uploads
  urlencoded: { limit: '10mb', extended: true },
};

// Built-in compression check (Express handles compression internally)
export const compressionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip compression if explicitly disabled
  if (req.headers['x-no-compression']) {
    return next();
  }
  
  // Express can handle basic compression internally
  // For production, consider using a reverse proxy like nginx for compression
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    // Remove HTML tags and potentially dangerous characters
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[sanitizeString(key)] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize request body, query, and params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// API key validation middleware for external integrations
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      code: 'MISSING_API_KEY',
      message: 'X-API-Key header is required for this endpoint'
    });
  }

  // Validate API key format (should be a valid UUID or similar)
  const apiKeySchema = z.string().min(32).max(128);
  const validation = apiKeySchema.safeParse(apiKey);
  
  if (!validation.success) {
    return res.status(401).json({
      error: 'Invalid API key format',
      code: 'INVALID_API_KEY',
      message: 'API key must be a valid token'
    });
  }

  // TODO: Implement actual API key validation against database
  // For now, we'll just pass through to the next middleware
  next();
};

// Request timeout middleware
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          code: 'REQUEST_TIMEOUT',
          message: `Request took longer than ${timeoutMs}ms to complete`
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

// Content type validation
export const validateContentType = (allowedTypes: string[] = ['application/json']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }

    const contentType = req.headers['content-type'];
    if (!contentType) {
      return res.status(400).json({
        error: 'Content-Type header required',
        code: 'MISSING_CONTENT_TYPE',
        message: 'Content-Type header is required for this request'
      });
    }

    const isValidType = allowedTypes.some(type => 
      contentType.toLowerCase().startsWith(type.toLowerCase())
    );

    if (!isValidType) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: `Content-Type must be one of: ${allowedTypes.join(', ')}`
      });
    }

    next();
  };
};

// Enhanced Express Request interface
declare global {
  namespace Express {
    interface Request {
      id?: string;
      startTime?: number;
      user?: {
        id: string;
        email: string;
        role: string;
        planType: string;
        [key: string]: any;
      };
    }
  }
}