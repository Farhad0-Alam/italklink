import type { Express } from "express";
import { storage } from './storage';
import { db } from './db';
import { appointments } from '@shared/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { insertAppointmentSchema, insertAppointmentEventTypeSchema } from '@shared/schema';
import { appointmentTriggers } from './appointment-triggers';
import { requireAuth, optionalAuth } from './auth';
import { conflictDetectionService } from './conflict-detection';

// Meeting link creation helper function
async function createMeetingLinkForAppointment(appointment: any, eventType: any) {
  try {
    // Determine meeting provider based on event type settings
    let provider = 'google_meet'; // default
    if (eventType.meetingLocation?.includes('zoom')) {
      provider = 'zoom';
    } else if (eventType.meetingLocation?.includes('teams')) {
      provider = 'microsoft_teams';
    }

    // Get user's video meeting provider
    const videoProvider = await storage.getVideoProviderByProvider(eventType.userId, provider);
    
    if (!videoProvider || videoProvider.status !== 'connected') {
      // Fall back to creating a simple meeting room placeholder
      const meetingLink = await storage.createMeetingLink({
        appointmentId: appointment.id,
        meetingUrl: `https://meet.google.com/new`, // Generic meeting URL
        provider: 'manual',
        meetingId: `meeting-${appointment.id}`,
        settings: {
          requirePassword: false,
          allowRecording: false,
          muteOnEntry: true
        }
      });
      
      return meetingLink;
    }

    // Create actual meeting based on provider
    let meetingUrl = '';
    let meetingId = '';
    
    if (provider === 'zoom' && videoProvider.accessToken) {
      // Create Zoom meeting
      const zoomResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${videoProvider.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: `${eventType.name} - ${appointment.attendeeName}`,
          type: 2, // Scheduled meeting
          start_time: appointment.startTime,
          duration: eventType.duration,
          timezone: appointment.timezone || 'UTC',
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            waiting_room: true,
            audio: 'both'
          }
        })
      });

      if (zoomResponse.ok) {
        const zoomMeeting = await zoomResponse.json();
        meetingUrl = zoomMeeting.join_url;
        meetingId = zoomMeeting.id.toString();
      }
    } else if (provider === 'google_meet') {
      // For Google Meet, we'll create a calendar event which automatically generates a Meet link
      meetingUrl = `https://meet.google.com/new`;
      meetingId = `meet-${appointment.id}`;
    } else if (provider === 'microsoft_teams' && videoProvider.accessToken) {
      // Create Teams meeting
      const teamsResponse = await fetch('https://graph.microsoft.com/v1.0/me/onlineMeetings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${videoProvider.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: `${eventType.name} - ${appointment.attendeeName}`,
          startDateTime: appointment.startTime,
          endDateTime: appointment.endTime
        })
      });

      if (teamsResponse.ok) {
        const teamsMeeting = await teamsResponse.json();
        meetingUrl = teamsMeeting.joinWebUrl;
        meetingId = teamsMeeting.id;
      }
    }

    // Store meeting link in database
    const meetingLink = await storage.createMeetingLink({
      appointmentId: appointment.id,
      meetingUrl,
      provider,
      meetingId,
      settings: {
        requirePassword: false,
        allowRecording: videoProvider.settings?.allowRecording || false,
        muteOnEntry: true
      }
    });

    await storage.createIntegrationLog({
      userId: eventType.userId,
      integrationType: 'video_meeting',
      provider,
      operation: 'create_meeting_link',
      status: 'success',
      details: { 
        appointmentId: appointment.id,
        meetingId,
        provider
      }
    });

    return meetingLink;
  } catch (error) {
    console.error('Meeting link creation error:', error);
    throw error;
  }
}

// Validation schemas
const availabilityQuerySchema = z.object({
  eventTypeId: z.string().uuid(),
  date: z.string().datetime(),
  timezone: z.string().min(1),
});

const createAppointmentSchema = insertAppointmentSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

const createEventTypeSchema = insertAppointmentEventTypeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

const updateEventTypeSchema = insertAppointmentEventTypeSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
}).partial();

const queryFiltersSchema = z.object({
  isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().regex(/^\d+$/).optional().transform(val => val ? Math.min(parseInt(val), 100) : 10)
});

export function setupAppointmentRoutes(app: Express) {

  // Get availability for event type and date
  app.get('/api/appointments/availability', async (req, res) => {
    try {
      const queryResult = availabilityQuerySchema.safeParse(req.query);
      
      if (!queryResult.success) {
        return res.status(400).json({ 
          message: 'Invalid query parameters',
          errors: queryResult.error.format(),
        });
      }

      const { eventTypeId, date, timezone } = queryResult.data;

      // Get event type details
      const eventType = await storage.getAppointmentEventType(eventTypeId);
      if (!eventType) {
        return res.status(404).json({ message: 'Event type not found' });
      }

      // Parse the date
      const requestedDate = new Date(date);
      if (isNaN(requestedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      // Get availability for the date
      const availability = await storage.getAvailabilityForDate(eventTypeId, requestedDate, timezone);

      res.json(availability);
    } catch (error) {
      console.error('Error fetching availability:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create new appointment
  app.post('/api/appointments', async (req, res) => {
    try {
      const validationResult = createAppointmentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid appointment data',
          errors: validationResult.error.format(),
        });
      }

      const appointmentData = validationResult.data;

      // Verify event type exists and is bookable
      const eventType = await storage.getAppointmentEventType(appointmentData.eventTypeId);
      if (!eventType || !eventType.isActive || !eventType.isPublic) {
        return res.status(400).json({ message: 'Event type not available for booking' });
      }

      // Check if the requested time slot is still available
      const requestedStartTime = new Date(appointmentData.startTime);
      const requestedEndTime = new Date(requestedStartTime.getTime() + eventType.duration * 60000);
      
      // Add buffers for conflict checking
      const bufferBefore = eventType.bufferTimeBefore || 0;
      const bufferAfter = eventType.bufferTimeAfter || 0;
      const conflictCheckStart = new Date(requestedStartTime.getTime() - bufferBefore * 60000);
      const conflictCheckEnd = new Date(requestedEndTime.getTime() + bufferAfter * 60000);
      
      // Comprehensive conflict checking including external calendars
      const conflictCheck = await conflictDetectionService.checkAppointmentConflicts(
        eventType.userId, // Check against the host's calendar
        conflictCheckStart.toISOString(),
        conflictCheckEnd.toISOString()
      );
      
      if (conflictCheck.hasConflicts) {
        // Suggest alternative time slots
        const alternatives = await conflictDetectionService.suggestAlternativeSlots(
          eventType.userId,
          requestedStartTime.toISOString(),
          eventType.duration
        );

        return res.status(409).json({ 
          message: 'Time slot is no longer available due to scheduling conflicts',
          conflictDetails: {
            requestedStart: requestedStartTime.toISOString(),
            requestedEnd: requestedEndTime.toISOString(),
            conflicts: conflictCheck.conflicts,
            suggestedAlternatives: alternatives.slice(0, 3) // Provide up to 3 alternatives
          }
        });
      }
      
      // Double-check availability using the same logic as the availability endpoint
      const requestedDateOnly = new Date(requestedStartTime);
      requestedDateOnly.setHours(0, 0, 0, 0);
      const availability = await storage.getAvailabilityForDate(
        appointmentData.eventTypeId, 
        requestedDateOnly, 
        appointmentData.timezone || 'UTC'
      );

      // Find the exact slot that matches our requested UTC time
      const availableSlot = availability.find(slot => 
        new Date(slot.utcTime).getTime() === requestedStartTime.getTime() && slot.available
      );

      if (!availableSlot) {
        return res.status(409).json({ 
          message: 'Time slot is not available according to business hours or blackout periods'
        });
      }

      // Calculate end time
      const endTime = new Date(requestedStartTime.getTime() + eventType.duration * 60000);

      // Create the appointment
      const appointment = await storage.createAppointment({
        ...appointmentData,
        endTime: endTime.toISOString(),
        hostUserId: eventType.userId, // The event type owner is the host
        status: eventType.requiresConfirmation ? 'scheduled' : 'confirmed',
      });

      // Automatically create meeting link if event type supports video calls
      let meetingLink = null;
      if (eventType.meetingLocation && (
        eventType.meetingLocation.includes('zoom') ||
        eventType.meetingLocation.includes('google_meet') ||
        eventType.meetingLocation.includes('teams')
      )) {
        try {
          meetingLink = await createMeetingLinkForAppointment(appointment, eventType);
        } catch (meetingError) {
          console.error('Failed to create meeting link:', meetingError);
          // Don't fail the booking if meeting link creation fails
          await storage.createIntegrationLog({
            userId: eventType.userId,
            integrationType: 'video_meeting',
            provider: 'auto_creation',
            operation: 'create_meeting_link',
            status: 'error',
            details: { 
              appointmentId: appointment.id,
              error: meetingError instanceof Error ? meetingError.message : 'Unknown error'
            }
          });
        }
      }

      // Get host user information for notifications
      const hostUser = await storage.getUser(eventType.userId);
      if (!hostUser) {
        console.error('Host user not found for appointment notifications:', eventType.userId);
      } else {
        // Trigger booking confirmation and schedule reminders
        try {
          await appointmentTriggers.onAppointmentBooked(appointment, eventType, hostUser);
          console.log('Appointment notifications triggered successfully:', appointment.id);
        } catch (triggerError) {
          console.error('Failed to trigger appointment notifications:', triggerError);
          // Don't fail the booking if notifications fail
        }
      }

      res.status(201).json({
        id: appointment.id,
        eventType: {
          name: eventType.name,
          duration: eventType.duration,
          meetingLocation: eventType.meetingLocation,
        },
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        attendeeName: appointment.attendeeName,
        attendeeEmail: appointment.attendeeEmail,
        requiresConfirmation: eventType.requiresConfirmation,
        meetingLink: meetingLink ? {
          url: meetingLink.meetingUrl,
          meetingId: meetingLink.meetingId,
          provider: meetingLink.provider
        } : null,
        message: eventType.requiresConfirmation 
          ? 'Your booking request has been submitted and is pending confirmation.'
          : 'Your appointment has been confirmed!',
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({ message: 'Time slot is no longer available' });
      }
      
      res.status(500).json({ message: 'Failed to create appointment' });
    }
  });

  // Get appointment details (for confirmation page)
  app.get('/api/appointments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: 'Appointment ID is required' });
      }

      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      res.json(appointment);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // ===== EVENT TYPES MANAGEMENT CRUD ROUTES =====

  // Get all event types for authenticated user
  app.get('/api/appointment-event-types', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const queryResult = queryFiltersSchema.safeParse(req.query);
      
      if (!queryResult.success) {
        return res.status(400).json({
          message: 'Invalid query parameters',
          errors: queryResult.error.format(),
        });
      }

      const { isActive, search } = queryResult.data;
      const eventTypes = await storage.getUserAppointmentEventTypes(user.id, { isActive, search });

      // Add stats for each event type
      const eventTypesWithStats = await Promise.all(
        eventTypes.map(async (eventType) => {
          const [appointmentCount] = await db
            .select({ count: sql`COUNT(*)` })
            .from(appointments)
            .where(eq(appointments.eventTypeId, eventType.id));

          return {
            ...eventType,
            appointmentCount: appointmentCount?.count || 0,
            bookingUrl: `${req.protocol}://${req.get('host')}/booking/${eventType.slug}`,
          };
        })
      );

      res.json({
        eventTypes: eventTypesWithStats,
        pagination: {
          total: eventTypesWithStats.length,
          page: 1,
          limit: eventTypesWithStats.length,
        }
      });
    } catch (error) {
      console.error('Error fetching event types:', error);
      res.status(500).json({ message: 'Failed to fetch event types' });
    }
  });

  // Create new event type
  app.post('/api/appointment-event-types', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const validationResult = createEventTypeSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid event type data',
          errors: validationResult.error.format(),
        });
      }

      const eventTypeData = {
        ...validationResult.data,
        userId: user.id,
      };

      const eventType = await storage.createAppointmentEventType(eventTypeData);

      res.status(201).json({
        ...eventType,
        bookingUrl: `${req.protocol}://${req.get('host')}/booking/${eventType.slug}`,
      });
    } catch (error) {
      console.error('Error creating event type:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to create event type' });
    }
  });

  // Get specific event type by ID (authenticated)
  app.get('/api/appointment-event-types/:id([0-9a-fA-F-]{36})', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { id } = req.params;
      
      const eventType = await storage.getAppointmentEventType(id);
      if (!eventType) {
        return res.status(404).json({ message: 'Event type not found' });
      }

      // Check if user owns this event type
      if (eventType.userId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Add additional stats
      const [appointmentCount] = await db
        .select({ count: sql`COUNT(*)` })
        .from(appointments)
        .where(eq(appointments.eventTypeId, eventType.id));

      res.json({
        ...eventType,
        appointmentCount: appointmentCount?.count || 0,
        bookingUrl: `${req.protocol}://${req.get('host')}/booking/${eventType.slug}`,
      });
    } catch (error) {
      console.error('Error fetching event type:', error);
      res.status(500).json({ message: 'Failed to fetch event type' });
    }
  });

  // Update event type
  app.put('/api/appointment-event-types/:id([0-9a-fA-F-]{36})', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { id } = req.params;
      
      const validationResult = updateEventTypeSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid event type data',
          errors: validationResult.error.format(),
        });
      }

      // Check ownership
      const existingEventType = await storage.getAppointmentEventType(id);
      if (!existingEventType) {
        return res.status(404).json({ message: 'Event type not found' });
      }
      if (existingEventType.userId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const eventType = await storage.updateAppointmentEventType(id, validationResult.data);

      res.json({
        ...eventType,
        bookingUrl: `${req.protocol}://${req.get('host')}/booking/${eventType.slug}`,
      });
    } catch (error) {
      console.error('Error updating event type:', error);
      if (error instanceof Error && error.message.includes('Slug already exists')) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to update event type' });
    }
  });

  // Delete event type
  app.delete('/api/appointment-event-types/:id([0-9a-fA-F-]{36})', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { id } = req.params;
      
      // Check ownership
      const existingEventType = await storage.getAppointmentEventType(id);
      if (!existingEventType) {
        return res.status(404).json({ message: 'Event type not found' });
      }
      if (existingEventType.userId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await storage.deleteAppointmentEventType(id);

      res.json({ message: 'Event type deleted successfully' });
    } catch (error) {
      console.error('Error deleting event type:', error);
      if (error instanceof Error && error.message.includes('existing appointments')) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to delete event type' });
    }
  });

  // Duplicate event type
  app.post('/api/appointment-event-types/:id([0-9a-fA-F-]{36})/duplicate', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { id } = req.params;
      const { name } = req.body;
      
      // Check ownership
      const existingEventType = await storage.getAppointmentEventType(id);
      if (!existingEventType) {
        return res.status(404).json({ message: 'Event type not found' });
      }
      if (existingEventType.userId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const duplicatedEventType = await storage.duplicateAppointmentEventType(id, name);

      res.status(201).json({
        ...duplicatedEventType,
        bookingUrl: `${req.protocol}://${req.get('host')}/booking/${duplicatedEventType.slug}`,
      });
    } catch (error) {
      console.error('Error duplicating event type:', error);
      res.status(500).json({ message: 'Failed to duplicate event type' });
    }
  });

  // Toggle event type status
  app.patch('/api/appointment-event-types/:id([0-9a-fA-F-]{36})/status', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { id } = req.params;
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive must be a boolean' });
      }

      // Check ownership
      const existingEventType = await storage.getAppointmentEventType(id);
      if (!existingEventType) {
        return res.status(404).json({ message: 'Event type not found' });
      }
      if (existingEventType.userId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const eventType = await storage.updateAppointmentEventTypeStatus(id, isActive);

      res.json({
        ...eventType,
        bookingUrl: `${req.protocol}://${req.get('host')}/booking/${eventType.slug}`,
      });
    } catch (error) {
      console.error('Error updating event type status:', error);
      res.status(500).json({ message: 'Failed to update event type status' });
    }
  });

  // Get event type templates
  app.get('/api/appointment-event-types/templates', requireAuth, async (req, res) => {
    try {
      const templates = await storage.getEventTypeTemplates();
      res.json({ templates });
    } catch (error) {
      console.error('Error fetching event type templates:', error);
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });

  // Get event type by slug (MUST be after all specific routes to prevent path conflicts)
  app.get('/api/appointment-event-types/:slug', optionalAuth, async (req, res) => {
    try {
      const { slug } = req.params;
      
      if (!slug) {
        return res.status(400).json({ message: 'Event type slug is required' });
      }

      const eventType = await storage.getAppointmentEventTypeBySlug(slug);
      
      if (!eventType) {
        return res.status(404).json({ message: 'Event type not found' });
      }

      // Only allow access if (public AND active) OR (authenticated owner)
      const isPublicAndActive = eventType.isPublic && eventType.isActive;
      const isAuthenticatedOwner = req.user && req.user.id === eventType.userId;
      
      if (!isPublicAndActive && !isAuthenticatedOwner) {
        return res.status(404).json({ message: 'Event type not found' });
      }

      res.json(eventType);
    } catch (error) {
      console.error('Error fetching event type:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get event type preview data
  app.get('/api/appointment-event-types/:id([0-9a-fA-F-]{36})/preview', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { id } = req.params;
      
      const eventType = await storage.getAppointmentEventType(id);
      if (!eventType) {
        return res.status(404).json({ message: 'Event type not found' });
      }

      // Check ownership
      if (eventType.userId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Generate preview data for booking page
      res.json({
        eventType,
        bookingUrl: `${req.protocol}://${req.get('host')}/booking/${eventType.slug}`,
        previewData: {
          title: eventType.name,
          description: eventType.description,
          duration: eventType.duration,
          price: eventType.price,
          currency: eventType.currency,
          location: eventType.meetingLocation,
          brandColor: eventType.brandColor,
          instructionsBeforeEvent: eventType.instructionsBeforeEvent,
          instructionsAfterEvent: eventType.instructionsAfterEvent,
        }
      });
    } catch (error) {
      console.error('Error generating event type preview:', error);
      res.status(500).json({ message: 'Failed to generate preview' });
    }
  });

  // Bulk operations for event types
  app.patch('/api/appointment-event-types/bulk', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { eventTypeIds, operation, data } = req.body;
      
      if (!Array.isArray(eventTypeIds) || eventTypeIds.length === 0) {
        return res.status(400).json({ message: 'eventTypeIds must be a non-empty array' });
      }

      // Verify ownership of all event types
      const eventTypes = await Promise.all(
        eventTypeIds.map(id => storage.getAppointmentEventType(id))
      );
      
      const invalidEventTypes = eventTypes.filter(et => !et || et.userId !== user.id);
      if (invalidEventTypes.length > 0) {
        return res.status(403).json({ message: 'Access denied to some event types' });
      }

      let results = [];
      
      switch (operation) {
        case 'toggle_status':
          results = await Promise.all(
            eventTypeIds.map(id => 
              storage.updateAppointmentEventTypeStatus(id, data.isActive)
            )
          );
          break;
        case 'update_settings':
          results = await Promise.all(
            eventTypeIds.map(id => 
              storage.updateAppointmentEventType(id, data)
            )
          );
          break;
        case 'delete':
          await Promise.all(
            eventTypeIds.map(id => storage.deleteAppointmentEventType(id))
          );
          results = { deleted: eventTypeIds.length };
          break;
        default:
          return res.status(400).json({ message: 'Invalid bulk operation' });
      }

      res.json({
        success: true,
        operation,
        affectedCount: eventTypeIds.length,
        results
      });
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      if (error instanceof Error && error.message.includes('existing appointments')) {
        return res.status(409).json({ message: 'Some event types have existing appointments and cannot be deleted' });
      }
      res.status(500).json({ message: 'Bulk operation failed' });
    }
  });
}