import type { Express } from "express";
import { requireAuth } from './auth';
import { storage } from './storage';
import { db } from './db';
import { teamMemberAvailability, blackoutDates, appointmentEventTypes } from '@shared/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { insertTeamMemberAvailabilitySchema, insertBlackoutDateSchema } from '@shared/schema';

// Validation schemas
const businessHoursSchema = z.object({
  weekday: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  enabled: z.boolean(),
  timezone: z.string().min(1),
  eventTypeId: z.string().uuid().optional(),
});

const bufferTimeSchema = z.object({
  eventTypeId: z.string().uuid(),
  bufferTimeBefore: z.number().min(0).max(120),
  bufferTimeAfter: z.number().min(0).max(120),
});

const blackoutDateSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  title: z.string().min(1),
  description: z.string().optional(),
  isAllDay: z.boolean().default(true),
  isRecurring: z.boolean().default(false),
  type: z.enum(['time_off', 'holiday', 'meeting', 'personal', 'maintenance']).default('time_off'),
  eventTypeId: z.string().uuid().optional(),
});

const availabilitySettingsSchema = z.object({
  businessHours: z.array(businessHoursSchema).optional(),
  bufferTimes: z.array(bufferTimeSchema).optional(),
  blackoutDates: z.array(blackoutDateSchema).optional(),
});

const updateBusinessHoursSchema = z.array(businessHoursSchema);
const updateBlackoutDatesSchema = z.array(blackoutDateSchema);

export function setupAvailabilityRoutes(app: Express) {
  // Get all availability settings for the authenticated user
  app.get('/api/availability/settings', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;

      // Get business hours (team member availability)
      const businessHoursResult = await db
        .select()
        .from(teamMemberAvailability)
        .where(eq(teamMemberAvailability.userId, userId));

      // Get blackout dates
      const blackoutDatesResult = await db
        .select()
        .from(blackoutDates)
        .where(eq(blackoutDates.userId, userId))
        .orderBy(blackoutDates.startDate);

      // Get user's event types for buffer configuration
      const eventTypesResult = await db
        .select()
        .from(appointmentEventTypes)
        .where(eq(appointmentEventTypes.userId, userId));

      // Transform business hours to client format
      const businessHours = businessHoursResult.map(bh => ({
        weekday: bh.weekday,
        startTime: bh.startTime,
        endTime: bh.endTime,
        enabled: bh.type === 'available',
        timezone: bh.timezone || 'UTC',
      }));

      // Transform blackout dates to client format
      const blackoutDatesFormatted = blackoutDatesResult.map(bd => ({
        id: bd.id,
        startDate: bd.startDate.toISOString(),
        endDate: bd.endDate.toISOString(),
        title: bd.title,
        description: bd.description,
        isAllDay: bd.isAllDay,
        isRecurring: bd.isRecurring,
        type: bd.type || 'time_off',
      }));

      // Transform buffer times (from event types)
      const bufferTimes = eventTypesResult.map(et => ({
        eventTypeId: et.id,
        bufferTimeBefore: et.bufferTimeBefore || 0,
        bufferTimeAfter: et.bufferTimeAfter || 0,
      }));

      // For now, return empty recurring schedules (future enhancement)
      const recurringSchedules: any[] = [];

      res.json({
        businessHours,
        bufferTimes,
        blackoutDates: blackoutDatesFormatted,
        recurringSchedules,
      });
    } catch (error) {
      console.error('Error fetching availability settings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update business hours
  app.put('/api/availability/business-hours', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validationResult = updateBusinessHoursSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid business hours data',
          errors: validationResult.error.format(),
        });
      }

      const businessHours = validationResult.data;

      // Delete existing business hours for this user
      await db
        .delete(teamMemberAvailability)
        .where(eq(teamMemberAvailability.userId, userId));

      // Insert new business hours
      if (businessHours.length > 0) {
        const newBusinessHours = businessHours
          .filter(bh => bh.enabled)
          .map(bh => ({
            userId,
            eventTypeId: bh.eventTypeId || null,
            weekday: bh.weekday,
            startTime: bh.startTime,
            endTime: bh.endTime,
            timezone: bh.timezone,
            type: 'available' as const,
          }));

        if (newBusinessHours.length > 0) {
          await db.insert(teamMemberAvailability).values(newBusinessHours);
        }
      }

      res.json({ message: 'Business hours updated successfully' });
    } catch (error) {
      console.error('Error updating business hours:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update buffer times (updates event types)
  app.put('/api/availability/buffer-times', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validationResult = z.array(bufferTimeSchema).safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid buffer times data',
          errors: validationResult.error.format(),
        });
      }

      const bufferTimes = validationResult.data;

      // Update each event type with new buffer times
      for (const buffer of bufferTimes) {
        await db
          .update(appointmentEventTypes)
          .set({
            bufferTimeBefore: buffer.bufferTimeBefore,
            bufferTimeAfter: buffer.bufferTimeAfter,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(appointmentEventTypes.id, buffer.eventTypeId),
              eq(appointmentEventTypes.userId, userId)
            )
          );
      }

      res.json({ message: 'Buffer times updated successfully' });
    } catch (error) {
      console.error('Error updating buffer times:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create blackout date
  app.post('/api/availability/blackout-dates', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validationResult = blackoutDateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid blackout date data',
          errors: validationResult.error.format(),
        });
      }

      const blackoutData = validationResult.data;

      // Validate date range
      if (new Date(blackoutData.startDate) > new Date(blackoutData.endDate)) {
        return res.status(400).json({
          message: 'Start date must be before or equal to end date',
        });
      }

      const newBlackout = await db
        .insert(blackoutDates)
        .values({
          userId,
          eventTypeId: blackoutData.eventTypeId || null,
          startDate: new Date(blackoutData.startDate),
          endDate: new Date(blackoutData.endDate),
          title: blackoutData.title,
          description: blackoutData.description,
          isAllDay: blackoutData.isAllDay,
          isRecurring: blackoutData.isRecurring,
          type: blackoutData.type,
        })
        .returning();

      res.status(201).json({
        message: 'Blackout date created successfully',
        blackout: {
          id: newBlackout[0].id,
          startDate: newBlackout[0].startDate.toISOString(),
          endDate: newBlackout[0].endDate.toISOString(),
          title: newBlackout[0].title,
          description: newBlackout[0].description,
          isAllDay: newBlackout[0].isAllDay,
          isRecurring: newBlackout[0].isRecurring,
          type: newBlackout[0].type,
        },
      });
    } catch (error) {
      console.error('Error creating blackout date:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update blackout date
  app.put('/api/availability/blackout-dates/:id', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const validationResult = blackoutDateSchema.partial().safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid blackout date data',
          errors: validationResult.error.format(),
        });
      }

      const updateData = validationResult.data;

      // Validate date range if both dates are provided
      if (updateData.startDate && updateData.endDate) {
        if (new Date(updateData.startDate) > new Date(updateData.endDate)) {
          return res.status(400).json({
            message: 'Start date must be before or equal to end date',
          });
        }
      }

      const updateFields: any = {};
      if (updateData.startDate) updateFields.startDate = new Date(updateData.startDate);
      if (updateData.endDate) updateFields.endDate = new Date(updateData.endDate);
      if (updateData.title) updateFields.title = updateData.title;
      if (updateData.description !== undefined) updateFields.description = updateData.description;
      if (updateData.isAllDay !== undefined) updateFields.isAllDay = updateData.isAllDay;
      if (updateData.isRecurring !== undefined) updateFields.isRecurring = updateData.isRecurring;
      if (updateData.type) updateFields.type = updateData.type;

      const result = await db
        .update(blackoutDates)
        .set(updateFields)
        .where(
          and(
            eq(blackoutDates.id, id),
            eq(blackoutDates.userId, userId)
          )
        )
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: 'Blackout date not found' });
      }

      res.json({
        message: 'Blackout date updated successfully',
        blackout: {
          id: result[0].id,
          startDate: result[0].startDate.toISOString(),
          endDate: result[0].endDate.toISOString(),
          title: result[0].title,
          description: result[0].description,
          isAllDay: result[0].isAllDay,
          isRecurring: result[0].isRecurring,
          type: result[0].type,
        },
      });
    } catch (error) {
      console.error('Error updating blackout date:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Delete blackout date
  app.delete('/api/availability/blackout-dates/:id', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await db
        .delete(blackoutDates)
        .where(
          and(
            eq(blackoutDates.id, id),
            eq(blackoutDates.userId, userId)
          )
        )
        .returning({ id: blackoutDates.id });

      if (result.length === 0) {
        return res.status(404).json({ message: 'Blackout date not found' });
      }

      res.json({ message: 'Blackout date deleted successfully' });
    } catch (error) {
      console.error('Error deleting blackout date:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Bulk update availability settings
  app.put('/api/availability/settings', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validationResult = availabilitySettingsSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid availability settings data',
          errors: validationResult.error.format(),
        });
      }

      const settings = validationResult.data;
      const responses: string[] = [];

      // Update business hours if provided
      if (settings.businessHours) {
        await db
          .delete(teamMemberAvailability)
          .where(eq(teamMemberAvailability.userId, userId));

        const newBusinessHours = settings.businessHours
          .filter(bh => bh.enabled)
          .map(bh => ({
            userId,
            eventTypeId: bh.eventTypeId || null,
            weekday: bh.weekday,
            startTime: bh.startTime,
            endTime: bh.endTime,
            timezone: bh.timezone,
            type: 'available' as const,
          }));

        if (newBusinessHours.length > 0) {
          await db.insert(teamMemberAvailability).values(newBusinessHours);
        }
        responses.push('Business hours updated');
      }

      // Update buffer times if provided
      if (settings.bufferTimes) {
        for (const buffer of settings.bufferTimes) {
          await db
            .update(appointmentEventTypes)
            .set({
              bufferTimeBefore: buffer.bufferTimeBefore,
              bufferTimeAfter: buffer.bufferTimeAfter,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(appointmentEventTypes.id, buffer.eventTypeId),
                eq(appointmentEventTypes.userId, userId)
              )
            );
        }
        responses.push('Buffer times updated');
      }

      res.json({
        message: 'Availability settings updated successfully',
        updated: responses,
      });
    } catch (error) {
      console.error('Error updating availability settings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get availability for a specific date (used by booking system)
  app.get('/api/availability/date/:eventTypeId/:date', async (req, res) => {
    try {
      const { eventTypeId, date } = req.params;
      const { timezone = 'UTC' } = req.query;

      // Parse and validate date
      const requestedDate = new Date(date);
      if (isNaN(requestedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      // Get event type
      const eventType = await db
        .select()
        .from(appointmentEventTypes)
        .where(eq(appointmentEventTypes.id, eventTypeId))
        .limit(1);

      if (eventType.length === 0) {
        return res.status(404).json({ message: 'Event type not found' });
      }

      const et = eventType[0];

      // Get business hours for the weekday
      const weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][requestedDate.getDay()];
      const businessHours = await db
        .select()
        .from(teamMemberAvailability)
        .where(
          and(
            eq(teamMemberAvailability.userId, et.userId),
            eq(teamMemberAvailability.weekday, weekday as any),
            eq(teamMemberAvailability.type, 'available')
          )
        );

      if (businessHours.length === 0) {
        return res.json({ available: false, reason: 'No business hours configured for this day' });
      }

      // Check for blackout dates
      const blackouts = await db
        .select()
        .from(blackoutDates)
        .where(
          and(
            eq(blackoutDates.userId, et.userId),
            sql`${blackoutDates.startDate} <= ${requestedDate} AND ${blackoutDates.endDate} >= ${requestedDate}`
          )
        );

      if (blackouts.length > 0) {
        return res.json({
          available: false,
          reason: `Blackout period: ${blackouts[0].title}`,
        });
      }

      // Generate available time slots
      const bh = businessHours[0];
      const slots = [];

      // Simple slot generation (every 30 minutes)
      const startHour = parseInt(bh.startTime.split(':')[0]);
      const startMinute = parseInt(bh.startTime.split(':')[1]);
      const endHour = parseInt(bh.endTime.split(':')[0]);
      const endMinute = parseInt(bh.endTime.split(':')[1]);

      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;

      for (let time = startTimeInMinutes; time <= endTimeInMinutes - et.duration; time += 30) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Create full datetime for this slot
        const slotDate = new Date(requestedDate);
        slotDate.setHours(hour, minute, 0, 0);

        slots.push({
          time: timeString,
          available: true,
          utcTime: slotDate.toISOString(),
        });
      }

      res.json(slots);
    } catch (error) {
      console.error('Error getting date availability:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}