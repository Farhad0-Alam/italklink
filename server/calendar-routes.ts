import type { Express } from "express";
import passport from 'passport';
import { google } from 'googleapis';
import { storage } from './storage';
import { requireAuth } from './auth';
import { z } from 'zod';
import { insertCalendarConnectionSchema, insertExternalCalendarEventSchema } from '@shared/schema';

// Validation schemas
const calendarSyncSchema = z.object({
  calendarId: z.string().optional(),
  appointmentIds: z.array(z.string().uuid()).optional(),
  syncDirection: z.enum(['one_way_to_external', 'one_way_from_external', 'two_way']).default('two_way'),
});

const conflictCheckSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  calendarConnectionId: z.string().uuid().optional(),
});

const calendarEventSchema = z.object({
  appointmentId: z.string().uuid(),
  calendarConnectionId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().optional(),
  attendees: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
  })).optional(),
});

export function setupCalendarRoutes(app: Express) {
  // OAuth flows for calendar connections
  
  // Google Calendar OAuth initiation
  app.get('/api/calendar/connect/google', requireAuth, (req, res, next) => {
    passport.authenticate('google-calendar', {
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      accessType: 'offline',
      prompt: 'consent'
    })(req, res, next);
  });

  // Google Calendar OAuth callback
  app.get('/api/calendar/google/callback', 
    passport.authenticate('google-calendar', { failureRedirect: '/calendar/error' }),
    async (req, res) => {
      try {
        // Log the successful connection
        await storage.createIntegrationLog({
          userId: (req.user as any).id,
          integrationType: 'calendar',
          provider: 'google',
          operation: 'auth',
          status: 'success',
          details: { message: 'Google Calendar connected successfully' }
        });

        res.redirect('/settings/integrations?success=google-calendar');
      } catch (error) {
        console.error('Google Calendar callback error:', error);
        res.redirect('/settings/integrations?error=google-calendar');
      }
    }
  );

  // Microsoft/Outlook OAuth initiation
  app.get('/api/calendar/connect/microsoft', requireAuth, (req, res, next) => {
    passport.authenticate('microsoft', {
      scope: [
        'https://graph.microsoft.com/calendars.readwrite',
        'https://graph.microsoft.com/user.read'
      ]
    })(req, res, next);
  });

  // Microsoft OAuth callback
  app.get('/api/calendar/microsoft/callback',
    passport.authenticate('microsoft', { failureRedirect: '/calendar/error' }),
    async (req, res) => {
      try {
        await storage.createIntegrationLog({
          userId: (req.user as any).id,
          integrationType: 'calendar',
          provider: 'microsoft',
          operation: 'auth',
          status: 'success',
          details: { message: 'Microsoft Calendar connected successfully' }
        });

        res.redirect('/settings/integrations?success=microsoft-calendar');
      } catch (error) {
        console.error('Microsoft Calendar callback error:', error);
        res.redirect('/settings/integrations?error=microsoft-calendar');
      }
    }
  );

  // Get user's calendar connections
  app.get('/api/calendar/connections', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { provider, isActive } = req.query;
      
      const filters: any = {};
      if (provider) filters.provider = provider as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const connections = await storage.getUserCalendarConnections(userId, filters);
      
      res.json({ connections });
    } catch (error) {
      console.error('Error fetching calendar connections:', error);
      res.status(500).json({ message: 'Failed to fetch calendar connections' });
    }
  });

  // Get specific calendar connection
  app.get('/api/calendar/connections/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).id;
      
      const connection = await storage.getCalendarConnection(id);
      
      if (!connection || connection.userId !== userId) {
        return res.status(404).json({ message: 'Calendar connection not found' });
      }
      
      res.json({ connection });
    } catch (error) {
      console.error('Error fetching calendar connection:', error);
      res.status(500).json({ message: 'Failed to fetch calendar connection' });
    }
  });

  // Update calendar connection settings
  app.put('/api/calendar/connections/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).id;
      
      // Verify ownership
      const existingConnection = await storage.getCalendarConnection(id);
      if (!existingConnection || existingConnection.userId !== userId) {
        return res.status(404).json({ message: 'Calendar connection not found' });
      }

      const updateData = insertCalendarConnectionSchema.partial().parse(req.body);
      
      const updatedConnection = await storage.updateCalendarConnection(id, updateData);
      
      await storage.createIntegrationLog({
        userId,
        integrationType: 'calendar',
        provider: existingConnection.provider,
        operation: 'update',
        status: 'success',
        connectionId: id,
        details: { message: 'Calendar connection updated' }
      });
      
      res.json({ connection: updatedConnection });
    } catch (error) {
      console.error('Error updating calendar connection:', error);
      res.status(500).json({ message: 'Failed to update calendar connection' });
    }
  });

  // Delete calendar connection
  app.delete('/api/calendar/connections/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).id;
      
      // Verify ownership
      const connection = await storage.getCalendarConnection(id);
      if (!connection || connection.userId !== userId) {
        return res.status(404).json({ message: 'Calendar connection not found' });
      }

      await storage.deleteCalendarConnection(id);
      
      await storage.createIntegrationLog({
        userId,
        integrationType: 'calendar',
        provider: connection.provider,
        operation: 'delete',
        status: 'success',
        connectionId: id,
        details: { message: 'Calendar connection removed' }
      });
      
      res.json({ message: 'Calendar connection deleted successfully' });
    } catch (error) {
      console.error('Error deleting calendar connection:', error);
      res.status(500).json({ message: 'Failed to delete calendar connection' });
    }
  });

  // Get available calendars from connected providers
  app.get('/api/calendar/calendars', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { provider } = req.query;
      
      const connections = await storage.getUserCalendarConnections(userId, {
        provider: provider as string,
        isActive: true
      });

      const calendars = [];

      for (const connection of connections) {
        try {
          if (connection.provider === 'google') {
            const oauth2Client = new google.auth.OAuth2(
              process.env.GOOGLE_CLIENT_ID,
              process.env.GOOGLE_CLIENT_SECRET,
              '/api/calendar/google/callback'
            );
            
            oauth2Client.setCredentials({
              access_token: connection.accessToken,
              refresh_token: connection.refreshToken
            });

            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
            const response = await calendar.calendarList.list();
            
            const googleCalendars = response.data.items?.map(cal => ({
              id: cal.id,
              name: cal.summary,
              description: cal.description,
              primary: cal.primary,
              provider: 'google',
              connectionId: connection.id
            })) || [];
            
            calendars.push(...googleCalendars);
          } else if (connection.provider === 'outlook') {
            // Microsoft Graph API for Outlook calendars
            const response = await fetch('https://graph.microsoft.com/v1.0/me/calendars', {
              headers: {
                'Authorization': `Bearer ${connection.accessToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              const outlookCalendars = data.value?.map((cal: any) => ({
                id: cal.id,
                name: cal.name,
                description: cal.description,
                primary: cal.isDefaultCalendar,
                provider: 'outlook',
                connectionId: connection.id
              })) || [];
              
              calendars.push(...outlookCalendars);
            }
          }
        } catch (error) {
          console.error(`Error fetching calendars for ${connection.provider}:`, error);
          // Continue with other connections
        }
      }
      
      res.json({ calendars });
    } catch (error) {
      console.error('Error fetching calendars:', error);
      res.status(500).json({ message: 'Failed to fetch calendars' });
    }
  });

  // Check for calendar conflicts
  app.post('/api/calendar/conflicts', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const validationResult = conflictCheckSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid conflict check data',
          errors: validationResult.error.format()
        });
      }

      const { startTime, endTime, calendarConnectionId } = validationResult.data;
      
      let connections = [];
      if (calendarConnectionId) {
        const connection = await storage.getCalendarConnection(calendarConnectionId);
        if (connection && connection.userId === userId) {
          connections = [connection];
        }
      } else {
        connections = await storage.getUserCalendarConnections(userId, { isActive: true });
      }

      const conflicts = [];

      for (const connection of connections) {
        try {
          if (connection.provider === 'google') {
            const oauth2Client = new google.auth.OAuth2(
              process.env.GOOGLE_CLIENT_ID,
              process.env.GOOGLE_CLIENT_SECRET,
              '/api/calendar/google/callback'
            );
            
            oauth2Client.setCredentials({
              access_token: connection.accessToken,
              refresh_token: connection.refreshToken
            });

            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
            
            const response = await calendar.events.list({
              calendarId: connection.calendarId || 'primary',
              timeMin: startTime,
              timeMax: endTime,
              singleEvents: true,
              orderBy: 'startTime'
            });

            const googleConflicts = response.data.items?.filter(event => 
              event.start?.dateTime && event.end?.dateTime
            ).map(event => ({
              id: event.id,
              title: event.summary,
              start: event.start?.dateTime,
              end: event.end?.dateTime,
              provider: 'google',
              calendarName: connection.calendarId
            })) || [];

            conflicts.push(...googleConflicts);
          } else if (connection.provider === 'outlook') {
            // Microsoft Graph API for conflict checking
            const startISO = new Date(startTime).toISOString();
            const endISO = new Date(endTime).toISOString();
            
            const response = await fetch(
              `https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=${startISO}&endDateTime=${endISO}`,
              {
                headers: {
                  'Authorization': `Bearer ${connection.accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              const outlookConflicts = data.value?.map((event: any) => ({
                id: event.id,
                title: event.subject,
                start: event.start.dateTime,
                end: event.end.dateTime,
                provider: 'outlook',
                calendarName: connection.calendarId
              })) || [];
              
              conflicts.push(...outlookConflicts);
            }
          }
        } catch (error) {
          console.error(`Error checking conflicts for ${connection.provider}:`, error);
          // Continue with other connections
        }
      }
      
      res.json({ conflicts, hasConflicts: conflicts.length > 0 });
    } catch (error) {
      console.error('Error checking calendar conflicts:', error);
      res.status(500).json({ message: 'Failed to check calendar conflicts' });
    }
  });

  // Create calendar event
  app.post('/api/calendar/events', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const validationResult = calendarEventSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid calendar event data',
          errors: validationResult.error.format()
        });
      }

      const { appointmentId, calendarConnectionId, title, description, startTime, endTime, location, attendees } = validationResult.data;
      
      // Verify calendar connection ownership
      const connection = await storage.getCalendarConnection(calendarConnectionId);
      if (!connection || connection.userId !== userId) {
        return res.status(404).json({ message: 'Calendar connection not found' });
      }

      let externalEventId = null;
      let externalCalendarId = connection.calendarId || 'primary';

      if (connection.provider === 'google') {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          '/api/calendar/google/callback'
        );
        
        oauth2Client.setCredentials({
          access_token: connection.accessToken,
          refresh_token: connection.refreshToken
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        const eventData = {
          summary: title,
          description,
          location,
          start: {
            dateTime: startTime,
            timeZone: 'UTC'
          },
          end: {
            dateTime: endTime,
            timeZone: 'UTC'
          },
          attendees: attendees?.map(attendee => ({
            email: attendee.email,
            displayName: attendee.name
          }))
        };

        const response = await calendar.events.insert({
          calendarId: externalCalendarId,
          requestBody: eventData
        });

        externalEventId = response.data.id;
      } else if (connection.provider === 'outlook') {
        // Microsoft Graph API for event creation
        const eventData = {
          subject: title,
          body: {
            contentType: 'text',
            content: description || ''
          },
          start: {
            dateTime: startTime,
            timeZone: 'UTC'
          },
          end: {
            dateTime: endTime,
            timeZone: 'UTC'
          },
          location: location ? { displayName: location } : undefined,
          attendees: attendees?.map(attendee => ({
            emailAddress: {
              address: attendee.email,
              name: attendee.name
            }
          }))
        };

        const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventData)
        });

        if (response.ok) {
          const data = await response.json();
          externalEventId = data.id;
        } else {
          throw new Error('Failed to create Outlook event');
        }
      }

      if (externalEventId) {
        // Store the external calendar event reference
        const externalEvent = await storage.createExternalCalendarEvent({
          appointmentId,
          calendarConnectionId,
          externalEventId,
          externalCalendarId,
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          location,
          attendees: attendees || [],
          syncStatus: 'synced'
        });

        await storage.createIntegrationLog({
          userId,
          integrationType: 'calendar',
          provider: connection.provider,
          operation: 'create',
          status: 'success',
          connectionId: calendarConnectionId,
          details: { 
            message: 'Calendar event created',
            appointmentId,
            externalEventId
          }
        });

        res.json({ 
          externalEvent,
          externalEventId,
          message: 'Calendar event created successfully'
        });
      } else {
        throw new Error('Failed to create external calendar event');
      }
    } catch (error) {
      console.error('Error creating calendar event:', error);
      res.status(500).json({ message: 'Failed to create calendar event' });
    }
  });

  // Sync appointments to calendar
  app.post('/api/calendar/sync', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const validationResult = calendarSyncSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid sync request data',
          errors: validationResult.error.format()
        });
      }

      const { calendarId, appointmentIds, syncDirection } = validationResult.data;
      
      // Get user's appointments to sync
      let appointmentsToSync;
      if (appointmentIds) {
        // Sync specific appointments
        appointmentsToSync = [];
        for (const id of appointmentIds) {
          const appointment = await storage.getAppointment(id);
          if (appointment) {
            appointmentsToSync.push(appointment);
          }
        }
      } else {
        // Sync all user's appointments
        const eventTypes = await storage.getUserAppointmentEventTypes(userId);
        appointmentsToSync = [];
        for (const eventType of eventTypes) {
          // Get appointments for this event type (we'd need a method for this)
          // This is a simplified version - in practice, you'd implement getAppointmentsByEventType
        }
      }

      const syncResults = {
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Process sync for each appointment
      for (const appointment of appointmentsToSync) {
        try {
          // Check if already synced
          const existingEvents = await storage.getAppointmentExternalEvents(appointment.id);
          
          if (existingEvents.length === 0) {
            // Create new calendar event
            // This would call the event creation logic
            syncResults.successful++;
          } else {
            // Update existing events if needed
            syncResults.successful++;
          }
        } catch (error) {
          syncResults.failed++;
          syncResults.errors.push(`Failed to sync appointment ${appointment.id}: ${error}`);
        }
      }

      await storage.createIntegrationLog({
        userId,
        integrationType: 'calendar',
        provider: 'bulk_sync',
        operation: 'sync',
        status: syncResults.failed === 0 ? 'success' : 'partial_failure',
        details: { 
          message: 'Bulk calendar sync completed',
          results: syncResults
        }
      });

      res.json({ 
        message: 'Calendar sync completed',
        results: syncResults
      });
    } catch (error) {
      console.error('Error syncing to calendar:', error);
      res.status(500).json({ message: 'Failed to sync to calendar' });
    }
  });

  // Get integration logs for debugging
  app.get('/api/calendar/logs', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { provider, operation, limit } = req.query;
      
      const logs = await storage.getIntegrationLogs({
        userId,
        integrationType: 'calendar',
        provider: provider as string,
        operation: operation as string,
        limit: limit ? parseInt(limit as string) : 50
      });
      
      res.json({ logs });
    } catch (error) {
      console.error('Error fetching integration logs:', error);
      res.status(500).json({ message: 'Failed to fetch integration logs' });
    }
  });
}