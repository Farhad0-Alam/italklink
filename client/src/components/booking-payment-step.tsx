import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PaymentForm } from "./payment-form";
import { StripeProvider } from "./stripe-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Calendar, MapPin, User, DollarSign, ChevronLeft, CheckCircle, AlertCircle } from "lucide-react";
import { createPaymentIntent, formatCurrency } from "@/lib/payment-utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EventType {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
  meetingLocation: string;
  brandColor: string;
  instructionsBeforeEvent: string;
  instructionsAfterEvent: string;
}

interface AppointmentData {
  startTime: string;
  attendeeEmail: string;
  attendeeName: string;
  attendeePhone?: string;
  attendeeCompany?: string;
  notes?: string;
  timezone: string;
}

interface BookingPaymentStepProps {
  eventType: EventType;
  appointmentData: AppointmentData;
  onPaymentSuccess: (paymentData: any) => void;
  onBackStep: () => void;
  onBookingComplete: (booking: any) => void;
}

export function BookingPaymentStep({
  eventType,
  appointmentData,
  onPaymentSuccess,
  onBackStep,
  onBookingComplete,
}: BookingPaymentStepProps) {
  const { toast } = useToast();
  
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Create appointment first, then payment intent
  const createAppointmentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventTypeId: eventType.id,
          startTime: appointmentData.startTime,
          attendeeEmail: appointmentData.attendeeEmail,
          attendeeName: appointmentData.attendeeName,
          attendeePhone: appointmentData.attendeePhone || null,
          attendeeCompany: appointmentData.attendeeCompany || null,
          notes: appointmentData.notes || null,
          timezone: appointmentData.timezone,
          paymentStatus: 'pending', // Mark as pending payment
          bookingSource: 'direct',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create appointment');
      }

      return response.json();
    },
    onSuccess: async (appointment) => {
      setAppointmentId(appointment.id);
      // Create payment intent after appointment is created
      await createPaymentIntentMutation.mutateAsync(appointment.id);
    },
    onError: (error) => {
      toast({
        title: "Booking Error",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  // Create payment intent mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      return createPaymentIntent({
        appointmentId,
        eventTypeId: eventType.id,
        amount: eventType.price * 100, // Convert to cents
        currency: eventType.currency.toLowerCase(),
        customerEmail: appointmentData.attendeeEmail,
        customerName: appointmentData.attendeeName,
        metadata: {
          eventTypeName: eventType.name,
          appointmentTime: appointmentData.startTime,
          timezone: appointmentData.timezone,
        },
      });
    },
    onSuccess: (paymentData) => {
      setClientSecret(paymentData.clientSecret);
      setPaymentIntentId(paymentData.paymentIntentId);
      setPaymentId(paymentData.paymentId);
      setPaymentError(null);
    },
    onError: (error) => {
      setPaymentError(error instanceof Error ? error.message : 'Failed to initialize payment');
      toast({
        title: "Payment Setup Error",
        description: error instanceof Error ? error.message : "Failed to setup payment",
        variant: "destructive",
      });
    },
  });

  // Handle payment success
  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      if (!appointmentId) {
        throw new Error('No appointment ID found');
      }

      // Confirm payment on server
      const response = await fetch('/api/payments/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          appointmentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to confirm payment');
      }

      const result = await response.json();
      
      // Call success callbacks
      onPaymentSuccess({
        paymentIntent,
        payment: result.payment,
        appointmentId,
      });

      onBookingComplete({
        appointment: { id: appointmentId },
        payment: result.payment,
        paymentIntent,
      });

    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast({
        title: "Payment Confirmation Error",
        description: error instanceof Error ? error.message : "Payment succeeded but confirmation failed",
        variant: "destructive",
      });
    }
  };

  // Handle payment error
  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setPaymentError(error?.message || 'Payment failed');
  };

  // Initialize payment process
  const initializePayment = () => {
    if (!appointmentId) {
      createAppointmentMutation.mutate();
    } else {
      createPaymentIntentMutation.mutate(appointmentId);
    }
  };

  const isLoading = createAppointmentMutation.isPending || createPaymentIntentMutation.isPending;
  const startTime = new Date(appointmentData.startTime);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Booking Summary */}
        <div className="space-y-6">
          <div>
            <Button
              variant="ghost"
              onClick={onBackStep}
              className="mb-4"
              data-testid="button-back-step"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Details
            </Button>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Complete Your Booking
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Review your booking details and complete payment to confirm your appointment
            </p>
          </div>

          <Card data-testid="booking-summary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{eventType.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {eventType.description}
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg font-semibold">
                  {formatCurrency(eventType.price * 100, eventType.currency)}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {eventType.duration} minutes
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {format(startTime, 'EEEE, MMMM do, yyyy')} at {format(startTime, 'h:mm a')}
                  </span>
                </div>

                {eventType.meetingLocation && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm capitalize">
                      {eventType.meetingLocation.replace('_', ' ')}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {appointmentData.attendeeName}
                  </span>
                </div>
              </div>

              {appointmentData.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">
                      Additional Notes
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {appointmentData.notes}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center justify-between text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Total Amount
                </div>
                <span>{formatCurrency(eventType.price * 100, eventType.currency)}</span>
              </div>
            </CardContent>
          </Card>

          {eventType.instructionsBeforeEvent && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Before your appointment:</strong> {eventType.instructionsBeforeEvent}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Payment Section */}
        <div className="space-y-6">
          {paymentError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}

          {!clientSecret && !isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Ready to Book?</CardTitle>
                <CardDescription>
                  Click below to proceed with payment and confirm your {eventType.name} appointment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="lg"
                  onClick={initializePayment}
                  className="w-full"
                  data-testid="button-initialize-payment"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Setting up your payment...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {clientSecret && (
            <StripeProvider clientSecret={clientSecret}>
              <PaymentForm
                amount={eventType.price * 100}
                currency={eventType.currency}
                eventTypeName={eventType.name}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                customerEmail={appointmentData.attendeeEmail}
                customerName={appointmentData.attendeeName}
                isProcessing={isLoading}
              />
            </StripeProvider>
          )}
        </div>
      </div>
    </div>
  );
}