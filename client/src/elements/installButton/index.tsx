import { Input } from "@/components/ui/input";
import { InstallButtonElement } from "@/components/InstallButtonElement";
import { ElementConfig, ElementRendererProps } from "../registry/types";

function InstallButtonRenderer({ element, isEditing, onUpdate, cardData }: ElementRendererProps) {
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
          <h4 className="text-md font-semibold text-slate-800">Install Button</h4>
          
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
            <Input
              value={elementData.text || "Install App"}
              onChange={(e) => handleDataUpdate({ text: e.target.value })}
              placeholder="Install App"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Button Color</label>
            <input
              type="color"
              value={elementData.buttonColor || cardData?.brandColor || "#22c55e"}
              onChange={(e) => handleDataUpdate({ buttonColor: e.target.value })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Text Color</label>
            <input
              type="color"
              value={elementData.textColor || "#ffffff"}
              onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <i className="fas fa-info-circle mr-2"></i>
              This button allows visitors to install your business card as a PWA app on their device.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <InstallButtonElement
        text={elementData.text || "Install App"}
        buttonColor={elementData.buttonColor || cardData?.brandColor || "#22c55e"}
        textColor={elementData.textColor || "#ffffff"}
        cardData={cardData}
      />
    </div>
  );
}

export const installButtonConfig: ElementConfig = {
  metadata: {
    type: "installButton",
    title: "Install Button",
    icon: "Plus",
    category: "Advanced",
    description: "Add PWA install button"
  },
  defaultData: () => ({
    text: "Install App",
    platform: "both" as const,
    position: "bottom-right" as const,
    showBadge: true,
    delay: 0
  }),
  Renderer: InstallButtonRenderer
};

export default installButtonConfig;
