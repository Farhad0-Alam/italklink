import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Calendar as CalendarIcon, Trash2, Edit2, MoreHorizontal, RefreshCw, Save, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, addDays, startOfWeek, endOfWeek } from "date-fns";

interface RecurringSchedule {
  id: string;
  name: string;
  pattern: string;
  startDate: string;
  endDate?: string;
}

interface RecurringSchedulesConfigProps {
  recurringSchedules: RecurringSchedule[];
  onChange: (recurringSchedules: RecurringSchedule[]) => void;
}

const RECURRING_PATTERNS = [
  { value: 'weekly', label: 'Weekly', description: 'Repeats every week' },
  { value: 'bi-weekly', label: 'Bi-weekly', description: 'Repeats every 2 weeks' },
  { value: 'monthly', label: 'Monthly', description: 'Repeats every month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Repeats every 3 months' },
  { value: 'seasonal', label: 'Seasonal', description: 'Repeats annually for specific seasons' },
  { value: 'custom', label: 'Custom', description: 'Custom recurring pattern' },
];

const SCHEDULE_TEMPLATES = [
  {
    id: 'summer-hours',
    name: 'Summer Hours (Extended)',
    pattern: 'seasonal',
    description: 'Extended summer hours: 8 AM - 7 PM',
    businessHours: [
      { weekday: 'monday', startTime: '08:00', endTime: '19:00', enabled: true },
      { weekday: 'tuesday', startTime: '08:00', endTime: '19:00', enabled: true },
      { weekday: 'wednesday', startTime: '08:00', endTime: '19:00', enabled: true },
      { weekday: 'thursday', startTime: '08:00', endTime: '19:00', enabled: true },
      { weekday: 'friday', startTime: '08:00', endTime: '19:00', enabled: true },
      { weekday: 'saturday', startTime: '09:00', endTime: '15:00', enabled: true },
      { weekday: 'sunday', startTime: '10:00', endTime: '14:00', enabled: false },
    ]
  },
  {
    id: 'winter-hours',
    name: 'Winter Hours (Reduced)',
    pattern: 'seasonal',
    description: 'Reduced winter hours: 9 AM - 5 PM',
    businessHours: [
      { weekday: 'monday', startTime: '09:00', endTime: '17:00', enabled: true },
      { weekday: 'tuesday', startTime: '09:00', endTime: '17:00', enabled: true },
      { weekday: 'wednesday', startTime: '09:00', endTime: '17:00', enabled: true },
      { weekday: 'thursday', startTime: '09:00', endTime: '17:00', enabled: true },
      { weekday: 'friday', startTime: '09:00', endTime: '16:00', enabled: true },
      { weekday: 'saturday', startTime: '10:00', endTime: '14:00', enabled: false },
      { weekday: 'sunday', startTime: '10:00', endTime: '14:00', enabled: false },
    ]
  },
  {
    id: 'holiday-reduced',
    name: 'Holiday Season (Reduced)',
    pattern: 'seasonal',
    description: 'Holiday season with reduced availability',
    businessHours: [
      { weekday: 'monday', startTime: '10:00', endTime: '16:00', enabled: true },
      { weekday: 'tuesday', startTime: '10:00', endTime: '16:00', enabled: true },
      { weekday: 'wednesday', startTime: '10:00', endTime: '16:00', enabled: true },
      { weekday: 'thursday', startTime: '10:00', endTime: '16:00', enabled: true },
      { weekday: 'friday', startTime: '10:00', endTime: '15:00', enabled: true },
      { weekday: 'saturday', startTime: '10:00', endTime: '14:00', enabled: false },
      { weekday: 'sunday', startTime: '12:00', endTime: '16:00', enabled: false },
    ]
  },
];

export function RecurringSchedulesConfig({ recurringSchedules, onChange }: RecurringSchedulesConfigProps) {
  const { toast } = useToast();
  const [localRecurringSchedules, setLocalRecurringSchedules] = useState<RecurringSchedule[]>(recurringSchedules);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<RecurringSchedule | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<Date>();
  const [selectedEndDate, setSelectedEndDate] = useState<Date>();

  // Form state for new/edit schedule
  const [formData, setFormData] = useState({
    name: '',
    pattern: 'weekly',
    description: '',
  });

  // Note: onChange is only called in user event handlers to prevent infinite loops

  const resetForm = () => {
    setFormData({
      name: '',
      pattern: 'weekly',
      description: '',
    });
    setSelectedStartDate(undefined);
    setSelectedEndDate(undefined);
    setEditingSchedule(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (schedule: RecurringSchedule) => {
    setFormData({
      name: schedule.name,
      pattern: schedule.pattern,
      description: '',
    });
    setSelectedStartDate(parseISO(schedule.startDate));
    if (schedule.endDate) {
      setSelectedEndDate(parseISO(schedule.endDate));
    }
    setEditingSchedule(schedule);
    setIsCreateModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !selectedStartDate) {
      toast({
        title: "Validation Error",
        description: "Please provide a name and start date for the recurring schedule.",
        variant: "destructive",
      });
      return;
    }

    const scheduleData = {
      name: formData.name,
      pattern: formData.pattern,
      startDate: selectedStartDate.toISOString(),
      endDate: selectedEndDate?.toISOString(),
    };

    if (editingSchedule) {
      // Update existing schedule
      setLocalRecurringSchedules(prev => {
        const next = prev.map(schedule => 
          schedule.id === editingSchedule.id 
            ? { ...schedule, ...scheduleData }
            : schedule
        );
        onChange(next); // Call onChange with computed next state
        return next;
      });
      toast({
        title: "Schedule Updated",
        description: "The recurring schedule has been updated successfully.",
      });
    } else {
      // Create new schedule
      const newSchedule: RecurringSchedule = {
        id: Date.now().toString(),
        ...scheduleData,
      };

      setLocalRecurringSchedules(prev => {
        const next = [...prev, newSchedule];
        onChange(next); // Call onChange with computed next state
        return next;
      });
      toast({
        title: "Schedule Created",
        description: "The recurring schedule has been created successfully.",
      });
    }

    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setLocalRecurringSchedules(prev => {
      const next = prev.filter(schedule => schedule.id !== id);
      onChange(next); // Call onChange with computed next state
      return next;
    });
    toast({
      title: "Schedule Deleted",
      description: "The recurring schedule has been removed.",
    });
  };

  const handleDuplicate = (schedule: RecurringSchedule) => {
    const duplicatedSchedule: RecurringSchedule = {
      ...schedule,
      id: Date.now().toString(),
      name: `${schedule.name} (Copy)`,
    };
    setLocalRecurringSchedules(prev => {
      const next = [...prev, duplicatedSchedule];
      onChange(next); // Call onChange with computed next state
      return next;
    });
    toast({
      title: "Schedule Duplicated",
      description: "The recurring schedule has been duplicated.",
    });
  };

  const applyTemplate = (template: typeof SCHEDULE_TEMPLATES[0]) => {
    const newSchedule: RecurringSchedule = {
      id: Date.now().toString(),
      name: template.name,
      pattern: template.pattern,
      startDate: new Date().toISOString(),
      endDate: addDays(new Date(), 365).toISOString(), // Default to 1 year
    };

    setLocalRecurringSchedules(prev => {
      const next = [...prev, newSchedule];
      onChange(next); // Call onChange with computed next state
      return next;
    });
    toast({
      title: "Template Applied",
      description: `Applied ${template.name} template to recurring schedules.`,
    });
  };

  const getPatternConfig = (pattern: string) => {
    return RECURRING_PATTERNS.find(p => p.value === pattern) || RECURRING_PATTERNS[0];
  };

  const isScheduleActive = (schedule: RecurringSchedule) => {
    const now = new Date();
    const startDate = parseISO(schedule.startDate);
    const endDate = schedule.endDate ? parseISO(schedule.endDate) : null;
    
    return now >= startDate && (!endDate || now <= endDate);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={openCreateModal} data-testid="button-create-recurring">
          <Plus className="w-4 h-4 mr-2" />
          Create Schedule
        </Button>
        {localRecurringSchedules.length === 0 && (
          <>
            {SCHEDULE_TEMPLATES.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                size="sm"
                onClick={() => applyTemplate(template)}
                data-testid={`button-template-${template.id}`}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {template.name}
              </Button>
            ))}
          </>
        )}
      </div>

      {/* Templates Section */}
      {localRecurringSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schedule Templates</CardTitle>
            <CardDescription>
              Quick templates for common recurring schedule patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SCHEDULE_TEMPLATES.map((template) => (
                <Card key={template.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{template.description}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyTemplate(template)}
                      data-testid={`button-apply-template-${template.id}`}
                    >
                      Apply Template
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recurring Schedules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Active Recurring Schedules</h3>
          <Badge variant="outline" data-testid="text-recurring-count">
            {localRecurringSchedules.length} schedules
          </Badge>
        </div>

        {localRecurringSchedules.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No recurring schedules configured. Create schedules to automatically manage seasonal changes or recurring patterns.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Recurring schedules allow you to:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Set summer/winter hours automatically</li>
                  <li>Reduce availability during holidays</li>
                  <li>Create repeating weekly patterns</li>
                  <li>Schedule vacation periods in advance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {localRecurringSchedules
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .map((schedule) => {
                const patternConfig = getPatternConfig(schedule.pattern);
                const startDate = parseISO(schedule.startDate);
                const endDate = schedule.endDate ? parseISO(schedule.endDate) : null;
                const isActive = isScheduleActive(schedule);

                return (
                  <Card key={schedule.id} className={`p-4 ${isActive ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium" data-testid={`text-schedule-name-${schedule.id}`}>
                              {schedule.name}
                            </div>
                            {isActive && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Active
                              </Badge>
                            )}
                            <Badge variant="outline" data-testid={`badge-pattern-${schedule.id}`}>
                              <RefreshCw className="w-3 h-3 mr-1" />
                              {patternConfig.label}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1" data-testid={`text-schedule-dates-${schedule.id}`}>
                            Starts: {format(startDate, 'MMM d, yyyy')}
                            {endDate && ` • Ends: ${format(endDate, 'MMM d, yyyy')}`}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {patternConfig.description}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid={`button-schedule-menu-${schedule.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(schedule)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(schedule)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Edit Recurring Schedule' : 'Create Recurring Schedule'}
            </DialogTitle>
            <DialogDescription>
              {editingSchedule 
                ? 'Update the recurring schedule details.'
                : 'Create a schedule that automatically applies availability changes on a recurring basis.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="schedule-name">Schedule Name *</Label>
                  <Input
                    id="schedule-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Summer Hours, Holiday Schedule"
                    data-testid="input-schedule-name"
                  />
                </div>
                <div>
                  <Label htmlFor="pattern">Recurring Pattern</Label>
                  <Select
                    value={formData.pattern}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, pattern: value }))}
                  >
                    <SelectTrigger data-testid="select-schedule-pattern">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRING_PATTERNS.map((pattern) => (
                        <SelectItem key={pattern.value} value={pattern.value}>
                          <div>
                            <div>{pattern.label}</div>
                            <div className="text-xs text-gray-500">{pattern.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Date Selection */}
              <div className="space-y-4">
                <div>
                  <Label>Start Date *</Label>
                  <Calendar
                    mode="single"
                    selected={selectedStartDate}
                    onSelect={setSelectedStartDate}
                    className="rounded-md border"
                    data-testid="calendar-start-date"
                  />
                </div>
              </div>
            </div>

            {/* End Date Selection */}
            <div>
              <Label>End Date (Optional)</Label>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Leave empty for schedules that don't expire
              </div>
              <Calendar
                mode="single"
                selected={selectedEndDate}
                onSelect={setSelectedEndDate}
                disabled={(date) => selectedStartDate ? date < selectedStartDate : false}
                className="rounded-md border"
                data-testid="calendar-end-date"
              />
            </div>

            {/* Schedule Preview */}
            {selectedStartDate && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium mb-1">Schedule Summary:</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Pattern: {getPatternConfig(formData.pattern).label}</div>
                  <div>Starts: {format(selectedStartDate, 'EEEE, MMMM d, yyyy')}</div>
                  {selectedEndDate && (
                    <div>Ends: {format(selectedEndDate, 'EEEE, MMMM d, yyyy')}</div>
                  )}
                  <div className="text-xs mt-1">
                    This schedule will automatically manage your availability based on the selected pattern.
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} data-testid="button-save-schedule">
                <Save className="w-4 h-4 mr-2" />
                {editingSchedule ? 'Update' : 'Create'} Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}