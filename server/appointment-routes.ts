import type { Express } from "express";
import { storage } from './storage';
import { db } from './db';
import { appointments } from '@shared/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { insertAppointmentSchema, insertAppointmentEventTypeSchema } from '@shared/schema';
import { appointmentTriggers } from './appointment-triggers';

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

export function setupAppointmentRoutes(app: Express) {
  // Get event type by slug
  app.get('/api/appointment-event-types/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      
      if (!slug) {
        return res.status(400).json({ message: 'Event type slug is required' });
      }

      const eventType = await storage.getAppointmentEventTypeBySlug(slug);
      
      if (!eventType) {
        return res.status(404).json({ message: 'Event type not found' });
      }

      // Only return public event types or if user has access
      if (!eventType.isPublic && !eventType.isActive) {
        return res.status(404).json({ message: 'Event type not available' });
      }

      res.json(eventType);
    } catch (error) {
      console.error('Error fetching event type:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

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
      
      // Check for existing appointment conflicts with proper overlap logic
      const conflictingAppointments = await db
        .select()
        .from(appointments)
        .where(and(
          eq(appointments.eventTypeId, appointmentData.eventTypeId),
          or(
            eq(appointments.status, 'scheduled'),
            eq(appointments.status, 'confirmed'),
            eq(appointments.status, 'completed')
          ),
          // Proper overlap detection: appointments overlap if start < existingEnd && end > existingStart
          sql`${conflictCheckStart.toISOString()} < ${appointments.endTime} AND ${conflictCheckEnd.toISOString()} > ${appointments.startTime}`
        ));
      
      if (conflictingAppointments.length > 0) {
        return res.status(409).json({ 
          message: 'Time slot is no longer available due to scheduling conflict',
          conflictDetails: {
            requestedStart: requestedStartTime.toISOString(),
            requestedEnd: requestedEndTime.toISOString(),
            conflictingAppointments: conflictingAppointments.length
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
      const endTime = new Date(requestedDate.getTime() + eventType.duration * 60000);

      // Create the appointment
      const appointment = await storage.createAppointment({
        ...appointmentData,
        endTime: endTime.toISOString(),
        hostUserId: eventType.userId, // The event type owner is the host
        status: eventType.requiresConfirmation ? 'scheduled' : 'confirmed',
      });

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
}