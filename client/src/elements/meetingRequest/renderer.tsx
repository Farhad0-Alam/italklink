import { Button } from "@/components/ui/button";
import { ElementRendererProps } from "../registry/types";

export function MeetingRequestRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};
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
