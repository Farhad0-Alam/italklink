import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ElementConfig, ElementRendererProps } from "../registry/types";

function AvailabilityDisplayRenderer({ element, isEditing, onUpdate, cardData, isInteractive = true }: ElementRendererProps) {
  const elementData = element.data || {};
  const [isLoading, setIsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  const daysToShow = elementData.daysInAdvance || 7;
  const primaryColor = cardData?.brandColor || "#22c55e";

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const mockSlots = [];
      const today = new Date();

      for (let i = 0; i < daysToShow; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isAvailable = !isWeekend && Math.random() > 0.3;

        if (isAvailable) {
          const timeSlots = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];
          timeSlots.forEach((time, timeIndex) => {
            if (Math.random() > 0.4) {
              mockSlots.push({
                id: `${i}-${timeIndex}`,
                day: `${dayName}, ${dateStr}`,
                time,
                available: true,
                date: date.toISOString().split('T')[0]
              });
            }
          });
        } else {
          mockSlots.push({
            id: `${i}-busy`,
            day: `${dayName}, ${dateStr}`,
            time: isWeekend ? 'Weekend' : 'No slots',
            available: false,
            date: date.toISOString().split('T')[0]
          });
        }
      }

      setAvailableSlots(mockSlots);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [daysToShow]);

  if (isEditing) {
    return (
      <div className="mb-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
          <h4 className="text-md font-semibold text-slate-800">Availability Display</h4>
          
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Days to Show</label>
            <Input
              type="number"
              value={elementData.daysInAdvance || 7}
              onChange={(e) => handleDataUpdate({ daysInAdvance: parseInt(e.target.value) })}
              min={1}
              max={30}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Show Book Button</span>
            <Switch
              checked={elementData.showBookButton !== false}
              onCheckedChange={(checked) => handleDataUpdate({ showBookButton: checked })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Layout</label>
            <select
              value={elementData.layout || "weekly"}
              onChange={(e) => handleDataUpdate({ layout: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="weekly">Weekly</option>
              <option value="compact">Compact</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mb-4 space-y-3">
        {Array.from({ length: Math.min(daysToShow, 5) }).map((_, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white rounded border animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            <div className="h-4 bg-slate-200 rounded w-16"></div>
            <div className="h-4 bg-slate-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-4 space-y-2">
      {availableSlots.slice(0, 7).map((slot, index) => (
        <div 
          key={slot.id} 
          className={`flex items-center justify-between p-3 bg-white rounded border transition-all ${
            slot.available && isInteractive ? 'hover:shadow-md hover:border-slate-300 cursor-pointer' : ''
          }`}
        >
          <span className="text-sm font-medium text-slate-700">{slot.day}</span>
          <span className="text-sm text-slate-600">{slot.time}</span>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${slot.available ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className={`text-xs ${slot.available ? "text-green-600" : "text-red-600"}`}>
              {slot.available ? "Available" : "Busy"}
            </span>
          </div>
        </div>
      ))}

      {elementData.showBookButton !== false && (
        <div className="mt-4 text-center">
          <Button style={{ backgroundColor: primaryColor }} className="px-4 py-2">
            <i className="fas fa-calendar-alt mr-2"></i>
            Book a Slot
          </Button>
        </div>
      )}
    </div>
  );
}

export const availabilityDisplayConfig: ElementConfig = {
  metadata: {
    type: "availabilityDisplay",
    title: "Availability",
    icon: "Calendar",
    category: "Booking",
    description: "Show your availability"
  },
  defaultData: () => ({
    calendarId: "",
    showBookButton: true,
    showTimezone: true,
    daysInAdvance: 30,
    timezone: "UTC",
    layout: "weekly" as const
  }),
  Renderer: AvailabilityDisplayRenderer
};

export default availabilityDisplayConfig;
