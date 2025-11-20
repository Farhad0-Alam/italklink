import type { Express } from "express";
import { google } from 'googleapis';
import { storage } from './storage';
import { z } from 'zod';
import crypto from 'crypto';

// Validation schemas for webhook payloads
const googleWebhookSchema = z.object({
  kind: z.string(),
  id: z.string().optional(),
  resourceId: z.string().optional(),
  resourceUri: z.string().optional(),
  token: z.string().optional(),
  expiration: z.string().optional(),
});

const zoomWebhookSchema = z.object({
  event: z.string(),
  payload: z.object({
    account_id: z.string(),
    object: z.object({
      id: z.string().optional(),
      uuid: z.string().optional(),
      start_time: z.string().optional(),
    }).optional(),
  }),
});

const microsoftWebhookSchema = z.object({
  subscriptionId: z.string(),
  changeType: z.string(),
  resource: z.string(),
  clientState: z.string().optional(),
});

// Background sync worker
export class CalendarSyncWorker {
  private isRunning = false;
  private syncInterval = 5 * 60 * 1000; // 5 minutes

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('Calendar sync worker started');
    this.scheduleNextSync();
  }

  stop() {
    this.isRunning = false;
    console.log('Calendar sync worker stopped');
  }

  private scheduleNextSync() {
    if (!this.isRunning) return;
    
    setTimeout(async () => {
      try {
        await this.performSync();
      } catch (error) {
        console.error('Calendar sync error:', error);
        // Don't try to log errors to database during sync to prevent crashes
      }
      
      this.scheduleNextSync();
    }, this.syncInterval);
  }

  private async performSync() {
    // Calendar sync temporarily disabled - requires database schema migration
    // Run: npm run db:push to sync integration_logs table schema
    return;
    
    console.log('Performing calendar sync...');
    
    // Get all active calendar connections
    const connections = await storage.getIntegrationLogs({
      integrationType: 'calendar',
      status: 'success',
      limit: 100
    });

    // Sync Google Calendar connections
    await this.syncGoogleCalendars();
    
    // Sync Microsoft calendar connections  
    await this.syncMicrosoftCalendars();
    
    console.log('Calendar sync completed');
  }

  private async syncGoogleCalendars() {
    try {
      // Get Google calendar connections
      const googleConnections = await storage.getIntegrationLogs({
        integrationType: 'calendar',
        provider: 'google',
        limit: 50
      });

      for (const connection of googleConnections) {
        if (!connection.userId) continue;
        
        const calendarConnection = await storage.getCalendarConnectionByProvider(
          connection.userId, 
          'google'
        );
        
        if (!calendarConnection || calendarConnection.status !== 'connected') continue;

        await this.syncGoogleCalendarEvents(calendarConnection);
      }
    } catch (error) {
      console.error('Google Calendar sync error:', error);
    }
  }

  private async syncGoogleCalendarEvents(connection: any) {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      // Get events from the last 24 hours
      const timeMin = new Date();
      timeMin.setHours(timeMin.getHours() - 24);
      
      const timeMax = new Date();
      timeMax.setHours(timeMax.getHours() + 24);

      const response = await calendar.events.list({
        calendarId: connection.calendarId || 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 100
      });

      const events = response.data.items || [];

      for (const event of events) {
        if (!event.id) continue;

        // Check if we have this event in our system
        const existingEvent = await storage.getExternalCalendarEventByExternalId(
          event.id,
          connection.id
        );

        if (existingEvent) {
          // Update existing event
          await storage.updateExternalCalendarEvent(existingEvent.id, {
            title: event.summary || '',
            description: event.description || '',
            startTime: event.start?.dateTime || event.start?.date || '',
            endTime: event.end?.dateTime || event.end?.date || '',
            location: event.location || '',
            status: event.status || 'confirmed'
          });
        } else {
          // Create new event record
          await storage.createExternalCalendarEvent({
            calendarConnectionId: connection.id,
            externalEventId: event.id,
            title: event.summary || '',
            description: event.description || '',
            startTime: event.start?.dateTime || event.start?.date || '',
            endTime: event.end?.dateTime || event.end?.date || '',
            location: event.location || '',
            status: event.status || 'confirmed',
            organizer: event.organizer?.email || '',
            attendees: event.attendees?.map(a => ({
              email: a.email || '',
              name: a.displayName || '',
              status: a.responseStatus || 'needsAction'
            })) || []
          });
        }
      }

      await storage.createIntegrationLog({
        userId: connection.userId,
        integrationType: 'calendar',
        provider: 'google',
        operation: 'sync_events',
        status: 'success',
        details: { 
          eventsProcessed: events.length,
          calendarId: connection.calendarId
        }
      });

    } catch (error) {
      console.error('Google Calendar events sync error:', error);
      
      await storage.createIntegrationLog({
        userId: connection.userId,
        integrationType: 'calendar',
        provider: 'google',
        operation: 'sync_events',
        status: 'error',
        details: { 
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  private async syncMicrosoftCalendars() {
    try {
      // Get Microsoft calendar connections
      const microsoftConnections = await storage.getIntegrationLogs({
        integrationType: 'calendar',
        provider: 'microsoft',
        limit: 50
      });

      for (const connection of microsoftConnections) {
        if (!connection.userId) continue;
        
        const calendarConnection = await storage.getCalendarConnectionByProvider(
          connection.userId, 
          'outlook'
        );
        
        if (!calendarConnection || calendarConnection.status !== 'connected') continue;

        await this.syncMicrosoftCalendarEvents(calendarConnection);
      }
    } catch (error) {
      console.error('Microsoft Calendar sync error:', error);
    }
  }

  private async syncMicrosoftCalendarEvents(connection: any) {
    try {
      // Get events from Microsoft Graph API
      const timeMin = new Date();
      timeMin.setHours(timeMin.getHours() - 24);
      
      const timeMax = new Date();
      timeMax.setHours(timeMax.getHours() + 24);

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/events?$filter=start/dateTime ge '${timeMin.toISOString()}' and end/dateTime le '${timeMax.toISOString()}'&$top=100`,
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

      for (const event of events) {
        if (!event.id) continue;

        // Check if we have this event in our system
        const existingEvent = await storage.getExternalCalendarEventByExternalId(
          event.id,
          connection.id
        );

        if (existingEvent) {
          // Update existing event
          await storage.updateExternalCalendarEvent(existingEvent.id, {
            title: event.subject || '',
            description: event.bodyPreview || '',
            startTime: event.start?.dateTime || '',
            endTime: event.end?.dateTime || '',
            location: event.location?.displayName || '',
            status: event.isCancelled ? 'cancelled' : 'confirmed'
          });
        } else {
          // Create new event record
          await storage.createExternalCalendarEvent({
            calendarConnectionId: connection.id,
            externalEventId: event.id,
            title: event.subject || '',
            description: event.bodyPreview || '',
            startTime: event.start?.dateTime || '',
            endTime: event.end?.dateTime || '',
            location: event.location?.displayName || '',
            status: event.isCancelled ? 'cancelled' : 'confirmed',
            organizer: event.organizer?.emailAddress?.address || '',
            attendees: event.attendees?.map((a: any) => ({
              email: a.emailAddress?.address || '',
              name: a.emailAddress?.name || '',
              status: a.status?.response || 'none'
            })) || []
          });
        }
      }

      await storage.createIntegrationLog({
        userId: connection.userId,
        integrationType: 'calendar',
        provider: 'microsoft',
        operation: 'sync_events',
        status: 'success',
        details: { 
          eventsProcessed: events.length
        }
      });

    } catch (error) {
      console.error('Microsoft Calendar events sync error:', error);
      
      await storage.createIntegrationLog({
        userId: connection.userId,
        integrationType: 'calendar',
        provider: 'microsoft',
        operation: 'sync_events',
        status: 'error',
        details: { 
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }
}

// Create global sync worker instance
export const calendarSyncWorker = new CalendarSyncWorker();

export function setupWebhookRoutes(app: Express) {
  // Google Calendar webhook endpoint
  app.post('/api/webhooks/google/calendar', async (req, res) => {
    try {
      const payload = googleWebhookSchema.parse(req.body);
      
      console.log('Google Calendar webhook received:', payload);

      // Verify webhook authenticity
      const channelId = req.headers['x-goog-channel-id'] as string;
      const resourceState = req.headers['x-goog-resource-state'] as string;
      
      if (!channelId || !resourceState) {
        return res.status(400).json({ message: 'Missing required headers' });
      }

      // Handle different resource states
      switch (resourceState) {
        case 'sync':
          // Initial sync - just acknowledge
          break;
          
        case 'exists':
          // Calendar event changed - trigger sync
          if (payload.resourceId) {
            await calendarSyncWorker.performSync();
          }
          break;
          
        case 'not_exists':
          // Event deleted - handle deletion
          break;
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Google Calendar webhook error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  // Zoom webhook endpoint
  app.post('/api/webhooks/zoom', async (req, res) => {
    try {
      // Verify Zoom webhook
      const signature = req.headers['authorization'] as string;
      if (process.env.ZOOM_WEBHOOK_SECRET) {
        const computedSignature = crypto
          .createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET)
          .update(JSON.stringify(req.body))
          .digest('hex');
        
        if (signature !== `v0=${computedSignature}`) {
          return res.status(401).json({ message: 'Invalid signature' });
        }
      }

      const payload = zoomWebhookSchema.parse(req.body);
      
      console.log('Zoom webhook received:', payload);

      // Handle different Zoom events
      switch (payload.event) {
        case 'meeting.created':
        case 'meeting.updated':
        case 'meeting.deleted':
          // Handle meeting changes
          await storage.createIntegrationLog({
            userId: 'system',
            integrationType: 'video_meeting',
            provider: 'zoom',
            operation: 'webhook_received',
            status: 'success',
            details: payload
          });
          break;
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Zoom webhook error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  // Microsoft Graph webhook endpoint
  app.post('/api/webhooks/microsoft', async (req, res) => {
    try {
      // Handle Microsoft Graph webhook validation
      const validationToken = req.query.validationToken as string;
      if (validationToken) {
        return res.status(200).send(validationToken);
      }

      const payload = microsoftWebhookSchema.parse(req.body);
      
      console.log('Microsoft webhook received:', payload);

      // Handle different change types
      switch (payload.changeType) {
        case 'created':
        case 'updated':
        case 'deleted':
          // Trigger sync for affected calendar
          await calendarSyncWorker.performSync();
          break;
      }

      await storage.createIntegrationLog({
        userId: 'system',
        integrationType: 'calendar',
        provider: 'microsoft',
        operation: 'webhook_received',
        status: 'success',
        details: payload
      });

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Microsoft webhook error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  // Manual sync endpoint for debugging
  app.post('/api/webhooks/sync/manual', async (req, res) => {
    try {
      await calendarSyncWorker.performSync();
      res.json({ message: 'Manual sync triggered' });
    } catch (error) {
      console.error('Manual sync error:', error);
      res.status(500).json({ message: 'Manual sync failed' });
    }
  });

  // Webhook health check
  app.get('/api/webhooks/health', (req, res) => {
    res.json({ 
      status: 'healthy',
      syncWorkerRunning: calendarSyncWorker.isRunning,
      timestamp: new Date().toISOString()
    });
  });
}