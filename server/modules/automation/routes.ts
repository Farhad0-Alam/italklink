import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db';
import { 
  trackButtonInteraction, 
  getUserAutomationConfig, 
  getCardInteractions, 
  getCardLeadProfiles,
  createOrUpdateCrmContact 
} from './tracking';
import { syncContactToCRMs, testCRMConnection, CRMConfig } from './crm';
import { 
  automationConfigs, 
  InsertAutomationConfig,
  businessCards 
} from '../../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Simple in-memory rate limiting for tracking endpoint
// In production, use Redis or a proper rate limiting service
const trackingRateLimit = new Map<string, { count: number; resetTime: number }>();
const MAX_TRACKING_REQUESTS_PER_MINUTE = 60; // Allow 60 requests per minute per IP
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Rate limit middleware for tracking endpoint
function checkTrackingRateLimit(req: Request, res: Response, next: Function) {
  // Use userId for authenticated requests, otherwise use IP
  const identifier = (req.user?.id) || req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, data] of trackingRateLimit.entries()) {
    if (now > data.resetTime) {
      trackingRateLimit.delete(key);
    }
  }
  
  // Check rate limit for this identifier
  const rateLimitData = trackingRateLimit.get(identifier);
  
  if (!rateLimitData) {
    // First request from this identifier
    trackingRateLimit.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    next();
  } else if (now > rateLimitData.resetTime) {
    // Reset the window
    rateLimitData.count = 1;
    rateLimitData.resetTime = now + RATE_LIMIT_WINDOW;
    next();
  } else if (rateLimitData.count < MAX_TRACKING_REQUESTS_PER_MINUTE) {
    // Within limit, increment count
    rateLimitData.count++;
    next();
  } else {
    // Rate limit exceeded
    res.status(429).json({
      success: false,
      error: 'Too many tracking requests. Please try again later.',
      retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
    });
  }
}

// Validation schemas
const trackInteractionSchema = z.object({
  cardId: z.string(),
  elementId: z.string(),
  interactionType: z.enum(['click', 'view', 'download']),
  buttonLabel: z.string(),
  buttonAction: z.enum(['call', 'email', 'link', 'download', 'whatsapp']),
  targetValue: z.string().optional()
});

const crmConfigSchema = z.object({
  provider: z.enum(['hubspot', 'salesforce', 'zoho', 'google_sheets', 'pipedrive', 'custom_webhook']),
  apiKey: z.string().optional(),
  config: z.record(z.any())
});

const updateAutomationConfigSchema = z.object({
  crmConnections: z.array(crmConfigSchema).optional(),
  defaultLeadScore: z.number().min(1).max(100).optional(),
  autoLeadCapture: z.boolean().optional(),
  smartNotifications: z.boolean().optional(),
  buttonAutomations: z.record(z.any()).optional(),
  analyticsEnabled: z.boolean().optional(),
  weeklyReports: z.boolean().optional()
});

// POST /api/automation/track - Track button interaction
router.post('/track', checkTrackingRateLimit, async (req: Request, res: Response) => {
  try {
    const data = trackInteractionSchema.parse(req.body);
    
    // Verify card exists and get owner
    const card = await db
      .select({ userId: businessCards.userId })
      .from(businessCards)
      .where(eq(businessCards.id, data.cardId))
      .limit(1);
    
    if (card.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Card not found' 
      });
    }
    
    const userId = card[0].userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Card has no associated user'
      });
    }
    
    // Track the interaction
    const result = await trackButtonInteraction({
      ...data,
      userId,
      req
    });
    
    if (!result.success || !result.interaction) {
      return res.status(500).json(result);
    }
    
    // Trigger automation workflows if configured
    const automationConfig = await getUserAutomationConfig(userId);
    
    if (automationConfig && automationConfig.autoLeadCapture) {
      // Create or update CRM contact from interaction (primary integration)
      const { generateVisitorFingerprint, getVisitorLocation, getDeviceType } = await import('./tracking');
      const visitorFingerprint = generateVisitorFingerprint(req);
      const userAgent = req.headers['user-agent'] || '';
      const location = getVisitorLocation(req);
      const device = getDeviceType(userAgent);
      
      const crmResult = await createOrUpdateCrmContact({
        cardId: data.cardId,
        userId,
        buttonAction: data.buttonAction,
        targetValue: data.targetValue,
        visitorFingerprint,
        location,
        device,
        leadScore: result.leadScore,
        userAgent
      });
      
      if (crmResult.success) {
        console.log(`CRM contact ${crmResult.isNewContact ? 'created' : 'updated'}:`, crmResult.contactId);
      } else {
        console.error('CRM contact creation failed:', crmResult.error);
      }
      
      // Also sync to external CRM systems if configured
      const crmConnections = (automationConfig.crmConnections as CRMConfig[]) || [];
      
      if (crmConnections.length > 0) {
        // Extract contact info for external CRM sync
        const contact = {
          email: data.buttonAction === 'email' ? data.targetValue : undefined,
          phone: data.buttonAction === 'call' || data.buttonAction === 'whatsapp' ? data.targetValue : undefined,
          source: 'Digital Business Card',
          leadScore: result.leadScore,
          customFields: {
            cardId: data.cardId,
            elementId: data.elementId,
            buttonAction: data.buttonAction,
            buttonLabel: data.buttonLabel,
            interactionType: data.interactionType,
            device: device,
            location: location.country || 'Unknown'
          }
        };
        
        // Only sync if we have identifiable contact info
        if (contact.email || contact.phone) {
          // Sync to external CRMs in background (don't wait)
          syncContactToCRMs(crmConnections, contact)
            .then(results => {
              console.log('External CRM sync results:', results);
            })
            .catch(error => {
              console.error('External CRM sync error:', error);
            });
        }
      }
    }
    
    res.json({
      success: true,
      interactionId: result.interaction.id,
      leadScore: result.leadScore,
      isRepeatVisitor: result.isRepeatVisitor,
      crmContactCreated: automationConfig?.autoLeadCapture || false
    });
    
  } catch (error: any) {
    console.error('Track interaction error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    // Provide more detailed error logging for debugging
    console.error('Track interaction detailed error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      type: error.constructor?.name
    });
    
    // Return 500 with helpful error info but don't expose internal details
    res.status(500).json({
      success: false,
      error: 'Failed to track interaction',
      code: 'TRACKING_ERROR'
    });
  }
});

// GET /api/automation/config - Get user's automation configuration
router.get('/config', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const config = await getUserAutomationConfig(userId);
    
    if (!config) {
      // Return default config
      return res.json({
        success: true,
        config: {
          defaultLeadScore: 10,
          autoLeadCapture: true,
          smartNotifications: true,
          crmConnections: [],
          buttonAutomations: {},
          analyticsEnabled: true,
          weeklyReports: true
        }
      });
    }
    
    // Don't expose sensitive API keys
    const sanitizedConfig = {
      ...config,
      crmConnections: (config.crmConnections as any[])?.map(conn => ({
        ...conn,
        apiKey: conn.apiKey ? '***masked***' : undefined
      })) || []
    };
    
    res.json({
      success: true,
      config: sanitizedConfig
    });
    
  } catch (error: any) {
    console.error('Get automation config error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /api/automation/config - Update automation configuration
router.put('/config', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const updates = updateAutomationConfigSchema.parse(req.body);
    
    // Check if config exists
    const existing = await getUserAutomationConfig(userId);
    
    if (existing) {
      // Update existing config
      await db
        .update(automationConfigs)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(automationConfigs.userId, userId));
    } else {
      // Create new config
      const configData: InsertAutomationConfig = {
        userId,
        defaultLeadScore: updates.defaultLeadScore || 10,
        autoLeadCapture: updates.autoLeadCapture ?? true,
        smartNotifications: updates.smartNotifications ?? true,
        crmConnections: updates.crmConnections || [],
        buttonAutomations: updates.buttonAutomations || {},
        analyticsEnabled: updates.analyticsEnabled ?? true,
        weeklyReports: updates.weeklyReports ?? true
      };
      
      await db.insert(automationConfigs).values(configData);
    }
    
    res.json({
      success: true,
      message: 'Automation configuration updated'
    });
    
  } catch (error: any) {
    console.error('Update automation config error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/automation/test-crm - Test CRM connection
router.post('/test-crm', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const crmConfig = crmConfigSchema.parse(req.body);
    
    const result = await testCRMConnection(crmConfig as CRMConfig);
    
    res.json({
      success: true,
      connectionResult: result
    });
    
  } catch (error: any) {
    console.error('Test CRM connection error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid CRM configuration',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/automation/analytics/interactions/:cardId - Get card interactions
router.get('/analytics/interactions/:cardId', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { cardId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Verify card ownership
    const card = await db
      .select({ userId: businessCards.userId })
      .from(businessCards)
      .where(eq(businessCards.id, cardId))
      .limit(1);
    
    if (card.length === 0 || card[0].userId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Card not found or access denied'
      });
    }
    
    const interactions = await getCardInteractions(cardId, limit);
    
    res.json({
      success: true,
      interactions
    });
    
  } catch (error: any) {
    console.error('Get interactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/automation/analytics/leads - Get lead profiles for user
router.get('/analytics/leads', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 100;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const leads = await getCardLeadProfiles(userId, limit);
    
    res.json({
      success: true,
      leads
    });
    
  } catch (error: any) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export { router as automationRoutes };