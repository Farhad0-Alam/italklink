import { Button } from "@/components/ui/button";
import { ElementRendererProps } from "../registry/types";

export function ScheduleCallRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};
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
