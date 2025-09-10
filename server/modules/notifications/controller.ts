import { Request, Response } from 'express';
import { OneSignalService } from './service';
import { RateLimiter } from './rate-limiter';
import type { User } from '@shared/schema';

const oneSignalService = new OneSignalService();
const rateLimiter = new RateLimiter();

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Send notification to card subscribers
 * POST /api/notify/card
 */
export async function notifyCardSubscribers(req: AuthenticatedRequest, res: Response) {
  try {
    const { cardId, title, message, url } = req.body;
    const userId = req.user?.id;

    // Validation
    if (!cardId || !title || !message) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: cardId, title, message',
      });
    }

    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'Authentication required',
      });
    }

    // Rate limiting (3 notifications per card per user per day)
    const rateLimitKey = `card:${userId}:${cardId}`;
    if (!rateLimiter.checkLimit(rateLimitKey, 3, 24 * 60 * 60 * 1000)) {
      return res.status(429).json({
        ok: false,
        error: 'Rate limit exceeded. Maximum 3 notifications per card per day.',
      });
    }

    // TODO: Verify card ownership
    // const cardExists = await verifyCardOwnership(cardId, userId);
    // if (!cardExists) {
    //   return res.status(403).json({
    //     ok: false,
    //     error: 'Card not found or access denied',
    //   });
    // }

    // Send notification
    const result = await oneSignalService.sendToCardSubscribers(
      String(cardId),
      String(title).slice(0, 100),
      String(message).slice(0, 300),
      url ? String(url) : undefined
    );

    // Record rate limit usage
    rateLimiter.recordUsage(rateLimitKey);

    res.json({
      ok: true,
      data: {
        notificationId: result.id,
        recipients: result.recipients,
        cardId,
      },
    });

  } catch (error: any) {
    console.error('Card notification error:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Failed to send notification',
    });
  }
}

/**
 * Send admin broadcast notification
 * POST /api/notify/admin
 */
export async function notifyAdminBroadcast(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, message, url, segment = 'all', locales, countries } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Validation
    if (!title || !message) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: title, message',
      });
    }

    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'Authentication required',
      });
    }

    // Admin authorization check
    if (userRole !== 'admin') {
      return res.status(403).json({
        ok: false,
        error: 'Admin access required',
      });
    }

    // Rate limiting (2 broadcasts per admin per day)
    const rateLimitKey = `admin:${userId}`;
    if (!rateLimiter.checkLimit(rateLimitKey, 2, 24 * 60 * 60 * 1000)) {
      return res.status(429).json({
        ok: false,
        error: 'Rate limit exceeded. Maximum 2 broadcasts per admin per day.',
      });
    }

    // Validate segment
    if (segment && !['all', 'free', 'paid'].includes(segment)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid segment. Must be: all, free, or paid',
      });
    }

    // Parse and validate locales
    let parsedLocales: string[] | undefined;
    if (locales) {
      if (Array.isArray(locales)) {
        parsedLocales = locales.map(l => String(l).toLowerCase().slice(0, 2));
      } else if (typeof locales === 'string') {
        parsedLocales = locales.split(',').map(l => l.trim().toLowerCase().slice(0, 2));
      }
      parsedLocales = parsedLocales?.filter(l => l.length === 2);
    }

    // Parse and validate countries
    let parsedCountries: string[] | undefined;
    if (countries) {
      if (Array.isArray(countries)) {
        parsedCountries = countries.map(c => String(c).toLowerCase().slice(0, 2));
      } else if (typeof countries === 'string') {
        parsedCountries = countries.split(',').map(c => c.trim().toLowerCase().slice(0, 2));
      }
      parsedCountries = parsedCountries?.filter(c => c.length === 2);
    }

    // Send notification
    const result = await oneSignalService.sendAdminBroadcast(
      String(title).slice(0, 100),
      String(message).slice(0, 300),
      {
        url: url ? String(url) : undefined,
        segment: segment as 'all' | 'free' | 'paid',
        locales: parsedLocales,
        countries: parsedCountries,
      }
    );

    // Record rate limit usage
    rateLimiter.recordUsage(rateLimitKey);

    res.json({
      ok: true,
      data: {
        notificationId: result.id,
        recipients: result.recipients,
        segment,
        locales: parsedLocales,
        countries: parsedCountries,
      },
    });

  } catch (error: any) {
    console.error('Admin broadcast error:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Failed to send broadcast',
    });
  }
}

/**
 * Send notification to all user's card subscribers
 * POST /api/notify/all-cards
 */
export async function notifyAllCardSubscribers(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, message, url } = req.body;
    const userId = req.user?.id;

    // Validation
    if (!title || !message) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: title, message',
      });
    }

    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'Authentication required',
      });
    }

    // Rate limiting (2 bulk notifications per user per day)
    const rateLimitKey = `bulk:${userId}`;
    if (!rateLimiter.checkLimit(rateLimitKey, 2, 24 * 60 * 60 * 1000)) {
      return res.status(429).json({
        ok: false,
        error: 'Rate limit exceeded. Maximum 2 bulk notifications per day.',
      });
    }

    // TODO: Get user's business cards from database
    // const userCards = await getUserBusinessCards(userId);
    // if (!userCards || userCards.length === 0) {
    //   return res.status(404).json({
    //     ok: false,
    //     error: 'No business cards found',
    //   });
    // }

    // For now, simulate with owner_user_id tag
    const result = await oneSignalService.sendToAllUserCards(
      String(userId),
      String(title).slice(0, 100),
      String(message).slice(0, 300),
      url ? String(url) : undefined
    );

    // Record rate limit usage
    rateLimiter.recordUsage(rateLimitKey);

    res.json({
      ok: true,
      data: {
        notificationId: result.id,
        recipients: result.recipients,
        userId,
        targetType: 'all_user_cards',
      },
    });

  } catch (error: any) {
    console.error('Bulk notification error:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Failed to send bulk notification',
    });
  }
}

/**
 * Test OneSignal connection (admin only)
 * GET /api/notify/test
 */
export async function testNotificationService(req: AuthenticatedRequest, res: Response) {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        ok: false,
        error: 'Admin access required',
      });
    }

    const isConnected = await oneSignalService.testConnection();

    res.json({
      ok: true,
      data: {
        oneSignalConnected: isConnected,
        environment: process.env.NODE_ENV,
        hasAppId: !!process.env.ONESIGNAL_APP_ID,
        hasApiKey: !!process.env.ONESIGNAL_API_KEY,
      },
    });

  } catch (error: any) {
    console.error('Notification test error:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Test failed',
    });
  }
}