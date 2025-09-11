import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { CalendarDays, Clock, MapPin, User, Check, ChevronLeft, ChevronRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format, startOfToday, addDays, parseISO } from "date-fns";
import { BookingPaymentStep } from "@/components/booking-payment-step";
import { formatCurrency } from "@/lib/utils";

// Common timezone options for the selector
const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];

// Form validation schemas
const attendeeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

type AttendeeFormData = z.infer<typeof attendeeFormSchema>;

interface BookingStep {
  id: string;
  title: string;
  description: string;
}

// Dynamic booking steps based on whether event requires payment
const getBookingSteps = (isPaidEvent: boolean): BookingStep[] => {
  const baseSteps = [
    {
      id: "info",
      title: "Event Details",
      description: "Review event information",
    },
    {
      id: "time",
      title: "Select Time",
      description: "Choose date and time",
    },
    {
      id: "details",
      title: "Your Details",
      description: "Provide your information",
    },
  ];

  if (isPaidEvent) {
    baseSteps.push({
      id: "payment",
      title: "Payment",
      description: "Complete payment",
    });
  }

  baseSteps.push({
    id: "confirm",
    title: "Confirmation",
    description: "Review and confirm",
  });

  return baseSteps;
};

interface TimeSlot {
  time: string;
  available: boolean;
  utcTime: string;
}

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
  requiresConfirmation: boolean;
  bufferTimeBefore: number;
  bufferTimeAfter: number;
}

export default function BookingPage() {
  const { eventTypeSlug } = useParams<{ eventTypeSlug: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>();
  const [userTimezone, setUserTimezone] = useState<string>();
  const [isBooking, setIsBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>();
  const [paymentData, setPaymentData] = useState<any>(null);

  // Detect user timezone
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(detected);
  }, []);

  // Parse URL parameters for pre-selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    const timeParam = urlParams.get('time');
    
    if (dateParam) {
      try {
        const date = parseISO(dateParam);
        setSelectedDate(date);
      } catch (error) {
        console.warn('Invalid date parameter:', dateParam);
      }
    }
    
    if (timeParam && dateParam) {
      // Will handle time selection in the time slot component
    }
  }, []);

  // Fetch event type data
  const { data: eventType, isLoading: eventTypeLoading, error: eventTypeError } = useQuery({
    queryKey: ['/api/appointment-event-types', eventTypeSlug],
    queryFn: async () => {
      const response = await fetch(`/api/appointment-event-types/${eventTypeSlug}`);
      if (!response.ok) {
        throw new Error('Event type not found');
      }
      return response.json() as EventType;
    },
    enabled: !!eventTypeSlug,
  });

  // Fetch availability for selected date
  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: ['/api/appointments/availability', eventType?.id, selectedDate?.toISOString()],
    queryFn: async () => {
      if (!eventType?.id || !selectedDate) return [];
      
      const response = await fetch(
        `/api/appointments/availability?eventTypeId=${eventType.id}&date=${selectedDate.toISOString()}&timezone=${userTimezone}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      return response.json() as TimeSlot[];
    },
    enabled: !!eventType?.id && !!selectedDate && !!userTimezone,
  });

  // Form management
  const form = useForm<AttendeeFormData>({
    resolver: zodResolver(attendeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      notes: "",
    },
  });

  // Determine if this is a paid event
  const isPaidEvent = eventType && eventType.price > 0;
  const bookingSteps = eventType ? getBookingSteps(isPaidEvent) : [];

  // Navigation functions
  const nextStep = () => {
    if (currentStep < bookingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // For free events, handle booking submission directly
  const onSubmit = async (data: AttendeeFormData) => {
    if (!eventType || !selectedDate || !selectedTimeSlot || !userTimezone) {
      toast({
        title: "Error",
        description: "Please complete all booking steps",
        variant: "destructive",
      });
      return;
    }

    // For paid events, go to payment step
    if (isPaidEvent) {
      // Store form data and go to payment step
      form.setValue('name', data.name);
      form.setValue('email', data.email);
      form.setValue('phone', data.phone);
      form.setValue('company', data.company);
      form.setValue('notes', data.notes);
      nextStep();
      return;
    }

    // For free events, create booking directly
    setIsBooking(true);
    
    try {
      const bookingData = {
        eventTypeId: eventType.id,
        startTime: selectedTimeSlot.utcTime,
        attendeeEmail: data.email,
        attendeeName: data.name,
        attendeePhone: data.phone || null,
        attendeeCompany: data.company || null,
        notes: data.notes || null,
        timezone: userTimezone,
        bookingSource: 'direct',
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      const booking = await response.json();
      setConfirmedBooking(booking);
      setBookingConfirmed(true);
      nextStep();
      
      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been successfully scheduled.",
      });
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  // Payment success handler
  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentData(paymentData);
    setBookingConfirmed(true);
    nextStep();
    
    toast({
      title: "Payment Successful!",
      description: "Your appointment has been booked and confirmed.",
    });
  };

  // Booking completion handler
  const handleBookingComplete = (booking: any) => {
    setConfirmedBooking(booking);
  };

  // Loading state
  if (eventTypeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (eventTypeError || !eventType) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Event Not Found</CardTitle>
            <CardDescription>
              The booking page you're looking for doesn't exist or is no longer available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} data-testid="button-home">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepData = bookingSteps[currentStep];

  return (
    <div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      style={{
        '--brand-color': eventType.brandColor || '#22c55e',
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: eventType.brandColor || '#22c55e' }}
              >
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-event-name">
                  {eventType.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {eventType.duration} minutes
                  </span>
                  {eventType.meetingLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {eventType.meetingLocation}
                    </span>
                  )}
                  {eventType.price > 0 && (
                    <Badge variant="secondary">
                      {eventType.currency?.toUpperCase()} ${eventType.price / 100}
                    </Badge>
                  )}
                  {userTimezone && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      Times in {userTimezone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              {bookingSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index <= currentStep
                          ? 'text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                      style={{
                        backgroundColor: index <= currentStep ? eventType.brandColor : undefined,
                      }}
                      data-testid={`step-${step.id}`}
                    >
                      {index < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < bookingSteps.length - 1 && (
                    <div className="ml-4 mr-4 hidden sm:block">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle data-testid={`title-step-${currentStepData.id}`}>
                    {currentStepData.title}
                  </CardTitle>
                  <CardDescription>
                    {currentStepData.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Step Content will be rendered here */}
                  {currentStep === 0 && (
                    <EventInfoStep eventType={eventType} onNext={nextStep} />
                  )}
                  {currentStep === 1 && (
                    <TimeSelectionStep
                      eventType={eventType}
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      selectedTimeSlot={selectedTimeSlot}
                      setSelectedTimeSlot={setSelectedTimeSlot}
                      availability={availability}
                      isLoading={availabilityLoading}
                      userTimezone={userTimezone}
                      setUserTimezone={setUserTimezone}
                      onNext={nextStep}
                      onPrev={prevStep}
                    />
                  )}
                  {currentStep === 2 && (
                    <AttendeeDetailsStep
                      form={form}
                      onNext={nextStep}
                      onPrev={prevStep}
                    />
                  )}
                  {currentStep === 3 && (
                    <ConfirmationStep
                      eventType={eventType}
                      selectedDate={selectedDate}
                      selectedTimeSlot={selectedTimeSlot}
                      attendeeData={form.getValues()}
                      userTimezone={userTimezone}
                      isBooking={isBooking}
                      bookingConfirmed={bookingConfirmed}
                      confirmedBooking={confirmedBooking}
                      onSubmit={() => onSubmit(form.getValues())}
                      onPrev={prevStep}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <BookingSidebar
                eventType={eventType}
                selectedDate={selectedDate}
                selectedTimeSlot={selectedTimeSlot}
                attendeeData={form.getValues()}
                userTimezone={userTimezone}
                currentStep={currentStep}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components (will be implemented in the next steps)
function EventInfoStep({ eventType, onNext }: { eventType: EventType; onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{eventType.name}</h3>
        <p className="text-gray-600 dark:text-gray-400">{eventType.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium">Duration</div>
          <div className="text-gray-600 dark:text-gray-400">{eventType.duration} minutes</div>
        </div>
        {eventType.meetingLocation && (
          <div>
            <div className="font-medium">Location</div>
            <div className="text-gray-600 dark:text-gray-400">{eventType.meetingLocation}</div>
          </div>
        )}
      </div>

      {eventType.instructionsBeforeEvent && (
        <div>
          <h4 className="font-medium mb-2">What to expect</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {eventType.instructionsBeforeEvent}
          </p>
        </div>
      )}

      <Button 
        onClick={onNext} 
        className="w-full"
        style={{ backgroundColor: eventType.brandColor }}
        data-testid="button-next-to-time"
      >
        Select Date & Time
      </Button>
    </div>
  );
}

// Time Selection Step Component
interface TimeSelectionStepProps {
  eventType: EventType;
  selectedDate?: Date;
  setSelectedDate: (date?: Date) => void;
  selectedTimeSlot?: TimeSlot;
  setSelectedTimeSlot: (slot?: TimeSlot) => void;
  availability?: TimeSlot[];
  isLoading: boolean;
  userTimezone?: string;
  setUserTimezone: (timezone: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

function TimeSelectionStep({
  eventType,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  availability = [],
  isLoading,
  userTimezone,
  setUserTimezone,
  onNext,
  onPrev,
}: TimeSelectionStepProps) {
  const [showTimezoneSelect, setShowTimezoneSelect] = useState(false);
  
  // Get common timezones for selection
  const commonTimezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(undefined); // Reset time selection when date changes
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedTimeSlot(slot);
    }
  };

  const canProceed = selectedDate && selectedTimeSlot;

  return (
    <div className="space-y-6">
      {/* Timezone Selection */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Timezone:</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {userTimezone || 'Detecting...'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTimezoneSelect(!showTimezoneSelect)}
          data-testid="button-change-timezone"
        >
          Change
        </Button>
      </div>

      {showTimezoneSelect && (
        <Card className="p-4">
          <div className="space-y-2">
            <h4 className="font-medium">Select Timezone</h4>
            <Select value={userTimezone} onValueChange={setUserTimezone}>
              <SelectTrigger data-testid="select-timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {commonTimezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => setShowTimezoneSelect(false)}
              data-testid="button-timezone-done"
            >
              Done
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Select a Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < startOfToday()}
            className="rounded-md border"
            data-testid="calendar-date-picker"
          />
        </div>

        {/* Time Slots */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {selectedDate ? 'Available Times' : 'Select a date first'}
          </h3>
          
          {selectedDate && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </div>
              
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : availability.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {availability.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedTimeSlot?.time === slot.time ? "default" : "outline"}
                      disabled={!slot.available}
                      onClick={() => handleTimeSlotSelect(slot)}
                      className={`text-sm justify-center ${
                        selectedTimeSlot?.time === slot.time 
                          ? '' 
                          : slot.available 
                            ? 'hover:bg-gray-50 dark:hover:bg-gray-800' 
                            : 'opacity-50 cursor-not-allowed'
                      }`}
                      style={{
                        backgroundColor: selectedTimeSlot?.time === slot.time 
                          ? eventType.brandColor 
                          : undefined,
                      }}
                      data-testid={`time-slot-${slot.time}`}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No available times for this date
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrev} data-testid="button-prev-to-info">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          style={{ backgroundColor: canProceed ? eventType.brandColor : undefined }}
          data-testid="button-next-to-details"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Attendee Details Step Component
interface AttendeeDetailsStepProps {
  form: any;
  onNext: () => void;
  onPrev: () => void;
}

function AttendeeDetailsStep({ form, onNext, onPrev }: AttendeeDetailsStepProps) {
  const [isValidating, setIsValidating] = useState(false);

  const handleNext = async () => {
    setIsValidating(true);
    const isValid = await form.trigger();
    setIsValidating(false);
    
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Enter your details</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please provide your information so we can prepare for our meeting.
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
                    {...field}
                    data-testid="input-attendee-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    {...field}
                    data-testid="input-attendee-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    {...field}
                    data-testid="input-attendee-phone"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your company name"
                    {...field}
                    data-testid="input-attendee-company"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Anything you'd like us to know before the meeting?"
                    className="min-h-[100px]"
                    {...field}
                    data-testid="textarea-attendee-notes"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrev} data-testid="button-prev-to-time">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={isValidating}
          data-testid="button-next-to-confirm"
        >
          {isValidating ? 'Validating...' : 'Review Booking'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Confirmation Step Component
interface ConfirmationStepProps {
  eventType: EventType;
  selectedDate?: Date;
  selectedTimeSlot?: TimeSlot;
  attendeeData: AttendeeFormData;
  userTimezone?: string;
  isBooking: boolean;
  bookingConfirmed: boolean;
  confirmedBooking?: any;
  onSubmit: () => void;
  onPrev: () => void;
}

function ConfirmationStep({
  eventType,
  selectedDate,
  selectedTimeSlot,
  attendeeData,
  userTimezone,
  isBooking,
  bookingConfirmed,
  confirmedBooking,
  onSubmit,
  onPrev,
}: ConfirmationStepProps) {
  const generateCalendarLinks = () => {
    if (!selectedDate || !selectedTimeSlot || !userTimezone) return {};
    
    const startTime = new Date(selectedTimeSlot.utcTime);
    const endTime = new Date(startTime.getTime() + eventType.duration * 60000);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventType.name
    )}&dates=${startTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endTime
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')}&details=${encodeURIComponent(
      `Meeting with ${attendeeData.name}\n\n${eventType.description}`
    )}`;

    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
      eventType.name
    )}&startdt=${startTime.toISOString()}&enddt=${endTime.toISOString()}&body=${encodeURIComponent(
      `Meeting with ${attendeeData.name}\n\n${eventType.description}`
    )}`;

    return { googleCalendarUrl, outlookUrl };
  };

  if (bookingConfirmed && confirmedBooking) {
    const { googleCalendarUrl, outlookUrl } = generateCalendarLinks();
    
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
            Booking Confirmed!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your {eventType.name} has been scheduled successfully.
          </p>
        </div>

        <Card className="p-6 text-left">
          <div className="space-y-4">
            <div>
              <div className="font-medium">Event</div>
              <div className="text-gray-600 dark:text-gray-400">{eventType.name}</div>
            </div>
            
            <div>
              <div className="font-medium">Date & Time</div>
              <div className="text-gray-600 dark:text-gray-400">
                {selectedDate && (
                  <>
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')} at{' '}
                    {selectedTimeSlot?.time}
                    <span className="text-sm ml-1">({userTimezone})</span>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <div className="font-medium">Duration</div>
              <div className="text-gray-600 dark:text-gray-400">{eventType.duration} minutes</div>
            </div>
            
            {eventType.meetingLocation && (
              <div>
                <div className="font-medium">Location</div>
                <div className="text-gray-600 dark:text-gray-400">{eventType.meetingLocation}</div>
              </div>
            )}
            
            <div>
              <div className="font-medium">Attendee</div>
              <div className="text-gray-600 dark:text-gray-400">
                {attendeeData.name} ({attendeeData.email})
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add this event to your calendar:
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => window.open(googleCalendarUrl, '_blank')}
              data-testid="button-add-google-calendar"
            >
              Google Calendar
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(outlookUrl, '_blank')}
              data-testid="button-add-outlook-calendar"
            >
              Outlook
            </Button>
          </div>
        </div>

        {eventType.instructionsAfterEvent && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h4 className="font-medium mb-2">What's Next?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {eventType.instructionsAfterEvent}
            </p>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Your Booking</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please review your booking details before confirming.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Event</span>
            <span className="text-gray-600 dark:text-gray-400">{eventType.name}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between">
            <span className="font-medium">Date & Time</span>
            <div className="text-right text-gray-600 dark:text-gray-400">
              {selectedDate && (
                <>
                  <div>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</div>
                  <div className="text-sm">
                    {selectedTimeSlot?.time}
                    <span className="ml-1">({userTimezone})</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between">
            <span className="font-medium">Duration</span>
            <span className="text-gray-600 dark:text-gray-400">{eventType.duration} minutes</span>
          </div>
          
          {eventType.meetingLocation && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Location</span>
                <span className="text-gray-600 dark:text-gray-400">{eventType.meetingLocation}</span>
              </div>
            </>
          )}
          
          <Separator />
          
          <div className="flex justify-between">
            <span className="font-medium">Your Details</span>
            <div className="text-right text-gray-600 dark:text-gray-400">
              <div>{attendeeData.name}</div>
              <div className="text-sm">{attendeeData.email}</div>
              {attendeeData.phone && <div className="text-sm">{attendeeData.phone}</div>}
              {attendeeData.company && <div className="text-sm">{attendeeData.company}</div>}
            </div>
          </div>
          
          {attendeeData.notes && (
            <>
              <Separator />
              <div>
                <span className="font-medium">Additional Notes</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {attendeeData.notes}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {eventType.requiresConfirmation && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> This booking requires confirmation. You'll receive an email once it's been reviewed.
          </p>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrev} disabled={isBooking} data-testid="button-prev-to-details">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isBooking}
          style={{ backgroundColor: eventType.brandColor }}
          data-testid="button-confirm-booking"
        >
          {isBooking ? 'Booking...' : 'Confirm Booking'}
          {!isBooking && <Check className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}

// Booking Sidebar Component
interface BookingSidebarProps {
  eventType: EventType;
  selectedDate?: Date;
  selectedTimeSlot?: TimeSlot;
  attendeeData: AttendeeFormData;
  userTimezone?: string;
  currentStep: number;
}

function BookingSidebar({
  eventType,
  selectedDate,
  selectedTimeSlot,
  attendeeData,
  userTimezone,
  currentStep,
}: BookingSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Event Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg" data-testid="sidebar-event-name">
            {eventType.name}
          </CardTitle>
          <CardDescription>
            {eventType.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{eventType.duration} minutes</span>
          </div>
          
          {eventType.meetingLocation && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{eventType.meetingLocation}</span>
            </div>
          )}
          
          {eventType.price > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">
                {eventType.currency?.toUpperCase()} ${eventType.price / 100}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Summary */}
      {currentStep > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDate && (
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</div>
                <div className="text-sm" data-testid="sidebar-selected-date">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
            )}
            
            {selectedTimeSlot && userTimezone && (
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</div>
                <div className="text-sm" data-testid="sidebar-selected-time">
                  {selectedTimeSlot.time}
                  <span className="text-xs ml-1 text-gray-500">({userTimezone})</span>
                </div>
              </div>
            )}
            
            {attendeeData.name && (
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendee</div>
                <div className="text-sm" data-testid="sidebar-attendee-name">
                  {attendeeData.name}
                </div>
                {attendeeData.email && (
                  <div className="text-xs text-gray-500 dark:text-gray-400" data-testid="sidebar-attendee-email">
                    {attendeeData.email}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      {eventType.instructionsBeforeEvent && currentStep === 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-sm">Before the Meeting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {eventType.instructionsBeforeEvent}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}