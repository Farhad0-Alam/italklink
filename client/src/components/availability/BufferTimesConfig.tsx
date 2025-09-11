import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Settings, AlertCircle, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BufferTime {
  eventTypeId: string;
  bufferTimeBefore: number;
  bufferTimeAfter: number;
}

interface EventType {
  id: string;
  name: string;
  duration: number;
  bufferTimeBefore: number;
  bufferTimeAfter: number;
}

interface BufferTimesConfigProps {
  eventTypes: EventType[];
  bufferTimes: BufferTime[];
  onChange: (bufferTimes: BufferTime[]) => void;
}

const BUFFER_TIME_OPTIONS = [
  { value: 0, label: 'No buffer' },
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
];

export function BufferTimesConfig({ eventTypes, bufferTimes, onChange }: BufferTimesConfigProps) {
  // Ensure eventTypes is always an array
  const safeEventTypes = Array.isArray(eventTypes) ? eventTypes : [];
  
  const { toast } = useToast();
  const [localBufferTimes, setLocalBufferTimes] = useState<BufferTime[]>([]);

  // Initialize buffer times from event types or provided buffer times
  useEffect(() => {
    if (safeEventTypes.length > 0) {
      const initialBufferTimes = safeEventTypes.map(eventType => {
        const existingBuffer = bufferTimes.find(bt => bt.eventTypeId === eventType.id);
        return existingBuffer || {
          eventTypeId: eventType.id,
          bufferTimeBefore: eventType.bufferTimeBefore || 0,
          bufferTimeAfter: eventType.bufferTimeAfter || 0,
        };
      });
      setLocalBufferTimes(initialBufferTimes);
    }
  }, [safeEventTypes, bufferTimes]);

  // Note: onChange is only called in user event handlers to prevent infinite loops

  const updateBufferTime = (eventTypeId: string, field: 'bufferTimeBefore' | 'bufferTimeAfter', value: number) => {
    setLocalBufferTimes(prev => {
      const next = prev.map(bt => 
        bt.eventTypeId === eventTypeId 
          ? { ...bt, [field]: value }
          : bt
      );
      onChange(next); // Call onChange with computed next state
      return next;
    });
  };

  const setBufferForAll = (field: 'bufferTimeBefore' | 'bufferTimeAfter', value: number) => {
    setLocalBufferTimes(prev => {
      const next = prev.map(bt => ({ ...bt, [field]: value }));
      onChange(next); // Call onChange with computed next state
      return next;
    });
    toast({
      title: "Buffer times updated",
      description: `Set ${field === 'bufferTimeBefore' ? 'before' : 'after'} buffer to ${value} minutes for all event types.`,
    });
  };

  const resetToDefaults = () => {
    setLocalBufferTimes(prev => {
      const next = prev.map(bt => ({
        ...bt,
        bufferTimeBefore: 0,
        bufferTimeAfter: 0,
      }));
      onChange(next); // Call onChange with computed next state
      return next;
    });
    toast({
      title: "Reset to defaults",
      description: "All buffer times have been reset to 0 minutes.",
    });
  };

  const applyRecommendedBuffers = () => {
    setLocalBufferTimes(prev => {
      const next = prev.map(bt => {
        const eventType = safeEventTypes.find(et => et.id === bt.eventTypeId);
        if (!eventType) return bt;

        // Recommended buffers based on appointment duration
        let recommendedBefore = 5;
        let recommendedAfter = 5;

        if (eventType.duration >= 60) {
          recommendedBefore = 15;
          recommendedAfter = 10;
        } else if (eventType.duration >= 30) {
          recommendedBefore = 10;
          recommendedAfter = 5;
        }

        return {
          ...bt,
          bufferTimeBefore: recommendedBefore,
          bufferTimeAfter: recommendedAfter,
        };
      });
      onChange(next); // Call onChange with computed next state
      return next;
    });
    toast({
      title: "Applied recommended buffers",
      description: "Buffer times have been set based on appointment durations.",
    });
  };

  const getTotalDuration = (eventType: EventType, bufferTime: BufferTime) => {
    return eventType.duration + bufferTime.bufferTimeBefore + bufferTime.bufferTimeAfter;
  };

  if (safeEventTypes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-yellow-800 dark:text-yellow-200">
            No event types found. Create an appointment event type first to configure buffer times.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBufferForAll('bufferTimeBefore', 10)}
          data-testid="button-set-all-before-10"
        >
          <Clock className="w-4 h-4 mr-2" />
          10min Before All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBufferForAll('bufferTimeAfter', 5)}
          data-testid="button-set-all-after-5"
        >
          <Clock className="w-4 h-4 mr-2" />
          5min After All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={applyRecommendedBuffers}
          data-testid="button-apply-recommended"
        >
          <Settings className="w-4 h-4 mr-2" />
          Apply Recommended
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          data-testid="button-reset-buffers"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All
        </Button>
      </div>

      {/* Buffer Time Configuration for Each Event Type */}
      <div className="space-y-4">
        {safeEventTypes.map((eventType) => {
          const bufferTime = localBufferTimes.find(bt => bt.eventTypeId === eventType.id) || {
            eventTypeId: eventType.id,
            bufferTimeBefore: 0,
            bufferTimeAfter: 0,
          };

          const totalDuration = getTotalDuration(eventType, bufferTime);

          return (
            <Card key={eventType.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{eventType.name}</CardTitle>
                    <CardDescription>
                      Base duration: {eventType.duration} minutes
                    </CardDescription>
                  </div>
                  <Badge variant="outline" data-testid={`text-total-duration-${eventType.id}`}>
                    Total: {totalDuration} min
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Before Buffer */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Buffer Before (Preparation time)</Label>
                    <Select
                      value={bufferTime.bufferTimeBefore.toString()}
                      onValueChange={(value) => updateBufferTime(eventType.id, 'bufferTimeBefore', parseInt(value))}
                    >
                      <SelectTrigger data-testid={`select-${eventType.id}-buffer-before`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BUFFER_TIME_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Time blocked before the appointment for preparation
                    </p>
                  </div>

                  {/* After Buffer */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Buffer After (Wrap-up time)</Label>
                    <Select
                      value={bufferTime.bufferTimeAfter.toString()}
                      onValueChange={(value) => updateBufferTime(eventType.id, 'bufferTimeAfter', parseInt(value))}
                    >
                      <SelectTrigger data-testid={`select-${eventType.id}-buffer-after`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BUFFER_TIME_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Time blocked after the appointment for notes/cleanup
                    </p>
                  </div>
                </div>

                {/* Visual Timeline */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Booking Timeline:</div>
                  <div className="flex items-center gap-1">
                    {bufferTime.bufferTimeBefore > 0 && (
                      <div 
                        className="bg-blue-200 dark:bg-blue-800 h-4 rounded-sm flex items-center justify-center text-xs"
                        style={{ minWidth: `${Math.max(bufferTime.bufferTimeBefore * 2, 40)}px` }}
                      >
                        {bufferTime.bufferTimeBefore}m prep
                      </div>
                    )}
                    <div 
                      className="bg-green-200 dark:bg-green-800 h-4 rounded-sm flex items-center justify-center text-xs font-medium"
                      style={{ minWidth: `${Math.max(eventType.duration * 2, 60)}px` }}
                    >
                      {eventType.duration}m appointment
                    </div>
                    {bufferTime.bufferTimeAfter > 0 && (
                      <div 
                        className="bg-blue-200 dark:bg-blue-800 h-4 rounded-sm flex items-center justify-center text-xs"
                        style={{ minWidth: `${Math.max(bufferTime.bufferTimeAfter * 2, 40)}px` }}
                      >
                        {bufferTime.bufferTimeAfter}m wrap-up
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Information */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm">
          <div className="font-medium mb-2">Buffer Configuration Summary:</div>
          <div className="space-y-1 text-gray-600 dark:text-gray-400">
            {localBufferTimes.map((bt) => {
              const eventType = safeEventTypes.find(et => et.id === bt.eventTypeId);
              if (!eventType) return null;
              
              return (
                <div key={bt.eventTypeId} className="flex justify-between">
                  <span>{eventType.name}:</span>
                  <span data-testid={`text-summary-${bt.eventTypeId}`}>
                    {bt.bufferTimeBefore + eventType.duration + bt.bufferTimeAfter} min total
                    ({bt.bufferTimeBefore}+{eventType.duration}+{bt.bufferTimeAfter})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}