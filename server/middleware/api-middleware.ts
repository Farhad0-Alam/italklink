import type { Express, Request, Response, NextFunction } from 'express';
import express from 'express';

import {
  requestId,
  sanitizeInput,
  requestTimeout,
  validateContentType,
} from './security';

import {
  errorHandler,
  notFoundHandler,
  asyncHandler,
} from './error-handling';

import {
  enhancedAuth,
  addRequestContext,
  premiumRateLimitBypass,
  limitConcurrentRequests,
} from './enhanced-auth';

// API Documentation middleware
export const apiDocumentation = (req: Request, res: Response, next: NextFunction) => {
  // Add API version to response headers
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-API-Documentation', 'https://docs.appointment-system.com/api');
  next();
};

// Performance monitoring middleware
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = req.user ? (req.user as any).id : 'anonymous';
    
    // Log performance metrics
    console.log(`[API_PERFORMANCE] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - User: ${userId}`);
    
    // Add performance headers only if headers haven't been sent yet
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    
    // Alert on slow requests (>2 seconds)
    if (duration > 2000) {
      console.warn(`[SLOW_REQUEST] ${req.method} ${req.path} took ${duration}ms - User: ${userId}`);
    }
  });
  
  next();
};

// Request logging middleware
export const requestLogging = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const userInfo = req.user ? { id: (req.user as any).id, email: (req.user as any).email } : 'anonymous';
  
  console.log(`[API_REQUEST] ${timestamp} - ${req.method} ${req.path} - IP: ${req.ip} - User: ${JSON.stringify(userInfo)} - RequestID: ${req.id}`);
  
  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive fields from logs
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    sensitiveFields.forEach(field => {
      if (sanitizedBody[field]) {
        sanitizedBody[field] = '[REDACTED]';
      }
    });
    
    console.log(`[API_REQUEST_BODY] ${req.id} - ${JSON.stringify(sanitizedBody)}`);
  }
  
  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// API versioning middleware
export const apiVersioning = (version: string = 'v1') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if API version is specified in header or URL
    const requestedVersion = req.headers['x-api-version'] || 
                           req.path.match(/^\/api\/v(\d+)/)?.[1] || 
                           version;
    
    if (requestedVersion !== version) {
      return res.status(400).json({
        error: 'API Version Mismatch',
        code: 'API_VERSION_MISMATCH',
        message: `Requested version ${requestedVersion} is not supported. Current version: ${version}`,
        supportedVersions: [version],
      });
    }
    
    req.headers['x-api-version'] = version;
    res.setHeader('X-API-Version', version);
    next();
  };
};

// Built-in compression middleware with smart detection
export const smartCompression = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Don't compress if explicitly disabled
    if (req.headers['x-no-compression']) {
      return next();
    }
    
    // For production environments, compression should be handled by
    // reverse proxy (nginx, CloudFlare, etc.) for better performance
    // This is a placeholder that maintains the API but doesn't compress
    next();
  };
};

// Health check endpoint data
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: { status: 'up' | 'down'; responseTime?: number; error?: string };
    redis?: { status: 'up' | 'down'; responseTime?: number; error?: string };
    externalServices: {
      stripe?: { status: 'up' | 'down'; responseTime?: number };
      google?: { status: 'up' | 'down'; responseTime?: number };
      zoom?: { status: 'up' | 'down'; responseTime?: number };
    };
  };
  metrics: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    activeConnections: number;
  };
}

// Health check implementation
export const setupHealthChecks = (app: Express) => {
  // Basic health check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Detailed health check
  app.get('/api/health/detailed', async (req: Request, res: Response) => {
    const startTime = Date.now();
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    const healthCheck: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: { status: 'up' },
        externalServices: {},
      },
      metrics: {
        requestsPerMinute: 0, // TODO: Implement actual metrics
        averageResponseTime: 0,
        errorRate: 0,
        activeConnections: 0,
      },
    };

    // Database health check
    try {
      const dbStart = Date.now();
      const { storage } = await import('../storage');
      await storage.getUser('health-check'); // This will likely return undefined but tests connection
      healthCheck.checks.database = {
        status: 'up',
        responseTime: Date.now() - dbStart,
      };
    } catch (error) {
      healthCheck.checks.database = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      overallStatus = 'degraded';
    }

    // External service checks
    const externalChecks = [];

    // Stripe health check
    if (process.env.STRIPE_SECRET_KEY) {
      externalChecks.push(
        (async () => {
          try {
            const stripeStart = Date.now();
            const { getStripe } = await import('../stripe-config');
            const stripe = getStripe();
            await stripe.balance.retrieve();
            healthCheck.checks.externalServices.stripe = {
              status: 'up',
              responseTime: Date.now() - stripeStart,
            };
          } catch (error) {
            healthCheck.checks.externalServices.stripe = {
              status: 'down',
              responseTime: Date.now() - Date.now(),
            };
            overallStatus = 'degraded';
          }
        })()
      );
    }

    // Wait for all external checks
    await Promise.allSettled(externalChecks);

    // Determine overall status
    const dbDown = healthCheck.checks.database.status === 'down';
    const criticalServicesDown = Object.values(healthCheck.checks.externalServices)
      .some(service => service.status === 'down');

    if (dbDown) {
      overallStatus = 'unhealthy';
    } else if (criticalServicesDown) {
      overallStatus = 'degraded';
    }

    healthCheck.status = overallStatus;

    // Return appropriate HTTP status
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthCheck);
  });

  // Ready check (for Kubernetes)
  app.get('/ready', (req: Request, res: Response) => {
    // Check if the application is ready to receive traffic
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  });

  // Live check (for Kubernetes)
  app.get('/live', (req: Request, res: Response) => {
    // Simple liveness check
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });
};

// Built-in rate limiting (simple implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const simpleRateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();
    
    let userRecord = requestCounts.get(identifier);
    
    if (!userRecord || now > userRecord.resetTime) {
      userRecord = { count: 1, resetTime: now + windowMs };
      requestCounts.set(identifier, userRecord);
    } else {
      userRecord.count++;
      
      if (userRecord.count > maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((userRecord.resetTime - now) / 1000)
        });
      }
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - userRecord.count));
    res.setHeader('X-RateLimit-Reset', userRecord.resetTime);
    
    next();
  };
};

// Apply all middleware to Express app
export const setupApiMiddleware = (app: Express) => {
  // Trust proxy for accurate IP addresses behind load balancers
  app.set('trust proxy', 1);

  // Security headers first
  app.use(securityHeaders);

  // Built-in CORS
  app.use((req, res, next) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://localhost:3000', 
      'https://localhost:5000'
    ];
    
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,X-API-Key');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Request parsing with size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Request identification and context
  app.use(requestId);
  app.use(addRequestContext);

  // Performance monitoring
  app.use(performanceMonitoring);

  // Request logging (after context is added)
  app.use(requestLogging);

  // Input sanitization
  app.use(sanitizeInput);

  // API versioning
  app.use('/api', apiVersioning('v1'));

  // API documentation headers
  app.use('/api', apiDocumentation);

  // Request timeout protection
  app.use(requestTimeout(30000)); // 30 second timeout

  // Content type validation for write operations
  app.use('/api', (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return validateContentType(['application/json', 'multipart/form-data'])(req, res, next);
    }
    next();
  });

  // Setup health checks
  setupHealthChecks(app);
};

// Apply enhanced authentication middleware to protected routes
export const setupAuthenticatedRoutes = (app: Express) => {
  // Premium user rate limit bypass
  app.use('/api', premiumRateLimitBypass);

  // NOTE: enhancedAuth middleware now checks for public endpoints internally
  // so we can apply it globally and it will skip authentication for public routes
  app.use('/api', enhancedAuth);
  
  // Concurrent request limiting for authenticated users (only after auth check)
  app.use('/api', (req, res, next) => {
    // Only apply concurrent limiting to authenticated requests
    if (req.isAuthenticated()) {
      return limitConcurrentRequests(10)(req, res, next);
    }
    next();
  });
};

// Setup public route rate limiting with built-in implementation
export const setupPublicRoutes = (app: Express) => {
  // Public endpoints with lighter rate limiting (200 requests per 15 minutes)
  app.use('/api/plans', simpleRateLimit(200, 15 * 60 * 1000));
  app.use('/api/templates', simpleRateLimit(200, 15 * 60 * 1000));
  app.use('/api/availability', simpleRateLimit(200, 15 * 60 * 1000));
  
  // Booking endpoints with moderate rate limiting (50 requests per 15 minutes)
  app.use('/api/appointments', simpleRateLimit(50, 15 * 60 * 1000));
  
  // Authentication endpoints - separate limits for different types
  // Login/logout endpoints with strictest rate limiting (5 requests per 15 minutes)
  app.use('/api/auth/login', simpleRateLimit(5, 15 * 60 * 1000));
  // NOTE: Logout should NOT have rate limiting - users need to be able to logout anytime
  // app.use('/api/auth/logout', simpleRateLimit(5, 15 * 60 * 1000));
  app.use('/api/admin/login', simpleRateLimit(20, 15 * 60 * 1000)); // More lenient for admin login (20 requests per 15 minutes)
  
  // User check endpoint with more relaxed rate limiting (50 requests per 15 minutes)
  app.use('/api/auth/user', simpleRateLimit(50, 15 * 60 * 1000));
  
  // Payment endpoints with strict rate limiting (10 requests per hour)
  app.use('/api/payments', simpleRateLimit(10, 60 * 60 * 1000));
  
  // General API rate limiting for everything else (100 requests per 15 minutes)
  app.use('/api', simpleRateLimit(100, 15 * 60 * 1000));
};

// Setup error handling (must be last) - scoped to API routes only
export const setupErrorHandling = (app: Express) => {
  // 404 handler for unmatched API routes only
  app.use('/api', notFoundHandler);

  // Error handler for API routes only  
  app.use('/api', errorHandler);
};