import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ElementConfig, ElementRendererProps } from "../registry/types";

function MeetingRequestRenderer({ element, isEditing, onUpdate, cardData }: ElementRendererProps) {
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
          <h4 className="text-md font-semibold text-slate-800">Meeting Request</h4>
          
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Default Duration (minutes)</label>
            <Input
              type="number"
              value={elementData.defaultDuration || 60}
              onChange={(e) => handleDataUpdate({ defaultDuration: parseInt(e.target.value) })}
              min={15}
              step={15}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
            <Input
              value={elementData.buttonText || "Request Meeting"}
              onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
              placeholder="Request Meeting"
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
        <i className="fas fa-handshake mr-2"></i>
        {elementData.buttonText || "Request Meeting"}
      </Button>
    </div>
  );
}

export const meetingRequestConfig: ElementConfig = {
  metadata: {
    type: "meetingRequest",
    title: "Meeting Request",
    icon: "Calendar",
    category: "Booking",
    description: "Add meeting request form"
  },
  defaultData: () => ({
    calendarId: "",
    meetingTypes: [],
    defaultDuration: 60,
    timezone: "UTC",
    requireApproval: false
  }),
  Renderer: MeetingRequestRenderer
};

export default meetingRequestConfig;
