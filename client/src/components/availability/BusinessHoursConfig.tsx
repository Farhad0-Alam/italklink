import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash2, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BusinessHour {
  weekday: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
  timezone: string;
}

interface BusinessHoursConfigProps {
  businessHours: BusinessHour[];
  onChange: (businessHours: BusinessHour[]) => void;
}

const WEEKDAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const time24 = `${hour.toString().padStart(2, '0')}:${minute}`;
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? 'AM' : 'PM';
  const time12 = `${hour12}:${minute} ${ampm}`;
  return { value: time24, label: time12 };
});

const DEFAULT_HOURS: BusinessHour[] = WEEKDAYS.map(day => ({
  weekday: day.key,
  startTime: '09:00',
  endTime: '17:00',
  enabled: day.key !== 'saturday' && day.key !== 'sunday',
  timezone: 'UTC',
}));

export function BusinessHoursConfig({ businessHours, onChange }: BusinessHoursConfigProps) {
  const [hours, setHours] = useState<BusinessHour[]>(businessHours.length > 0 ? businessHours : DEFAULT_HOURS);
  const [userTimezone, setUserTimezone] = useState<string>('UTC');

  // Detect user timezone
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(detected);
  }, []);

  // Note: onChange is only called in user event handlers to prevent infinite loops

  const updateHour = (weekday: string, field: keyof BusinessHour, value: any) => {
    setHours(prev => {
      const next = prev.map(hour => 
        hour.weekday === weekday 
          ? { ...hour, [field]: value }
          : hour
      );
      onChange(next); // Call onChange with computed next state
      return next;
    });
  };

  const addTimeRange = (weekday: string) => {
    const existingHour = hours.find(h => h.weekday === weekday);
    if (existingHour) {
      // For now, we'll just enable the day if it's disabled
      updateHour(weekday, 'enabled', true);
    }
  };

  const copyHours = (fromWeekday: string, toWeekday: string) => {
    const sourceHour = hours.find(h => h.weekday === fromWeekday);
    if (sourceHour) {
      updateHour(toWeekday, 'startTime', sourceHour.startTime);
      updateHour(toWeekday, 'endTime', sourceHour.endTime);
      updateHour(toWeekday, 'enabled', sourceHour.enabled);
      updateHour(toWeekday, 'timezone', sourceHour.timezone);
    }
  };

  const copyToAllDays = (weekday: string) => {
    const sourceHour = hours.find(h => h.weekday === weekday);
    if (sourceHour) {
      setHours(prev => {
        const next = prev.map(hour => ({
          ...hour,
          startTime: sourceHour.startTime,
          endTime: sourceHour.endTime,
          enabled: sourceHour.enabled,
          timezone: sourceHour.timezone,
        }));
        onChange(next); // Call onChange with computed next state
        return next;
      });
    }
  };

  const setCommonWorkingHours = () => {
    setHours(prev => {
      const next = prev.map(hour => ({
        ...hour,
        startTime: '09:00',
        endTime: '17:00',
        enabled: hour.weekday !== 'saturday' && hour.weekday !== 'sunday',
        timezone: userTimezone,
      }));
      onChange(next); // Call onChange with computed next state
      return next;
    });
  };

  const enableAllDays = () => {
    setHours(prev => {
      const next = prev.map(hour => ({ ...hour, enabled: true }));
      onChange(next); // Call onChange with computed next state
      return next;
    });
  };

  const disableAllDays = () => {
    setHours(prev => {
      const next = prev.map(hour => ({ ...hour, enabled: false }));
      onChange(next); // Call onChange with computed next state
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={setCommonWorkingHours}
          data-testid="button-set-common-hours"
        >
          <Clock className="w-4 h-4 mr-2" />
          Set 9AM-5PM
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={enableAllDays}
          data-testid="button-enable-all-days"
        >
          Enable All Days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={disableAllDays}
          data-testid="button-disable-all-days"
        >
          Disable All Days
        </Button>
        <Badge variant="secondary" className="ml-auto">
          Timezone: {userTimezone}
        </Badge>
      </div>

      {/* Business Hours Grid */}
      <div className="space-y-4">
        {WEEKDAYS.map((day) => {
          const dayHours = hours.find(h => h.weekday === day.key);
          const enabled = dayHours?.enabled || false;
          
          return (
            <Card key={day.key} className={enabled ? "" : "opacity-60"}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Day Toggle */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => updateHour(day.key, 'enabled', checked)}
                      data-testid={`switch-${day.key}-enabled`}
                    />
                    <Label className="text-sm font-medium min-w-[80px]">
                      {day.label}
                    </Label>
                  </div>

                  {/* Time Range */}
                  {enabled && (
                    <div className="flex items-center gap-2 flex-1">
                      <Select
                        value={dayHours?.startTime || '09:00'}
                        onValueChange={(value) => updateHour(day.key, 'startTime', value)}
                      >
                        <SelectTrigger className="w-[140px]" data-testid={`select-${day.key}-start-time`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <span className="text-gray-500">to</span>

                      <Select
                        value={dayHours?.endTime || '17:00'}
                        onValueChange={(value) => updateHour(day.key, 'endTime', value)}
                      >
                        <SelectTrigger className="w-[140px]" data-testid={`select-${day.key}-end-time`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {enabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addTimeRange(day.key)}
                        data-testid={`button-${day.key}-add-range`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" data-testid={`button-${day.key}-copy-menu`}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyToAllDays(day.key)}>
                          Copy to all days
                        </DropdownMenuItem>
                        {WEEKDAYS.filter(d => d.key !== day.key).map((targetDay) => (
                          <DropdownMenuItem 
                            key={targetDay.key}
                            onClick={() => copyHours(day.key, targetDay.key)}
                          >
                            Copy to {targetDay.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Time Validation Warning */}
                {enabled && dayHours && dayHours.startTime >= dayHours.endTime && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Start time must be before end time
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm">
          <div className="font-medium mb-2">Schedule Summary:</div>
          <div className="text-gray-600 dark:text-gray-400">
            {hours.filter(h => h.enabled).length > 0 ? (
              <span data-testid="text-enabled-days-summary">
                Available {hours.filter(h => h.enabled).length} days per week
              </span>
            ) : (
              <span className="text-red-600">No availability configured</span>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            All times are displayed in {userTimezone}
          </div>
        </div>
      </div>
    </div>
  );
}