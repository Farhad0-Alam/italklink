import type { Express, Request, Response } from "express";
import { storage } from './storage';
import { getStripe, hasStripeConfig, formatCurrency, toCents, fromCents, STRIPE_CONFIG } from './stripe-config';
import { z } from 'zod';
import { requireAuth, optionalAuth } from './auth';
import { insertAppointmentPaymentSchema } from '@shared/schema';
import type { InsertAppointmentPayment } from '@shared/schema';
import Stripe from 'stripe';

// Validation schemas
const createPaymentIntentSchema = z.object({
  appointmentId: z.string().uuid(),
  eventTypeId: z.string().uuid(),
  amount: z.number().min(1), // amount in cents
  currency: z.string().default('usd'),
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  metadata: z.record(z.string()).optional(),
});

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string(),
});

const refundPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().optional(), // partial refund amount in cents
  reason: z.enum(['requested_by_customer', 'duplicate', 'fraudulent']).optional(),
});

const paymentHistoryFiltersSchema = z.object({
  status: z.enum(['pending', 'paid', 'failed', 'refunded', 'partially_refunded']).optional(),
  appointmentId: z.string().uuid().optional(),
  customerId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().regex(/^\d+$/).optional().transform(val => val ? Math.min(parseInt(val), 100) : 20),
});

export function setupPaymentRoutes(app: Express) {
  // Check if Stripe is configured before setting up routes
  if (!hasStripeConfig()) {
    console.warn('⚠️  Stripe not configured - payment routes disabled');
    // Setup placeholder routes that return appropriate errors
    app.post('/api/payments/create-payment-intent', (req, res) => {
      res.status(503).json({ message: 'Payment processing is not configured' });
    });
    app.post('/api/payments/confirm-payment', (req, res) => {
      res.status(503).json({ message: 'Payment processing is not configured' });
    });
    app.post('/api/payments/refund', (req, res) => {
      res.status(503).json({ message: 'Payment processing is not configured' });
    });
    app.post('/api/payments/webhook', (req, res) => {
      res.status(503).json({ message: 'Payment processing is not configured' });
    });
    app.get('/api/payments/history', (req, res) => {
      res.status(503).json({ message: 'Payment processing is not configured' });
    });
    return;
  }

  console.log('✅ Setting up Stripe payment routes');

  // Create payment intent for appointment booking
  app.post('/api/payments/create-payment-intent', async (req: Request, res: Response) => {
    try {
      const validation = createPaymentIntentSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: 'Invalid payment data',
          errors: validation.error.format(),
        });
      }

      const { appointmentId, eventTypeId, amount, currency, customerEmail, customerName, metadata } = validation.data;

      // Verify event type exists and get pricing
      const eventType = await storage.getAppointmentEventType(eventTypeId);
      if (!eventType) {
        return res.status(404).json({ message: 'Event type not found' });
      }

      // Verify the amount matches the event type price
      const expectedAmount = toCents(eventType.price);
      if (amount !== expectedAmount) {
        return res.status(400).json({ 
          message: 'Payment amount does not match event type price',
          expected: expectedAmount,
          received: amount,
        });
      }

      // Verify currency matches event type configuration
      if (currency !== (eventType.currency || 'usd')) {
        return res.status(400).json({ 
          message: 'Currency does not match event type configuration',
          expected: eventType.currency || 'usd',
          received: currency,
        });
      }

      // Create customer in Stripe (or retrieve existing)
      const stripe = getStripe();
      let customer: Stripe.Customer;
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: {
            userId: req.user?.id || 'guest',
          },
        });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customer.id,
        metadata: {
          appointmentId,
          eventTypeId,
          customerEmail,
          customerName,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: customerEmail,
      });

      // Create payment record in database
      const paymentData: InsertAppointmentPayment = {
        appointmentId,
        amount,
        currency,
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: customer.id,
        customerEmail,
        customerName,
        paymentMethod: null, // Will be updated after payment confirmation
        metadata: metadata || null,
      };

      const payment = await storage.createAppointmentPayment(paymentData);

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentId: payment.id,
        amount,
        currency,
        formattedAmount: formatCurrency(amount, currency),
      });

    } catch (error) {
      console.error('Failed to create payment intent:', error);
      res.status(500).json({ 
        message: 'Failed to create payment intent',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Confirm payment after successful Stripe payment
  app.post('/api/payments/confirm-payment', async (req: Request, res: Response) => {
    try {
      const validation = confirmPaymentSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: 'Invalid confirmation data',
          errors: validation.error.format(),
        });
      }

      const { paymentIntentId } = validation.data;

      // Verify payment intent with Stripe
      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ 
          message: 'Payment has not been completed',
          status: paymentIntent.status,
        });
      }

      // Update payment record and get appointmentId from it (security: don't trust client)
      const payment = await storage.updateAppointmentPaymentByStripeId(paymentIntentId, {
        status: 'paid',
        paidAt: new Date(),
        paymentMethod: paymentIntent.payment_method_types[0] || 'card',
      });

      // Validate payment amount and currency match Stripe intent
      if (payment.amount !== paymentIntent.amount) {
        throw new Error('Payment amount mismatch');
      }
      if (payment.currency !== paymentIntent.currency) {
        throw new Error('Payment currency mismatch');
      }

      // Update appointment status to confirmed (use appointmentId from payment record)
      await storage.updateAppointment(payment.appointmentId, {
        status: 'confirmed',
        paymentStatus: 'paid',
      });

      // Trigger notification for successful payment
      // await notificationService.sendPaymentConfirmation(appointmentId, payment.id);

      res.json({
        success: true,
        payment,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      });

    } catch (error) {
      console.error('Failed to confirm payment:', error);
      res.status(500).json({ 
        message: 'Failed to confirm payment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Process refund for appointment payment
  app.post('/api/payments/refund', requireAuth, async (req: Request, res: Response) => {
    try {
      const validation = refundPaymentSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: 'Invalid refund data',
          errors: validation.error.format(),
        });
      }

      const { paymentId, amount, reason } = validation.data;

      // Get payment record
      const payment = await storage.getAppointmentPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Verify user has permission to refund this payment
      const appointment = await storage.getAppointment(payment.appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Associated appointment not found' });
      }

      const eventType = await storage.getAppointmentEventType(appointment.eventTypeId);
      if (!eventType || eventType.userId !== req.user!.id) {
        return res.status(403).json({ message: 'Not authorized to refund this payment' });
      }

      // Check if payment can be refunded
      if (!payment.stripePaymentIntentId || payment.status !== 'paid') {
        return res.status(400).json({ message: 'Payment cannot be refunded' });
      }

      // Calculate refund amount
      const refundAmount = amount || payment.amount;
      if (refundAmount > payment.amount) {
        return res.status(400).json({ message: 'Refund amount cannot exceed original payment' });
      }

      // Process refund with Stripe
      const stripe = getStripe();
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: refundAmount,
        reason,
        metadata: {
          paymentId,
          appointmentId: payment.appointmentId,
          userId: req.user!.id,
        },
      });

      // Update payment record
      const totalRefunded = (payment.refundAmount || 0) + refundAmount;
      const newStatus = totalRefunded >= payment.amount ? 'refunded' : 'partially_refunded';
      const updatedPayment = await storage.updateAppointmentPayment(paymentId, {
        status: newStatus,
        refundedAt: new Date(),
        refundAmount: totalRefunded,
        stripeRefundId: refund.id,
      });

      // Only cancel appointment for full refunds
      if (totalRefunded >= payment.amount) {
        await storage.updateAppointment(payment.appointmentId, {
          status: 'cancelled',
          paymentStatus: 'refunded',
        });
      } else {
        // For partial refunds, just update payment status
        await storage.updateAppointment(payment.appointmentId, {
          paymentStatus: 'partially_refunded',
        });
      }

      res.json({
        success: true,
        refund: {
          id: refund.id,
          amount: refundAmount,
          status: refund.status,
          currency: refund.currency,
        },
        payment: updatedPayment,
      });

    } catch (error) {
      console.error('Failed to process refund:', error);
      res.status(500).json({ 
        message: 'Failed to process refund',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Stripe webhook endpoint for handling async events
  app.post('/api/payments/webhook', async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      console.error('Missing Stripe signature header');
      return res.status(400).json({ message: 'Missing signature header' });
    }

    let event: Stripe.Event;
    
    try {
      // Verify webhook signature
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_CONFIG.webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).json({ message: 'Invalid signature' });
    }

    try {
      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentSuccess(paymentIntent);
          break;
        }
        
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentFailure(paymentIntent);
          break;
        }
        
        case 'payment_intent.canceled': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentCancellation(paymentIntent);
          break;
        }
        
        case 'charge.dispute.created': {
          const dispute = event.data.object as Stripe.Dispute;
          await handleChargeback(dispute);
          break;
        }
        
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      
      // Respond with success to acknowledge receipt
      res.json({ received: true, eventType: event.type });
      
    } catch (error) {
      console.error(`Webhook handler failed for event ${event.type}:`, error);
      res.status(500).json({ message: 'Webhook handler failed' });
    }
  });

  // Helper function to handle successful payments
  async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const payment = await storage.updateAppointmentPaymentByStripeId(paymentIntent.id, {
      status: 'paid',
      paidAt: new Date(),
      paymentMethod: paymentIntent.payment_method_types[0] || 'card',
    });

    // Update appointment status to confirmed
    await storage.updateAppointment(payment.appointmentId, {
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    console.log(`Payment succeeded for appointment ${payment.appointmentId}`);
  }

  // Helper function to handle failed payments
  async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const payment = await storage.updateAppointmentPaymentByStripeId(paymentIntent.id, {
      status: 'failed',
    });

    // Update appointment status to cancelled
    await storage.updateAppointment(payment.appointmentId, {
      status: 'cancelled',
      paymentStatus: 'failed',
    });

    console.log(`Payment failed for appointment ${payment.appointmentId}`);
  }

  // Helper function to handle payment cancellations
  async function handlePaymentCancellation(paymentIntent: Stripe.PaymentIntent) {
    const payment = await storage.updateAppointmentPaymentByStripeId(paymentIntent.id, {
      status: 'cancelled',
    });

    // Update appointment status to cancelled
    await storage.updateAppointment(payment.appointmentId, {
      status: 'cancelled',
      paymentStatus: 'cancelled',
    });

    console.log(`Payment cancelled for appointment ${payment.appointmentId}`);
  }

  // Helper function to handle chargebacks/disputes
  async function handleChargeback(dispute: Stripe.Dispute) {
    const chargeId = dispute.charge as string;
    
    // Find payment by charge ID (would need to add this to storage if not exists)
    // For now, log the dispute
    console.log(`Chargeback received for charge ${chargeId}:`, {
      amount: dispute.amount,
      reason: dispute.reason,
      status: dispute.status,
    });

    // TODO: Implement chargeback handling logic
    // - Find associated payment and appointment
    // - Update payment status to 'disputed'
    // - Notify administrators
    // - Handle appointment cancellation if needed
  }

  // Get payment history for authenticated user
  app.get('/api/payments/history', requireAuth, async (req: Request, res: Response) => {
    try {
      const validation = paymentHistoryFiltersSchema.safeParse(req.query);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: 'Invalid query parameters',
          errors: validation.error.format(),
        });
      }

      const filters = validation.data;

      // Get user's payments through their event types
      const payments = await storage.getUserAppointmentPayments(req.user!.id, filters);
      
      // Add formatted amounts and appointment details
      const enrichedPayments = await Promise.all(
        payments.map(async (payment) => {
          const appointment = await storage.getAppointment(payment.appointmentId);
          const eventType = appointment ? await storage.getAppointmentEventType(appointment.eventTypeId) : null;

          return {
            ...payment,
            formattedAmount: formatCurrency(payment.amount, payment.currency),
            formattedRefundAmount: payment.refundAmount ? formatCurrency(payment.refundAmount, payment.currency) : null,
            appointment: appointment ? {
              id: appointment.id,
              startTime: appointment.startTime,
              attendeeName: appointment.attendeeName,
              attendeeEmail: appointment.attendeeEmail,
              status: appointment.status,
            } : null,
            eventType: eventType ? {
              id: eventType.id,
              name: eventType.name,
              duration: eventType.duration,
            } : null,
          };
        })
      );

      res.json({
        payments: enrichedPayments,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: enrichedPayments.length,
        },
      });

    } catch (error) {
      console.error('Failed to get payment history:', error);
      res.status(500).json({ 
        message: 'Failed to get payment history',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get payment details by ID
  app.get('/api/payments/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const payment = await storage.getAppointmentPayment(id);
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Verify user has permission to view this payment
      const appointment = await storage.getAppointment(payment.appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Associated appointment not found' });
      }

      const eventType = await storage.getAppointmentEventType(appointment.eventTypeId);
      if (!eventType || eventType.userId !== req.user!.id) {
        return res.status(403).json({ message: 'Not authorized to view this payment' });
      }

      // Enrich payment with related data
      const enrichedPayment = {
        ...payment,
        formattedAmount: formatCurrency(payment.amount, payment.currency),
        formattedRefundAmount: payment.refundAmount ? formatCurrency(payment.refundAmount, payment.currency) : null,
        appointment: {
          id: appointment.id,
          startTime: appointment.startTime,
          attendeeName: appointment.attendeeName,
          attendeeEmail: appointment.attendeeEmail,
          status: appointment.status,
        },
        eventType: {
          id: eventType.id,
          name: eventType.name,
          duration: eventType.duration,
          price: eventType.price,
        },
      };

      res.json(enrichedPayment);

    } catch (error) {
      console.error('Failed to get payment details:', error);
      res.status(500).json({ 
        message: 'Failed to get payment details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Stripe webhook handler for payment status updates
  app.post('/api/payments/webhook', async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    try {
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentSuccess(paymentIntent);
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          await handlePaymentFailure(failedPayment);
          break;

        case 'charge.dispute.created':
          const dispute = event.data.object as Stripe.Dispute;
          await handlePaymentDispute(dispute);
          break;

        case 'refund.created':
          const refund = event.data.object as Stripe.Refund;
          await handleRefundCreated(refund);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  });

  // Payment analytics and statistics
  app.get('/api/payments/analytics', requireAuth, async (req: Request, res: Response) => {
    try {
      const analytics = await storage.getPaymentAnalytics(req.user!.id);

      res.json({
        totalRevenue: analytics.totalRevenue,
        formattedTotalRevenue: formatCurrency(analytics.totalRevenue, 'usd'),
        totalTransactions: analytics.totalTransactions,
        successfulPayments: analytics.successfulPayments,
        refundedPayments: analytics.refundedPayments,
        averageTransactionValue: analytics.averageTransactionValue,
        formattedAverageTransactionValue: formatCurrency(analytics.averageTransactionValue, 'usd'),
        monthlyRevenue: analytics.monthlyRevenue.map(month => ({
          ...month,
          formattedRevenue: formatCurrency(month.revenue, 'usd'),
        })),
        paymentsByStatus: analytics.paymentsByStatus,
        recentPayments: analytics.recentPayments.map(payment => ({
          ...payment,
          formattedAmount: formatCurrency(payment.amount, payment.currency),
        })),
      });

    } catch (error) {
      console.error('Failed to get payment analytics:', error);
      res.status(500).json({ 
        message: 'Failed to get payment analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

// Webhook handler functions
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  if (!paymentIntent.metadata.appointmentId) {
    console.warn('Payment intent missing appointmentId metadata');
    return;
  }

  const appointmentId = paymentIntent.metadata.appointmentId;

  try {
    // Update payment record
    await storage.updateAppointmentPaymentByStripeId(paymentIntent.id, {
      status: 'paid',
      paidAt: new Date(),
      paymentMethod: paymentIntent.payment_method_types[0] || 'card',
    });

    // Update appointment status
    await storage.updateAppointment(appointmentId, {
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    console.log(`Payment successful for appointment ${appointmentId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  if (!paymentIntent.metadata.appointmentId) {
    console.warn('Failed payment intent missing appointmentId metadata');
    return;
  }

  try {
    // Update payment record
    await storage.updateAppointmentPaymentByStripeId(paymentIntent.id, {
      status: 'failed',
      failedAt: new Date(),
    });

    console.log(`Payment failed for appointment ${paymentIntent.metadata.appointmentId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handlePaymentDispute(dispute: Stripe.Dispute) {
  console.log('Payment dispute created:', dispute.id);
  // Handle dispute logic here - notify admin, flag payment, etc.
}

async function handleRefundCreated(refund: Stripe.Refund) {
  console.log('Refund created:', refund.id);
  // Additional refund processing if needed
}