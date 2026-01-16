import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ElementRendererProps } from "../registry/types";

export function AvailabilityDisplayRenderer({ element, cardData, isInteractive = true }: ElementRendererProps) {
  const elementData = element.data || {};
  const [isLoading, setIsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

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
      {availableSlots.slice(0, 7).map((slot) => (
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
