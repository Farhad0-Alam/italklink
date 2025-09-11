import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  Settings, 
  UserCheck, 
  Palette,
  Plus,
  Trash2,
  Eye,
  Save,
  X
} from "lucide-react";

// Event Type Form Schema
const eventTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  slug: z.string().min(1, "URL slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  duration: z.number().min(5).max(480), // 5 minutes to 8 hours
  price: z.number().min(0).default(0),
  currency: z.string().default("USD"),
  meetingLocation: z.enum(["video", "phone", "in_person", "custom"]).default("video"),
  customLocation: z.string().optional(),
  brandColor: z.string().regex(/^#[0-9A-F]{6}$/i).default("#3B82F6"),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  requiresConfirmation: z.boolean().default(false),
  bufferTimeBefore: z.number().min(0).max(120).default(0),
  bufferTimeAfter: z.number().min(0).max(120).default(0),
  
  // Advanced settings
  minimumNotice: z.number().min(0).max(43200).default(60), // minutes, up to 30 days
  maximumFutureBooking: z.number().min(1).max(365).default(30), // days
  dailyBookingLimit: z.number().min(0).default(0), // 0 = unlimited
  weeklyBookingLimit: z.number().min(0).default(0),
  monthlyBookingLimit: z.number().min(0).default(0),
  
  // Custom fields
  collectAttendeeEmail: z.boolean().default(true),
  collectAttendeePhone: z.boolean().default(false),
  collectAttendeeMessage: z.boolean().default(false),
  customQuestions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    required: z.boolean(),
    type: z.enum(["text", "textarea", "select", "checkbox"])
  })).default([]),
  
  // Booking instructions
  instructionsBeforeEvent: z.string().optional(),
  instructionsAfterEvent: z.string().optional(),
  confirmationMessage: z.string().optional(),
  
  // Cancellation and rescheduling
  allowCancellation: z.boolean().default(true),
  cancellationNotice: z.number().min(0).max(1440).default(60), // minutes
  allowRescheduling: z.boolean().default(true),
  rescheduleNotice: z.number().min(0).max(1440).default(60), // minutes
});

type EventTypeFormData = z.infer<typeof eventTypeFormSchema>;

interface EventTypeEditorProps {
  eventTypeId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (eventType: any) => void;
}

const DURATION_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1 hour 30 minutes" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
];

const MEETING_LOCATIONS = [
  { value: "video", label: "Video Call", icon: "📹" },
  { value: "phone", label: "Phone Call", icon: "📞" },
  { value: "in_person", label: "In Person", icon: "🏢" },
  { value: "custom", label: "Custom Location", icon: "📍" },
];

const CURRENCIES = [
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
  { value: "CAD", label: "Canadian Dollar (C$)", symbol: "C$" },
];

const BRAND_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  "#F97316", "#6366F1", "#14B8A6", "#F43F5E"
];

export function EventTypeEditor({ eventTypeId, isOpen, onClose, onSave }: EventTypeEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const form = useForm<EventTypeFormData>({
    resolver: zodResolver(eventTypeFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      duration: 30,
      price: 0,
      currency: "USD",
      meetingLocation: "video",
      brandColor: "#3B82F6",
      isActive: true,
      isPublic: true,
      requiresConfirmation: false,
      bufferTimeBefore: 0,
      bufferTimeAfter: 0,
      minimumNotice: 60,
      maximumFutureBooking: 30,
      dailyBookingLimit: 0,
      weeklyBookingLimit: 0,
      monthlyBookingLimit: 0,
      collectAttendeeEmail: true,
      collectAttendeePhone: false,
      collectAttendeeMessage: false,
      customQuestions: [],
      allowCancellation: true,
      cancellationNotice: 60,
      allowRescheduling: true,
      rescheduleNotice: 60,
    }
  });

  // Fetch existing event type for editing
  const { data: eventType, isLoading } = useQuery({
    queryKey: ['/api/appointment-event-types', eventTypeId],
    queryFn: async () => {
      if (!eventTypeId) return null;
      return await apiRequest('GET', `/api/appointment-event-types/${eventTypeId}`);
    },
    enabled: !!eventTypeId && isOpen,
  });

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Watch name changes to auto-generate slug
  const nameValue = form.watch("name");
  useEffect(() => {
    if (nameValue && !eventTypeId) {
      const slug = generateSlug(nameValue);
      form.setValue("slug", slug);
    }
  }, [nameValue, form, eventTypeId]);

  // Load event type data when editing
  useEffect(() => {
    if (eventType && eventTypeId) {
      form.reset({
        name: eventType.name,
        slug: eventType.slug,
        description: eventType.description || "",
        duration: eventType.duration,
        price: eventType.price,
        currency: eventType.currency,
        meetingLocation: eventType.meetingLocation || "video",
        customLocation: eventType.customLocation || "",
        brandColor: eventType.brandColor,
        isActive: eventType.isActive,
        isPublic: eventType.isPublic,
        requiresConfirmation: eventType.requiresConfirmation,
        bufferTimeBefore: eventType.bufferTimeBefore || 0,
        bufferTimeAfter: eventType.bufferTimeAfter || 0,
        minimumNotice: eventType.minimumNotice || 60,
        maximumFutureBooking: eventType.maximumFutureBooking || 30,
        dailyBookingLimit: eventType.dailyBookingLimit || 0,
        weeklyBookingLimit: eventType.weeklyBookingLimit || 0,
        monthlyBookingLimit: eventType.monthlyBookingLimit || 0,
        collectAttendeeEmail: eventType.collectAttendeeEmail !== false,
        collectAttendeePhone: eventType.collectAttendeePhone || false,
        collectAttendeeMessage: eventType.collectAttendeeMessage || false,
        customQuestions: eventType.customQuestions || [],
        instructionsBeforeEvent: eventType.instructionsBeforeEvent || "",
        instructionsAfterEvent: eventType.instructionsAfterEvent || "",
        confirmationMessage: eventType.confirmationMessage || "",
        allowCancellation: eventType.allowCancellation !== false,
        cancellationNotice: eventType.cancellationNotice || 60,
        allowRescheduling: eventType.allowRescheduling !== false,
        rescheduleNotice: eventType.rescheduleNotice || 60,
      });
    }
  }, [eventType, eventTypeId, form]);

  // Create/Update mutation
  const saveEventTypeMutation = useMutation({
    mutationFn: async (data: EventTypeFormData) => {
      if (eventTypeId) {
        return await apiRequest('PUT', `/api/appointment-event-types/${eventTypeId}`, data);
      } else {
        return await apiRequest('POST', '/api/appointment-event-types', data);
      }
    },
    onSuccess: (data) => {
      toast({
        title: eventTypeId ? "Event Type Updated" : "Event Type Created",
        description: `The event type "${data.name}" has been ${eventTypeId ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointment-event-types'] });
      onSave?.(data);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: eventTypeId ? "Update Failed" : "Creation Failed",
        description: error.message || `Failed to ${eventTypeId ? 'update' : 'create'} event type.`,
        variant: "destructive",
      });
    },
  });

  // Add custom question
  const addCustomQuestion = () => {
    const currentQuestions = form.getValues("customQuestions");
    const newQuestion = {
      id: Date.now().toString(),
      question: "",
      required: false,
      type: "text" as const,
    };
    form.setValue("customQuestions", [...currentQuestions, newQuestion]);
  };

  // Remove custom question
  const removeCustomQuestion = (questionId: string) => {
    const currentQuestions = form.getValues("customQuestions");
    form.setValue("customQuestions", currentQuestions.filter(q => q.id !== questionId));
  };

  // Handle form submission
  const onSubmit = (data: EventTypeFormData) => {
    saveEventTypeMutation.mutate(data);
  };

  // Generate preview URL
  const handlePreview = () => {
    const formData = form.getValues();
    if (formData.slug) {
      const url = `${window.location.origin}/booking/${formData.slug}`;
      setPreviewUrl(url);
      window.open(url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold" data-testid="title-event-type-editor">
              {eventTypeId ? 'Edit Event Type' : 'Create New Event Type'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure your appointment type settings and booking preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!form.watch("slug")}
              data-testid="button-preview"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="ghost" onClick={onClose} data-testid="button-close">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="scheduling" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Scheduling
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger value="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </TabsTrigger>
                  <TabsTrigger value="collection" className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Collection
                  </TabsTrigger>
                  <TabsTrigger value="branding" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Branding
                  </TabsTrigger>
                </TabsList>

                {/* Basic Settings Tab */}
                <TabsContent value="basic" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>
                        Set the fundamental details for your event type
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Type Name*</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g. 30 Minute Meeting"
                                data-testid="input-name"
                              />
                            </FormControl>
                            <FormDescription>
                              A clear, descriptive name for your appointment type
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Slug*</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-r-0 rounded-l-md text-sm text-gray-600">
                                  /booking/
                                </span>
                                <Input 
                                  {...field} 
                                  className="rounded-l-none"
                                  placeholder="30-minute-meeting"
                                  data-testid="input-slug"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              This will be part of your booking page URL
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Brief description of what this appointment is for..."
                                className="min-h-[100px]"
                                data-testid="textarea-description"
                              />
                            </FormControl>
                            <FormDescription>
                              Optional description shown to people booking appointments
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration*</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger data-testid="select-duration">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DURATION_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value.toString()}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                                <SelectItem value="custom">Custom Duration</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              How long each appointment should last
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("duration") && !DURATION_OPTIONS.find(opt => opt.value === form.watch("duration")) && (
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Duration (minutes)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="5"
                                  max="480"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-custom-duration"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="flex items-center gap-4">
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-active"
                                />
                              </FormControl>
                              <div>
                                <FormLabel>Active</FormLabel>
                                <FormDescription className="text-xs">
                                  Allow new bookings for this event type
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isPublic"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-public"
                                />
                              </FormControl>
                              <div>
                                <FormLabel>Public</FormLabel>
                                <FormDescription className="text-xs">
                                  Show on your public booking page
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Scheduling Settings Tab */}
                <TabsContent value="scheduling" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Scheduling Rules</CardTitle>
                      <CardDescription>
                        Configure when and how people can book appointments
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bufferTimeBefore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Buffer Before (minutes)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  max="120"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-buffer-before"
                                />
                              </FormControl>
                              <FormDescription>
                                Time to block before each appointment
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bufferTimeAfter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Buffer After (minutes)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  max="120"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-buffer-after"
                                />
                              </FormControl>
                              <FormDescription>
                                Time to block after each appointment
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="minimumNotice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Notice (minutes)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  max="43200"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-minimum-notice"
                                />
                              </FormControl>
                              <FormDescription>
                                How far in advance must bookings be made
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maximumFutureBooking"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Future Booking (days)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="1"
                                  max="365"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-max-future-booking"
                                />
                              </FormControl>
                              <FormDescription>
                                How far in the future can appointments be booked
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Booking Limits</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="dailyBookingLimit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Daily Limit</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    data-testid="input-daily-limit"
                                  />
                                </FormControl>
                                <FormDescription>
                                  0 = unlimited
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="weeklyBookingLimit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Weekly Limit</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    data-testid="input-weekly-limit"
                                  />
                                </FormControl>
                                <FormDescription>
                                  0 = unlimited
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="monthlyBookingLimit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Monthly Limit</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    data-testid="input-monthly-limit"
                                  />
                                </FormControl>
                                <FormDescription>
                                  0 = unlimited
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="requiresConfirmation"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div className="space-y-0.5">
                                <FormLabel>Require Confirmation</FormLabel>
                                <FormDescription>
                                  Manually approve each booking request
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-requires-confirmation"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Cancellation & Rescheduling</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="allowCancellation"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-y-0">
                                <div className="space-y-0.5">
                                  <FormLabel>Allow Cancellation</FormLabel>
                                  <FormDescription>
                                    Let attendees cancel bookings
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-allow-cancellation"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="allowRescheduling"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-y-0">
                                <div className="space-y-0.5">
                                  <FormLabel>Allow Rescheduling</FormLabel>
                                  <FormDescription>
                                    Let attendees reschedule bookings
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-allow-rescheduling"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        {(form.watch("allowCancellation") || form.watch("allowRescheduling")) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {form.watch("allowCancellation") && (
                              <FormField
                                control={form.control}
                                name="cancellationNotice"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cancellation Notice (minutes)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        min="0"
                                        max="1440"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        data-testid="input-cancellation-notice"
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Minimum notice required for cancellation
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}

                            {form.watch("allowRescheduling") && (
                              <FormField
                                control={form.control}
                                name="rescheduleNotice"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Reschedule Notice (minutes)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        min="0"
                                        max="1440"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        data-testid="input-reschedule-notice"
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Minimum notice required for rescheduling
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pricing Settings Tab */}
                <TabsContent value="pricing" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing Configuration</CardTitle>
                      <CardDescription>
                        Set up pricing for paid appointments
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (in cents)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-price"
                                />
                              </FormControl>
                              <FormDescription>
                                Set to 0 for free appointments. Price in cents (e.g., 2500 = $25.00)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-currency">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CURRENCIES.map((currency) => (
                                    <SelectItem key={currency.value} value={currency.value}>
                                      {currency.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch("price") > 0 && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Payment Information
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                            This event type will cost{" "}
                            <strong>
                              {CURRENCIES.find(c => c.value === form.watch("currency"))?.symbol}
                              {(form.watch("price") / 100).toFixed(2)}
                            </strong>
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Payment will be collected when the appointment is booked. Make sure you have set up payment processing in your account settings.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Location Settings Tab */}
                <TabsContent value="location" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Meeting Location</CardTitle>
                      <CardDescription>
                        Configure where appointments will take place
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="meetingLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-location">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {MEETING_LOCATIONS.map((location) => (
                                  <SelectItem key={location.value} value={location.value}>
                                    <div className="flex items-center gap-2">
                                      <span>{location.icon}</span>
                                      {location.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("meetingLocation") === "custom" && (
                        <FormField
                          control={form.control}
                          name="customLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Location</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Enter location details..."
                                  data-testid="input-custom-location"
                                />
                              </FormControl>
                              <FormDescription>
                                Specify the meeting location (address, link, etc.)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium mb-2">Location Information</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {form.watch("meetingLocation") === "video" && (
                            <p>📹 Video call link will be automatically generated and sent to attendees</p>
                          )}
                          {form.watch("meetingLocation") === "phone" && (
                            <p>📞 Phone number will be provided in the confirmation email</p>
                          )}
                          {form.watch("meetingLocation") === "in_person" && (
                            <p>🏢 In-person meeting at your office or specified location</p>
                          )}
                          {form.watch("meetingLocation") === "custom" && form.watch("customLocation") && (
                            <p>📍 {form.watch("customLocation")}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Information Collection Tab */}
                <TabsContent value="collection" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Information Collection</CardTitle>
                      <CardDescription>
                        Configure what information to collect from attendees
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Standard Fields</h4>
                        
                        <FormField
                          control={form.control}
                          name="collectAttendeeEmail"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div className="space-y-0.5">
                                <FormLabel>Email Address</FormLabel>
                                <FormDescription>
                                  Collect attendee's email address (recommended)
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-collect-email"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="collectAttendeePhone"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div className="space-y-0.5">
                                <FormLabel>Phone Number</FormLabel>
                                <FormDescription>
                                  Collect attendee's phone number
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-collect-phone"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="collectAttendeeMessage"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div className="space-y-0.5">
                                <FormLabel>Message/Notes</FormLabel>
                                <FormDescription>
                                  Allow attendees to add a message or notes
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-collect-message"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Custom Questions</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addCustomQuestion}
                            data-testid="button-add-question"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Question
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {form.watch("customQuestions").map((question, index) => (
                            <Card key={question.id} className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-sm">Question {index + 1}</h5>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCustomQuestion(question.id)}
                                    data-testid={`button-remove-question-${index}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor={`question-${index}`} className="text-sm">Question</Label>
                                    <Input
                                      id={`question-${index}`}
                                      value={question.question}
                                      onChange={(e) => {
                                        const questions = [...form.watch("customQuestions")];
                                        questions[index].question = e.target.value;
                                        form.setValue("customQuestions", questions);
                                      }}
                                      placeholder="Enter your question..."
                                      data-testid={`input-question-${index}`}
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor={`type-${index}`} className="text-sm">Type</Label>
                                    <Select
                                      value={question.type}
                                      onValueChange={(value: "text" | "textarea" | "select" | "checkbox") => {
                                        const questions = [...form.watch("customQuestions")];
                                        questions[index].type = value;
                                        form.setValue("customQuestions", questions);
                                      }}
                                    >
                                      <SelectTrigger data-testid={`select-question-type-${index}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="text">Text Input</SelectItem>
                                        <SelectItem value="textarea">Long Text</SelectItem>
                                        <SelectItem value="select">Dropdown</SelectItem>
                                        <SelectItem value="checkbox">Checkbox</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`required-${index}`}
                                    checked={question.required}
                                    onChange={(e) => {
                                      const questions = [...form.watch("customQuestions")];
                                      questions[index].required = e.target.checked;
                                      form.setValue("customQuestions", questions);
                                    }}
                                    className="rounded"
                                    data-testid={`checkbox-required-${index}`}
                                  />
                                  <Label htmlFor={`required-${index}`} className="text-sm">
                                    Required field
                                  </Label>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>

                        {form.watch("customQuestions").length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No custom questions added yet</p>
                            <p className="text-xs">Add questions to collect specific information from your attendees</p>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Instructions & Messages</h4>
                        
                        <FormField
                          control={form.control}
                          name="instructionsBeforeEvent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instructions Before Event</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Instructions or information to show attendees before the appointment..."
                                  className="min-h-[80px]"
                                  data-testid="textarea-instructions-before"
                                />
                              </FormControl>
                              <FormDescription>
                                Shown on booking confirmation and reminder emails
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="instructionsAfterEvent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instructions After Event</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Follow-up instructions or next steps after the appointment..."
                                  className="min-h-[80px]"
                                  data-testid="textarea-instructions-after"
                                />
                              </FormControl>
                              <FormDescription>
                                Shown in post-appointment emails and follow-ups
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="confirmationMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Confirmation Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Custom message to show when appointment is booked..."
                                  className="min-h-[80px]"
                                  data-testid="textarea-confirmation-message"
                                />
                              </FormControl>
                              <FormDescription>
                                Overrides default confirmation message
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Branding Settings Tab */}
                <TabsContent value="branding" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Branding & Appearance</CardTitle>
                      <CardDescription>
                        Customize the look and feel of your booking page
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="brandColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand Color</FormLabel>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-10 h-10 rounded-lg border-2 border-gray-300"
                                  style={{ backgroundColor: field.value }}
                                />
                                <FormControl>
                                  <Input 
                                    type="color"
                                    {...field} 
                                    className="w-20 h-10 border-0 p-0 cursor-pointer"
                                    data-testid="input-brand-color"
                                  />
                                </FormControl>
                                <FormControl>
                                  <Input 
                                    type="text"
                                    {...field} 
                                    className="font-mono"
                                    data-testid="input-brand-color-hex"
                                  />
                                </FormControl>
                              </div>
                              
                              <div className="grid grid-cols-6 gap-2">
                                {BRAND_COLORS.map((color) => (
                                  <button
                                    key={color}
                                    type="button"
                                    className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                    onClick={() => field.onChange(color)}
                                    data-testid={`button-color-${color.replace('#', '')}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <FormDescription>
                              This color will be used for buttons and accents on your booking page
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Preview</h4>
                        <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                          <div className="max-w-md mx-auto">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-xl font-semibold" data-testid="preview-title">
                                    {form.watch("name") || "Event Type Name"}
                                  </h3>
                                  {form.watch("description") && (
                                    <p className="text-gray-600 dark:text-gray-400 mt-2" data-testid="preview-description">
                                      {form.watch("description")}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {form.watch("duration")} min
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {MEETING_LOCATIONS.find(loc => loc.value === form.watch("meetingLocation"))?.label}
                                  </div>
                                  {form.watch("price") > 0 && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      {CURRENCIES.find(c => c.value === form.watch("currency"))?.symbol}
                                      {(form.watch("price") / 100).toFixed(2)}
                                    </div>
                                  )}
                                </div>

                                <Button 
                                  type="button"
                                  className="w-full"
                                  style={{ backgroundColor: form.watch("brandColor") }}
                                  data-testid="preview-book-button"
                                >
                                  Book Appointment
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Footer Actions */}
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 dark:bg-gray-800/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    disabled={!form.watch("slug")}
                    data-testid="button-preview-footer"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={saveEventTypeMutation.isPending}
                    data-testid="button-save"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveEventTypeMutation.isPending 
                      ? 'Saving...' 
                      : eventTypeId ? 'Update Event Type' : 'Create Event Type'
                    }
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}