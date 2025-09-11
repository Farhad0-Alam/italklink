import { storage } from '../storage';
import type { CalendarConnection, VideoMeetingProvider, ExternalCalendarEvent, MeetingLink, Appointment } from '@shared/schema';

export interface GraphCalendarEvent {
  id?: string;
  subject: string;
  body?: {
    contentType: 'text' | 'html';
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      countryOrRegion?: string;
      postalCode?: string;
    };
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
    type?: 'required' | 'optional' | 'resource';
  }>;
  onlineMeeting?: {
    conferenceId?: string;
    joinUrl?: string;
    tollFreeNumbers?: string[];
    tollNumbers?: string[];
  };
  isOnlineMeeting?: boolean;
  onlineMeetingProvider?: 'unknown' | 'skypeForBusiness' | 'skypeForConsumer' | 'teamsForBusiness';
  recurrence?: {
    pattern: {
      type: 'daily' | 'weekly' | 'absoluteMonthly' | 'relativeMonthly' | 'absoluteYearly' | 'relativeYearly';
      interval: number;
      month?: number;
      dayOfMonth?: number;
      daysOfWeek?: Array<'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'>;
      firstDayOfWeek?: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
      index?: 'first' | 'second' | 'third' | 'fourth' | 'last';
    };
    range: {
      type: 'endDate' | 'noEnd' | 'numbered';
      startDate: string;
      endDate?: string;
      numberOfOccurrences?: number;
    };
  };
  sensitivity?: 'normal' | 'personal' | 'private' | 'confidential';
  showAs?: 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere' | 'unknown';
  reminderMinutesBeforeStart?: number;
}

export interface GraphOnlineMeeting {
  id?: string;
  creationDateTime?: string;
  startDateTime: string;
  endDateTime: string;
  subject: string;
  joinWebUrl?: string;
  joinMeetingIdSettings?: {
    isPasscodeRequired: boolean;
    joinMeetingId?: string;
    passcode?: string;
  };
  chatInfo?: {
    threadId?: string;
    messageId?: string;
    replyChainMessageId?: string;
  };
  videoTeleconferenceId?: string;
  audioConferencing?: {
    tollNumber?: string;
    tollFreeNumber?: string;
    conferenceId?: string;
    dialinUrl?: string;
  };
  participants?: {
    organizer?: {
      upn?: string;
      role?: 'attendee' | 'presenter' | 'producer' | 'unknownFutureValue';
      identity?: {
        user?: {
          id?: string;
          displayName?: string;
          tenantId?: string;
        };
      };
    };
    attendees?: Array<{
      upn?: string;
      role?: 'attendee' | 'presenter' | 'producer' | 'unknownFutureValue';
      identity?: {
        user?: {
          id?: string;
          displayName?: string;
          tenantId?: string;
        };
      };
    }>;
  };
  lobbyBypassSettings?: {
    scope?: 'organizer' | 'organization' | 'organizationAndFederated' | 'everyone' | 'unknownFutureValue';
    isDialInBypassEnabled?: boolean;
  };
  allowedPresenters?: 'everyone' | 'organization' | 'roleIsPresenter' | 'organizer' | 'unknownFutureValue';
  allowMeetingChat?: 'enabled' | 'disabled' | 'limited' | 'unknownFutureValue';
  allowTeamworkReactions?: boolean;
  recordAutomatically?: boolean;
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
  isDefaultCalendar: boolean;
  canShare: boolean;
  canViewPrivateItems: boolean;
  canEdit: boolean;
  owner?: {
    name: string;
    address: string;
  };
  color: string;
}

export class MicrosoftGraphService {
  private async makeGraphAPIRequest(
    accessToken: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
  ): Promise<any> {
    const url = `https://graph.microsoft.com/v1.0${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Microsoft Graph API error: ${response.status} ${response.statusText} - ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Microsoft Graph API request failed:', error);
      throw error;
    }
  }

  private async refreshAccessToken(provider: CalendarConnection | VideoMeetingProvider): Promise<string> {
    if (!provider.refreshToken) {
      throw new Error('No refresh token available for Microsoft provider');
    }

    try {
      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: provider.refreshToken,
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          scope: 'https://graph.microsoft.com/calendars.readwrite https://graph.microsoft.com/onlineMeetings.readwrite https://graph.microsoft.com/user.read',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update provider with new tokens
      if ('calendarConnectionId' in provider) {
        // This is a CalendarConnection
        await storage.updateCalendarTokens(
          provider.id,
          data.access_token,
          data.refresh_token || provider.refreshToken
        );
      } else {
        // This is a VideoMeetingProvider
        await storage.updateVideoProviderTokens(
          provider.id,
          data.access_token,
          data.refresh_token || provider.refreshToken
        );
      }

      return data.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Get user information from Microsoft Graph
   */
  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await this.makeGraphAPIRequest(accessToken, '/me');
      return response;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error}`);
    }
  }

  /**
   * Get list of calendars available to the user
   */
  async getCalendars(connection: CalendarConnection): Promise<CalendarInfo[]> {
    try {
      let accessToken = connection.accessToken;
      
      try {
        const response = await this.makeGraphAPIRequest(accessToken, '/me/calendars');
        
        return response.value?.map((cal: any) => ({
          id: cal.id,
          name: cal.name,
          description: cal.description,
          isDefaultCalendar: cal.isDefaultCalendar || false,
          canShare: cal.canShare || false,
          canViewPrivateItems: cal.canViewPrivateItems || false,
          canEdit: cal.canEdit || false,
          owner: cal.owner ? {
            name: cal.owner.name,
            address: cal.owner.address
          } : undefined,
          color: cal.color || 'auto'
        })) || [];
      } catch (error: any) {
        if (error.message.includes('401')) {
          // Token expired, refresh and retry
          accessToken = await this.refreshAccessToken(connection);
          const response = await this.makeGraphAPIRequest(accessToken, '/me/calendars');
          
          return response.value?.map((cal: any) => ({
            id: cal.id,
            name: cal.name,
            description: cal.description,
            isDefaultCalendar: cal.isDefaultCalendar || false,
            canShare: cal.canShare || false,
            canViewPrivateItems: cal.canViewPrivateItems || false,
            canEdit: cal.canEdit || false,
            owner: cal.owner ? {
              name: cal.owner.name,
              address: cal.owner.address
            } : undefined,
            color: cal.color || 'auto'
          })) || [];
        }
        throw error;
      }
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
    calendarId?: string,
    excludeEventId?: string
  ): Promise<ConflictResult> {
    try {
      let accessToken = connection.accessToken;
      const endpoint = calendarId ? `/me/calendars/${calendarId}/calendarView` : '/me/calendarView';
      const queryParams = `?startDateTime=${encodeURIComponent(startTime)}&endDateTime=${encodeURIComponent(endTime)}`;
      
      try {
        const response = await this.makeGraphAPIRequest(
          accessToken,
          `${endpoint}${queryParams}`
        );

        const conflicts = response.value?.filter((event: any) => {
          // Filter out the event we're updating (if any)
          if (excludeEventId && event.id === excludeEventId) {
            return false;
          }
          
          // Only include events that are not free time
          return event.showAs !== 'free';
        }).map((event: any) => ({
          id: event.id,
          title: event.subject || 'Untitled Event',
          start: event.start.dateTime,
          end: event.end.dateTime,
          calendarName: calendarId || 'default'
        })) || [];

        return {
          hasConflicts: conflicts.length > 0,
          conflicts
        };
      } catch (error: any) {
        if (error.message.includes('401')) {
          // Token expired, refresh and retry
          accessToken = await this.refreshAccessToken(connection);
          const response = await this.makeGraphAPIRequest(
            accessToken,
            `${endpoint}${queryParams}`
          );

          const conflicts = response.value?.filter((event: any) => {
            if (excludeEventId && event.id === excludeEventId) {
              return false;
            }
            return event.showAs !== 'free';
          }).map((event: any) => ({
            id: event.id,
            title: event.subject || 'Untitled Event',
            start: event.start.dateTime,
            end: event.end.dateTime,
            calendarName: calendarId || 'default'
          })) || [];

          return {
            hasConflicts: conflicts.length > 0,
            conflicts
          };
        }
        throw error;
      }
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
    eventData: GraphCalendarEvent,
    calendarId?: string,
    withTeamsMeeting: boolean = false
  ): Promise<{ eventId: string; teamsLink?: string; event: any }> {
    try {
      let accessToken = connection.accessToken;
      
      // Add Teams meeting if requested
      if (withTeamsMeeting) {
        eventData.isOnlineMeeting = true;
        eventData.onlineMeetingProvider = 'teamsForBusiness';
      }

      // Set default timezone
      if (!eventData.start.timeZone) {
        eventData.start.timeZone = 'UTC';
      }
      if (!eventData.end.timeZone) {
        eventData.end.timeZone = 'UTC';
      }

      const endpoint = calendarId ? `/me/calendars/${calendarId}/events` : '/me/events';
      
      try {
        const response = await this.makeGraphAPIRequest(
          accessToken,
          endpoint,
          'POST',
          eventData
        );

        if (!response.id) {
          throw new Error('Event creation failed - no event ID returned');
        }

        let teamsLink: string | undefined;
        if (withTeamsMeeting && response.onlineMeeting?.joinUrl) {
          teamsLink = response.onlineMeeting.joinUrl;
        }

        await this.logSuccess(connection, 'create_event', {
          eventId: response.id,
          calendarId: calendarId || 'default',
          withTeamsMeeting,
          teamsLink
        });

        return {
          eventId: response.id,
          teamsLink,
          event: response
        };
      } catch (error: any) {
        if (error.message.includes('401')) {
          // Token expired, refresh and retry
          accessToken = await this.refreshAccessToken(connection);
          const response = await this.makeGraphAPIRequest(
            accessToken,
            endpoint,
            'POST',
            eventData
          );

          let teamsLink: string | undefined;
          if (withTeamsMeeting && response.onlineMeeting?.joinUrl) {
            teamsLink = response.onlineMeeting.joinUrl;
          }

          await this.logSuccess(connection, 'create_event', {
            eventId: response.id,
            calendarId: calendarId || 'default',
            withTeamsMeeting,
            teamsLink
          });

          return {
            eventId: response.id,
            teamsLink,
            event: response
          };
        }
        throw error;
      }
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
    eventData: Partial<GraphCalendarEvent>,
    calendarId?: string
  ): Promise<{ event: any }> {
    try {
      let accessToken = connection.accessToken;
      const endpoint = calendarId ? `/me/calendars/${calendarId}/events/${eventId}` : `/me/events/${eventId}`;
      
      try {
        const response = await this.makeGraphAPIRequest(
          accessToken,
          endpoint,
          'PATCH',
          eventData
        );

        await this.logSuccess(connection, 'update_event', {
          eventId,
          calendarId: calendarId || 'default'
        });

        return {
          event: response
        };
      } catch (error: any) {
        if (error.message.includes('401')) {
          // Token expired, refresh and retry
          accessToken = await this.refreshAccessToken(connection);
          const response = await this.makeGraphAPIRequest(
            accessToken,
            endpoint,
            'PATCH',
            eventData
          );

          await this.logSuccess(connection, 'update_event', {
            eventId,
            calendarId: calendarId || 'default'
          });

          return {
            event: response
          };
        }
        throw error;
      }
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
    calendarId?: string
  ): Promise<void> {
    try {
      let accessToken = connection.accessToken;
      const endpoint = calendarId ? `/me/calendars/${calendarId}/events/${eventId}` : `/me/events/${eventId}`;
      
      try {
        await this.makeGraphAPIRequest(
          accessToken,
          endpoint,
          'DELETE'
        );

        await this.logSuccess(connection, 'delete_event', {
          eventId,
          calendarId: calendarId || 'default'
        });
      } catch (error: any) {
        if (error.message.includes('401')) {
          // Token expired, refresh and retry
          accessToken = await this.refreshAccessToken(connection);
          await this.makeGraphAPIRequest(
            accessToken,
            endpoint,
            'DELETE'
          );

          await this.logSuccess(connection, 'delete_event', {
            eventId,
            calendarId: calendarId || 'default'
          });
        } else {
          throw error;
        }
      }
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
    calendarId?: string
  ): Promise<any> {
    try {
      let accessToken = connection.accessToken;
      const endpoint = calendarId ? `/me/calendars/${calendarId}/events/${eventId}` : `/me/events/${eventId}`;
      
      try {
        const response = await this.makeGraphAPIRequest(accessToken, endpoint);
        return response;
      } catch (error: any) {
        if (error.message.includes('401')) {
          // Token expired, refresh and retry
          accessToken = await this.refreshAccessToken(connection);
          const response = await this.makeGraphAPIRequest(accessToken, endpoint);
          return response;
        }
        throw error;
      }
    } catch (error) {
      await this.logError(connection, 'get_event', error);
      throw new Error(`Failed to get calendar event: ${error}`);
    }
  }

  /**
   * Create a Teams online meeting
   */
  async createOnlineMeeting(
    provider: VideoMeetingProvider,
    meetingData: Partial<GraphOnlineMeeting>
  ): Promise<{
    meetingId: string;
    joinUrl: string;
    conferenceId?: string;
    meetingData: any;
  }> {
    try {
      let accessToken = provider.accessToken;
      
      try {
        const response = await this.makeGraphAPIRequest(
          accessToken,
          '/me/onlineMeetings',
          'POST',
          meetingData
        );

        if (!response.id) {
          throw new Error('Online meeting creation failed - no meeting ID returned');
        }

        await this.logSuccess(provider, 'create_online_meeting', {
          meetingId: response.id,
          subject: response.subject
        });

        return {
          meetingId: response.id,
          joinUrl: response.joinWebUrl,
          conferenceId: response.videoTeleconferenceId,
          meetingData: response
        };
      } catch (error: any) {
        if (error.message.includes('401')) {
          // Token expired, refresh and retry
          accessToken = await this.refreshAccessToken(provider);
          const response = await this.makeGraphAPIRequest(
            accessToken,
            '/me/onlineMeetings',
            'POST',
            meetingData
          );

          await this.logSuccess(provider, 'create_online_meeting', {
            meetingId: response.id,
            subject: response.subject
          });

          return {
            meetingId: response.id,
            joinUrl: response.joinWebUrl,
            conferenceId: response.videoTeleconferenceId,
            meetingData: response
          };
        }
        throw error;
      }
    } catch (error) {
      await this.logError(provider, 'create_online_meeting', error);
      throw new Error(`Failed to create Teams meeting: ${error}`);
    }
  }

  /**
   * Sync an appointment to Outlook Calendar
   */
  async syncAppointmentToCalendar(
    connection: CalendarConnection,
    appointment: Appointment,
    eventTypeSettings: any = {},
    calendarId?: string
  ): Promise<ExternalCalendarEvent> {
    try {
      // Check if already synced
      const existingEvents = await storage.getAppointmentExternalEvents(appointment.id);
      const existingOutlookEvent = existingEvents.find(
        event => event.calendarConnectionId === connection.id
      );

      const eventData: GraphCalendarEvent = {
        subject: appointment.title || `Appointment with ${appointment.attendeeName}`,
        body: {
          contentType: 'text',
          content: this.formatAppointmentDescription(appointment, eventTypeSettings)
        },
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
        location: appointment.location ? {
          displayName: appointment.location
        } : undefined,
        attendees: [
          {
            emailAddress: {
              address: appointment.attendeeEmail,
              name: appointment.attendeeName
            },
            type: 'required'
          }
        ],
        reminderMinutesBeforeStart: 15,
        showAs: 'busy'
      };

      let result;
      let syncStatus = 'synced';

      if (existingOutlookEvent) {
        // Update existing event
        try {
          result = await this.updateEvent(
            connection,
            existingOutlookEvent.externalEventId,
            eventData,
            calendarId
          );
          
          // Update our record
          await storage.updateExternalCalendarEvent(existingOutlookEvent.id, {
            title: eventData.subject,
            description: eventData.body?.content,
            startTime: new Date(eventData.start.dateTime),
            endTime: new Date(eventData.end.dateTime),
            location: eventData.location?.displayName,
            attendees: eventData.attendees?.map(a => ({
              email: a.emailAddress.address,
              name: a.emailAddress.name
            })) || [],
            syncStatus,
            lastSyncAt: new Date()
          });

          return await storage.getExternalCalendarEvent(existingOutlookEvent.id) as ExternalCalendarEvent;
        } catch (error) {
          syncStatus = 'error';
          throw error;
        }
      } else {
        // Create new event
        try {
          const withTeamsMeeting = eventTypeSettings.includeTeamsMeeting || false;
          result = await this.createEvent(connection, eventData, calendarId, withTeamsMeeting);
          
          // Create our record
          const externalEvent = await storage.createExternalCalendarEvent({
            appointmentId: appointment.id,
            calendarConnectionId: connection.id,
            externalEventId: result.eventId,
            externalCalendarId: calendarId || 'default',
            title: eventData.subject,
            description: eventData.body?.content,
            startTime: new Date(eventData.start.dateTime),
            endTime: new Date(eventData.end.dateTime),
            location: eventData.location?.displayName,
            attendees: eventData.attendees?.map(a => ({
              email: a.emailAddress.address,
              name: a.emailAddress.name
            })) || [],
            syncStatus,
            lastSyncAt: new Date(),
            meetingUrl: result.teamsLink
          });

          return externalEvent;
        } catch (error) {
          syncStatus = 'error';
          throw error;
        }
      }
    } catch (error) {
      await this.logError(connection, 'sync_appointment', error);
      throw new Error(`Failed to sync appointment to Outlook calendar: ${error}`);
    }
  }

  /**
   * Create Teams meeting for appointment
   */
  async createMeetingForAppointment(
    provider: VideoMeetingProvider,
    appointment: Appointment,
    settings?: any
  ): Promise<MeetingLink> {
    try {
      const meetingData: Partial<GraphOnlineMeeting> = {
        subject: appointment.title || `Meeting with ${appointment.attendeeName}`,
        startDateTime: appointment.scheduledAt.toISOString(),
        endDateTime: new Date(
          appointment.scheduledAt.getTime() + (appointment.duration * 60000)
        ).toISOString(),
        participants: {
          attendees: [
            {
              identity: {
                user: {
                  displayName: appointment.attendeeName
                }
              }
            }
          ]
        },
        lobbyBypassSettings: {
          scope: settings?.allowEveryoneBypass ? 'everyone' : 'organization',
          isDialInBypassEnabled: true
        },
        allowedPresenters: settings?.allowedPresenters || 'organizer',
        allowMeetingChat: settings?.allowMeetingChat || 'enabled',
        allowTeamworkReactions: settings?.allowReactions !== false,
        recordAutomatically: settings?.recordAutomatically || false
      };

      const result = await this.createOnlineMeeting(provider, meetingData);

      // Store meeting link in database
      const meetingLink = await storage.createMeetingLink({
        appointmentId: appointment.id,
        videoMeetingProviderId: provider.id,
        externalMeetingId: result.meetingId,
        joinUrl: result.joinUrl,
        hostUrl: result.joinUrl, // Teams doesn't have separate host URL
        meetingId: result.conferenceId,
        hostEmail: provider.providerEmail,
        settings: settings || {},
        meetingStatus: 'created'
      });

      await this.logSuccess(provider, 'create_appointment_meeting', {
        appointmentId: appointment.id,
        meetingId: result.meetingId
      });

      return meetingLink;
    } catch (error) {
      await this.logError(provider, 'create_appointment_meeting', error);
      throw new Error(`Failed to create Teams meeting for appointment: ${error}`);
    }
  }

  /**
   * Validate connection
   */
  async validateConnection(provider: CalendarConnection | VideoMeetingProvider): Promise<boolean> {
    try {
      let accessToken = provider.accessToken;
      
      try {
        // Try to get user info to validate connection
        await this.makeGraphAPIRequest(accessToken, '/me');
        
        // Update provider status to connected
        if ('calendarConnectionId' in provider) {
          // This is a CalendarConnection
          await storage.updateCalendarConnection(provider.id, {
            status: 'connected',
            lastSyncAt: new Date()
          });
        } else {
          // This is a VideoMeetingProvider
          await storage.updateVideoMeetingProvider(provider.id, {
            status: 'connected',
            lastSyncAt: new Date()
          });
        }

        return true;
      } catch (error: any) {
        if (error.message.includes('401')) {
          // Try to refresh token
          accessToken = await this.refreshAccessToken(provider);
          await this.makeGraphAPIRequest(accessToken, '/me');
          
          // Update provider status to connected
          if ('calendarConnectionId' in provider) {
            await storage.updateCalendarConnection(provider.id, {
              status: 'connected',
              lastSyncAt: new Date()
            });
          } else {
            await storage.updateVideoMeetingProvider(provider.id, {
              status: 'connected',
              lastSyncAt: new Date()
            });
          }

          return true;
        }
        throw error;
      }
    } catch (error) {
      // Update provider status to error
      if ('calendarConnectionId' in provider) {
        await storage.updateCalendarConnection(provider.id, {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      } else {
        await storage.updateVideoMeetingProvider(provider.id, {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      await this.logError(provider, 'validate_connection', error);
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
    provider: CalendarConnection | VideoMeetingProvider,
    operation: string,
    details: any
  ): Promise<void> {
    try {
      const integrationType = 'calendarConnectionId' in provider ? 'calendar' : 'video_meeting';
      
      await storage.createIntegrationLog({
        userId: provider.userId,
        integrationType,
        provider: 'microsoft',
        operation,
        status: 'success',
        connectionId: provider.id,
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
    provider: CalendarConnection | VideoMeetingProvider,
    operation: string,
    error: any
  ): Promise<void> {
    try {
      const integrationType = 'calendarConnectionId' in provider ? 'calendar' : 'video_meeting';
      
      await storage.createIntegrationLog({
        userId: provider.userId,
        integrationType,
        provider: 'microsoft',
        operation,
        status: 'error',
        connectionId: provider.id,
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
export const microsoftGraphService = new MicrosoftGraphService();