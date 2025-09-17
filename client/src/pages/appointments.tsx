import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Search, 
  Calendar as CalendarIcon, 
  List, 
  Plus, 
  Clock, 
  User, 
  Users,
  Settings,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  Phone,
  Mail,
  Building,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Edit,
  Trash2,
  Video,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Appointment, AppointmentEventType, InsertAppointment, InsertAppointmentEventType } from '@shared/schema';

// Extended appointment interfaces with joined data
interface AppointmentWithDetails extends Appointment {
  eventType: {
    id: string;
    name: string;
    type: string;
    duration: number;
    price?: number;
  };
  host: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface AppointmentsResponse {
  appointments: AppointmentWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface AppointmentStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  averageBookingValue: number;
  mostPopularEventType: string;
  busyDay: string;
}

// Form schemas
const eventTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  slug: z.string().min(1, 'URL slug is required').max(50).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  type: z.string().min(1, 'Type is required'),
  duration: z.number().min(15).max(480),
  price: z.number().min(0).optional(),
  currency: z.string().default('usd'),
  isActive: z.boolean().default(true),
  maxBookingsPerDay: z.number().min(1).optional(),
  bufferTimeBefore: z.number().min(0).default(0),
  bufferTimeAfter: z.number().min(0).default(0),
});

const rescheduleSchema = z.object({
  newStartTime: z.string().min(1, 'New start time is required'),
  reason: z.string().max(500).optional(),
});

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

export default function AppointmentDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [activeTab, setActiveTab] = useState('overview');
  const [page, setPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showEventTypeModal, setShowEventTypeModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [editingEventType, setEditingEventType] = useState<AppointmentEventType | null>(null);
  
  // Calendar navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const { toast } = useToast();
  
  // Forms
  const eventTypeForm = useForm<z.infer<typeof eventTypeSchema>>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      type: 'consultation',
      duration: 30,
      price: 0,
      currency: 'usd',
      isActive: true,
      bufferTimeBefore: 0,
      bufferTimeAfter: 0,
    },
  });
  
  const rescheduleForm = useForm<z.infer<typeof rescheduleSchema>>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      newStartTime: '',
      reason: '',
    },
  });
  
  const cancelForm = useForm<z.infer<typeof cancelSchema>>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      reason: '',
    },
  });

  // Fetch appointments
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments', { search: searchTerm, status: statusFilter, eventType: eventTypeFilter, page }],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey as [string, { search: string; status: string; eventType: string; page: number }];
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search as string);
      if (params.status && params.status !== 'all') searchParams.append('status', params.status as string);
      if (params.eventType && params.eventType !== 'all') searchParams.append('eventType', params.eventType as string);
      if (params.page) searchParams.append('page', String(params.page));
      return await apiRequest('GET', `/api/appointments?${searchParams.toString()}`) as unknown as AppointmentsResponse;
    },
  });

  // Fetch appointment statistics
  const { data: appointmentStats, isLoading: statsLoading } = useQuery<AppointmentStats>({
    queryKey: ['/api/appointments/stats'],
    queryFn: () => apiRequest('GET', '/api/appointments/stats') as Promise<AppointmentStats>,
  });

  // Fetch event types
  const { data: eventTypesResponse, isLoading: eventTypesLoading } = useQuery({
    queryKey: ['/api/appointment-event-types'],
    queryFn: () => apiRequest('GET', '/api/appointment-event-types'),
  });

  const eventTypes = eventTypesResponse?.eventTypes || [];

  const appointmentsDataTyped = appointmentsData as AppointmentsResponse | undefined;
  const appointments: AppointmentWithDetails[] = appointmentsDataTyped?.appointments || [];
  const pagination = appointmentsDataTyped?.pagination;

  // Status update mutation
  const updateAppointmentStatus = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: string }) => {
      return await apiRequest('PATCH', `/api/appointments/${appointmentId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/stats'] });
      toast({
        title: "Status updated",
        description: "Appointment status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    },
  });

  // Cancel appointment mutation
  const cancelAppointment = useMutation({
    mutationFn: async ({ appointmentId, reason }: { appointmentId: string; reason?: string }) => {
      return await apiRequest('POST', `/api/appointments/${appointmentId}/cancel`, { reason, cancelledBy: 'host' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/stats'] });
      setShowCancelDialog(false);
      setShowAppointmentModal(false);
      toast({
        title: "Appointment cancelled",
        description: "The appointment has been cancelled successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    },
  });

  // Reschedule appointment mutation
  const rescheduleAppointment = useMutation({
    mutationFn: async ({ appointmentId, newStartTime, reason }: { appointmentId: string; newStartTime: string; reason?: string }) => {
      return await apiRequest('POST', `/api/appointments/${appointmentId}/reschedule`, { newStartTime, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/stats'] });
      setShowRescheduleDialog(false);
      setShowAppointmentModal(false);
      toast({
        title: "Appointment rescheduled",
        description: "The appointment has been rescheduled successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      });
    },
  });

  // Create event type mutation
  const createEventType = useMutation({
    mutationFn: async (data: z.infer<typeof eventTypeSchema>) => {
      return await apiRequest('POST', '/api/appointment-event-types', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointment-event-types'] });
      setShowEventTypeModal(false);
      eventTypeForm.reset();
      toast({
        title: "Event type created",
        description: "New event type has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event type",
        variant: "destructive",
      });
    },
  });

  // Update event type mutation
  const updateEventType = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof eventTypeSchema>> }) => {
      return await apiRequest('PATCH', `/api/appointment-event-types/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointment-event-types'] });
      setShowEventTypeModal(false);
      setEditingEventType(null);
      eventTypeForm.reset();
      toast({
        title: "Event type updated",
        description: "Event type has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update event type",
        variant: "destructive",
      });
    },
  });

  // Delete event type mutation
  const deleteEventType = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/appointment-event-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointment-event-types'] });
      toast({
        title: "Event type deleted",
        description: "Event type has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete event type",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // Calendar navigation functions
  const navigateMonth = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      setCurrentYear(year);
      setCurrentMonth(month);
      setCurrentDate(new Date(year, month, 1));
    } else {
      // Calculate new values first to avoid stale state
      const newDate = new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1);
      const newYear = newDate.getFullYear();
      const newMonth = newDate.getMonth();
      
      // Use calculated values for all updates
      setCurrentYear(newYear);
      setCurrentMonth(newMonth);
      setCurrentDate(newDate);
    }
  };

  // Handle form submissions
  const handleCreateEventType = (data: z.infer<typeof eventTypeSchema>) => {
    if (editingEventType) {
      updateEventType.mutate({ id: editingEventType.id, data });
    } else {
      createEventType.mutate(data);
    }
  };

  const handleCancelAppointment = (data: z.infer<typeof cancelSchema>) => {
    if (selectedAppointment) {
      cancelAppointment.mutate({ 
        appointmentId: selectedAppointment.id, 
        reason: data.reason 
      });
    }
  };

  const handleRescheduleAppointment = (data: z.infer<typeof rescheduleSchema>) => {
    if (selectedAppointment) {
      rescheduleAppointment.mutate({ 
        appointmentId: selectedAppointment.id, 
        newStartTime: data.newStartTime,
        reason: data.reason 
      });
    }
  };

  // Open event type modal for editing
  const openEventTypeModal = (eventType?: AppointmentEventType) => {
    if (eventType) {
      setEditingEventType(eventType);
      eventTypeForm.reset({
        name: eventType.name,
        description: eventType.description || '',
        slug: eventType.slug,
        type: eventType.type,
        duration: eventType.duration,
        price: eventType.price || 0,
        currency: eventType.currency || 'usd',
        isActive: eventType.isActive,
        maxBookingsPerDay: eventType.maxBookingsPerDay,
        bufferTimeBefore: eventType.bufferTimeBefore || 0,
        bufferTimeAfter: eventType.bufferTimeAfter || 0,
      });
    } else {
      setEditingEventType(null);
      eventTypeForm.reset();
    }
    setShowEventTypeModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'no_show': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'rescheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-3 w-3" />;
      case 'confirmed': return <CheckCircle className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      case 'no_show': return <AlertTriangle className="h-3 w-3" />;
      case 'rescheduled': return <RotateCcw className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  // Statistics cards
  const StatsCard = ({ title, value, change, icon: Icon, color }: {
    title: string;
    value: string | number;
    change?: string;
    icon: React.ElementType;
    color: string;
  }) => (
    <Card data-testid={`stats-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className="text-xs text-muted-foreground mt-1">{change}</p>
            )}
          </div>
          <div className={`p-2 rounded-full ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Appointment details modal
  const AppointmentDetailsModal = () => (
    <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="appointment-details-modal">
        {selectedAppointment && (
          <>
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(selectedAppointment.status)}`}>
                    {getStatusIcon(selectedAppointment.status)}
                    <span>{selectedAppointment.status.replace('_', ' ').toUpperCase()}</span>
                  </div>
                </div>
                <Select
                  value={selectedAppointment.status}
                  onValueChange={(status) => updateAppointmentStatus.mutate({ appointmentId: selectedAppointment.id, status })}
                  data-testid="status-select"
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">EVENT DETAILS</h3>
                    <p className="font-medium">{selectedAppointment.eventType.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedAppointment.eventType.type}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedAppointment.duration} minutes</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">DATE & TIME</h3>
                    <div className="space-y-1">
                      <p className="font-medium">{formatDate(selectedAppointment.startTime)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedAppointment.timezone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">ATTENDEE</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedAppointment.attendeeName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{selectedAppointment.attendeeEmail}</span>
                      </div>
                      {selectedAppointment.attendeePhone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{selectedAppointment.attendeePhone}</span>
                        </div>
                      )}
                      {selectedAppointment.attendeeCompany && (
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{selectedAppointment.attendeeCompany}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedAppointment.meetingLink && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">MEETING LINK</h3>
                      <Button variant="outline" size="sm" asChild data-testid="meeting-link">
                        <a href={selectedAppointment.meetingLink} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4 mr-2" />
                          Join Meeting
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">NOTES</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAppointmentModal(false)} data-testid="close-modal">
                Close
              </Button>
              <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" data-testid="cancel-appointment">
                    Cancel Appointment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this appointment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Form {...cancelForm}>
                    <form onSubmit={cancelForm.handleSubmit(handleCancelAppointment)} className="space-y-4">
                      <FormField
                        control={cancelForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cancellation Reason (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Reason for cancellation..."
                                {...field}
                                data-testid="cancel-reason"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                        <AlertDialogAction
                          type="submit"
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={cancelAppointment.isPending}
                          data-testid="confirm-cancel"
                        >
                          {cancelAppointment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Cancel Appointment
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </form>
                  </Form>
                </AlertDialogContent>
              </AlertDialog>
              
              <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="reschedule-appointment">Reschedule</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reschedule Appointment</DialogTitle>
                  </DialogHeader>
                  <Form {...rescheduleForm}>
                    <form onSubmit={rescheduleForm.handleSubmit(handleRescheduleAppointment)} className="space-y-4">
                      <FormField
                        control={rescheduleForm.control}
                        name="newStartTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Date & Time</FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                {...field}
                                data-testid="reschedule-datetime"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={rescheduleForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Reason for rescheduling..."
                                {...field}
                                data-testid="reschedule-reason"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowRescheduleDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={rescheduleAppointment.isPending}
                          data-testid="confirm-reschedule"
                        >
                          {rescheduleAppointment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Reschedule
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  // Calendar view component
  const CalendarView = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    const todayDate = today.getDate();

    const calendarDays = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-24 border border-border bg-muted/10"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAppointments = appointments.filter(apt => 
        apt.startTime.split('T')[0] === dateString
      );
      
      const isToday = isCurrentMonth && day === todayDate;
      
      calendarDays.push(
        <div key={day} className={`h-24 border border-border p-1 hover:bg-muted/50 relative ${
          isToday ? 'bg-primary/10 border-primary/30' : ''
        }`}>
          <div className={`font-medium text-sm mb-1 ${
            isToday ? 'text-primary font-bold' : ''
          }`}>{day}</div>
          {isToday && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
          )}
          <div className="space-y-1">
            {appointmentsLoading ? (
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ) : (
              dayAppointments.slice(0, 3).map((apt, idx) => (
                <div 
                  key={idx}
                  className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer transition-colors hover:opacity-80 ${getStatusColor(apt.status)}`}
                  onClick={() => {
                    setSelectedAppointment(apt);
                    setShowAppointmentModal(true);
                  }}
                  data-testid={`calendar-appointment-${apt.id}`}
                  title={`${apt.attendeeName} - ${apt.eventType.name}`}
                >
                  {formatTime(apt.startTime)} {apt.attendeeName}
                </div>
              ))
            )}
            {dayAppointments.length > 3 && (
              <div className="text-xs text-muted-foreground cursor-pointer hover:text-foreground" 
                   onClick={() => setActiveTab('appointments')}>
                +{dayAppointments.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4" data-testid="calendar-view">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{monthName}</h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateMonth('prev')}
              data-testid="previous-month"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateMonth('today')}
              data-testid="today-button"
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateMonth('next')}
              data-testid="next-month"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-12 border-r border-b border-border bg-muted/30 flex items-center justify-center font-medium text-sm">
              {day}
            </div>
          ))}
          {calendarDays}
        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="back-to-dashboard">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">Appointment Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your appointments, event types, and booking calendar
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => openEventTypeModal()} data-testid="create-event-type">
              <Settings className="h-4 w-4 mr-2" />
              Event Types
            </Button>
            <Button onClick={() => setShowAppointmentModal(true)} data-testid="create-appointment">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>

        {/* Statistics Overview */}
        {!statsLoading && appointmentStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Appointments"
              value={appointmentStats.totalAppointments}
              icon={CalendarIcon}
              color="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
            />
            <StatsCard
              title="Upcoming"
              value={appointmentStats.upcomingAppointments}
              icon={Clock}
              color="bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
            />
            <StatsCard
              title="Completed"
              value={appointmentStats.completedAppointments}
              icon={CheckCircle}
              color="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
            />
            <StatsCard
              title="Revenue"
              value={`$${appointmentStats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-testid="appointment-tabs">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-calendar">Calendar</TabsTrigger>
          <TabsTrigger value="appointments" data-testid="tab-appointments">Appointments</TabsTrigger>
          <TabsTrigger value="event-types" data-testid="tab-event-types">Event Types</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6" data-testid="overview-tab">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Appointments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  {appointmentsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No appointments scheduled</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.slice(0, 10).map((appointment) => (
                        <div 
                          key={appointment.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowAppointmentModal(true);
                          }}
                          data-testid={`appointment-item-${appointment.id}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium">{appointment.attendeeName}</p>
                              <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{appointment.eventType.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(appointment.startTime)} at {formatTime(appointment.startTime)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setShowAppointmentModal(true)} className="w-full justify-start" data-testid="quick-new-appointment">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Appointment
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="quick-view-calendar">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  View Full Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="quick-manage-types">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Event Types
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="quick-export-data">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6" data-testid="calendar-tab">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Calendar View</h2>
            <div className="flex items-center space-x-2">
              <Button 
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                data-testid="calendar-view-btn"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                data-testid="list-view-btn"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <CalendarView />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>List view coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6" data-testid="appointments-tab">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="appointment-search"
                />
              </div>
            </form>

            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="status-filter">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>

              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter} data-testid="event-type-filter">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {eventTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Appointments Table */}
          <Card>
            <CardContent className="p-0">
              <Table data-testid="appointments-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointmentsLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded w-28 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse"></div></TableCell>
                      </TableRow>
                    ))
                  ) : appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No appointments found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((appointment) => (
                      <TableRow key={appointment.id} data-testid={`appointment-row-${appointment.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{appointment.attendeeName}</p>
                            <p className="text-sm text-muted-foreground">{appointment.attendeeEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{appointment.eventType.name}</p>
                            <p className="text-sm text-muted-foreground">{appointment.duration} min</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatDate(appointment.startTime)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{appointment.status.replace('_', ' ')}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowAppointmentModal(true);
                            }}
                            data-testid={`view-appointment-${appointment.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                data-testid="previous-page"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page >= pagination.pages}
                data-testid="next-page"
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="event-types" className="space-y-6" data-testid="event-types-tab">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Event Types</h2>
            <Button onClick={() => openEventTypeModal()} data-testid="create-new-event-type">
              <Plus className="h-4 w-4 mr-2" />
              Create Event Type
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventTypesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-10 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : !eventTypes || eventTypes.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-full bg-muted p-6">
                    <Settings className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">No event types yet</h3>
                    <p className="text-muted-foreground">
                      Create your first event type to start accepting bookings.
                    </p>
                  </div>
                  <Button onClick={() => openEventTypeModal()} data-testid="create-first-event-type">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Event Type
                  </Button>
                </div>
              </div>
            ) : (
              eventTypes.map((eventType) => (
                <Card key={eventType.id} className="hover:shadow-lg transition-all duration-300" data-testid={`event-type-${eventType.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{eventType.name}</CardTitle>
                      <Badge variant={eventType.isActive ? "default" : "secondary"}>
                        {eventType.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {eventType.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {eventType.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{eventType.duration} min</span>
                      </div>
                      {eventType.price && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${eventType.price}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEventTypeModal(eventType)}
                        data-testid={`edit-event-type-${eventType.id}`}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid={`delete-event-type-${eventType.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event Type</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{eventType.name}"? This action cannot be undone and will affect any scheduled appointments using this event type.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEventType.mutate(eventType.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={deleteEventType.isPending}
                              data-testid={`confirm-delete-${eventType.id}`}
                            >
                              {deleteEventType.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Delete Event Type
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal />

      {/* Event Type Modal */}
      <Dialog open={showEventTypeModal} onOpenChange={setShowEventTypeModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="event-type-modal">
          <DialogHeader>
            <DialogTitle>
              {editingEventType ? 'Edit Event Type' : 'Create Event Type'}
            </DialogTitle>
          </DialogHeader>
          <Form {...eventTypeForm}>
            <form onSubmit={eventTypeForm.handleSubmit(handleCreateEventType)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={eventTypeForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="30-minute consultation"
                          {...field}
                          data-testid="event-name-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eventTypeForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="consultation-30min"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                            field.onChange(value);
                          }}
                          data-testid="event-slug-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={eventTypeForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this event type is for..."
                        {...field}
                        data-testid="event-description-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={eventTypeForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="event-type-select">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="demo">Demo</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="sales_call">Sales Call</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                          <SelectItem value="onboarding">Onboarding</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eventTypeForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={15}
                          max={480}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                          data-testid="event-duration-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eventTypeForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="event-price-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={eventTypeForm.control}
                  name="maxBookingsPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Bookings/Day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          data-testid="max-bookings-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eventTypeForm.control}
                  name="bufferTimeBefore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buffer Before (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="buffer-before-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eventTypeForm.control}
                  name="bufferTimeAfter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buffer After (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="buffer-after-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={eventTypeForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Event Type</FormLabel>
                      <div className="text-[0.8rem] text-muted-foreground">
                        Allow new bookings for this event type
                      </div>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                        data-testid="event-active-checkbox"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEventTypeModal(false);
                    setEditingEventType(null);
                    eventTypeForm.reset();
                  }} 
                  data-testid="cancel-event-type"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createEventType.isPending || updateEventType.isPending}
                  data-testid="save-event-type"
                >
                  {(createEventType.isPending || updateEventType.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingEventType ? 'Update Event Type' : 'Create Event Type'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}