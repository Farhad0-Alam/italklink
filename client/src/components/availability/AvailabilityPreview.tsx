import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, Eye, ExternalLink, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format, addDays, startOfDay, isSameDay, isWithinInterval } from "date-fns";

interface AvailabilitySettings {
  businessHours: Array<{
    weekday: string;
    startTime: string;
    endTime: string;
    enabled: boolean;
    timezone: string;
  }>;
  bufferTimes: Array<{
    eventTypeId: string;
    bufferTimeBefore: number;
    bufferTimeAfter: number;
  }>;
  blackoutDates: Array<{
    id: string;
    startDate: string;
    endDate: string;
    title: string;
    description?: string;
    isAllDay: boolean;
    isRecurring: boolean;
    type: string;
  }>;
  recurringSchedules: Array<{
    id: string;
    name: string;
    pattern: string;
    startDate: string;
    endDate?: string;
  }>;
}

interface EventType {
  id: string;
  name: string;
  duration: number;
  bufferTimeBefore: number;
  bufferTimeAfter: number;
}

interface AvailabilityPreviewProps {
  settings?: AvailabilitySettings;
  eventTypes: EventType[];
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const time24 = `${hour.toString().padStart(2, '0')}:${minute}`;
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? 'AM' : 'PM';
  const time12 = `${hour12}:${minute} ${ampm}`;
  return { value: time24, label: time12, available: false };
});

export function AvailabilityPreview({ settings, eventTypes }: AvailabilityPreviewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEventType, setSelectedEventType] = useState<string>(eventTypes[0]?.id || '');
  const [previewMode, setPreviewMode] = useState<'calendar' | 'list'>('calendar');

  // Generate mock booking URL for preview
  const mockBookingUrl = `/booking/${eventTypes.find(et => et.id === selectedEventType)?.name?.toLowerCase().replace(/\s+/g, '-') || 'consultation'}`;

  // Check if a date is blacked out
  const isDateBlackedOut = (date: Date): { isBlackedOut: boolean; reasons: string[] } => {
    if (!settings?.blackoutDates) return { isBlackedOut: false, reasons: [] };

    const reasons: string[] = [];
    let isBlackedOut = false;

    for (const blackout of settings.blackoutDates) {
      const startDate = new Date(blackout.startDate);
      const endDate = new Date(blackout.endDate);
      
      if (isWithinInterval(date, { start: startOfDay(startDate), end: startOfDay(endDate) }) || 
          isSameDay(date, startDate) || isSameDay(date, endDate)) {
        isBlackedOut = true;
        reasons.push(blackout.title);
      }
    }

    return { isBlackedOut, reasons };
  };

  // Check if a weekday has business hours
  const hasBusinessHours = (date: Date): { hasHours: boolean; hours?: { startTime: string; endTime: string } } => {
    if (!settings?.businessHours) return { hasHours: false };

    const weekday = WEEKDAYS[date.getDay()];
    const dayHours = settings.businessHours.find(bh => bh.weekday === weekday && bh.enabled);
    
    return {
      hasHours: !!dayHours,
      hours: dayHours ? { startTime: dayHours.startTime, endTime: dayHours.endTime } : undefined
    };
  };

  // Generate available time slots for a specific date
  const getAvailableTimeSlots = (date: Date, eventTypeId: string) => {
    // Check if date is blacked out
    const blackoutCheck = isDateBlackedOut(date);
    if (blackoutCheck.isBlackedOut) {
      return TIME_SLOTS.map(slot => ({ ...slot, available: false, reason: blackoutCheck.reasons[0] }));
    }

    // Check business hours
    const businessHours = hasBusinessHours(date);
    if (!businessHours.hasHours || !businessHours.hours) {
      return TIME_SLOTS.map(slot => ({ ...slot, available: false, reason: 'No business hours' }));
    }

    // Get event type and buffer settings
    const eventType = eventTypes.find(et => et.id === eventTypeId);
    const bufferSettings = settings?.bufferTimes?.find(bt => bt.eventTypeId === eventTypeId);
    
    if (!eventType) {
      return TIME_SLOTS.map(slot => ({ ...slot, available: false, reason: 'Event type not found' }));
    }

    const duration = eventType.duration;
    const bufferBefore = bufferSettings?.bufferTimeBefore || 0;
    const bufferAfter = bufferSettings?.bufferTimeAfter || 0;

    // Calculate which slots are available
    return TIME_SLOTS.map(slot => {
      const slotTime = slot.value;
      
      // Check if slot is within business hours
      const isWithinBusinessHours = slotTime >= businessHours.hours!.startTime && 
                                   slotTime <= businessHours.hours!.endTime;
      
      if (!isWithinBusinessHours) {
        return { ...slot, available: false, reason: 'Outside business hours' };
      }

      // For simplicity, mark slots as available if within business hours
      // In a real implementation, you'd check for existing appointments, buffers, etc.
      return { ...slot, available: true };
    });
  };

  // Get preview statistics
  const getPreviewStats = () => {
    const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
    
    let availableDays = 0;
    let totalSlots = 0;
    let blackedOutDays = 0;
    
    next7Days.forEach(date => {
      const blackoutCheck = isDateBlackedOut(date);
      const businessHours = hasBusinessHours(date);
      
      if (blackoutCheck.isBlackedOut) {
        blackedOutDays++;
      } else if (businessHours.hasHours) {
        availableDays++;
        // Rough estimate of available slots per day
        const slots = getAvailableTimeSlots(date, selectedEventType);
        totalSlots += slots.filter(s => s.available).length;
      }
    });

    return { availableDays, totalSlots, blackedOutDays };
  };

  const stats = getPreviewStats();

  if (!settings) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Preview Mode:</span>
          </div>
          <Select value={previewMode} onValueChange={(value: 'calendar' | 'list') => setPreviewMode(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendar View</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-refresh-preview">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(mockBookingUrl, '_blank')}
            data-testid="button-open-booking-page"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Booking Page
          </Button>
        </div>
      </div>

      {/* Preview Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Available Days</div>
                <div className="text-lg font-semibold" data-testid="text-available-days">
                  {stats.availableDays}/7
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Available Slots</div>
                <div className="text-lg font-semibold" data-testid="text-available-slots">
                  ~{stats.totalSlots}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Blackout Days</div>
                <div className="text-lg font-semibold" data-testid="text-blackout-days">
                  {stats.blackedOutDays}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Config Status</div>
                <div className="text-lg font-semibold">
                  {settings.businessHours?.some(bh => bh.enabled) ? (
                    <span className="text-green-600">Ready</span>
                  ) : (
                    <span className="text-red-600">Incomplete</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Type Selection */}
      {eventTypes.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium">Preview for Event Type:</div>
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger className="w-[200px]" data-testid="select-preview-event-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((eventType) => (
                    <SelectItem key={eventType.id} value={eventType.id}>
                      {eventType.name} ({eventType.duration}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEventType && (
                <Badge variant="outline">
                  {eventTypes.find(et => et.id === selectedEventType)?.duration}min duration
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Content */}
      {previewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
              <CardDescription>
                Green: Available • Red: Blackout • Gray: No business hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={{
                  available: (date) => {
                    const blackout = isDateBlackedOut(date);
                    const businessHours = hasBusinessHours(date);
                    return !blackout.isBlackedOut && businessHours.hasHours;
                  },
                  blackout: (date) => isDateBlackedOut(date).isBlackedOut,
                  noHours: (date) => !hasBusinessHours(date).hasHours,
                }}
                modifiersStyles={{
                  available: { backgroundColor: 'rgb(34 197 94 / 0.2)', color: 'rgb(22 163 74)' },
                  blackout: { backgroundColor: 'rgb(239 68 68 / 0.2)', color: 'rgb(220 38 38)' },
                  noHours: { backgroundColor: 'rgb(156 163 175 / 0.2)', color: 'rgb(107 114 128)' },
                }}
                className="rounded-md border"
                data-testid="calendar-availability-preview"
              />
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Available Times - {format(selectedDate, 'MMM d, yyyy')}
              </CardTitle>
              <CardDescription>
                Times shown for {eventTypes.find(et => et.id === selectedEventType)?.name || 'selected event type'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto">
                {(() => {
                  const timeSlots = getAvailableTimeSlots(selectedDate, selectedEventType);
                  const availableSlots = timeSlots.filter(slot => slot.available);
                  
                  if (availableSlots.length === 0) {
                    const unavailableSlot = timeSlots.find(slot => slot.reason);
                    return (
                      <div className="text-center py-8">
                        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No available times on this date
                        </p>
                        {unavailableSlot?.reason && (
                          <p className="text-sm text-red-600 mt-1">
                            Reason: {unavailableSlot.reason}
                          </p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.slice(0, 16).map((slot, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-center text-sm"
                          data-testid={`button-time-slot-${slot.value}`}
                        >
                          {slot.label}
                        </Button>
                      ))}
                      {availableSlots.length > 16 && (
                        <div className="col-span-2 text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                          +{availableSlots.length - 16} more times available
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List View */
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Schedule Preview</CardTitle>
            <CardDescription>
              Your availability for the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 7 }, (_, i) => {
                const date = addDays(new Date(), i);
                const blackoutCheck = isDateBlackedOut(date);
                const businessHours = hasBusinessHours(date);
                const timeSlots = getAvailableTimeSlots(date, selectedEventType);
                const availableSlots = timeSlots.filter(slot => slot.available);

                return (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="min-w-[120px]">
                        <div className="font-medium">{format(date, 'EEEE')}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {format(date, 'MMM d')}
                        </div>
                      </div>
                      
                      {blackoutCheck.isBlackedOut ? (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Blocked: {blackoutCheck.reasons[0]}
                        </Badge>
                      ) : !businessHours.hasHours ? (
                        <Badge variant="secondary">
                          No Business Hours
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {businessHours.hours?.startTime} - {businessHours.hours?.endTime}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-slots-${format(date, 'yyyy-MM-dd')}`}>
                      {blackoutCheck.isBlackedOut || !businessHours.hasHours
                        ? 'Unavailable'
                        : `${availableSlots.length} slots available`
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Warnings */}
      {(!settings.businessHours?.some(bh => bh.enabled) || 
        settings.blackoutDates?.length === 0) && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800 dark:text-yellow-200">
                  Configuration Incomplete
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {!settings.businessHours?.some(bh => bh.enabled) && (
                    <div>• No business hours configured - visitors won't see any available times</div>
                  )}
                  <div>• Consider adding common blackout dates like holidays</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}