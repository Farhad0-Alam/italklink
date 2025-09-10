import { Request, Response, NextFunction } from 'express';
import type { User } from '@shared/schema';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Middleware to ensure user is authenticated
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      ok: false,
      error: 'Authentication required. Please log in.',
    });
  }
  next();
}

/**
 * Middleware to ensure user is an admin
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      ok: false,
      error: 'Authentication required. Please log in.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      ok: false,
      error: 'Admin access required.',
    });
  }

  next();
}

/**
 * Middleware to verify card ownership (stub implementation)
 * TODO: Replace with actual database lookup
 */
export function assertOwnsCard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { cardId } = req.body;
  const userId = req.user?.id;

  if (!cardId) {
    return res.status(400).json({
      ok: false,
      error: 'cardId is required',
    });
  }

  // TODO: Implement actual database check
  // Example:
  // const card = await db.businessCards.findFirst({
  //   where: { id: cardId, userId: userId }
  // });
  // 
  // if (!card) {
  //   return res.status(403).json({
  //     ok: false,
  //     error: 'Card not found or access denied',
  //   });
  // }

  // For now, always pass (stub)
  console.log(`TODO: Verify user ${userId} owns card ${cardId}`);
  next();
}

/**
 * Request validation middleware
 */
export function validateNotificationRequest(req: Request, res: Response, next: NextFunction) {
  const { title, message } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      ok: false,
      error: 'Title is required and must be a non-empty string',
    });
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      ok: false,
      error: 'Message is required and must be a non-empty string',
    });
  }

  if (title.length > 100) {
    return res.status(400).json({
      ok: false,
      error: 'Title must be 100 characters or less',
    });
  }

  if (message.length > 300) {
    return res.status(400).json({
      ok: false,
      error: 'Message must be 300 characters or less',
    });
  }

  // Validate URL if provided
  const { url } = req.body;
  if (url && typeof url === 'string' && url.trim().length > 0) {
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        ok: false,
        error: 'Invalid URL format',
      });
    }
  }

  next();
}

/**
 * Error handling middleware for notification routes
 */
export function handleNotificationError(error: any, req: Request, res: Response, next: NextFunction) {
  console.error('Notification error:', error);

  // OneSignal specific errors
  if (error.message?.includes('OneSignal')) {
    return res.status(502).json({
      ok: false,
      error: 'Notification service unavailable. Please try again later.',
    });
  }

  // Rate limit errors
  if (error.message?.includes('rate limit') || error.message?.includes('Rate limit')) {
    return res.status(429).json({
      ok: false,
      error: error.message,
    });
  }

  // Generic server error
  res.status(500).json({
    ok: false,
    error: 'Internal server error. Please try again later.',
  });
}