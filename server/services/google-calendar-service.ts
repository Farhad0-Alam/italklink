import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { storage } from '../storage';
import type { CalendarConnection, ExternalCalendarEvent, Appointment } from '@shared/schema';

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: {
        type: 'hangoutsMeet';
      };
    };
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface ConflictResult {
  hasConflicts: boolean;
  conflicts: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    calendarName?: string;
  }>;
}

export interface CalendarInfo {
  id: string;
  name: string;
  description?: string;
  primary: boolean;
  accessRole: string;
  timeZone: string;
  colorId?: string;
}

export class GoogleCalendarService {
  private createOAuth2Client(connection: CalendarConnection): OAuth2Client {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || '/api/calendar/google/callback'
    );
    
    oauth2Client.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken
    });

    // Handle token refresh automatically
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await storage.updateCalendarTokens(
          connection.id,
          tokens.access_token,
          tokens.refresh_token || connection.refreshToken
        );
      }
    });

    return oauth2Client;
  }

  async getCalendarClient(connection: CalendarConnection) {
    const auth = this.createOAuth2Client(connection);
    return google.calendar({ version: 'v3', auth });
  }

  /**
   * Get list of calendars available to the user
   */
  async getCalendars(connection: CalendarConnection): Promise<CalendarInfo[]> {
    try {
      const calendar = await this.getCalendarClient(connection);
      
      const response = await calendar.calendarList.list({
        maxResults: 250,
        showDeleted: false,
        showHidden: false
      });

      return response.data.items?.map(cal => ({
        id: cal.id!,
        name: cal.summary!,
        description: cal.description,
        primary: cal.primary || false,
        accessRole: cal.accessRole!,
        timeZone: cal.timeZone!,
        colorId: cal.colorId
      })) || [];
    } catch (error) {
      await this.logError(connection, 'get_calendars', error);
      throw new Error(`Failed to fetch calendars: ${error}`);
    }
  }

  /**
   * Check for conflicts in the specified time range
   */
  async checkConflicts(
    connection: CalendarConnection,
    startTime: string,
    endTime: string,
    calendarId: string = 'primary',
    excludeEventId?: string
  ): Promise<ConflictResult> {
    try {
      const calendar = await this.getCalendarClient(connection);
      
      const response = await calendar.events.list({
        calendarId,
        timeMin: startTime,
        timeMax: endTime,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 100
      });

      const conflicts = response.data.items?.filter(event => {
        // Filter out the event we're updating (if any)
        if (excludeEventId && event.id === excludeEventId) {
          return false;
        }
        
        // Only include events with actual start/end times
        return event.start?.dateTime && event.end?.dateTime;
      }).map(event => ({
        id: event.id!,
        title: event.summary || 'Untitled Event',
        start: event.start!.dateTime!,
        end: event.end!.dateTime!,
        calendarName: calendarId
      })) || [];

      return {
        hasConflicts: conflicts.length > 0,
        conflicts
      };
    } catch (error) {
      await this.logError(connection, 'check_conflicts', error);
      throw new Error(`Failed to check conflicts: ${error}`);
    }
  }

  /**
   * Create a new calendar event
   */
  async createEvent(
    connection: CalendarConnection,
    eventData: GoogleCalendarEvent,
    calendarId: string = 'primary',
    withMeetLink: boolean = false
  ): Promise<{ eventId: string; meetLink?: string; event: any }> {
    try {
      const calendar = await this.getCalendarClient(connection);
      
      // Add conference data for Google Meet if requested
      if (withMeetLink) {
        eventData.conferenceData = {
          createRequest: {
            requestId: `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        };
      }

      // Set default reminders if not specified
      if (!eventData.reminders) {
        eventData.reminders = {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1440 }, // 24 hours
            { method: 'popup', minutes: 15 }    // 15 minutes
          ]
        };
      }

      const response = await calendar.events.insert({
        calendarId,
        requestBody: eventData,
        conferenceDataVersion: withMeetLink ? 1 : 0,
        sendUpdates: 'all'
      });

      if (!response.data.id) {
        throw new Error('Event creation failed - no event ID returned');
      }

      // Extract Google Meet link if created
      let meetLink: string | undefined;
      if (withMeetLink && response.data.conferenceData?.entryPoints) {
        const videoEntry = response.data.conferenceData.entryPoints.find(
          ep => ep.entryPointType === 'video'
        );
        meetLink = videoEntry?.uri;
      }

      await this.logSuccess(connection, 'create_event', {
        eventId: response.data.id,
        calendarId,
        withMeetLink,
        meetLink
      });

      return {
        eventId: response.data.id,
        meetLink,
        event: response.data
      };
    } catch (error) {
      await this.logError(connection, 'create_event', error);
      throw new Error(`Failed to create calendar event: ${error}`);
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(
    connection: CalendarConnection,
    eventId: string,
    eventData: Partial<GoogleCalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<{ event: any }> {
    try {
      const calendar = await this.getCalendarClient(connection);
      
      const response = await calendar.events.patch({
        calendarId,
        eventId,
        requestBody: eventData,
        sendUpdates: 'all'
      });

      await this.logSuccess(connection, 'update_event', {
        eventId,
        calendarId
      });

      return {
        event: response.data
      };
    } catch (error) {
      await this.logError(connection, 'update_event', error);
      throw new Error(`Failed to update calendar event: ${error}`);
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(
    connection: CalendarConnection,
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<void> {
    try {
      const calendar = await this.getCalendarClient(connection);
      
      await calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all'
      });

      await this.logSuccess(connection, 'delete_event', {
        eventId,
        calendarId
      });
    } catch (error) {
      await this.logError(connection, 'delete_event', error);
      throw new Error(`Failed to delete calendar event: ${error}`);
    }
  }

  /**
   * Get a specific calendar event
   */
  async getEvent(
    connection: CalendarConnection,
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<any> {
    try {
      const calendar = await this.getCalendarClient(connection);
      
      const response = await calendar.events.get({
        calendarId,
        eventId
      });

      return response.data;
    } catch (error) {
      await this.logError(connection, 'get_event', error);
      throw new Error(`Failed to get calendar event: ${error}`);
    }
  }

  /**
   * Sync an appointment to Google Calendar
   */
  async syncAppointmentToCalendar(
    connection: CalendarConnection,
    appointment: Appointment,
    eventTypeSettings: any = {},
    calendarId: string = 'primary'
  ): Promise<ExternalCalendarEvent> {
    try {
      // Check if already synced
      const existingEvents = await storage.getAppointmentExternalEvents(appointment.id);
      const existingGoogleEvent = existingEvents.find(
        event => event.calendarConnectionId === connection.id
      );

      const eventData: GoogleCalendarEvent = {
        summary: appointment.title || `Appointment with ${appointment.attendeeName}`,
        description: this.formatAppointmentDescription(appointment, eventTypeSettings),
        start: {
          dateTime: appointment.scheduledAt.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: new Date(
            appointment.scheduledAt.getTime() + (appointment.duration * 60000)
          ).toISOString(),
          timeZone: 'UTC'
        },
        location: appointment.location || eventTypeSettings.location,
        attendees: [
          {
            email: appointment.attendeeEmail,
            displayName: appointment.attendeeName
          }
        ]
      };

      let result;
      let syncStatus = 'synced';

      if (existingGoogleEvent) {
        // Update existing event
        try {
          result = await this.updateEvent(
            connection,
            existingGoogleEvent.externalEventId,
            eventData,
            calendarId
          );
          
          // Update our record
          await storage.updateExternalCalendarEvent(existingGoogleEvent.id, {
            title: eventData.summary,
            description: eventData.description,
            startTime: new Date(eventData.start.dateTime),
            endTime: new Date(eventData.end.dateTime),
            location: eventData.location,
            attendees: eventData.attendees || [],
            syncStatus,
            lastSyncAt: new Date()
          });

          return await storage.getExternalCalendarEvent(existingGoogleEvent.id) as ExternalCalendarEvent;
        } catch (error) {
          syncStatus = 'error';
          throw error;
        }
      } else {
        // Create new event
        try {
          const withMeetLink = eventTypeSettings.includeGoogleMeet || false;
          result = await this.createEvent(connection, eventData, calendarId, withMeetLink);
          
          // Create our record
          const externalEvent = await storage.createExternalCalendarEvent({
            appointmentId: appointment.id,
            calendarConnectionId: connection.id,
            externalEventId: result.eventId,
            externalCalendarId: calendarId,
            title: eventData.summary,
            description: eventData.description,
            startTime: new Date(eventData.start.dateTime),
            endTime: new Date(eventData.end.dateTime),
            location: eventData.location,
            attendees: eventData.attendees || [],
            syncStatus,
            lastSyncAt: new Date(),
            meetingUrl: result.meetLink
          });

          return externalEvent;
        } catch (error) {
          syncStatus = 'error';
          throw error;
        }
      }
    } catch (error) {
      await this.logError(connection, 'sync_appointment', error);
      throw new Error(`Failed to sync appointment to calendar: ${error}`);
    }
  }

  /**
   * Bulk sync multiple appointments
   */
  async bulkSyncAppointments(
    connection: CalendarConnection,
    appointments: Appointment[],
    calendarId: string = 'primary'
  ): Promise<{
    successful: number;
    failed: number;
    errors: string[];
    results: ExternalCalendarEvent[];
  }> {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
      results: [] as ExternalCalendarEvent[]
    };

    for (const appointment of appointments) {
      try {
        const result = await this.syncAppointmentToCalendar(
          connection,
          appointment,
          {},
          calendarId
        );
        results.successful++;
        results.results.push(result);
      } catch (error) {
        results.failed++;
        results.errors.push(`Appointment ${appointment.id}: ${error}`);
      }
    }

    await this.logSuccess(connection, 'bulk_sync', {
      total: appointments.length,
      successful: results.successful,
      failed: results.failed
    });

    return results;
  }

  /**
   * Remove appointment from calendar
   */
  async removeAppointmentFromCalendar(
    connection: CalendarConnection,
    appointmentId: string
  ): Promise<void> {
    try {
      const externalEvents = await storage.getAppointmentExternalEvents(appointmentId);
      const googleEvent = externalEvents.find(
        event => event.calendarConnectionId === connection.id
      );

      if (googleEvent) {
        await this.deleteEvent(
          connection,
          googleEvent.externalEventId,
          googleEvent.externalCalendarId
        );
        
        await storage.deleteExternalCalendarEvent(googleEvent.id);
      }
    } catch (error) {
      await this.logError(connection, 'remove_appointment', error);
      throw new Error(`Failed to remove appointment from calendar: ${error}`);
    }
  }

  /**
   * Get events for a specific date range
   */
  async getEventsInRange(
    connection: CalendarConnection,
    startDate: string,
    endDate: string,
    calendarId: string = 'primary'
  ): Promise<any[]> {
    try {
      const calendar = await this.getCalendarClient(connection);
      
      const response = await calendar.events.list({
        calendarId,
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 2500
      });

      return response.data.items || [];
    } catch (error) {
      await this.logError(connection, 'get_events_range', error);
      throw new Error(`Failed to get events in range: ${error}`);
    }
  }

  /**
   * Validate calendar connection
   */
  async validateConnection(connection: CalendarConnection): Promise<boolean> {
    try {
      const calendar = await this.getCalendarClient(connection);
      
      // Try to get calendar list to validate connection
      await calendar.calendarList.list({ maxResults: 1 });
      
      // Update connection status to connected
      await storage.updateCalendarConnection(connection.id, {
        status: 'connected',
        lastSyncAt: new Date()
      });

      return true;
    } catch (error) {
      // Update connection status to error
      await storage.updateCalendarConnection(connection.id, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      await this.logError(connection, 'validate_connection', error);
      return false;
    }
  }

  /**
   * Format appointment description for calendar event
   */
  private formatAppointmentDescription(appointment: Appointment, settings: any = {}): string {
    let description = '';
    
    if (appointment.notes) {
      description += `Notes: ${appointment.notes}\n\n`;
    }
    
    description += `Attendee: ${appointment.attendeeName}\n`;
    description += `Email: ${appointment.attendeeEmail}\n`;
    description += `Duration: ${appointment.duration} minutes\n`;
    
    if (appointment.location) {
      description += `Location: ${appointment.location}\n`;
    }
    
    if (settings.customMessage) {
      description += `\n${settings.customMessage}`;
    }
    
    description += '\n\nCreated by 2TalkLink';
    
    return description;
  }

  /**
   * Log successful operation
   */
  private async logSuccess(
    connection: CalendarConnection,
    operation: string,
    details: any
  ): Promise<void> {
    try {
      await storage.createIntegrationLog({
        userId: connection.userId,
        integrationType: 'calendar',
        provider: 'google',
        operation,
        status: 'success',
        connectionId: connection.id,
        details
      });
    } catch (error) {
      console.error('Failed to log success:', error);
    }
  }

  /**
   * Log error operation
   */
  private async logError(
    connection: CalendarConnection,
    operation: string,
    error: any
  ): Promise<void> {
    try {
      await storage.createIntegrationLog({
        userId: connection.userId,
        integrationType: 'calendar',
        provider: 'google',
        operation,
        status: 'error',
        connectionId: connection.id,
        details: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();