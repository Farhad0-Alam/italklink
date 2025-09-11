import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Settings, Ban, RefreshCw, Eye, Plus, Save } from "lucide-react";
import { BusinessHoursConfig } from "@/components/availability/BusinessHoursConfig";
import { BufferTimesConfig } from "@/components/availability/BufferTimesConfig";
import { BlackoutDatesConfig } from "@/components/availability/BlackoutDatesConfig";
import { RecurringSchedulesConfig } from "@/components/availability/RecurringSchedulesConfig";
import { AvailabilityPreview } from "@/components/availability/AvailabilityPreview";

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

export default function AvailabilityManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("business-hours");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editedSettings, setEditedSettings] = useState<AvailabilitySettings | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch user's availability settings
  const { data: availabilitySettings, isLoading: settingsLoading, error: settingsError } = useQuery<AvailabilitySettings>({
    queryKey: ['/api/availability/settings'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch user's event types for buffer time configuration
  const { data: eventTypes = [], isLoading: eventTypesLoading } = useQuery<EventType[]>({
    queryKey: ['/api/appointment-event-types'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Save availability settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (settings: AvailabilitySettings) => 
      apiRequest('PUT', '/api/availability/settings', settings),
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Your availability settings have been updated successfully.",
      });
      setHasUnsavedChanges(false);
      setEditedSettings(null);
      queryClient.invalidateQueries({ queryKey: ['/api/availability/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save availability settings.",
        variant: "destructive",
      });
    },
  });

  // Initialize edited settings when availability settings are loaded
  useEffect(() => {
    if (availabilitySettings && !editedSettings) {
      setEditedSettings(availabilitySettings);
    }
  }, [availabilitySettings, editedSettings]);

  // Handle settings changes
  const handleSettingsChange = useCallback((section: keyof AvailabilitySettings, data: any) => {
    setHasUnsavedChanges(true);
    setEditedSettings(prev => ({
      ...prev!,
      [section]: data
    }));
  }, []); // Empty dependency array since this doesn't depend on any props or state

  // Get current settings (edited if available, otherwise from query)
  const currentSettings = editedSettings || availabilitySettings;

  // Handle preview button click
  const handlePreview = () => {
    if (hasUnsavedChanges) {
      toast({
        title: "Unsaved Changes",
        description: "You have unsaved changes. The preview shows your current edits.",
      });
    }
    setShowPreview(true);
  };

  // Handle save
  const handleSave = () => {
    if (!editedSettings) {
      toast({
        title: "Nothing to Save",
        description: "No changes detected.",
      });
      return;
    }
    saveSettingsMutation.mutate(editedSettings);
  };

  if (settingsLoading || eventTypesLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Settings</CardTitle>
              <CardDescription>
                Unable to load your availability settings. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()} data-testid="button-refresh">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="title-availability">
              Availability Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure your business hours, buffer times, and blackout dates to control when appointments can be booked.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600">
                Unsaved Changes
              </Badge>
            )}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  data-testid="button-preview"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Availability Preview</DialogTitle>
                </DialogHeader>
                <AvailabilityPreview
                  settings={currentSettings}
                  eventTypes={eventTypes}
                />
              </DialogContent>
            </Dialog>
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saveSettingsMutation.isPending}
              size="sm"
              data-testid="button-save-settings"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveSettingsMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Business Hours</div>
                  <div className="text-lg font-semibold" data-testid="text-business-hours-count">
                    {currentSettings?.businessHours?.filter(h => h.enabled).length || 0} days
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Settings className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Buffer Times</div>
                  <div className="text-lg font-semibold" data-testid="text-buffer-times-count">
                    {currentSettings?.bufferTimes?.length || 0} configured
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Ban className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Blackout Dates</div>
                  <div className="text-lg font-semibold" data-testid="text-blackout-dates-count">
                    {currentSettings?.blackoutDates?.length || 0} periods
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Recurring Schedules</div>
                  <div className="text-lg font-semibold" data-testid="text-recurring-schedules-count">
                    {currentSettings?.recurringSchedules?.length || 0} active
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5" data-testid="tabs-availability">
            <TabsTrigger value="business-hours" data-testid="tab-business-hours">
              <Clock className="w-4 h-4 mr-2" />
              Business Hours
            </TabsTrigger>
            <TabsTrigger value="buffer-times" data-testid="tab-buffer-times">
              <Settings className="w-4 h-4 mr-2" />
              Buffer Times
            </TabsTrigger>
            <TabsTrigger value="blackout-dates" data-testid="tab-blackout-dates">
              <Ban className="w-4 h-4 mr-2" />
              Blackout Dates
            </TabsTrigger>
            <TabsTrigger value="recurring" data-testid="tab-recurring">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recurring
            </TabsTrigger>
            <TabsTrigger value="preview" data-testid="tab-preview">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business-hours" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Hours Configuration</CardTitle>
                <CardDescription>
                  Set your available hours for each day of the week. You can add multiple time ranges per day and copy settings across days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BusinessHoursConfig
                  businessHours={currentSettings?.businessHours || []}
                  onChange={(data) => handleSettingsChange('businessHours', data)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buffer-times" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Buffer Times Management</CardTitle>
                <CardDescription>
                  Configure preparation and wrap-up time before and after appointments for each event type.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BufferTimesConfig
                  eventTypes={eventTypes}
                  bufferTimes={currentSettings?.bufferTimes || []}
                  onChange={(data) => handleSettingsChange('bufferTimes', data)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blackout-dates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Blackout Dates System</CardTitle>
                <CardDescription>
                  Block out dates when you're unavailable. Set single dates, date ranges, or recurring blackouts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlackoutDatesConfig
                  blackoutDates={currentSettings?.blackoutDates || []}
                  onChange={(data) => handleSettingsChange('blackoutDates', data)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recurring" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recurring Schedules</CardTitle>
                <CardDescription>
                  Create and manage recurring availability patterns, seasonal changes, and schedule templates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecurringSchedulesConfig
                  recurringSchedules={currentSettings?.recurringSchedules || []}
                  onChange={(data) => handleSettingsChange('recurringSchedules', data)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Availability Preview</CardTitle>
                <CardDescription>
                  See how your availability settings look to people booking appointments with you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AvailabilityPreview
                  settings={currentSettings}
                  eventTypes={eventTypes}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}