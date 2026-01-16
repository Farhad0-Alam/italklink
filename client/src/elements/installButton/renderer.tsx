import { InstallButtonElement } from "@/components/InstallButtonElement";
import { ElementRendererProps } from "../registry/types";

export function InstallButtonRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

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
