import { storage } from './storage';
import { google } from 'googleapis';
import type { CalendarConnection, ExternalCalendarEvent } from '@shared/schema';

export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    source: 'internal' | 'external';
    calendarName?: string;
  }>;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export class ConflictDetectionService {
  // Check for conflicts when booking a new appointment
  async checkAppointmentConflicts(
    userId: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<ConflictCheckResult> {
    const conflicts: ConflictCheckResult['conflicts'] = [];

    // Check internal appointments
    const internalConflicts = await this.checkInternalConflicts(
      userId,
      startTime,
      endTime,
      excludeAppointmentId
    );
    conflicts.push(...internalConflicts);

    // Check external calendar events
    const externalConflicts = await this.checkExternalConflicts(
      userId,
      startTime,
      endTime
    );
    conflicts.push(...externalConflicts);

    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  }

  // Check conflicts with existing appointments in our system
  private async checkInternalConflicts(
    userId: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<ConflictCheckResult['conflicts']> {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);

      // Get user's appointments in the time range
      const appointments = await storage.getUserAppointments(userId, {
        startDate: start,
        endDate: end,
        statuses: ['scheduled', 'confirmed']
      });

      const conflicts = appointments
        .filter(apt => apt.id !== excludeAppointmentId)
        .filter(apt => {
          const aptStart = new Date(apt.startTime);
          const aptEnd = new Date(apt.endTime);
          
          // Check for overlap
          return (start < aptEnd && end > aptStart);
        })
        .map(apt => ({
          id: apt.id,
          title: `Appointment: ${apt.title}`,
          startTime: apt.startTime.toISOString(),
          endTime: apt.endTime.toISOString(),
          source: 'internal' as const
        }));

      return conflicts;
    } catch (error) {
      console.error('Internal conflict check error:', error);
      return [];
    }
  }

  // Check conflicts with external calendar events
  private async checkExternalConflicts(
    userId: string,
    startTime: string,
    endTime: string
  ): Promise<ConflictCheckResult['conflicts']> {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const conflicts: ConflictCheckResult['conflicts'] = [];

      // Get user's calendar connections
      const calendarConnections = await storage.getUserCalendarConnections(userId, {
        isActive: true
      });

      for (const connection of calendarConnections) {
        // Get external events for this calendar
        const externalEvents = await this.getExternalEventsInRange(
          connection,
          start,
          end
        );

        // Check for conflicts
        const connectionConflicts = externalEvents
          .filter(event => {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);
            
            // Check for overlap
            return (start < eventEnd && end > eventStart);
          })
          .map(event => ({
            id: event.id,
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            source: 'external' as const,
            calendarName: `${connection.provider} Calendar`
          }));

        conflicts.push(...connectionConflicts);
      }

      return conflicts;
    } catch (error) {
      console.error('External conflict check error:', error);
      return [];
    }
  }

  // Get external events from calendar providers in real-time
  private async getExternalEventsInRange(
    connection: CalendarConnection,
    start: Date,
    end: Date
  ): Promise<ExternalCalendarEvent[]> {
    try {
      // First, get cached events from our database
      const cachedEvents = await storage.getIntegrationLogs({
        userId: connection.userId,
        integrationType: 'calendar',
        provider: connection.provider,
        limit: 100
      });

      // For real-time accuracy, also fetch from external provider
      if (connection.provider === 'google') {
        return await this.getGoogleCalendarEvents(connection, start, end);
      } else if (connection.provider === 'outlook' || connection.provider === 'microsoft') {
        return await this.getMicrosoftCalendarEvents(connection, start, end);
      }

      return [];
    } catch (error) {
      console.error('External events fetch error:', error);
      return [];
    }
  }

  // Fetch Google Calendar events for conflict checking
  private async getGoogleCalendarEvents(
    connection: CalendarConnection,
    start: Date,
    end: Date
  ): Promise<ExternalCalendarEvent[]> {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      const response = await calendar.events.list({
        calendarId: connection.calendarId || 'primary',
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50
      });

      const events = response.data.items || [];
      
      return events
        .filter(event => event.status !== 'cancelled')
        .map(event => ({
          id: event.id || '',
          calendarConnectionId: connection.id,
          externalEventId: event.id || '',
          title: event.summary || 'Busy',
          description: event.description || '',
          startTime: event.start?.dateTime || event.start?.date || '',
          endTime: event.end?.dateTime || event.end?.date || '',
          location: event.location || '',
          status: event.status || 'confirmed',
          organizer: event.organizer?.email || '',
          attendees: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }));
    } catch (error) {
      console.error('Google Calendar events fetch error:', error);
      return [];
    }
  }

  // Fetch Microsoft Calendar events for conflict checking
  private async getMicrosoftCalendarEvents(
    connection: CalendarConnection,
    start: Date,
    end: Date
  ): Promise<ExternalCalendarEvent[]> {
    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/events?$filter=start/dateTime ge '${start.toISOString()}' and end/dateTime le '${end.toISOString()}'&$top=50`,
        {
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Microsoft Graph API error: ${response.status}`);
      }

      const data = await response.json();
      const events = data.value || [];

      return events
        .filter((event: any) => !event.isCancelled)
        .map((event: any) => ({
          id: event.id || '',
          calendarConnectionId: connection.id,
          externalEventId: event.id || '',
          title: event.subject || 'Busy',
          description: event.bodyPreview || '',
          startTime: event.start?.dateTime || '',
          endTime: event.end?.dateTime || '',
          location: event.location?.displayName || '',
          status: event.isCancelled ? 'cancelled' : 'confirmed',
          organizer: event.organizer?.emailAddress?.address || '',
          attendees: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }));
    } catch (error) {
      console.error('Microsoft Calendar events fetch error:', error);
      return [];
    }
  }

  // Suggest alternative time slots when conflicts are found
  async suggestAlternativeSlots(
    userId: string,
    preferredStartTime: string,
    duration: number, // in minutes
    searchWindow: number = 7 // days to search
  ): Promise<TimeSlot[]> {
    try {
      const preferredStart = new Date(preferredStartTime);
      const suggestions: TimeSlot[] = [];
      
      // Search for available slots within the search window
      for (let day = 0; day < searchWindow && suggestions.length < 5; day++) {
        const searchDate = new Date(preferredStart);
        searchDate.setDate(searchDate.getDate() + day);
        
        // Check business hours (9 AM to 5 PM)
        for (let hour = 9; hour <= 17 && suggestions.length < 5; hour++) {
          const slotStart = new Date(searchDate);
          slotStart.setHours(hour, 0, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + duration);
          
          // Check if this slot is available
          const conflictCheck = await this.checkAppointmentConflicts(
            userId,
            slotStart.toISOString(),
            slotEnd.toISOString()
          );
          
          if (!conflictCheck.hasConflicts) {
            suggestions.push({
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString()
            });
          }
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Alternative slots suggestion error:', error);
      return [];
    }
  }
}

export const conflictDetectionService = new ConflictDetectionService();