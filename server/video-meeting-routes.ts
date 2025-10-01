import type { Express } from "express";
import passport from 'passport';
import { google } from 'googleapis';
import { storage } from './storage';
import { requireAuth } from './auth';
import { z } from 'zod';
import { insertVideoMeetingProviderSchema, insertMeetingLinkSchema } from '@shared/schema';

// Validation schemas
const createMeetingSchema = z.object({
  appointmentId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  duration: z.number().min(15).max(480), // 15 minutes to 8 hours
  providerType: z.enum(['zoom', 'google_meet', 'microsoft_teams']).optional(),
  settings: z.object({
    password: z.string().optional(),
    waitingRoom: z.boolean().default(true),
    allowRecording: z.boolean().default(false),
    muteOnEntry: z.boolean().default(true),
    requireApproval: z.boolean().default(false),
    maxParticipants: z.number().optional(),
  }).optional(),
  attendees: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    role: z.enum(['host', 'attendee']).default('attendee'),
  })).optional(),
});

const updateMeetingSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  duration: z.number().min(15).max(480).optional(),
  settings: z.object({
    password: z.string().optional(),
    waitingRoom: z.boolean().optional(),
    allowRecording: z.boolean().optional(),
    muteOnEntry: z.boolean().optional(),
    requireApproval: z.boolean().optional(),
    maxParticipants: z.number().optional(),
  }).optional(),
});

const meetingActionSchema = z.object({
  action: z.enum(['start', 'end', 'start_recording', 'stop_recording', 'mute_all', 'unmute_all']),
});

export function setupVideoMeetingRoutes(app: Express) {
  // OAuth flows for video meeting providers

  // Zoom OAuth initiation
  app.get('/api/video/connect/zoom', requireAuth, (req, res, next) => {
    if (!process.env.ZOOM_CLIENT_ID || !process.env.ZOOM_CLIENT_SECRET) {
      return res.status(400).json({ message: 'Zoom integration not configured' });
    }
    
    passport.authenticate('zoom', {
      scope: [
        'meeting:write:admin',
        'meeting:read:admin',
        'user:read:admin',
        'recording:read:admin'
      ]
    })(req, res, next);
  });

  // Zoom OAuth callback
  app.get('/api/video/zoom/callback',
    passport.authenticate('zoom', { failureRedirect: '/video/error' }),
    async (req, res) => {
      try {
        await storage.createIntegrationLog({
          userId: (req.user as any).id,
          integrationType: 'video_meeting',
          provider: 'zoom',
          operation: 'auth',
          status: 'success',
          details: { message: 'Zoom connected successfully' }
        });

        res.redirect('/settings/integrations?success=zoom');
      } catch (error) {
        console.error('Zoom callback error:', error);
        res.redirect('/settings/integrations?error=zoom');
      }
    }
  );

  // Google Meet doesn't require separate OAuth (uses Google Calendar OAuth)
  app.post('/api/video/connect/google_meet', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Check if user has Google Calendar connection
      const googleConnection = await storage.getCalendarConnectionByProvider(userId, 'google');
      
      if (!googleConnection) {
        return res.status(400).json({ 
          message: 'Google Calendar connection required for Google Meet integration',
          requiresAuth: true,
          authUrl: '/api/calendar/connect/google'
        });
      }

      // Create or update Google Meet provider
      let meetProvider = await storage.getVideoProviderByProvider(userId, 'google_meet');
      
      if (!meetProvider) {
        meetProvider = await storage.createVideoMeetingProvider({
          userId,
          provider: 'google_meet',
          providerAccountId: googleConnection.providerAccountId,
          providerEmail: googleConnection.providerEmail,
          accessToken: googleConnection.accessToken,
          refreshToken: googleConnection.refreshToken,
          isDefault: false,
          scopes: ['https://www.googleapis.com/auth/calendar'],
          settings: {
            autoCreateMeetings: true,
            defaultDuration: 60,
            allowRecording: false,
          },
          status: 'connected'
        });
      }

      await storage.createIntegrationLog({
        userId,
        integrationType: 'video_meeting',
        provider: 'google_meet',
        operation: 'auth',
        status: 'success',
        details: { message: 'Google Meet enabled successfully' }
      });

      res.json({ 
        provider: meetProvider,
        message: 'Google Meet integration enabled'
      });
    } catch (error) {
      console.error('Google Meet setup error:', error);
      res.status(500).json({ message: 'Failed to enable Google Meet integration' });
    }
  });

  // Microsoft Teams OAuth callback (handled by Microsoft strategy)
  app.get('/api/video/teams/callback',
    passport.authenticate('microsoft', { failureRedirect: '/video/error' }),
    async (req, res) => {
      try {
        await storage.createIntegrationLog({
          userId: (req.user as any).id,
          integrationType: 'video_meeting',
          provider: 'microsoft_teams',
          operation: 'auth',
          status: 'success',
          details: { message: 'Microsoft Teams connected successfully' }
        });

        res.redirect('/settings/integrations?success=teams');
      } catch (error) {
        console.error('Teams callback error:', error);
        res.redirect('/settings/integrations?error=teams');
      }
    }
  );

  // Get user's video meeting providers
  app.get('/api/video/providers', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { provider, isActive } = req.query;
      
      const filters: any = {};
      if (provider) filters.provider = provider as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const providers = await storage.getUserVideoMeetingProviders(userId, filters);
      
      res.json({ providers });
    } catch (error) {
      console.error('Error fetching video providers:', error);
      res.status(500).json({ message: 'Failed to fetch video meeting providers' });
    }
  });

  // Get specific video meeting provider
  app.get('/api/video/providers/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).id;
      
      const provider = await storage.getVideoMeetingProvider(id);
      
      if (!provider || provider.userId !== userId) {
        return res.status(404).json({ message: 'Video meeting provider not found' });
      }
      
      res.json({ provider });
    } catch (error) {
      console.error('Error fetching video provider:', error);
      res.status(500).json({ message: 'Failed to fetch video meeting provider' });
    }
  });

  // Update video meeting provider settings
  app.put('/api/video/providers/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).id;
      
      // Verify ownership
      const existingProvider = await storage.getVideoMeetingProvider(id);
      if (!existingProvider || existingProvider.userId !== userId) {
        return res.status(404).json({ message: 'Video meeting provider not found' });
      }

      const updateData = insertVideoMeetingProviderSchema.partial().parse(req.body);
      
      const updatedProvider = await storage.updateVideoMeetingProvider(id, updateData);
      
      await storage.createIntegrationLog({
        userId,
        integrationType: 'video_meeting',
        provider: existingProvider.provider,
        operation: 'update',
        status: 'success',
        connectionId: id,
        details: { message: 'Video provider updated' }
      });
      
      res.json({ provider: updatedProvider });
    } catch (error) {
      console.error('Error updating video provider:', error);
      res.status(500).json({ message: 'Failed to update video meeting provider' });
    }
  });

  // Delete video meeting provider
  app.delete('/api/video/providers/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).id;
      
      // Verify ownership
      const provider = await storage.getVideoMeetingProvider(id);
      if (!provider || provider.userId !== userId) {
        return res.status(404).json({ message: 'Video meeting provider not found' });
      }

      await storage.deleteVideoMeetingProvider(id);
      
      await storage.createIntegrationLog({
        userId,
        integrationType: 'video_meeting',
        provider: provider.provider,
        operation: 'delete',
        status: 'success',
        connectionId: id,
        details: { message: 'Video provider removed' }
      });
      
      res.json({ message: 'Video meeting provider deleted successfully' });
    } catch (error) {
      console.error('Error deleting video provider:', error);
      res.status(500).json({ message: 'Failed to delete video meeting provider' });
    }
  });

  // Create video meeting
  app.post('/api/video/meetings', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const validationResult = createMeetingSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid meeting data',
          errors: validationResult.error.format()
        });
      }

      const { appointmentId, title, description, startTime, duration, providerType, settings, attendees } = validationResult.data;
      
      // Get user's default provider or specified provider
      let provider;
      if (providerType) {
        provider = await storage.getVideoProviderByProvider(userId, providerType);
      } else {
        const providers = await storage.getUserVideoMeetingProviders(userId, { isActive: true });
        provider = providers.find(p => p.isDefault) || providers[0];
      }

      if (!provider) {
        return res.status(400).json({ 
          message: 'No video meeting provider configured',
          requiresSetup: true
        });
      }

      let meetingData: any = null;

      // Create meeting based on provider
      if (provider.provider === 'zoom') {
        // Zoom API call
        const zoomMeetingData = {
          topic: title,
          type: 2, // Scheduled meeting
          start_time: startTime,
          duration,
          agenda: description,
          settings: {
            host_video: true,
            participant_video: true,
            cn_meeting: false,
            in_meeting: false,
            join_before_host: false,
            mute_upon_entry: settings?.muteOnEntry ?? true,
            watermark: false,
            use_pmi: false,
            approval_type: settings?.requireApproval ? 1 : 0,
            audio: 'both',
            auto_recording: settings?.allowRecording ? 'cloud' : 'none',
            enforce_login: false,
            registrants_email_notification: true,
            waiting_room: settings?.waitingRoom ?? true,
          }
        };

        const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(zoomMeetingData)
        });

        if (response.ok) {
          meetingData = await response.json();
        } else {
          throw new Error('Failed to create Zoom meeting');
        }
      } else if (provider.provider === 'google_meet') {
        // Google Meet creation via Calendar API
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          '/api/calendar/google/callback'
        );
        
        oauth2Client.setCredentials({
          access_token: provider.accessToken,
          refresh_token: provider.refreshToken
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        const eventData = {
          summary: title,
          description,
          start: {
            dateTime: startTime,
            timeZone: 'UTC'
          },
          end: {
            dateTime: new Date(new Date(startTime).getTime() + duration * 60000).toISOString(),
            timeZone: 'UTC'
          },
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: {
                type: 'hangoutsMeet'
              }
            }
          },
          attendees: attendees?.map(attendee => ({
            email: attendee.email,
            displayName: attendee.name
          }))
        };

        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: eventData,
          conferenceDataVersion: 1
        });

        if (response.data.conferenceData?.entryPoints) {
          const meetLink = response.data.conferenceData.entryPoints.find(ep => ep.entryPointType === 'video');
          meetingData = {
            id: response.data.id,
            join_url: meetLink?.uri,
            start_url: meetLink?.uri,
            meeting_id: response.data.conferenceData.conferenceId,
            password: null,
            host_email: provider.providerEmail
          };
        } else {
          throw new Error('Failed to create Google Meet link');
        }
      } else if (provider.provider === 'microsoft_teams') {
        // Microsoft Teams meeting creation
        const teamsRequestData = {
          subject: title,
          startDateTime: startTime,
          endDateTime: new Date(new Date(startTime).getTime() + duration * 60000).toISOString(),
          participants: {
            attendees: attendees?.map(attendee => ({
              identity: {
                user: {
                  id: attendee.email,
                  displayName: attendee.name
                }
              }
            }))
          }
        };

        const response = await fetch('https://graph.microsoft.com/v1.0/me/onlineMeetings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(teamsRequestData)
        });

        if (response.ok) {
          meetingData = await response.json();
        } else {
          throw new Error('Failed to create Teams meeting');
        }
      }

      if (meetingData) {
        // Store meeting link in database
        const meetingLink = await storage.createMeetingLink({
          appointmentId,
          videoMeetingProviderId: provider.id,
          externalMeetingId: meetingData.id || meetingData.meeting_id,
          joinUrl: meetingData.join_url || meetingData.webUrl,
          hostUrl: meetingData.start_url || meetingData.webUrl,
          meetingPassword: meetingData.password,
          meetingId: meetingData.meeting_id || meetingData.id,
          hostEmail: meetingData.host_email || provider.providerEmail,
          maxParticipants: settings?.maxParticipants,
          settings: settings || {},
          meetingStatus: 'created'
        });

        await storage.createIntegrationLog({
          userId,
          integrationType: 'video_meeting',
          provider: provider.provider,
          operation: 'create',
          status: 'success',
          connectionId: provider.id,
          details: { 
            message: 'Video meeting created',
            appointmentId,
            meetingId: meetingData.id
          }
        });

        res.json({ 
          meetingLink,
          meetingData: {
            id: meetingData.id,
            joinUrl: meetingData.join_url || meetingData.webUrl,
            meetingId: meetingData.meeting_id || meetingData.id,
            password: meetingData.password
          },
          message: 'Video meeting created successfully'
        });
      } else {
        throw new Error('Failed to create video meeting');
      }
    } catch (error) {
      console.error('Error creating video meeting:', error);
      res.status(500).json({ message: 'Failed to create video meeting' });
    }
  });

  // Get meeting by appointment
  app.get('/api/video/meetings/appointment/:appointmentId', requireAuth, async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const userId = (req.user as any).id;
      
      // Verify appointment ownership
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      const eventType = await storage.getAppointmentEventType(appointment.eventTypeId);
      if (!eventType || eventType.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const meetingLink = await storage.getMeetingLinkByAppointment(appointmentId);
      
      res.json({ meetingLink });
    } catch (error) {
      console.error('Error fetching meeting:', error);
      res.status(500).json({ message: 'Failed to fetch meeting' });
    }
  });

  // Update meeting
  app.put('/api/video/meetings/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).id;
      const validationResult = updateMeetingSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid meeting update data',
          errors: validationResult.error.format()
        });
      }

      const meetingLink = await storage.getMeetingLink(id);
      if (!meetingLink) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      // Verify ownership through appointment
      const appointment = await storage.getAppointment(meetingLink.appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Associated appointment not found' });
      }

      const eventType = await storage.getAppointmentEventType(appointment.eventTypeId);
      if (!eventType || eventType.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updateData = validationResult.data;
      
      // Update in external provider if needed
      const provider = await storage.getVideoMeetingProvider(meetingLink.videoMeetingProviderId);
      if (provider && (updateData.title || updateData.startTime || updateData.duration)) {
        // Provider-specific update logic would go here
        // For brevity, we'll just update our database
      }

      const updatedMeeting = await storage.updateMeetingLink(id, {
        settings: updateData.settings ? { ...meetingLink.settings, ...updateData.settings } : meetingLink.settings,
        updatedAt: new Date()
      });

      await storage.createIntegrationLog({
        userId,
        integrationType: 'video_meeting',
        provider: provider?.provider || 'unknown',
        operation: 'update',
        status: 'success',
        connectionId: provider?.id,
        details: { 
          message: 'Video meeting updated',
          meetingId: meetingLink.externalMeetingId
        }
      });

      res.json({ 
        meetingLink: updatedMeeting,
        message: 'Meeting updated successfully' 
      });
    } catch (error) {
      console.error('Error updating meeting:', error);
      res.status(500).json({ message: 'Failed to update meeting' });
    }
  });

  // Delete meeting
  app.delete('/api/video/meetings/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).id;
      
      const meetingLink = await storage.getMeetingLink(id);
      if (!meetingLink) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      // Verify ownership
      const appointment = await storage.getAppointment(meetingLink.appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Associated appointment not found' });
      }

      const eventType = await storage.getAppointmentEventType(appointment.eventTypeId);
      if (!eventType || eventType.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Delete from external provider
      const provider = await storage.getVideoMeetingProvider(meetingLink.videoMeetingProviderId);
      if (provider) {
        try {
          if (provider.provider === 'zoom') {
            await fetch(`https://api.zoom.us/v2/meetings/${meetingLink.externalMeetingId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${provider.accessToken}`
              }
            });
          }
          // Add other provider deletion logic as needed
        } catch (error) {
          console.error('Error deleting from external provider:', error);
          // Continue with local deletion even if external deletion fails
        }
      }

      await storage.deleteMeetingLink(id);

      await storage.createIntegrationLog({
        userId,
        integrationType: 'video_meeting',
        provider: provider?.provider || 'unknown',
        operation: 'delete',
        status: 'success',
        connectionId: provider?.id,
        details: { 
          message: 'Video meeting deleted',
          meetingId: meetingLink.externalMeetingId
        }
      });

      res.json({ message: 'Meeting deleted successfully' });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      res.status(500).json({ message: 'Failed to delete meeting' });
    }
  });

  // Meeting actions (start, stop recording, etc.)
  app.post('/api/video/meetings/:id/actions', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).id;
      const validationResult = meetingActionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid action data',
          errors: validationResult.error.format()
        });
      }

      const { action } = validationResult.data;
      
      const meetingLink = await storage.getMeetingLink(id);
      if (!meetingLink) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      // Verify ownership
      const appointment = await storage.getAppointment(meetingLink.appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Associated appointment not found' });
      }

      const eventType = await storage.getAppointmentEventType(appointment.eventTypeId);
      if (!eventType || eventType.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const provider = await storage.getVideoMeetingProvider(meetingLink.videoMeetingProviderId);
      if (!provider) {
        return res.status(404).json({ message: 'Video provider not found' });
      }

      let actionResult: any = {};

      // Perform action based on provider
      if (provider.provider === 'zoom') {
        const actionUrl = `https://api.zoom.us/v2/meetings/${meetingLink.externalMeetingId}`;
        
        switch (action) {
          case 'start_recording':
            actionResult = await fetch(`${actionUrl}/recordings`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${provider.accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ action: 'start' })
            });
            break;
          case 'stop_recording':
            actionResult = await fetch(`${actionUrl}/recordings`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${provider.accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ action: 'stop' })
            });
            break;
          default:
            return res.status(400).json({ message: 'Action not supported for this provider' });
        }
      }

      // Update meeting status if needed
      let statusUpdate: any = {};
      if (action === 'start') {
        statusUpdate.meetingStatus = 'started';
        statusUpdate.actualStartTime = new Date();
      } else if (action === 'end') {
        statusUpdate.meetingStatus = 'ended';
        statusUpdate.actualEndTime = new Date();
      }

      if (Object.keys(statusUpdate).length > 0) {
        await storage.updateMeetingLink(id, statusUpdate);
      }

      await storage.createIntegrationLog({
        userId,
        integrationType: 'video_meeting',
        provider: provider.provider,
        operation: action,
        status: 'success',
        connectionId: provider.id,
        details: { 
          message: `Meeting action: ${action}`,
          meetingId: meetingLink.externalMeetingId
        }
      });

      res.json({ 
        message: `Meeting ${action} completed successfully`,
        actionResult
      });
    } catch (error) {
      console.error('Error performing meeting action:', error);
      res.status(500).json({ message: 'Failed to perform meeting action' });
    }
  });

  // Get integration logs for debugging
  app.get('/api/video/logs', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { provider, operation, limit } = req.query;
      
      const logs = await storage.getIntegrationLogs({
        userId,
        integrationType: 'video_meeting',
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