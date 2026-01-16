import { Input } from "@/components/ui/input";
import { ElementEditorProps } from "../registry/types";

export function BookAppointmentEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className="mb-4">
      <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
        <h4 className="text-md font-semibold text-slate-800">Book Appointment</h4>
        
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Service Name</label>
          <Input
            value={elementData.service || ""}
            onChange={(e) => handleDataUpdate({ service: e.target.value })}
            placeholder="e.g., Consultation"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Duration (minutes)</label>
          <Input
            type="number"
            value={elementData.duration || 30}
            onChange={(e) => handleDataUpdate({ duration: parseInt(e.target.value) })}
            min={15}
            step={15}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
          <Input
            value={elementData.buttonText || "Book Now"}
            onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
            placeholder="Book Now"
          />
        </div>

        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            <i className="fas fa-info-circle mr-2"></i>
            Links to your booking page for appointment scheduling.
          </p>
        </div>
      </div>
    </div>
  );
}
