import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Calendar as CalendarIcon, Trash2, Edit2, MoreHorizontal, Ban, Clock, Repeat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, startOfDay, endOfDay, addDays } from "date-fns";

interface BlackoutDate {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  description?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  type: string;
}

interface BlackoutDatesConfigProps {
  blackoutDates: BlackoutDate[];
  onChange: (blackoutDates: BlackoutDate[]) => void;
}

const BLACKOUT_TYPES = [
  { value: 'time_off', label: 'Time Off', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'holiday', label: 'Holiday', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'meeting', label: 'Meeting', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'personal', label: 'Personal', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
];

const COMMON_HOLIDAYS = [
  { name: "New Year's Day", date: new Date(new Date().getFullYear(), 0, 1) },
  { name: "Martin Luther King Jr. Day", date: new Date(new Date().getFullYear(), 0, 21) }, // Third Monday in January
  { name: "Presidents Day", date: new Date(new Date().getFullYear(), 1, 18) }, // Third Monday in February
  { name: "Memorial Day", date: new Date(new Date().getFullYear(), 4, 27) }, // Last Monday in May
  { name: "Independence Day", date: new Date(new Date().getFullYear(), 6, 4) },
  { name: "Labor Day", date: new Date(new Date().getFullYear(), 8, 2) }, // First Monday in September
  { name: "Columbus Day", date: new Date(new Date().getFullYear(), 9, 14) }, // Second Monday in October
  { name: "Veterans Day", date: new Date(new Date().getFullYear(), 10, 11) },
  { name: "Thanksgiving", date: new Date(new Date().getFullYear(), 10, 28) }, // Fourth Thursday in November
  { name: "Christmas Day", date: new Date(new Date().getFullYear(), 11, 25) },
];

export function BlackoutDatesConfig({ blackoutDates, onChange }: BlackoutDatesConfigProps) {
  const { toast } = useToast();
  const [localBlackoutDates, setLocalBlackoutDates] = useState<BlackoutDate[]>(blackoutDates);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBlackout, setEditingBlackout] = useState<BlackoutDate | null>(null);
  const [showHolidays, setShowHolidays] = useState(false);

  // Form state for new/edit blackout
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'time_off',
    isAllDay: true,
    isRecurring: false,
    startTime: '09:00',
    endTime: '17:00',
  });

  // Note: onChange is only called in user event handlers to prevent infinite loops

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'time_off',
      isAllDay: true,
      isRecurring: false,
      startTime: '09:00',
      endTime: '17:00',
    });
    setSelectedDates([]);
    setEditingBlackout(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (blackout: BlackoutDate) => {
    setFormData({
      title: blackout.title,
      description: blackout.description || '',
      type: blackout.type,
      isAllDay: blackout.isAllDay,
      isRecurring: blackout.isRecurring,
      startTime: '09:00', // Could parse from blackout if stored
      endTime: '17:00',
    });
    setSelectedDates([parseISO(blackout.startDate)]);
    setEditingBlackout(blackout);
    setIsCreateModalOpen(true);
  };

  const handleSave = () => {
    if (selectedDates.length === 0 || !formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select dates and provide a title.",
        variant: "destructive",
      });
      return;
    }

    if (editingBlackout) {
      // Update existing blackout
      setLocalBlackoutDates(prev => {
        const next = prev.map(blackout => 
          blackout.id === editingBlackout.id 
            ? {
                ...blackout,
                title: formData.title,
                description: formData.description,
                type: formData.type,
                isAllDay: formData.isAllDay,
                isRecurring: formData.isRecurring,
                startDate: selectedDates[0].toISOString(),
                endDate: selectedDates[selectedDates.length - 1].toISOString(),
              }
            : blackout
        );
        onChange(next); // Call onChange with computed next state
        return next;
      });
      toast({
        title: "Blackout Updated",
        description: "The blackout period has been updated successfully.",
      });
    } else {
      // Create new blackout(s)
      const newBlackouts: BlackoutDate[] = [];
      
      if (selectedDates.length === 1) {
        // Single date or date range
        newBlackouts.push({
          id: Date.now().toString(),
          title: formData.title,
          description: formData.description,
          type: formData.type,
          isAllDay: formData.isAllDay,
          isRecurring: formData.isRecurring,
          startDate: selectedDates[0].toISOString(),
          endDate: selectedDates[0].toISOString(),
        });
      } else {
        // Multiple individual dates
        selectedDates.forEach((date, index) => {
          newBlackouts.push({
            id: `${Date.now()}_${index}`,
            title: formData.title,
            description: formData.description,
            type: formData.type,
            isAllDay: formData.isAllDay,
            isRecurring: formData.isRecurring,
            startDate: date.toISOString(),
            endDate: date.toISOString(),
          });
        });
      }

      setLocalBlackoutDates(prev => {
        const next = [...prev, ...newBlackouts];
        onChange(next); // Call onChange with computed next state
        return next;
      });
      toast({
        title: "Blackout Created",
        description: `Created ${newBlackouts.length} blackout period${newBlackouts.length > 1 ? 's' : ''}.`,
      });
    }

    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setLocalBlackoutDates(prev => {
      const next = prev.filter(blackout => blackout.id !== id);
      onChange(next); // Call onChange with computed next state
      return next;
    });
    toast({
      title: "Blackout Deleted",
      description: "The blackout period has been removed.",
    });
  };

  const addCommonHolidays = () => {
    const holidayBlackouts: BlackoutDate[] = COMMON_HOLIDAYS.map((holiday, index) => ({
      id: `holiday_${Date.now()}_${index}`,
      title: holiday.name,
      description: `US Holiday: ${holiday.name}`,
      type: 'holiday',
      isAllDay: true,
      isRecurring: true,
      startDate: holiday.date.toISOString(),
      endDate: holiday.date.toISOString(),
    }));

    setLocalBlackoutDates(prev => {
      const next = [...prev, ...holidayBlackouts];
      onChange(next); // Call onChange with computed next state
      return next;
    });
    toast({
      title: "Holidays Added",
      description: `Added ${holidayBlackouts.length} common US holidays.`,
    });
  };

  const clearAllBlackouts = () => {
    setLocalBlackoutDates(() => {
      const next = [];
      onChange(next); // Call onChange with computed next state
      return next;
    });
    toast({
      title: "All Blackouts Cleared",
      description: "All blackout periods have been removed.",
    });
  };

  const getTypeConfig = (type: string) => {
    return BLACKOUT_TYPES.find(t => t.value === type) || BLACKOUT_TYPES[0];
  };

  const getBlackoutDatesForCalendar = () => {
    return localBlackoutDates.map(blackout => parseISO(blackout.startDate));
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={openCreateModal} data-testid="button-add-blackout">
          <Plus className="w-4 h-4 mr-2" />
          Add Blackout
        </Button>
        <Button
          variant="outline"
          onClick={addCommonHolidays}
          data-testid="button-add-holidays"
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Add US Holidays
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHolidays(!showHolidays)}
          data-testid="button-toggle-calendar"
        >
          {showHolidays ? 'Hide' : 'Show'} Calendar
        </Button>
        {localBlackoutDates.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllBlackouts}
            className="text-red-600 hover:text-red-700"
            data-testid="button-clear-all"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Calendar View */}
      {showHolidays && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Calendar View</CardTitle>
            <CardDescription>
              Blackout dates are highlighted in red. Click dates to quickly add blackouts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Calendar
                mode="multiple"
                selected={getBlackoutDatesForCalendar()}
                onSelect={(dates) => {
                  if (dates && dates.length > 0) {
                    setSelectedDates(dates);
                    openCreateModal();
                  }
                }}
                className="rounded-md border"
                data-testid="calendar-blackout-picker"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blackout Dates List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Blackout Periods</h3>
          <Badge variant="outline" data-testid="text-blackout-count">
            {localBlackoutDates.length} periods
          </Badge>
        </div>

        {localBlackoutDates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Ban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No blackout dates configured. Add periods when you're unavailable for appointments.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {localBlackoutDates
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .map((blackout) => {
                const typeConfig = getTypeConfig(blackout.type);
                const startDate = parseISO(blackout.startDate);
                const endDate = parseISO(blackout.endDate);
                const isMultiDay = startDate.getTime() !== endDate.getTime();

                return (
                  <Card key={blackout.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={typeConfig.color} data-testid={`badge-type-${blackout.id}`}>
                            {typeConfig.label}
                          </Badge>
                          {blackout.isRecurring && (
                            <Badge variant="outline">
                              <Repeat className="w-3 h-3 mr-1" />
                              Recurring
                            </Badge>
                          )}
                          {!blackout.isAllDay && (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              Time Specific
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid={`button-menu-${blackout.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(blackout)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(blackout.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-2">
                      <div className="font-medium" data-testid={`text-title-${blackout.id}`}>
                        {blackout.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-date-${blackout.id}`}>
                        {isMultiDay 
                          ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
                          : format(startDate, 'EEEE, MMM d, yyyy')
                        }
                      </div>
                      {blackout.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          {blackout.description}
                        </div>
                      )}
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
              {editingBlackout ? 'Edit Blackout Period' : 'Create Blackout Period'}
            </DialogTitle>
            <DialogDescription>
              {editingBlackout 
                ? 'Update the blackout period details.'
                : 'Block out dates when you\'re unavailable for appointments.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Select Dates</Label>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  className="rounded-md border"
                  data-testid="calendar-modal-picker"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Vacation, Holiday, Meeting"
                    data-testid="input-blackout-title"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger data-testid="select-blackout-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BLACKOUT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional details about this blackout period"
                    rows={3}
                    data-testid="textarea-blackout-description"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="all-day"
                    checked={formData.isAllDay}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAllDay: checked }))}
                    data-testid="switch-blackout-all-day"
                  />
                  <Label htmlFor="all-day">All day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))}
                    data-testid="switch-blackout-recurring"
                  />
                  <Label htmlFor="recurring">Recurring annually</Label>
                </div>
              </div>
            </div>

            {/* Selected Dates Summary */}
            {selectedDates.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium mb-1">Selected Dates:</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedDates.length === 1 
                    ? format(selectedDates[0], 'EEEE, MMMM d, yyyy')
                    : `${selectedDates.length} dates selected`
                  }
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} data-testid="button-save-blackout">
                {editingBlackout ? 'Update' : 'Create'} Blackout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}