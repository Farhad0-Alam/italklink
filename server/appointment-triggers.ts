import { emailService } from './email-service';
import { notificationScheduler } from './notification-scheduler';
import { storage } from './storage';
import { Appointment, AppointmentEventType } from '@shared/schema';

interface AppointmentEmailVariables {
  attendeeName: string;
  attendeeEmail: string;
  hostName: string;
  hostEmail: string;
  eventTypeName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentDuration: string;
  meetingLink?: string;
  rescheduleLink?: string;
  cancelLink?: string;
  appointmentNotes?: string;
  location?: string;
  timezone?: string;
  companyName?: string;
  companyLogo?: string;
}

class AppointmentTriggers {
  // Trigger when appointment is booked
  async onAppointmentBooked(
    appointment: Appointment,
    eventType: AppointmentEventType,
    hostUser: { id: string; firstName?: string; lastName?: string; email: string }
  ): Promise<void> {
    try {
      const variables = this.buildEmailVariables(appointment, eventType, hostUser);
      
      // Send confirmation to attendee
      const confirmationResult = await emailService.sendNotification(
        appointment.id,
        'booking_confirmed',
        appointment.attendeeEmail,
        variables
      );
      
      if (!confirmationResult.success) {
        console.error('Failed to send booking confirmation:', confirmationResult.error);
      }
      
      // Send notification to host
      const hostNotificationResult = await emailService.sendNotification(
        appointment.id,
        'booking_confirmed',
        hostUser.email,
        {
          ...variables,
          // Swap perspective for host notification
          attendeeName: variables.hostName,
          hostName: variables.attendeeName,
          attendeeEmail: hostUser.email
        }
      );
      
      if (!hostNotificationResult.success) {
        console.error('Failed to send host notification:', hostNotificationResult.error);
      }
      
      // Schedule reminder emails
      await notificationScheduler.scheduleAppointmentReminders(
        appointment.id,
        new Date(appointment.startTime),
        appointment.attendeeEmail,
        variables,
        {
          reminder24h: true,
          reminder1h: true
        }
      );
      
      console.log(`Appointment notifications triggered for appointment ${appointment.id}`);
    } catch (error) {
      console.error('Error triggering appointment booked notifications:', error);
    }
  }
  
  // Trigger when appointment is rescheduled
  async onAppointmentRescheduled(
    appointment: Appointment,
    eventType: AppointmentEventType,
    hostUser: { id: string; firstName?: string; lastName?: string; email: string },
    oldStartTime: Date
  ): Promise<void> {
    try {
      const variables = this.buildEmailVariables(appointment, eventType, hostUser);
      
      // Send reschedule notification to attendee
      const rescheduleResult = await emailService.sendNotification(
        appointment.id,
        'appointment_rescheduled',
        appointment.attendeeEmail,
        variables
      );
      
      if (!rescheduleResult.success) {
        console.error('Failed to send reschedule notification:', rescheduleResult.error);
      }
      
      // Send reschedule notification to host
      const hostRescheduleResult = await emailService.sendNotification(
        appointment.id,
        'appointment_rescheduled',
        hostUser.email,
        {
          ...variables,
          attendeeName: variables.hostName,
          hostName: variables.attendeeName,
          attendeeEmail: hostUser.email
        }
      );
      
      if (!hostRescheduleResult.success) {
        console.error('Failed to send host reschedule notification:', hostRescheduleResult.error);
      }
      
      // Reschedule reminder emails
      await notificationScheduler.rescheduleAppointmentReminders(
        appointment.id,
        new Date(appointment.startTime),
        appointment.attendeeEmail,
        variables
      );
      
      console.log(`Appointment reschedule notifications triggered for appointment ${appointment.id}`);
    } catch (error) {
      console.error('Error triggering appointment rescheduled notifications:', error);
    }
  }
  
  // Trigger when appointment is cancelled
  async onAppointmentCancelled(
    appointment: Appointment,
    eventType: AppointmentEventType,
    hostUser: { id: string; firstName?: string; lastName?: string; email: string }
  ): Promise<void> {
    try {
      const variables = this.buildEmailVariables(appointment, eventType, hostUser);
      
      // Send cancellation notification to attendee
      const cancellationResult = await emailService.sendNotification(
        appointment.id,
        'appointment_cancelled',
        appointment.attendeeEmail,
        variables
      );
      
      if (!cancellationResult.success) {
        console.error('Failed to send cancellation notification:', cancellationResult.error);
      }
      
      // Send cancellation notification to host
      const hostCancellationResult = await emailService.sendNotification(
        appointment.id,
        'appointment_cancelled',
        hostUser.email,
        {
          ...variables,
          attendeeName: variables.hostName,
          hostName: variables.attendeeName,
          attendeeEmail: hostUser.email
        }
      );
      
      if (!hostCancellationResult.success) {
        console.error('Failed to send host cancellation notification:', hostCancellationResult.error);
      }
      
      // Cancel all pending reminders
      await notificationScheduler.cancelAppointmentReminders(appointment.id);
      
      console.log(`Appointment cancellation notifications triggered for appointment ${appointment.id}`);
    } catch (error) {
      console.error('Error triggering appointment cancelled notifications:', error);
    }
  }
  
  // Trigger when appointment is completed
  async onAppointmentCompleted(
    appointment: Appointment,
    eventType: AppointmentEventType,
    hostUser: { id: string; firstName?: string; lastName?: string; email: string }
  ): Promise<void> {
    try {
      const variables = this.buildEmailVariables(appointment, eventType, hostUser);
      
      // Send follow-up to attendee (after a delay)
      setTimeout(async () => {
        const followUpResult = await emailService.sendNotification(
          appointment.id,
          'follow_up',
          appointment.attendeeEmail,
          variables
        );
        
        if (!followUpResult.success) {
          console.error('Failed to send follow-up notification:', followUpResult.error);
        }
      }, 30 * 60 * 1000); // 30 minutes delay
      
      console.log(`Appointment completion follow-up scheduled for appointment ${appointment.id}`);
    } catch (error) {
      console.error('Error triggering appointment completed notifications:', error);
    }
  }
  
  private buildEmailVariables(
    appointment: Appointment,
    eventType: AppointmentEventType,
    hostUser: { id: string; firstName?: string; lastName?: string; email: string }
  ): AppointmentEmailVariables {
    const appointmentStart = new Date(appointment.startTime);
    const appointmentEnd = new Date(appointment.endTime);
    const duration = Math.round((appointmentEnd.getTime() - appointmentStart.getTime()) / (1000 * 60));
    
    return {
      attendeeName: appointment.attendeeName,
      attendeeEmail: appointment.attendeeEmail,
      hostName: `${hostUser.firstName || ''} ${hostUser.lastName || ''}`.trim() || 'Host',
      hostEmail: hostUser.email,
      eventTypeName: eventType.name,
      appointmentDate: appointmentStart.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      appointmentTime: appointmentStart.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      appointmentDuration: `${duration} minutes`,
      meetingLink: appointment.meetingUrl || eventType.meetingUrl || '',
      rescheduleLink: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/booking/${eventType.slug}?reschedule=${appointment.id}`,
      cancelLink: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/booking/${eventType.slug}?cancel=${appointment.id}`,
      appointmentNotes: appointment.notes || eventType.description || '',
      location: appointment.location || eventType.location || 'Online Meeting',
      timezone: appointment.timezone || 'UTC',
      companyName: process.env.COMPANY_NAME || 'Your Company',
      companyLogo: process.env.COMPANY_LOGO_URL || ''
    };
  }
}

export const appointmentTriggers = new AppointmentTriggers();
export { AppointmentTriggers, AppointmentEmailVariables };
