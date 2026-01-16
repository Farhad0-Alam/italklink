import { Input } from "@/components/ui/input";
import { ElementEditorProps } from "../registry/types";

export function VoiceAssistantEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className="mb-4">
      <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
        <h4 className="text-md font-semibold text-slate-800">Voice Assistant</h4>
        
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Greeting</label>
          <Input
            value={elementData.greeting || "Hello! I'm your voice assistant."}
            onChange={(e) => handleDataUpdate({ greeting: e.target.value })}
            placeholder="Greeting message"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Language</label>
          <select
            value={elementData.language || "en"}
            onChange={(e) => handleDataUpdate({ language: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <i className="fas fa-info-circle mr-2"></i>
            Voice Assistant provides hands-free interaction.
          </p>
        </div>
      </div>
    </div>
  );
}
