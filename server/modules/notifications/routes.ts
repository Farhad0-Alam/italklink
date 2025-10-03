import { Router } from 'express';
import { notifyCardSubscribers, notifyAllCardSubscribers, notifyAdminBroadcast, testNotificationService } from './controller';
import { requireAuth, requireAdmin, assertOwnsCard, validateNotificationRequest, handleNotificationError } from './middleware';

const router = Router();

/**
 * Send notification to card subscribers
 * POST /api/notify/card
 */
router.post(
  '/card',
  requireAuth,
  validateNotificationRequest,
  assertOwnsCard,
  notifyCardSubscribers
);

/**
 * Send notification to all user's card subscribers
 * POST /api/notify/all-cards
 */
router.post(
  '/all-cards',
  requireAuth,
  validateNotificationRequest,
  notifyAllCardSubscribers
);

/**
 * Send admin broadcast notification
 * POST /api/notify/admin
 */
router.post(
  '/admin',
  requireAuth,
  requireAdmin,
  validateNotificationRequest,
  notifyAdminBroadcast
);

/**
 * Test OneSignal connection (admin only)
 * GET /api/notify/test
 */
router.get(
  '/test',
  requireAuth,
  requireAdmin,
  testNotificationService
);

/**
 * Get VAPID public key for Web Push subscriptions
 * GET /api/notify/vapid-public-key
 */
router.get('/vapid-public-key', (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  
  if (!publicKey) {
    return res.status(503).json({
      ok: false,
      error: 'Web Push not configured',
    });
  }
  
  res.json({
    ok: true,
    data: {
      publicKey,
    },
  });
});

/**
 * Get rate limit status for current user (authenticated)
 * GET /api/notify/limits
 */
router.get('/limits', requireAuth, (req: any, res) => {
  // TODO: Implement rate limit status endpoint if needed
  res.json({
    ok: true,
    data: {
      cardNotifications: {
        limit: 3,
        window: '24 hours',
        // current: await rateLimiter.getUsage(`card:${req.user.id}`)
      },
      adminBroadcasts: req.user?.role === 'admin' ? {
        limit: 2,
        window: '24 hours',
        // current: await rateLimiter.getUsage(`admin:${req.user.id}`)
      } : null,
    },
  });
});

// Error handling middleware
router.use(handleNotificationError);

export default router;