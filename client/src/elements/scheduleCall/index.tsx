import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ElementConfig, ElementRendererProps } from "../registry/types";

function ScheduleCallRenderer({ element, isEditing, onUpdate, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  if (isEditing) {
    return (
      <div className="mb-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
          <h4 className="text-md font-semibold text-slate-800">Schedule Call</h4>
          
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Call Duration (minutes)</label>
            <Input
              type="number"
              value={elementData.duration || 30}
              onChange={(e) => handleDataUpdate({ duration: parseInt(e.target.value) })}
              min={15}
              step={15}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Buffer Time (minutes)</label>
            <Input
              type="number"
              value={elementData.bufferTime || 5}
              onChange={(e) => handleDataUpdate({ bufferTime: parseInt(e.target.value) })}
              min={0}
              step={5}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
            <Input
              value={elementData.buttonText || "Schedule a Call"}
              onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
              placeholder="Schedule a Call"
            />
          </div>
        </div>
      </div>
    );
  }

  const brandColor = cardData?.brandColor || "#22c55e";

  return (
    <div className="mb-4">
      <Button
        className="w-full py-3 font-medium"
        style={{ backgroundColor: brandColor }}
        onClick={() => window.open(`/booking/${cardData?.customUrl || cardData?.id}`, '_blank')}
      >
        <i className="fas fa-phone mr-2"></i>
        {elementData.buttonText || "Schedule a Call"}
      </Button>
      <p className="text-center text-sm text-slate-600 mt-2">
        {elementData.duration || 30} min call
      </p>
    </div>
  );
}

export const scheduleCallConfig: ElementConfig = {
  metadata: {
    type: "scheduleCall",
    title: "Schedule Call",
    icon: "Phone",
    category: "Booking",
    description: "Add call scheduling"
  },
  defaultData: () => ({
    calendarId: "",
    duration: 30,
    bufferTime: 5,
    timezone: "UTC",
    confirmationMessage: "Your call has been scheduled!"
  }),
  Renderer: ScheduleCallRenderer
};

export default scheduleCallConfig;
