import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticationError, AuthorizationError, businessLogicError } from './error-handling';
import { storage } from '../storage';

// Enhanced authentication middleware that includes additional security checks
export const enhancedAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated via session
    if (!req.isAuthenticated() || !req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const user = req.user as any;

    // Check if user account is active
    if (user.isActive === false) {
      throw new AuthenticationError('Account has been deactivated', 'ACCOUNT_DEACTIVATED');
    }

    // Check if user account is locked
    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      throw new AuthenticationError('Account is temporarily locked', 'ACCOUNT_LOCKED');
    }

    // Update last login timestamp
    try {
      await storage.updateUser(user.id, { 
        lastLoginAt: new Date(),
        loginAttempts: 0, // Reset login attempts on successful auth
      });
    } catch (error) {
      console.warn('Failed to update last login timestamp:', error);
      // Don't fail the request if this update fails
    }

    // Add user info to request for use in subsequent middleware
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Role-based authorization middleware factory
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    const userRole = (req.user as any).role;
    
    if (!allowedRoles.includes(userRole)) {
      return next(new AuthorizationError(
        `Access denied. Required roles: ${allowedRoles.join(', ')}. Current role: ${userRole}`,
        'INSUFFICIENT_ROLE'
      ));
    }

    next();
  };
};

// Plan-based authorization middleware
export const requirePlan = (...allowedPlans: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    const userPlan = (req.user as any).planType;
    
    if (!allowedPlans.includes(userPlan)) {
      return next(new AuthorizationError(
        `This feature requires a ${allowedPlans.join(' or ')} plan. Current plan: ${userPlan}`,
        'PLAN_UPGRADE_REQUIRED'
      ));
    }

    next();
  };
};

// Resource ownership verification middleware
export const requireOwnership = (resourceType: 'appointment' | 'event_type' | 'business_card' | 'team') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AuthenticationError());
      }

      const userId = (req.user as any).id;
      const resourceId = req.params.id || req.params.resourceId;

      if (!resourceId) {
        return next(new AuthorizationError('Resource ID is required', 'MISSING_RESOURCE_ID'));
      }

      let resource;
      let isOwner = false;

      switch (resourceType) {
        case 'appointment':
          resource = await storage.getAppointment(resourceId);
          isOwner = resource?.hostUserId === userId;
          break;
        
        case 'event_type':
          resource = await storage.getAppointmentEventType(resourceId);
          isOwner = resource?.userId === userId;
          break;
        
        case 'business_card':
          resource = await storage.getBusinessCard(resourceId);
          isOwner = resource?.userId === userId;
          break;
        
        case 'team':
          resource = await storage.getTeam(resourceId);
          isOwner = resource?.ownerId === userId;
          break;
        
        default:
          return next(new AuthorizationError('Invalid resource type', 'INVALID_RESOURCE_TYPE'));
      }

      if (!resource) {
        return next(new AuthorizationError('Resource not found', 'RESOURCE_NOT_FOUND'));
      }

      if (!isOwner) {
        return next(new AuthorizationError(
          `You do not have permission to access this ${resourceType}`,
          'RESOURCE_ACCESS_DENIED'
        ));
      }

      // Add resource to request for use in route handler
      (req as any).resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Team membership verification with role requirements
export const requireTeamAccess = (requiredRoles: string[] = ['owner', 'admin', 'member']) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AuthenticationError());
      }

      const userId = (req.user as any).id;
      const teamId = req.params.teamId || req.params.id;

      if (!teamId) {
        return next(new AuthorizationError('Team ID is required', 'MISSING_TEAM_ID'));
      }

      // Check team membership
      const teamMembership = await storage.getTeamMemberByUserAndTeam(userId, teamId);
      
      if (!teamMembership) {
        return next(new AuthorizationError(
          'You are not a member of this team',
          'TEAM_ACCESS_DENIED'
        ));
      }

      // Check member status
      if (teamMembership.status !== 'active') {
        return next(new AuthorizationError(
          `Team membership is ${teamMembership.status}`,
          'TEAM_MEMBERSHIP_INACTIVE'
        ));
      }

      // Check role requirements
      if (!requiredRoles.includes(teamMembership.role)) {
        return next(new AuthorizationError(
          `Insufficient team permissions. Required: ${requiredRoles.join(', ')}. Current: ${teamMembership.role}`,
          'INSUFFICIENT_TEAM_ROLE'
        ));
      }

      // Add team membership info to request
      (req as any).teamMembership = teamMembership;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// API key authentication for external integrations
export const requireApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      throw new AuthenticationError('API key required', 'MISSING_API_KEY');
    }

    // Validate API key format
    const apiKeySchema = z.string().uuid();
    const validation = apiKeySchema.safeParse(apiKey);
    
    if (!validation.success) {
      throw new AuthenticationError('Invalid API key format', 'INVALID_API_KEY_FORMAT');
    }

    // TODO: Implement API key validation against database
    // For now, we'll validate the format and continue
    
    // Add API key info to request
    (req as any).apiKey = apiKey;
    next();
  } catch (error) {
    next(error);
  }
};

// Multi-tenant data isolation middleware
export const enforceDataIsolation = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AuthenticationError());
  }

  const userId = (req.user as any).id;
  
  // Add data isolation filters to request
  (req as any).dataFilters = {
    userId,
    // Add team-based filtering if user is part of teams
    teamIds: (req as any).teamMembership ? [(req as any).teamMembership.teamId] : [],
  };

  next();
};

// Rate limiting bypass for premium users
export const premiumRateLimitBypass = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    const userPlan = (req.user as any).planType;
    
    // Premium users get higher rate limits
    if (['pro', 'enterprise'].includes(userPlan)) {
      // Add bypass header for rate limiting middleware
      req.headers['x-rate-limit-bypass'] = 'premium';
    }
  }
  
  next();
};

// Business hours enforcement for certain operations
export const enforceBusinessHours = (timezone: string = 'UTC') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = new Date();
    const userTimezone = (req.user as any)?.timezone || timezone;
    
    try {
      const currentTime = new Intl.DateTimeFormat('en-US', {
        timeZone: userTimezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        weekday: 'long'
      }).formatToParts(now);

      const hour = parseInt(currentTime.find(part => part.type === 'hour')?.value || '0');
      const weekday = currentTime.find(part => part.type === 'weekday')?.value;
      
      // Define business hours (9 AM - 5 PM, Monday-Friday)
      const isBusinessHours = 
        weekday && !['Saturday', 'Sunday'].includes(weekday) &&
        hour >= 9 && hour < 17;

      if (!isBusinessHours) {
        return next(businessLogicError(
          'This operation is only available during business hours (9 AM - 5 PM, Monday-Friday)',
          'OUTSIDE_BUSINESS_HOURS'
        ));
      }

      next();
    } catch (error) {
      // If timezone parsing fails, continue anyway
      console.warn('Business hours validation failed:', error);
      next();
    }
  };
};

// Concurrent request limiting per user
const userRequestCounts = new Map<string, number>();

export const limitConcurrentRequests = (maxConcurrent: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    const userId = (req.user as any).id;
    const currentRequests = userRequestCounts.get(userId) || 0;

    if (currentRequests >= maxConcurrent) {
      return next(businessLogicError(
        'Too many concurrent requests. Please wait for previous requests to complete.',
        'TOO_MANY_CONCURRENT_REQUESTS'
      ));
    }

    // Increment request count
    userRequestCounts.set(userId, currentRequests + 1);

    // Decrement on request completion
    const cleanup = () => {
      const count = userRequestCounts.get(userId) || 0;
      if (count <= 1) {
        userRequestCounts.delete(userId);
      } else {
        userRequestCounts.set(userId, count - 1);
      }
    };

    res.on('finish', cleanup);
    res.on('close', cleanup);

    next();
  };
};

// Feature flag middleware
export const requireFeatureFlag = (featureName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AuthenticationError());
      }

      const userId = (req.user as any).id;
      
      // TODO: Implement feature flag checking against database/cache
      // For now, we'll check against environment variables
      const enabledFeatures = process.env.ENABLED_FEATURES?.split(',') || [];
      
      if (!enabledFeatures.includes(featureName)) {
        return next(new AuthorizationError(
          `Feature '${featureName}' is not available`,
          'FEATURE_NOT_AVAILABLE'
        ));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Request context middleware to add user context to all requests
export const addRequestContext = (req: Request, res: Response, next: NextFunction) => {
  // Add request start time for performance monitoring
  req.startTime = Date.now();
  
  // Add correlation ID if not present
  if (!req.id) {
    req.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add user context if authenticated
  if (req.user) {
    (req as any).context = {
      userId: (req.user as any).id,
      userRole: (req.user as any).role,
      userPlan: (req.user as any).planType,
      requestId: req.id,
      requestStartTime: req.startTime,
    };
  }

  next();
};