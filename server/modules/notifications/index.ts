/**
 * OneSignal Push Notifications Module
 * 
 * Features:
 * - Per-card notifications (users -> card subscribers)
 * - Admin broadcasts (admin -> app users)
 * - Worldwide tagging (locale, country, plan, role)
 * - Rate limiting (3/day per card, 2/day per admin)
 * - Graceful error handling
 * 
 * Environment Variables Required:
 * - ONESIGNAL_APP_ID: Your OneSignal App ID
 * - ONESIGNAL_API_KEY: Your OneSignal REST API Key
 */

import router from './routes';

export { OneSignalService } from './service';
export { RateLimiter } from './rate-limiter';
export { notifyCardSubscribers, notifyAdminBroadcast, testNotificationService } from './controller';
export { requireAuth, requireAdmin, assertOwnsCard, validateNotificationRequest, handleNotificationError } from './middleware';

export default router;