import { Router } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { requireAuth } from './auth';
import { emailService } from './email-service';
import { DEFAULT_EMAIL_TEMPLATES, EMAIL_TEMPLATE_TYPES, EmailTemplateType } from './email-templates';
import { insertEmailTemplateSchema, insertAppointmentNotificationSchema } from '@shared/schema';

const router = Router();

// Email template schemas
const updateEmailTemplateSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  htmlContent: z.string().min(1, 'Content is required'),
  isActive: z.boolean().optional(),
  variables: z.array(z.string()).optional()
});

const sendNotificationSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  recipient: z.string().email('Invalid email address'),
  variables: z.object({
    attendeeName: z.string().optional(),
    attendeeEmail: z.string().optional(),
    hostName: z.string().optional(),
    hostEmail: z.string().optional(),
    eventTypeName: z.string().optional(),
    appointmentDate: z.string().optional(),
    appointmentTime: z.string().optional(),
    appointmentDuration: z.string().optional(),
    meetingLink: z.string().optional(),
    rescheduleLink: z.string().optional(),
    cancelLink: z.string().optional(),
    appointmentNotes: z.string().optional(),
    location: z.string().optional(),
    timezone: z.string().optional(),
    companyName: z.string().optional(),
    companyLogo: z.string().optional()
  }).optional()
});

// ===== EMAIL TEMPLATE ROUTES =====

// Get all email templates for user
router.get('/templates', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const templates = await storage.getUserEmailTemplates(userId);
    
    // If no templates exist, create defaults
    if (templates.length === 0) {
      await ensureDefaultTemplates(userId);
      const defaultTemplates = await storage.getUserEmailTemplates(userId);
      return res.json(defaultTemplates);
    }
    
    res.json(templates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
});

// Get specific email template
router.get('/templates/:type', requireAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user!.id;
    
    if (!EMAIL_TEMPLATE_TYPES.includes(type as EmailTemplateType)) {
      return res.status(400).json({ error: 'Invalid template type' });
    }
    
    // First try to get user's custom template
    let template = await storage.getEmailTemplateByType(type, userId);
    
    // If no custom template, create from default
    if (!template) {
      template = await createDefaultTemplate(userId, type as EmailTemplateType);
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({ error: 'Failed to fetch email template' });
  }
});

// Update email template
router.put('/templates/:type', requireAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user!.id;
    
    if (!EMAIL_TEMPLATE_TYPES.includes(type as EmailTemplateType)) {
      return res.status(400).json({ error: 'Invalid template type' });
    }
    
    const templateData = updateEmailTemplateSchema.parse(req.body);
    
    // Get existing template or create new one
    let existingTemplate = await storage.getEmailTemplateByType(type, userId);
    
    if (existingTemplate) {
      // Update existing template
      const updatedTemplate = await storage.updateEmailTemplate(existingTemplate.id, {
        ...templateData,
        updatedAt: new Date(),
        category: getCategoryForType(type as EmailTemplateType)
      }, userId);
      res.json(updatedTemplate);
    } else {
      // Create new custom template
      const updatedTemplate = await storage.createEmailTemplate({
        ownerUserId: userId,
        type: type as any,
        name: `${type.replace('_', ' ')} Template`,
        category: getCategoryForType(type as EmailTemplateType),
        ...templateData,
        isDefault: false
      });
      res.json(updatedTemplate);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error updating email template:', error);
    res.status(500).json({ error: 'Failed to update email template' });
  }
});

// Reset template to default
router.post('/templates/:type/reset', requireAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user!.id;
    
    if (!EMAIL_TEMPLATE_TYPES.includes(type as EmailTemplateType)) {
      return res.status(400).json({ error: 'Invalid template type' });
    }
    
    // Delete existing custom template
    const existingTemplate = await storage.getEmailTemplateByType(type, userId);
    if (existingTemplate && !existingTemplate.isDefault) {
      await storage.deleteEmailTemplate(existingTemplate.id, userId);
    }
    
    // Create new default template
    const defaultTemplate = await createDefaultTemplate(userId, type as EmailTemplateType);
    res.json(defaultTemplate);
  } catch (error) {
    console.error('Error resetting email template:', error);
    res.status(500).json({ error: 'Failed to reset email template' });
  }
});

// Preview template with sample data
router.post('/templates/:type/preview', requireAuth, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!EMAIL_TEMPLATE_TYPES.includes(type as EmailTemplateType)) {
      return res.status(400).json({ error: 'Invalid template type' });
    }
    
    // For preview, use system templates (no user restriction)
    let template = await storage.getEmailTemplateByType(type, 'system');
    if (!template) {
      template = DEFAULT_EMAIL_TEMPLATES[type as keyof typeof DEFAULT_EMAIL_TEMPLATES];
    }
    
    // Sample data for preview
    const sampleVariables = {
      attendeeName: 'John Smith',
      attendeeEmail: 'john.smith@example.com',
      hostName: 'Jane Doe',
      hostEmail: 'jane.doe@company.com',
      eventTypeName: '30-minute Discovery Call',
      appointmentDate: 'Thursday, December 15, 2023',
      appointmentTime: '2:00 PM',
      appointmentDuration: '30 minutes',
      meetingLink: 'https://meet.company.com/sample-meeting',
      rescheduleLink: 'https://app.company.com/reschedule/sample',
      cancelLink: 'https://app.company.com/cancel/sample',
      appointmentNotes: 'Please prepare your project requirements for discussion.',
      location: 'Google Meet',
      timezone: 'EST',
      companyName: 'Your Company',
      companyLogo: 'https://via.placeholder.com/150x50/0066CC/FFFFFF?text=LOGO'
    };
    
    // Replace variables in template
    const processedSubject = replaceVariables(template.subject, sampleVariables);
    const processedHtml = replaceVariables(template.htmlContent, sampleVariables);
    
    res.json({
      subject: processedSubject,
      htmlContent: processedHtml,
      variables: sampleVariables
    });
  } catch (error) {
    console.error('Error previewing template:', error);
    res.status(500).json({ error: 'Failed to preview template' });
  }
});

// ===== NOTIFICATION ROUTES =====

// Send immediate notification
router.post('/send/:type', requireAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user!.id;
    
    if (!EMAIL_TEMPLATE_TYPES.includes(type as EmailTemplateType)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }
    
    const { appointmentId, recipient, variables } = sendNotificationSchema.parse(req.body);
    
    // Send the notification
    const result = await emailService.sendNotification(
      appointmentId,
      type as any,
      recipient,
      variables || {}
    );
    
    if (result.success) {
      res.json({ 
        success: true, 
        notificationId: result.notificationId,
        message: 'Notification sent successfully'
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Get notification history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const type = req.query.type as string;
    const status = req.query.status as string;
    
    const notifications = await storage.getUserNotifications(userId, {
      type,
      status,
      limit
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({ error: 'Failed to fetch notification history' });
  }
});

// Get notification statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const stats = await storage.getNotificationStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
});

// Get pending notifications (admin/debug endpoint)
router.get('/pending', requireAuth, async (req, res) => {
  try {
    const pendingNotifications = await storage.getPendingNotifications();
    res.json(pendingNotifications);
  } catch (error) {
    console.error('Error fetching pending notifications:', error);
    res.status(500).json({ error: 'Failed to fetch pending notifications' });
  }
});

// ===== HELPER FUNCTIONS =====

async function ensureDefaultTemplates(userId: string): Promise<void> {
  for (const type of EMAIL_TEMPLATE_TYPES) {
    const exists = await storage.getEmailTemplateByType(type, userId);
    if (!exists) {
      await createDefaultTemplate(userId, type);
    }
  }
}

async function createDefaultTemplate(userId: string, type: EmailTemplateType) {
  const defaultTemplate = DEFAULT_EMAIL_TEMPLATES[type];
  
  return await storage.createEmailTemplate({
    ownerUserId: userId,
    type: type as any,
    name: `${type.replace('_', ' ')} Template`,
    category: getCategoryForType(type),
    subject: defaultTemplate.subject,
    htmlContent: defaultTemplate.htmlContent,
    isDefault: true,
    isActive: true,
    variables: Object.keys({
      attendeeName: '',
      attendeeEmail: '',
      hostName: '',
      hostEmail: '',
      eventTypeName: '',
      appointmentDate: '',
      appointmentTime: '',
      appointmentDuration: '',
      meetingLink: '',
      rescheduleLink: '',
      cancelLink: '',
      appointmentNotes: '',
      location: '',
      timezone: '',
      companyName: '',
      companyLogo: ''
    })
  });
}

function getCategoryForType(type: EmailTemplateType): string {
  switch (type) {
    case 'booking_confirmed':
      return 'confirmations';
    case 'reminder_24h':
    case 'reminder_1h':
    case 'appointment_start':
      return 'reminders';
    case 'appointment_cancelled':
    case 'appointment_rescheduled':
      return 'updates';
    case 'follow_up':
      return 'follow_ups';
    default:
      return 'general';
  }
}

function replaceVariables(template: string, variables: Record<string, any>): string {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const regex = new RegExp(`\\{${key}\\}|\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, String(value));
    }
  });
  
  // Remove any remaining unreplaced variables
  result = result.replace(/\{\{[^}]+\}\}|\{[^}]+\}/g, '');
  
  return result;
}

export default router;
