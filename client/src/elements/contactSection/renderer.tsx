import { ContactLinksRenderer } from "@/components/ContactLinksRenderer";
import { ElementRendererProps } from "../registry/types";

export function ContactSectionRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

  return (
    <div className="mb-4">
      <ContactLinksRenderer
        data={elementData}
        cardData={cardData}
      />
    </div>
  );
}
