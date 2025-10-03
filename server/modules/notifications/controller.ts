import { Request, Response } from 'express';
import { OneSignalService } from './service';
import { RateLimiter } from './rate-limiter';
import type { User } from '@shared/schema';
import { getDb } from '../../db';
import { storage } from '../../storage';
import webpush from 'web-push';

const oneSignalService = new OneSignalService();
const rateLimiter = new RateLimiter();

// Configure VAPID details for Web Push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_MAILTO) {
  // Ensure mailto: prefix is present
  const vapidMailto = process.env.VAPID_MAILTO.startsWith('mailto:') 
    ? process.env.VAPID_MAILTO 
    : `mailto:${process.env.VAPID_MAILTO}`;
  
  webpush.setVapidDetails(
    vapidMailto,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log('[Notifications] Web Push VAPID configured successfully');
} else {
  console.warn('[Notifications] Web Push VAPID keys not configured - push notifications will be disabled');
}

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

    // Verify card ownership
    const card = await storage.getBusinessCard(cardId);
    if (!card || card.userId !== userId) {
      return res.status(403).json({
        ok: false,
        error: 'Card not found or access denied',
      });
    }

    // Check if Web Push is configured
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return res.status(503).json({
        ok: false,
        error: 'Web Push not configured - VAPID keys missing',
      });
    }

    // Get active subscribers from database
    const subscribers = await storage.getCardSubscriptions(cardId, true);
    console.log(`[Notifications] Found ${subscribers.length} active subscribers for card ${cardId}`);

    let successCount = 0;
    let failureCount = 0;

    // Send Web Push notifications to browser subscribers
    for (const subscriber of subscribers) {
      if (subscriber.pushSubscription) {
        try {
          // Parse the push subscription
          const pushSub = typeof subscriber.pushSubscription === 'string' 
            ? JSON.parse(subscriber.pushSubscription) 
            : subscriber.pushSubscription;

          // Prepare the notification payload with proper URL
          let notificationUrl = url;
          if (!notificationUrl) {
            // Fallback to card URL or configured app URL
            const baseUrl = process.env.APP_URL || 
                           (process.env.REPL_SLUG && process.env.REPL_OWNER 
                            ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
                            : null);
            
            if (baseUrl && card?.slug) {
              notificationUrl = `${baseUrl}/share/${card.slug}`;
            } else if (baseUrl) {
              notificationUrl = baseUrl;
            }
          }
          
          const payload = JSON.stringify({
            title,
            body: message,
            url: notificationUrl,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
          });

          // Send the push notification
          await webpush.sendNotification(pushSub, payload);
          
          console.log(`[Notifications] Web Push sent successfully to ${subscriber.email}`);
          successCount++;
        } catch (error: any) {
          console.error(`[Notifications] Failed to send Web Push to ${subscriber.email}:`, error?.message || error);
          failureCount++;
          
          // If the subscription is no longer valid (410 Gone), we should remove it
          if (error?.statusCode === 410) {
            console.log(`[Notifications] Removing invalid push subscription for ${subscriber.email}`);
            // Update subscriber to remove invalid push subscription
            try {
              await storage.updateCardSubscription(subscriber.id, {
                pushSubscription: null,
              });
            } catch (updateError) {
              console.error(`[Notifications] Failed to update subscription:`, updateError);
            }
          }
        }
      }
    }

    // Also send via OneSignal as fallback for legacy subscribers
    try {
      const oneSignalResult = await oneSignalService.sendToCardSubscribers(
        String(cardId),
        String(title).slice(0, 100),
        String(message).slice(0, 300),
        url ? String(url) : undefined
      );
      console.log(`[Notifications] OneSignal result:`, oneSignalResult);
    } catch (error) {
      console.error('[Notifications] OneSignal error:', error);
      // Don't fail the request if OneSignal fails
    }

    // Record rate limit usage
    rateLimiter.recordUsage(rateLimitKey);

    res.json({
      ok: true,
      data: {
        cardId,
        totalSubscribers: subscribers.length,
        webPushSent: successCount,
        webPushFailed: failureCount,
        recipients: successCount,
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