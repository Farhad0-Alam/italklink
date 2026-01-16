import { MenuPageElement } from "@/components/multi-page";
import { ElementRendererProps } from "../registry/types";

export function NavigationMenuRenderer({ element, cardData, onNavigatePage }: ElementRendererProps) {
  return (
    <div className="mb-4">
      <MenuPageElement
        element={element}
        cardData={cardData}
        onNavigatePage={onNavigatePage}
      />
    </div>
  );
}
