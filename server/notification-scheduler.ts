import { emailService } from './email-service';
import { storage } from './storage';

// Background job processor for scheduled notifications
class NotificationScheduler {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly PROCESSING_INTERVAL = 60000; // Check every 1 minute

  start(): void {
    if (this.isRunning) {
      console.log('Notification scheduler is already running');
      return;
    }

    console.log('Starting notification scheduler...');
    this.isRunning = true;
    
    // Process immediately on start
    this.processPendingNotifications();
    
    // Then process every interval
    this.intervalId = setInterval(() => {
      this.processPendingNotifications();
    }, this.PROCESSING_INTERVAL);
    
    console.log(`Notification scheduler started. Processing every ${this.PROCESSING_INTERVAL / 1000} seconds.`);
  }

  stop(): void {
    if (!this.isRunning) {
      console.log('Notification scheduler is not running');
      return;
    }

    console.log('Stopping notification scheduler...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    console.log('Notification scheduler stopped');
  }

  async processPendingNotifications(): Promise<void> {
    try {
      await emailService.processPendingNotifications();
    } catch (error) {
      console.error('Error in notification scheduler:', error);
    }
  }

  isActive(): boolean {
    return this.isRunning;
  }

  // Schedule reminders for an appointment
  async scheduleAppointmentReminders(
    appointmentId: string,
    appointmentTime: Date,
    recipientEmail: string,
    variables: any,
    reminderSettings: {
      reminder24h?: boolean;
      reminder1h?: boolean;
      customReminderMinutes?: number[];
    } = { reminder24h: true, reminder1h: true }
  ): Promise<void> {
    try {
      // Schedule 24-hour reminder
      if (reminderSettings.reminder24h) {
        const reminder24h = await emailService.scheduleReminder(
          appointmentId,
          appointmentTime,
          recipientEmail,
          variables,
          24 * 60 // 24 hours in minutes
        );
        
        if (!reminder24h.success) {
          console.warn(`Failed to schedule 24h reminder: ${reminder24h.error}`);
        }
      }

      // Schedule 1-hour reminder
      if (reminderSettings.reminder1h) {
        const reminder1h = await emailService.scheduleReminder(
          appointmentId,
          appointmentTime,
          recipientEmail,
          variables,
          60 // 1 hour in minutes
        );
        
        if (!reminder1h.success) {
          console.warn(`Failed to schedule 1h reminder: ${reminder1h.error}`);
        }
      }

      // Schedule custom reminders
      if (reminderSettings.customReminderMinutes?.length) {
        for (const minutes of reminderSettings.customReminderMinutes) {
          const reminderResult = await emailService.scheduleReminder(
            appointmentId,
            appointmentTime,
            recipientEmail,
            variables,
            minutes
          );
          
          if (!reminderResult.success) {
            console.warn(`Failed to schedule ${minutes}min reminder: ${reminderResult.error}`);
          }
        }
      }
    } catch (error) {
      console.error('Error scheduling appointment reminders:', error);
    }
  }

  // Cancel all reminders for an appointment
  async cancelAppointmentReminders(appointmentId: string): Promise<void> {
    try {
      const notifications = await storage.getAppointmentNotifications(appointmentId);
      
      for (const notification of notifications) {
        if (
          notification.status === 'pending' &&
          (notification.type === 'reminder_24h' || notification.type === 'reminder_1h')
        ) {
          await storage.updateNotification(notification.id, {
            status: 'cancelled',
            errorMessage: 'Appointment changed or cancelled'
          });
        }
      }
    } catch (error) {
      console.error('Error cancelling appointment reminders:', error);
    }
  }

  // Reschedule reminders for an appointment
  async rescheduleAppointmentReminders(
    appointmentId: string,
    newAppointmentTime: Date,
    recipientEmail: string,
    variables: any,
    reminderSettings?: {
      reminder24h?: boolean;
      reminder1h?: boolean;
      customReminderMinutes?: number[];
    }
  ): Promise<void> {
    try {
      // Cancel existing reminders
      await this.cancelAppointmentReminders(appointmentId);
      
      // Schedule new reminders
      await this.scheduleAppointmentReminders(
        appointmentId,
        newAppointmentTime,
        recipientEmail,
        variables,
        reminderSettings
      );
    } catch (error) {
      console.error('Error rescheduling appointment reminders:', error);
    }
  }
}

// Create singleton instance
export const notificationScheduler = new NotificationScheduler();

// Start scheduler when module loads (in production)
if (process.env.NODE_ENV === 'production') {
  notificationScheduler.start();
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, stopping notification scheduler...');
  notificationScheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, stopping notification scheduler...');
  notificationScheduler.stop();
  process.exit(0);
});

export { NotificationScheduler };
