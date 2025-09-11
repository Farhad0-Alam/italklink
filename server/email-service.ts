import sgMail from '@sendgrid/mail';
import { EmailTemplate, AppointmentNotification, InsertAppointmentNotification } from '@shared/schema';
import { storage } from './storage';

interface EmailVariables {
  attendeeName?: string;
  attendeeEmail?: string;
  hostName?: string;
  hostEmail?: string;
  eventTypeName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentDuration?: string;
  meetingLink?: string;
  rescheduleLink?: string;
  cancelLink?: string;
  appointmentNotes?: string;
  location?: string;
  timezone?: string;
  companyName?: string;
  companyLogo?: string;
}

interface EmailOptions {
  to: string;
  from?: string;
  subject: string;
  html: string;
  variables?: EmailVariables;
}

class EmailService {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.warn('SendGrid API key not configured. Email notifications will be disabled.');
      return;
    }
    
    sgMail.setApiKey(apiKey);
    this.initialized = true;
  }

  private replaceVariables(template: string, variables: EmailVariables = {}): string {
    let result = template;
    
    // Replace all template variables
    Object.entries(variables).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const regex = new RegExp(`{{${key}}}|{${key}}`, 'g');
        result = result.replace(regex, String(value));
      }
    });
    
    // Remove any remaining unreplaced variables
    result = result.replace(/{{[^}]+}}|{[^}]+}/g, '');
    
    return result;
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      await this.initialize();
      
      if (!this.initialized) {
        return { success: false, error: 'SendGrid not configured' };
      }

      const processedHtml = this.replaceVariables(options.html, options.variables);
      const processedSubject = this.replaceVariables(options.subject, options.variables);

      const msg = {
        to: options.to,
        from: options.from || process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        subject: processedSubject,
        html: processedHtml,
      };

      const [response] = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: response.headers['x-message-id'] || response.headers['X-Message-Id']
      };
    } catch (error: any) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  async sendNotification(
    appointmentId: string,
    notificationType: 'booking_confirmed' | 'reminder_24h' | 'reminder_1h' | 'appointment_start' | 'appointment_cancelled' | 'appointment_rescheduled' | 'follow_up',
    recipient: string,
    variables: EmailVariables,
    userId?: string
  ): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      // Get userId from appointment context if not provided
      let templateUserId = userId;
      if (!templateUserId) {
        const appointment = await storage.getAppointment(appointmentId);
        if (appointment) {
          templateUserId = appointment.hostUserId;
        }
      }
      
      if (!templateUserId) {
        return { success: false, error: 'Cannot determine user context for email template' };
      }
      
      // Get the user-scoped email template for this notification type
      const template = await storage.getEmailTemplateByType(notificationType, templateUserId);
      if (!template) {
        return { success: false, error: `No email template found for type: ${notificationType}` };
      }

      // Send the email
      const emailResult = await this.sendEmail({
        to: recipient,
        subject: template.subject,
        html: template.htmlContent,
        variables
      });

      if (!emailResult.success) {
        return emailResult;
      }

      // Create notification record
      const notificationData: InsertAppointmentNotification = {
        appointmentId,
        type: notificationType,
        method: 'email',
        recipient,
        scheduledFor: new Date(),
        sentAt: new Date(),
        subject: this.replaceVariables(template.subject, variables),
        message: this.replaceVariables(template.htmlContent, variables),
        templateId: template.id,
        status: 'sent',
        externalId: emailResult.messageId,
        deliveryAttempts: 1
      };

      const notification = await storage.createNotification(notificationData);
      
      return {
        success: true,
        notificationId: notification.id
      };
    } catch (error: any) {
      console.error('Notification sending failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send notification'
      };
    }
  }

  async scheduleReminder(
    appointmentId: string,
    appointmentTime: Date,
    recipient: string,
    variables: EmailVariables,
    reminderMinutes: number = 60, // 1 hour default
    userId?: string
  ): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      const reminderTime = new Date(appointmentTime.getTime() - (reminderMinutes * 60 * 1000));
      
      // Don't schedule reminders in the past
      if (reminderTime <= new Date()) {
        return { success: false, error: 'Cannot schedule reminder in the past' };
      }

      // Get userId from appointment context if not provided
      let templateUserId = userId;
      if (!templateUserId) {
        const appointment = await storage.getAppointment(appointmentId);
        if (appointment) {
          templateUserId = appointment.hostUserId;
        }
      }
      
      if (!templateUserId) {
        return { success: false, error: 'Cannot determine user context for email template' };
      }

      const notificationType = reminderMinutes >= 1440 ? 'reminder_24h' : 'reminder_1h';
      const template = await storage.getEmailTemplateByType(notificationType, templateUserId);
      
      if (!template) {
        return { success: false, error: `No email template found for type: ${notificationType}` };
      }

      // Create scheduled notification record
      const notificationData: InsertAppointmentNotification = {
        appointmentId,
        type: notificationType,
        method: 'email',
        recipient,
        scheduledFor: reminderTime,
        subject: this.replaceVariables(template.subject, variables),
        message: this.replaceVariables(template.htmlContent, variables),
        templateId: template.id,
        status: 'pending'
      };

      const notification = await storage.createNotification(notificationData);
      
      return {
        success: true,
        notificationId: notification.id
      };
    } catch (error: any) {
      console.error('Reminder scheduling failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to schedule reminder'
      };
    }
  }

  async processPendingNotifications(): Promise<void> {
    try {
      const pendingNotifications = await storage.getPendingNotifications();
      
      for (const notification of pendingNotifications) {
        if (new Date() >= new Date(notification.scheduledFor)) {
          try {
            const emailResult = await this.sendEmail({
              to: notification.recipient,
              subject: notification.subject || '',
              html: notification.message || ''
            });

            await storage.updateNotification(notification.id, {
              status: emailResult.success ? 'sent' : 'failed',
              sentAt: emailResult.success ? new Date() : undefined,
              errorMessage: emailResult.error,
              externalId: emailResult.messageId,
              deliveryAttempts: (notification.deliveryAttempts || 0) + 1,
              lastAttemptAt: new Date()
            });
          } catch (error: any) {
            console.error(`Failed to send notification ${notification.id}:`, error);
            await storage.updateNotification(notification.id, {
              status: 'failed',
              errorMessage: error.message,
              deliveryAttempts: (notification.deliveryAttempts || 0) + 1,
              lastAttemptAt: new Date()
            });
          }
        }
      }
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }
}

export const emailService = new EmailService();
export { EmailVariables, EmailOptions };
