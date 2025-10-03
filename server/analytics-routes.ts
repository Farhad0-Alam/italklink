import type { Express } from "express";
import { storage } from './storage';
import { db } from './db';
import { 
  appointments, 
  appointmentEventTypes, 
  appointmentAnalytics,
  appointmentPayments,
  users
} from '@shared/schema';
import { 
  eq, and, or, sql, desc, asc, gte, lte, count, sum, avg,
  inArray, between, isNull, isNotNull 
} from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth } from './auth';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// Validation schemas
const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  eventTypeId: z.string().uuid().optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  timezone: z.string().default('UTC'),
});

const dateRangeSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '6m', '1y', 'custom']).default('30d'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  eventTypeId: z.string().uuid().optional(),
});

// Helper functions
function getDateRange(period: string, startDate?: string, endDate?: string) {
  const now = new Date();
  
  switch (period) {
    case '7d':
      return {
        start: startOfDay(subDays(now, 7)),
        end: endOfDay(now)
      };
    case '30d':
      return {
        start: startOfDay(subDays(now, 30)),
        end: endOfDay(now)
      };
    case '90d':
      return {
        start: startOfDay(subDays(now, 90)),
        end: endOfDay(now)
      };
    case '6m':
      return {
        start: startOfDay(subDays(now, 180)),
        end: endOfDay(now)
      };
    case '1y':
      return {
        start: startOfDay(subDays(now, 365)),
        end: endOfDay(now)
      };
    case 'custom':
      return {
        start: startDate ? startOfDay(new Date(startDate)) : startOfDay(subDays(now, 30)),
        end: endDate ? endOfDay(new Date(endDate)) : endOfDay(now)
      };
    default:
      return {
        start: startOfDay(subDays(now, 30)),
        end: endOfDay(now)
      };
  }
}

// Helper function to create timezone-aware date queries
function getTimezoneAwareHourExtraction(timezone: string = 'UTC') {
  if (timezone === 'UTC') {
    return sql<number>`EXTRACT(HOUR FROM ${appointments.startTime}::timestamp)`;
  }
  return sql<number>`EXTRACT(HOUR FROM ${appointments.startTime}::timestamp AT TIME ZONE ${timezone})`;
}

function getTimezoneAwareDayExtraction(timezone: string = 'UTC') {
  if (timezone === 'UTC') {
    return sql<number>`EXTRACT(DOW FROM ${appointments.startTime}::timestamp)`;
  }
  return sql<number>`EXTRACT(DOW FROM ${appointments.startTime}::timestamp AT TIME ZONE ${timezone})`;
}

function buildAnalyticsFilter(userId: string, eventTypeId?: string, startDate?: Date, endDate?: Date) {
  const conditions = [eq(appointments.hostUserId, userId)];
  
  if (eventTypeId) {
    conditions.push(eq(appointments.eventTypeId, eventTypeId));
  }
  
  if (startDate) {
    conditions.push(gte(appointments.startTime, startDate.toISOString()));
  }
  
  if (endDate) {
    conditions.push(lte(appointments.startTime, endDate.toISOString()));
  }
  
  return and(...conditions);
}

export function setupAnalyticsRoutes(app: Express) {

  // Dashboard overview - Combined key metrics
  app.get('/api/analytics/dashboard', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const queryResult = dateRangeSchema.safeParse(req.query);
      
      if (!queryResult.success) {
        return res.status(400).json({
          message: 'Invalid query parameters',
          errors: queryResult.error.format(),
        });
      }

      const { period, eventTypeId } = queryResult.data;
      const { start, end } = getDateRange(period, queryResult.data.startDate, queryResult.data.endDate);
      
      // Get dashboard metrics in parallel
      const [
        totalBookingsResult,
        confirmedBookingsResult,
        cancelledBookingsResult,
        noShowBookingsResult,
        revenueResult,
        conversionResult,
        popularTimesResult,
        recentActivityResult
      ] = await Promise.all([
        // Total bookings
        db.select({ count: count() })
          .from(appointments)
          .where(buildAnalyticsFilter(user.id, eventTypeId, start, end)),
        
        // Confirmed bookings
        db.select({ count: count() })
          .from(appointments)
          .where(and(
            buildAnalyticsFilter(user.id, eventTypeId, start, end),
            inArray(appointments.status, ['confirmed', 'completed'])
          )),
        
        // Cancelled bookings
        db.select({ count: count() })
          .from(appointments)
          .where(and(
            buildAnalyticsFilter(user.id, eventTypeId, start, end),
            eq(appointments.status, 'cancelled')
          )),
        
        // No shows
        db.select({ count: count() })
          .from(appointments)
          .where(and(
            buildAnalyticsFilter(user.id, eventTypeId, start, end),
            eq(appointments.status, 'no_show')
          )),
        
        // Revenue - Fixed overcounting by counting distinct appointments
        db.select({ 
          totalRevenue: sum(appointmentPayments.amount),
          paidBookings: sql<number>`COUNT(DISTINCT ${appointments.id})`
        })
          .from(appointments)
          .leftJoin(appointmentPayments, eq(appointments.id, appointmentPayments.appointmentId))
          .where(and(
            buildAnalyticsFilter(user.id, eventTypeId, start, end),
            eq(appointmentPayments.status, 'paid')
          )),
        
        // Conversion metrics (simplified for now)
        db.select({
          views: sum(appointmentAnalytics.pageViews),
          bookings: sum(appointmentAnalytics.totalBookings)
        })
          .from(appointmentAnalytics)
          .where(and(
            eq(appointmentAnalytics.userId, user.id),
            gte(appointmentAnalytics.date, start.toISOString()),
            lte(appointmentAnalytics.date, end.toISOString()),
            eventTypeId ? eq(appointmentAnalytics.eventTypeId, eventTypeId) : sql`1=1`
          )),
        
        // Popular times (hour distribution)
        db.select({
          hour: sql<number>`EXTRACT(HOUR FROM ${appointments.startTime}::timestamp)`,
          count: count()
        })
          .from(appointments)
          .where(buildAnalyticsFilter(user.id, eventTypeId, start, end))
          .groupBy(sql`EXTRACT(HOUR FROM ${appointments.startTime}::timestamp)`)
          .orderBy(sql`count DESC`)
          .limit(5),
        
        // Recent activity
        db.select({
          id: appointments.id,
          attendeeName: appointments.attendeeName,
          startTime: appointments.startTime,
          status: appointments.status,
          eventTypeName: appointmentEventTypes.name
        })
          .from(appointments)
          .leftJoin(appointmentEventTypes, eq(appointments.eventTypeId, appointmentEventTypes.id))
          .where(buildAnalyticsFilter(user.id, eventTypeId, start, end))
          .orderBy(desc(appointments.createdAt))
          .limit(10)
      ]);

      const totalBookings = totalBookingsResult[0]?.count || 0;
      const confirmedBookings = confirmedBookingsResult[0]?.count || 0;
      const cancelledBookings = cancelledBookingsResult[0]?.count || 0;
      const noShowBookings = noShowBookingsResult[0]?.count || 0;
      const totalRevenue = revenueResult[0]?.totalRevenue || 0;
      const paidBookings = revenueResult[0]?.paidBookings || 0;
      const totalViews = conversionResult[0]?.views || 0;
      const analyticsBookings = conversionResult[0]?.bookings || 0;

      // Calculate rates
      const confirmationRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;
      const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;
      const noShowRate = totalBookings > 0 ? (noShowBookings / totalBookings) * 100 : 0;
      const conversionRate = totalViews > 0 ? (analyticsBookings / totalViews) * 100 : 0;
      const avgRevenuePerBooking = paidBookings > 0 ? totalRevenue / paidBookings : 0;

      res.json({
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          period
        },
        overview: {
          totalBookings,
          confirmedBookings,
          cancelledBookings,
          noShowBookings,
          totalRevenue: totalRevenue || 0,
          paidBookings
        },
        rates: {
          confirmationRate: Math.round(confirmationRate * 100) / 100,
          cancellationRate: Math.round(cancellationRate * 100) / 100,
          noShowRate: Math.round(noShowRate * 100) / 100,
          conversionRate: Math.round(conversionRate * 100) / 100
        },
        revenue: {
          totalRevenue: totalRevenue || 0,
          avgRevenuePerBooking: Math.round(avgRevenuePerBooking),
          paidBookings
        },
        popularTimes: popularTimesResult.map(item => ({
          hour: `${item.hour}:00`,
          count: item.count
        })),
        recentActivity: recentActivityResult
      });

    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard analytics' });
    }
  });

  // Booking trends analytics
  app.get('/api/analytics/booking-trends', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      // Parse with dateRangeSchema to get period parameter
      const queryResult = dateRangeSchema.safeParse(req.query);
      
      if (!queryResult.success) {
        return res.status(400).json({
          message: 'Invalid query parameters',
          errors: queryResult.error.format(),
        });
      }

      const { period, eventTypeId } = queryResult.data;
      const { start, end } = getDateRange(period, queryResult.data.startDate, queryResult.data.endDate);
      
      // Get granularity from query separately since it's not in dateRangeSchema
      const granularity = (req.query.granularity as string) || 'day';
      
      // Build date grouping based on granularity
      const dateGrouping = granularity === 'hour' 
        ? sql`DATE_TRUNC('hour', ${appointments.startTime}::timestamp)`
        : granularity === 'week'
        ? sql`DATE_TRUNC('week', ${appointments.startTime}::timestamp)`
        : granularity === 'month'
        ? sql`DATE_TRUNC('month', ${appointments.startTime}::timestamp)`
        : sql`DATE_TRUNC('day', ${appointments.startTime}::timestamp)`;

      // Get booking trends
      const trendsResult = await db.select({
        date: dateGrouping,
        totalBookings: count(),
        confirmedBookings: count(sql`CASE WHEN ${appointments.status} IN ('confirmed', 'completed') THEN 1 END`),
        cancelledBookings: count(sql`CASE WHEN ${appointments.status} = 'cancelled' THEN 1 END`),
        noShowBookings: count(sql`CASE WHEN ${appointments.status} = 'no_show' THEN 1 END`),
        rescheduledBookings: count(sql`CASE WHEN ${appointments.isRescheduled} = true THEN 1 END`)
      })
        .from(appointments)
        .where(buildAnalyticsFilter(user.id, eventTypeId, start, end))
        .groupBy(dateGrouping)
        .orderBy(dateGrouping);

      // Get event type breakdown
      const eventTypeBreakdown = await db.select({
        eventTypeId: appointments.eventTypeId,
        eventTypeName: appointmentEventTypes.name,
        totalBookings: count(),
        confirmedBookings: count(sql`CASE WHEN ${appointments.status} IN ('confirmed', 'completed') THEN 1 END`)
      })
        .from(appointments)
        .leftJoin(appointmentEventTypes, eq(appointments.eventTypeId, appointmentEventTypes.id))
        .where(buildAnalyticsFilter(user.id, eventTypeId, start, end))
        .groupBy(appointments.eventTypeId, appointmentEventTypes.name)
        .orderBy(desc(count()));

      res.json({
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          granularity
        },
        trends: trendsResult.map(item => ({
          date: item.date,
          totalBookings: item.totalBookings,
          confirmedBookings: item.confirmedBookings,
          cancelledBookings: item.cancelledBookings,
          noShowBookings: item.noShowBookings,
          rescheduledBookings: item.rescheduledBookings
        })),
        eventTypeBreakdown: eventTypeBreakdown
      });

    } catch (error) {
      console.error('Error fetching booking trends:', error);
      res.status(500).json({ message: 'Failed to fetch booking trends' });
    }
  });

  // Popular times analysis
  app.get('/api/analytics/popular-times', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const queryResult = dateRangeSchema.safeParse(req.query);
      
      if (!queryResult.success) {
        return res.status(400).json({
          message: 'Invalid query parameters',
          errors: queryResult.error.format(),
        });
      }

      const { period, eventTypeId } = queryResult.data;
      const { start, end } = getDateRange(period, queryResult.data.startDate, queryResult.data.endDate);
      
      // Get timezone from query
      const timezone = (req.query.timezone as string) || 'UTC';

      // Get hourly distribution with timezone support
      const hourlyDistribution = await db.select({
        hour: getTimezoneAwareHourExtraction(timezone),
        count: count(),
        confirmedCount: count(sql`CASE WHEN ${appointments.status} IN ('confirmed', 'completed') THEN 1 END`)
      })
        .from(appointments)
        .where(buildAnalyticsFilter(user.id, eventTypeId, start, end))
        .groupBy(getTimezoneAwareHourExtraction(timezone))
        .orderBy(getTimezoneAwareHourExtraction(timezone));

      // Get day of week distribution with timezone support
      const dayOfWeekDistribution = await db.select({
        dayOfWeek: getTimezoneAwareDayExtraction(timezone),
        count: count(),
        confirmedCount: count(sql`CASE WHEN ${appointments.status} IN ('confirmed', 'completed') THEN 1 END`)
      })
        .from(appointments)
        .where(buildAnalyticsFilter(user.id, eventTypeId, start, end))
        .groupBy(getTimezoneAwareDayExtraction(timezone))
        .orderBy(getTimezoneAwareDayExtraction(timezone));

      // Get peak times
      const peakTimes = await db.select({
        timeSlot: sql<string>`TO_CHAR(${appointments.startTime}::timestamp, 'HH24:MI')`,
        count: count()
      })
        .from(appointments)
        .where(buildAnalyticsFilter(user.id, eventTypeId, start, end))
        .groupBy(sql`TO_CHAR(${appointments.startTime}::timestamp, 'HH24:MI')`)
        .orderBy(desc(count()))
        .limit(10);

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      res.json({
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        },
        hourlyDistribution: Array.from({ length: 24 }, (_, hour) => {
          const data = hourlyDistribution.find(h => h.hour === hour);
          return {
            hour: `${hour.toString().padStart(2, '0')}:00`,
            count: data?.count || 0,
            confirmedCount: data?.confirmedCount || 0
          };
        }),
        dayOfWeekDistribution: Array.from({ length: 7 }, (_, day) => {
          const data = dayOfWeekDistribution.find(d => d.dayOfWeek === day);
          return {
            day: dayNames[day],
            count: data?.count || 0,
            confirmedCount: data?.confirmedCount || 0
          };
        }),
        peakTimes: peakTimes
      });

    } catch (error) {
      console.error('Error fetching popular times:', error);
      res.status(500).json({ message: 'Failed to fetch popular times' });
    }
  });

  // Conversion rates tracking
  app.get('/api/analytics/conversion-rates', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const queryResult = dateRangeSchema.safeParse(req.query);
      
      if (!queryResult.success) {
        return res.status(400).json({
          message: 'Invalid query parameters',
          errors: queryResult.error.format(),
        });
      }

      const { period, eventTypeId } = queryResult.data;
      const { start, end } = getDateRange(period, queryResult.data.startDate, queryResult.data.endDate);

      // Get conversion funnel data
      const funnelData = await db.select({
        eventTypeId: appointmentAnalytics.eventTypeId,
        eventTypeName: appointmentEventTypes.name,
        totalViews: sum(appointmentAnalytics.pageViews),
        totalBookings: sum(appointmentAnalytics.totalBookings),
        confirmedBookings: sum(appointmentAnalytics.confirmedBookings),
        completedBookings: sum(appointmentAnalytics.completedBookings)
      })
        .from(appointmentAnalytics)
        .leftJoin(appointmentEventTypes, eq(appointmentAnalytics.eventTypeId, appointmentEventTypes.id))
        .where(and(
          eq(appointmentAnalytics.userId, user.id),
          gte(appointmentAnalytics.date, start.toISOString()),
          lte(appointmentAnalytics.date, end.toISOString()),
          eventTypeId ? eq(appointmentAnalytics.eventTypeId, eventTypeId) : sql`1=1`
        ))
        .groupBy(appointmentAnalytics.eventTypeId, appointmentEventTypes.name);

      // Calculate conversion rates
      const conversionMetrics = funnelData.map(item => {
        const views = item.totalViews || 0;
        const bookings = item.totalBookings || 0;
        const confirmed = item.confirmedBookings || 0;
        const completed = item.completedBookings || 0;

        return {
          eventTypeId: item.eventTypeId,
          eventTypeName: item.eventTypeName || 'Unknown Event Type',
          views,
          bookings,
          confirmed,
          completed,
          viewToBookingRate: views > 0 ? (bookings / views) * 100 : 0,
          bookingToConfirmedRate: bookings > 0 ? (confirmed / bookings) * 100 : 0,
          confirmedToCompletedRate: confirmed > 0 ? (completed / confirmed) * 100 : 0,
          overallConversionRate: views > 0 ? (completed / views) * 100 : 0
        };
      });

      // Get daily conversion trends
      const dailyTrends = await db.select({
        date: appointmentAnalytics.date,
        views: sum(appointmentAnalytics.pageViews),
        bookings: sum(appointmentAnalytics.totalBookings)
      })
        .from(appointmentAnalytics)
        .where(and(
          eq(appointmentAnalytics.userId, user.id),
          gte(appointmentAnalytics.date, start.toISOString()),
          lte(appointmentAnalytics.date, end.toISOString()),
          eventTypeId ? eq(appointmentAnalytics.eventTypeId, eventTypeId) : sql`1=1`
        ))
        .groupBy(appointmentAnalytics.date)
        .orderBy(appointmentAnalytics.date);

      res.json({
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        },
        conversionMetrics: conversionMetrics,
        dailyTrends: dailyTrends.map(day => ({
          date: day.date,
          views: day.views || 0,
          bookings: day.bookings || 0,
          conversionRate: day.views && day.views > 0 ? ((day.bookings || 0) / day.views) * 100 : 0
        }))
      });

    } catch (error) {
      console.error('Error fetching conversion rates:', error);
      res.status(500).json({ message: 'Failed to fetch conversion rates' });
    }
  });

  // No-show tracking
  app.get('/api/analytics/no-shows', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const queryResult = dateRangeSchema.safeParse(req.query);
      
      if (!queryResult.success) {
        return res.status(400).json({
          message: 'Invalid query parameters',
          errors: queryResult.error.format(),
        });
      }

      const { period, eventTypeId } = queryResult.data;
      const { start, end } = getDateRange(period, queryResult.data.startDate, queryResult.data.endDate);

      // Get no-show statistics
      const noShowStats = await db.select({
        totalAppointments: count(),
        noShowAppointments: count(sql`CASE WHEN ${appointments.status} = 'no_show' THEN 1 END`),
        completedAppointments: count(sql`CASE WHEN ${appointments.status} = 'completed' THEN 1 END`)
      })
        .from(appointments)
        .where(buildAnalyticsFilter(user.id, eventTypeId, start, end));

      // Get no-show trends by date
      const noShowTrends = await db.select({
        date: sql<string>`DATE_TRUNC('day', ${appointments.startTime}::timestamp)`,
        totalAppointments: count(),
        noShowCount: count(sql`CASE WHEN ${appointments.status} = 'no_show' THEN 1 END`)
      })
        .from(appointments)
        .where(buildAnalyticsFilter(user.id, eventTypeId, start, end))
        .groupBy(sql`DATE_TRUNC('day', ${appointments.startTime}::timestamp)`)
        .orderBy(sql`DATE_TRUNC('day', ${appointments.startTime}::timestamp)`);

      // Get no-show breakdown by event type
      const eventTypeNoShows = await db.select({
        eventTypeId: appointments.eventTypeId,
        eventTypeName: appointmentEventTypes.name,
        totalAppointments: count(),
        noShowCount: count(sql`CASE WHEN ${appointments.status} = 'no_show' THEN 1 END`)
      })
        .from(appointments)
        .leftJoin(appointmentEventTypes, eq(appointments.eventTypeId, appointmentEventTypes.id))
        .where(buildAnalyticsFilter(user.id, eventTypeId, start, end))
        .groupBy(appointments.eventTypeId, appointmentEventTypes.name);

      // Get time-based no-show patterns
      const timePatterns = await db.select({
        hour: sql<number>`EXTRACT(HOUR FROM ${appointments.startTime}::timestamp)`,
        totalAppointments: count(),
        noShowCount: count(sql`CASE WHEN ${appointments.status} = 'no_show' THEN 1 END`)
      })
        .from(appointments)
        .where(buildAnalyticsFilter(user.id, eventTypeId, start, end))
        .groupBy(sql`EXTRACT(HOUR FROM ${appointments.startTime}::timestamp)`)
        .orderBy(sql`EXTRACT(HOUR FROM ${appointments.startTime}::timestamp)`);

      const totalAppts = noShowStats[0]?.totalAppointments || 0;
      const noShows = noShowStats[0]?.noShowAppointments || 0;
      const noShowRate = totalAppts > 0 ? (noShows / totalAppts) * 100 : 0;

      res.json({
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        },
        overview: {
          totalAppointments: totalAppts,
          noShowAppointments: noShows,
          noShowRate: Math.round(noShowRate * 100) / 100,
          completedAppointments: noShowStats[0]?.completedAppointments || 0
        },
        trends: noShowTrends.map(item => ({
          date: item.date,
          totalAppointments: item.totalAppointments,
          noShowCount: item.noShowCount,
          noShowRate: item.totalAppointments > 0 ? (item.noShowCount / item.totalAppointments) * 100 : 0
        })),
        eventTypeBreakdown: eventTypeNoShows.map(item => ({
          eventTypeId: item.eventTypeId,
          eventTypeName: item.eventTypeName || 'Unknown Event Type',
          totalAppointments: item.totalAppointments,
          noShowCount: item.noShowCount,
          noShowRate: item.totalAppointments > 0 ? (item.noShowCount / item.totalAppointments) * 100 : 0
        })),
        timePatterns: timePatterns.map(item => ({
          hour: `${item.hour}:00`,
          totalAppointments: item.totalAppointments,
          noShowCount: item.noShowCount,
          noShowRate: item.totalAppointments > 0 ? (item.noShowCount / item.totalAppointments) * 100 : 0
        }))
      });

    } catch (error) {
      console.error('Error fetching no-show analytics:', error);
      res.status(500).json({ message: 'Failed to fetch no-show analytics' });
    }
  });

  // Revenue analytics
  app.get('/api/analytics/revenue', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const queryResult = dateRangeSchema.safeParse(req.query);
      
      if (!queryResult.success) {
        return res.status(400).json({
          message: 'Invalid query parameters',
          errors: queryResult.error.format(),
        });
      }

      const { period, eventTypeId } = queryResult.data;
      const { start, end } = getDateRange(period, queryResult.data.startDate, queryResult.data.endDate);

      // Get revenue overview
      const revenueOverview = await db.select({
        totalRevenue: sum(appointmentPayments.amount),
        paidBookings: count(appointmentPayments.id),
        refundedAmount: sum(sql`CASE WHEN ${appointmentPayments.status} = 'refunded' THEN ${appointmentPayments.amount} ELSE 0 END`),
        avgRevenuePerBooking: avg(appointmentPayments.amount)
      })
        .from(appointments)
        .leftJoin(appointmentPayments, eq(appointments.id, appointmentPayments.appointmentId))
        .where(and(
          buildAnalyticsFilter(user.id, eventTypeId, start, end),
          inArray(appointmentPayments.status, ['paid', 'refunded', 'partially_refunded'])
        ));

      // Get daily revenue trends
      const dailyRevenue = await db.select({
        date: sql<string>`DATE_TRUNC('day', ${appointments.startTime}::timestamp)`,
        revenue: sum(sql`CASE WHEN ${appointmentPayments.status} = 'paid' THEN ${appointmentPayments.amount} ELSE 0 END`),
        bookingsCount: count(sql`CASE WHEN ${appointmentPayments.status} = 'paid' THEN 1 END`),
        refunds: sum(sql`CASE WHEN ${appointmentPayments.status} = 'refunded' THEN ${appointmentPayments.amount} ELSE 0 END`)
      })
        .from(appointments)
        .leftJoin(appointmentPayments, eq(appointments.id, appointmentPayments.appointmentId))
        .where(and(
          buildAnalyticsFilter(user.id, eventTypeId, start, end),
          isNotNull(appointmentPayments.id)
        ))
        .groupBy(sql`DATE_TRUNC('day', ${appointments.startTime}::timestamp)`)
        .orderBy(sql`DATE_TRUNC('day', ${appointments.startTime}::timestamp)`);

      // Get revenue by event type
      const revenueByEventType = await db.select({
        eventTypeId: appointments.eventTypeId,
        eventTypeName: appointmentEventTypes.name,
        totalRevenue: sum(sql`CASE WHEN ${appointmentPayments.status} = 'paid' THEN ${appointmentPayments.amount} ELSE 0 END`),
        bookingsCount: count(sql`CASE WHEN ${appointmentPayments.status} = 'paid' THEN 1 END`),
        avgPrice: avg(sql`CASE WHEN ${appointmentPayments.status} = 'paid' THEN ${appointmentPayments.amount} ELSE NULL END`)
      })
        .from(appointments)
        .leftJoin(appointmentEventTypes, eq(appointments.eventTypeId, appointmentEventTypes.id))
        .leftJoin(appointmentPayments, eq(appointments.id, appointmentPayments.appointmentId))
        .where(and(
          buildAnalyticsFilter(user.id, eventTypeId, start, end),
          isNotNull(appointmentPayments.id)
        ))
        .groupBy(appointments.eventTypeId, appointmentEventTypes.name)
        .orderBy(desc(sum(sql`CASE WHEN ${appointmentPayments.status} = 'paid' THEN ${appointmentPayments.amount} ELSE 0 END`)));

      // Payment success rates
      const paymentStats = await db.select({
        totalAttempts: count(),
        successfulPayments: count(sql`CASE WHEN ${appointmentPayments.status} = 'paid' THEN 1 END`),
        failedPayments: count(sql`CASE WHEN ${appointmentPayments.status} = 'failed' THEN 1 END`),
        pendingPayments: count(sql`CASE WHEN ${appointmentPayments.status} = 'pending' THEN 1 END`)
      })
        .from(appointments)
        .leftJoin(appointmentPayments, eq(appointments.id, appointmentPayments.appointmentId))
        .where(and(
          buildAnalyticsFilter(user.id, eventTypeId, start, end),
          isNotNull(appointmentPayments.id)
        ));

      const overview = revenueOverview[0];
      const paymentOverview = paymentStats[0];

      res.json({
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        },
        overview: {
          totalRevenue: overview?.totalRevenue || 0,
          paidBookings: overview?.paidBookings || 0,
          refundedAmount: overview?.refundedAmount || 0,
          avgRevenuePerBooking: Math.round(overview?.avgRevenuePerBooking || 0),
          netRevenue: (overview?.totalRevenue || 0) - (overview?.refundedAmount || 0)
        },
        paymentStats: {
          totalAttempts: paymentOverview?.totalAttempts || 0,
          successfulPayments: paymentOverview?.successfulPayments || 0,
          failedPayments: paymentOverview?.failedPayments || 0,
          pendingPayments: paymentOverview?.pendingPayments || 0,
          successRate: paymentOverview?.totalAttempts > 0 
            ? ((paymentOverview?.successfulPayments || 0) / paymentOverview.totalAttempts) * 100 
            : 0
        },
        dailyTrends: dailyRevenue.map(item => ({
          date: item.date,
          revenue: item.revenue || 0,
          bookingsCount: item.bookingsCount,
          refunds: item.refunds || 0,
          netRevenue: (item.revenue || 0) - (item.refunds || 0)
        })),
        eventTypeBreakdown: revenueByEventType.map(item => ({
          eventTypeId: item.eventTypeId,
          eventTypeName: item.eventTypeName || 'Unknown Event Type',
          totalRevenue: item.totalRevenue || 0,
          bookingsCount: item.bookingsCount,
          avgPrice: Math.round(item.avgPrice || 0)
        }))
      });

    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      res.status(500).json({ message: 'Failed to fetch revenue analytics' });
    }
  });

  // Customer analytics
  app.get('/api/analytics/customers', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const queryResult = dateRangeSchema.safeParse(req.query);
      
      if (!queryResult.success) {
        return res.status(400).json({
          message: 'Invalid query parameters',
          errors: queryResult.error.format(),
        });
      }

      const { period, eventTypeId } = queryResult.data;
      const { start, end } = getDateRange(period, queryResult.data.startDate, queryResult.data.endDate);

      // Get customer metrics
      const customerOverview = await db.select({
        totalCustomers: sql<number>`COUNT(DISTINCT ${appointments.attendeeEmail})`,
        newCustomers: sql<number>`COUNT(DISTINCT CASE WHEN first_booking.min_date >= '${start.toISOString()}' THEN ${appointments.attendeeEmail} END)`,
        returningCustomers: sql<number>`COUNT(DISTINCT CASE WHEN customer_counts.booking_count > 1 THEN ${appointments.attendeeEmail} END)`
      })
        .from(appointments)
        .leftJoin(
          sql`(
            SELECT attendee_email, MIN(start_time) as min_date
            FROM appointments
            WHERE host_user_id = '${user.id}'
            GROUP BY attendee_email
          ) as first_booking`,
          sql`${appointments.attendeeEmail} = first_booking.attendee_email`
        )
        .leftJoin(
          sql`(
            SELECT attendee_email, COUNT(*) as booking_count
            FROM appointments
            WHERE host_user_id = '${user.id}'
            GROUP BY attendee_email
          ) as customer_counts`,
          sql`${appointments.attendeeEmail} = customer_counts.attendee_email`
        )
        .where(buildAnalyticsFilter(user.id, eventTypeId, start, end));

      // Get repeat customer analysis
      const repeatCustomers = await db.select({
        attendeeEmail: appointments.attendeeEmail,
        attendeeName: appointments.attendeeName,
        bookingCount: count(),
        totalRevenue: sum(appointmentPayments.amount),
        lastBookingDate: sql<string>`MAX(${appointments.startTime})`,
        firstBookingDate: sql<string>`MIN(${appointments.startTime})`
      })
        .from(appointments)
        .leftJoin(appointmentPayments, and(
          eq(appointments.id, appointmentPayments.appointmentId),
          eq(appointmentPayments.status, 'paid')
        ))
        .where(buildAnalyticsFilter(user.id, eventTypeId, start, end))
        .groupBy(appointments.attendeeEmail, appointments.attendeeName)
        .having(sql`COUNT(*) > 1`)
        .orderBy(desc(count()))
        .limit(20);

      // Get customer acquisition trends
      const acquisitionTrends = await db.select({
        date: sql<string>`DATE_TRUNC('day', first_booking.min_date)`,
        newCustomers: count()
      })
        .from(
          sql`(
            SELECT attendee_email, MIN(start_time) as min_date
            FROM appointments
            WHERE host_user_id = '${user.id}' 
            ${eventTypeId ? `AND event_type_id = '${eventTypeId}'` : ''}
            GROUP BY attendee_email
          ) as first_booking`
        )
        .where(and(
          gte(sql`first_booking.min_date`, start.toISOString()),
          lte(sql`first_booking.min_date`, end.toISOString())
        ))
        .groupBy(sql`DATE_TRUNC('day', first_booking.min_date)`)
        .orderBy(sql`DATE_TRUNC('day', first_booking.min_date)`);

      // Customer lifetime value
      const customerLTV = await db.select({
        avgLifetimeValue: avg(sql`customer_revenue.total_revenue`),
        avgBookingsPerCustomer: avg(sql`customer_revenue.booking_count`),
        topCustomerValue: sql<number>`MAX(customer_revenue.total_revenue)`
      })
        .from(
          sql`(
            SELECT 
              a.attendee_email,
              COUNT(*) as booking_count,
              COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END), 0) as total_revenue
            FROM appointments a
            LEFT JOIN appointment_payments p ON a.id = p.appointment_id
            WHERE a.host_user_id = '${user.id}'
            ${eventTypeId ? `AND a.event_type_id = '${eventTypeId}'` : ''}
            GROUP BY a.attendee_email
          ) as customer_revenue`
        );

      const overview = customerOverview[0];
      const ltv = customerLTV[0];

      res.json({
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        },
        overview: {
          totalCustomers: overview?.totalCustomers || 0,
          newCustomers: overview?.newCustomers || 0,
          returningCustomers: overview?.returningCustomers || 0,
          retentionRate: overview?.totalCustomers > 0 
            ? ((overview?.returningCustomers || 0) / overview.totalCustomers) * 100 
            : 0
        },
        lifetimeValue: {
          avgLifetimeValue: Math.round(ltv?.avgLifetimeValue || 0),
          avgBookingsPerCustomer: Math.round((ltv?.avgBookingsPerCustomer || 0) * 10) / 10,
          topCustomerValue: ltv?.topCustomerValue || 0
        },
        repeatCustomers: repeatCustomers.map(customer => ({
          email: customer.attendeeEmail,
          name: customer.attendeeName,
          bookingCount: customer.bookingCount,
          totalRevenue: customer.totalRevenue || 0,
          lastBookingDate: customer.lastBookingDate,
          firstBookingDate: customer.firstBookingDate
        })),
        acquisitionTrends: acquisitionTrends.map(item => ({
          date: item.date,
          newCustomers: item.newCustomers
        }))
      });

    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      res.status(500).json({ message: 'Failed to fetch customer analytics' });
    }
  });

  // Export analytics data
  app.get('/api/analytics/export', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { type, format = 'json' } = req.query;
      const queryResult = dateRangeSchema.safeParse(req.query);
      
      if (!queryResult.success) {
        return res.status(400).json({
          message: 'Invalid query parameters',
          errors: queryResult.error.format(),
        });
      }

      const { period, eventTypeId } = queryResult.data;
      const { start, end } = getDateRange(period, queryResult.data.startDate, queryResult.data.endDate);

      let data: any = {};

      // Fetch data based on type
      switch (type) {
        case 'bookings':
          const bookings = await db.select({
            id: appointments.id,
            eventTypeName: appointmentEventTypes.name,
            attendeeName: appointments.attendeeName,
            attendeeEmail: appointments.attendeeEmail,
            startTime: appointments.startTime,
            endTime: appointments.endTime,
            status: appointments.status,
            createdAt: appointments.createdAt
          })
            .from(appointments)
            .leftJoin(appointmentEventTypes, eq(appointments.eventTypeId, appointmentEventTypes.id))
            .where(buildAnalyticsFilter(user.id, eventTypeId, start, end))
            .orderBy(desc(appointments.startTime));
          
          data = { bookings };
          break;

        case 'revenue':
          const revenue = await db.select({
            appointmentId: appointments.id,
            eventTypeName: appointmentEventTypes.name,
            attendeeName: appointments.attendeeName,
            amount: appointmentPayments.amount,
            currency: appointmentPayments.currency,
            status: appointmentPayments.status,
            paymentDate: appointmentPayments.createdAt
          })
            .from(appointments)
            .leftJoin(appointmentEventTypes, eq(appointments.eventTypeId, appointmentEventTypes.id))
            .leftJoin(appointmentPayments, eq(appointments.id, appointmentPayments.appointmentId))
            .where(and(
              buildAnalyticsFilter(user.id, eventTypeId, start, end),
              isNotNull(appointmentPayments.id)
            ))
            .orderBy(desc(appointmentPayments.createdAt));
          
          data = { revenue };
          break;

        default:
          return res.status(400).json({ message: 'Invalid export type' });
      }

      // Return data in requested format
      if (format === 'csv') {
        // Basic CSV conversion - in production you'd use a proper CSV library
        const csv = Object.values(data)[0] as any[];
        if (csv.length > 0) {
          const headers = Object.keys(csv[0]).join(',');
          const rows = csv.map(row => Object.values(row).join(',')).join('\n');
          const csvData = `${headers}\n${rows}`;
          
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${new Date().toISOString().split('T')[0]}.csv"`);
          res.send(csvData);
        } else {
          res.status(404).json({ message: 'No data to export' });
        }
      } else {
        res.json({
          exportType: type,
          period: {
            startDate: start.toISOString(),
            endDate: end.toISOString()
          },
          exportedAt: new Date().toISOString(),
          ...data
        });
      }

    } catch (error) {
      console.error('Error exporting analytics:', error);
      res.status(500).json({ message: 'Failed to export analytics data' });
    }
  });

  // ===== CARD ANALYTICS ENDPOINTS =====

  // Card analytics dashboard - Overview metrics
  app.get('/api/analytics/cards/dashboard', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { period = '30d', cardId, startDate, endDate } = req.query;
      const { start, end } = getDateRange(period as string, startDate as string, endDate as string);

      const { buttonInteractions, leadProfiles, businessCards } = await import('@shared/schema');

      // Build filter conditions
      const filterConditions = [eq(businessCards.userId, user.id)];
      if (cardId) {
        filterConditions.push(eq(buttonInteractions.cardId, cardId as string));
      }

      // Get total views (page_view interactions)
      const viewsResult = await db.select({ count: count() })
        .from(buttonInteractions)
        .leftJoin(businessCards, eq(buttonInteractions.cardId, businessCards.id))
        .where(and(
          ...filterConditions,
          eq(buttonInteractions.interactionType, 'view'),
          gte(buttonInteractions.createdAt, start),
          lte(buttonInteractions.createdAt, end)
        ));

      // Get unique visitors
      const uniqueVisitorsResult = await db.select({
        count: sql<number>`COUNT(DISTINCT ${buttonInteractions.visitorIp})`
      })
        .from(buttonInteractions)
        .leftJoin(businessCards, eq(buttonInteractions.cardId, businessCards.id))
        .where(and(
          ...filterConditions,
          gte(buttonInteractions.createdAt, start),
          lte(buttonInteractions.createdAt, end)
        ));

      // Get total clicks (all non-view interactions)
      const clicksResult = await db.select({ count: count() })
        .from(buttonInteractions)
        .leftJoin(businessCards, eq(buttonInteractions.cardId, businessCards.id))
        .where(and(
          ...filterConditions,
          eq(buttonInteractions.interactionType, 'click'),
          gte(buttonInteractions.createdAt, start),
          lte(buttonInteractions.createdAt, end)
        ));

      // Get device breakdown
      const deviceBreakdown = await db.select({
        device: buttonInteractions.visitorDevice,
        count: count()
      })
        .from(buttonInteractions)
        .leftJoin(businessCards, eq(buttonInteractions.cardId, businessCards.id))
        .where(and(
          ...filterConditions,
          gte(buttonInteractions.createdAt, start),
          lte(buttonInteractions.createdAt, end)
        ))
        .groupBy(buttonInteractions.visitorDevice);

      // Get clicks by action type
      const clicksByAction = await db.select({
        action: buttonInteractions.buttonAction,
        label: buttonInteractions.buttonLabel,
        count: count()
      })
        .from(buttonInteractions)
        .leftJoin(businessCards, eq(buttonInteractions.cardId, businessCards.id))
        .where(and(
          ...filterConditions,
          eq(buttonInteractions.interactionType, 'click'),
          gte(buttonInteractions.createdAt, start),
          lte(buttonInteractions.createdAt, end)
        ))
        .groupBy(buttonInteractions.buttonAction, buttonInteractions.buttonLabel)
        .orderBy(desc(count()));

      // Get location breakdown (top countries)
      const locationBreakdown = await db.select({
        country: sql<string>`${buttonInteractions.visitorLocation}->>'country'`,
        city: sql<string>`${buttonInteractions.visitorLocation}->>'city'`,
        count: count()
      })
        .from(buttonInteractions)
        .leftJoin(businessCards, eq(buttonInteractions.cardId, businessCards.id))
        .where(and(
          ...filterConditions,
          gte(buttonInteractions.createdAt, start),
          lte(buttonInteractions.createdAt, end),
          isNotNull(buttonInteractions.visitorLocation)
        ))
        .groupBy(sql`${buttonInteractions.visitorLocation}->>'country'`, sql`${buttonInteractions.visitorLocation}->>'city'`)
        .orderBy(desc(count()))
        .limit(10);

      res.json({
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          period
        },
        overview: {
          totalViews: viewsResult[0]?.count || 0,
          uniqueVisitors: uniqueVisitorsResult[0]?.count || 0,
          totalClicks: clicksResult[0]?.count || 0,
          clickThroughRate: viewsResult[0]?.count > 0 
            ? ((clicksResult[0]?.count || 0) / viewsResult[0].count * 100).toFixed(2)
            : 0
        },
        deviceBreakdown: deviceBreakdown.map(d => ({
          device: d.device || 'unknown',
          count: d.count
        })),
        clicksByAction: clicksByAction.map(c => ({
          action: c.action,
          label: c.label,
          count: c.count
        })),
        topLocations: locationBreakdown.filter(l => l.country).map(l => ({
          country: l.country,
          city: l.city,
          count: l.count
        }))
      });

    } catch (error) {
      console.error('Error fetching card analytics dashboard:', error);
      res.status(500).json({ message: 'Failed to fetch card analytics dashboard' });
    }
  });

  // Card analytics - Time-based trends
  app.get('/api/analytics/cards/trends', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { period = '30d', cardId, granularity = 'day', startDate, endDate } = req.query;
      const { start, end } = getDateRange(period as string, startDate as string, endDate as string);

      const { buttonInteractions, businessCards } = await import('@shared/schema');

      const filterConditions = [eq(businessCards.userId, user.id)];
      if (cardId) {
        filterConditions.push(eq(buttonInteractions.cardId, cardId as string));
      }

      // Build date grouping based on granularity
      const dateGrouping = granularity === 'hour' 
        ? sql`DATE_TRUNC('hour', ${buttonInteractions.createdAt})`
        : granularity === 'week'
        ? sql`DATE_TRUNC('week', ${buttonInteractions.createdAt})`
        : granularity === 'month'
        ? sql`DATE_TRUNC('month', ${buttonInteractions.createdAt})`
        : sql`DATE_TRUNC('day', ${buttonInteractions.createdAt})`;

      // Get view and click trends over time
      const trends = await db.select({
        date: dateGrouping,
        views: count(sql`CASE WHEN ${buttonInteractions.interactionType} = 'view' THEN 1 END`),
        clicks: count(sql`CASE WHEN ${buttonInteractions.interactionType} = 'click' THEN 1 END`),
        uniqueVisitors: sql<number>`COUNT(DISTINCT ${buttonInteractions.visitorIp})`
      })
        .from(buttonInteractions)
        .leftJoin(businessCards, eq(buttonInteractions.cardId, businessCards.id))
        .where(and(
          ...filterConditions,
          gte(buttonInteractions.createdAt, start),
          lte(buttonInteractions.createdAt, end)
        ))
        .groupBy(dateGrouping)
        .orderBy(dateGrouping);

      res.json({
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          granularity
        },
        trends: trends.map(t => ({
          date: t.date,
          views: t.views,
          clicks: t.clicks,
          uniqueVisitors: t.uniqueVisitors,
          clickThroughRate: t.views > 0 ? ((t.clicks / t.views) * 100).toFixed(2) : 0
        }))
      });

    } catch (error) {
      console.error('Error fetching card analytics trends:', error);
      res.status(500).json({ message: 'Failed to fetch card analytics trends' });
    }
  });

  // Card analytics - Individual card performance
  app.get('/api/analytics/cards/performance', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { period = '30d', cardId, startDate, endDate } = req.query;
      const { start, end } = getDateRange(period as string, startDate as string, endDate as string);

      const { buttonInteractions, businessCards } = await import('@shared/schema');

      // Get performance metrics for each card
      const filterConditions = [
        eq(businessCards.userId, user.id),
        gte(buttonInteractions.createdAt, start),
        lte(buttonInteractions.createdAt, end)
      ];
      
      if (cardId) {
        filterConditions.push(eq(buttonInteractions.cardId, cardId as string));
      }

      const cardPerformance = await db.select({
        cardId: buttonInteractions.cardId,
        cardTitle: sql<string>`COALESCE(${businessCards.fullName}, ${businessCards.templateData}->>'name', 'Untitled Card')`,
        totalViews: count(sql`CASE WHEN ${buttonInteractions.interactionType} = 'view' THEN 1 END`),
        totalClicks: count(sql`CASE WHEN ${buttonInteractions.interactionType} = 'click' THEN 1 END`),
        uniqueVisitors: sql<number>`COUNT(DISTINCT ${buttonInteractions.visitorIp})`,
        avgLeadScore: avg(buttonInteractions.leadScore)
      })
        .from(buttonInteractions)
        .leftJoin(businessCards, eq(buttonInteractions.cardId, businessCards.id))
        .where(and(...filterConditions))
        .groupBy(buttonInteractions.cardId, businessCards.fullName, sql`${businessCards.templateData}->>'name'`)
        .orderBy(desc(count()));

      res.json({
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        },
        cards: cardPerformance.map(c => ({
          cardId: c.cardId,
          cardTitle: c.cardTitle || 'Untitled Card',
          totalViews: c.totalViews,
          totalClicks: c.totalClicks,
          uniqueVisitors: c.uniqueVisitors,
          clickThroughRate: c.totalViews > 0 ? ((c.totalClicks / c.totalViews) * 100).toFixed(2) : 0,
          avgLeadScore: Math.round(c.avgLeadScore || 0)
        }))
      });

    } catch (error) {
      console.error('Error fetching card performance:', error);
      res.status(500).json({ message: 'Failed to fetch card performance' });
    }
  });

  // QR scan tracking endpoint
  app.post('/api/analytics/qr-scan', async (req, res) => {
    try {
      const { qrId, shortId } = req.body;

      if (!qrId && !shortId) {
        return res.status(400).json({ message: 'QR ID or Short ID is required' });
      }

      const { qrEvents, qrLinks } = await import('@shared/schema');
      
      // Get device type from user agent
      const userAgent = req.headers['user-agent'] || '';
      const device = userAgent.match(/mobile/i) ? 'mobile' : 
                     userAgent.match(/tablet|ipad/i) ? 'tablet' : 
                     userAgent.match(/bot|crawler|spider/i) ? 'bot' : 'desktop';

      // Hash IP for privacy
      const crypto = await import('crypto');
      const ipHash = crypto.createHash('sha256')
        .update((req.ip || 'unknown') + process.env.IP_SALT || 'default-salt')
        .digest('hex');

      // Get country from headers (Cloudflare or similar)
      const country = (req.headers['cf-ipcountry'] as string) || 
                     (req.headers['x-country'] as string) || null;

      // Record the scan event
      await db.insert(qrEvents).values({
        qrId: qrId || shortId,
        ipHash,
        ua: userAgent,
        device: device as any,
        country,
        referrer: req.headers.referer || req.headers.referrer,
        landingHost: req.headers.host
      });

      res.json({ success: true, message: 'QR scan tracked' });

    } catch (error) {
      console.error('Error tracking QR scan:', error);
      res.status(500).json({ message: 'Failed to track QR scan' });
    }
  });

  // QR analytics endpoint
  app.get('/api/analytics/qr/:qrId', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { qrId } = req.params;
      const { period = '30d' } = req.query;
      const { start, end } = getDateRange(period as string);

      const { qrEvents, qrLinks } = await import('@shared/schema');

      // Verify QR link belongs to user
      const qrLink = await db.select()
        .from(qrLinks)
        .where(eq(qrLinks.id, qrId))
        .limit(1);

      if (!qrLink.length || qrLink[0].userId !== user.id) {
        return res.status(404).json({ message: 'QR code not found' });
      }

      // Get scan statistics
      const scanStats = await db.select({
        totalScans: count(),
        uniqueScans: sql<number>`COUNT(DISTINCT ${qrEvents.ipHash})`,
        deviceBreakdown: sql<any>`json_agg(DISTINCT ${qrEvents.device})`,
        countryBreakdown: sql<any>`json_agg(DISTINCT ${qrEvents.country})`
      })
        .from(qrEvents)
        .where(and(
          eq(qrEvents.qrId, qrId),
          gte(qrEvents.ts, start),
          lte(qrEvents.ts, end)
        ));

      // Get daily scan trends
      const scanTrends = await db.select({
        date: sql<string>`DATE_TRUNC('day', ${qrEvents.ts})`,
        scans: count()
      })
        .from(qrEvents)
        .where(and(
          eq(qrEvents.qrId, qrId),
          gte(qrEvents.ts, start),
          lte(qrEvents.ts, end)
        ))
        .groupBy(sql`DATE_TRUNC('day', ${qrEvents.ts})`)
        .orderBy(sql`DATE_TRUNC('day', ${qrEvents.ts})`);

      res.json({
        qrLink: qrLink[0],
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        },
        stats: scanStats[0] || { totalScans: 0, uniqueScans: 0 },
        trends: scanTrends
      });

    } catch (error) {
      console.error('Error fetching QR analytics:', error);
      res.status(500).json({ message: 'Failed to fetch QR analytics' });
    }
  });
}