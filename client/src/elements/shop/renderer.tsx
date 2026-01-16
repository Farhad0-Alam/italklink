import { ShopElement } from "@/components/shop-element";
import { ElementRendererProps } from "../registry/types";

export function ShopRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

  return (
    <div className="mb-4">
      <div className="shop-element w-full" data-testid="shop-element">
        <ShopElement
          sellerId={cardData?.userId || ""}
          title={elementData.title || "My Digital Products"}
          description={elementData.description}
          maxItems={elementData.maxItems || 6}
        />
      </div>
    </div>
  );
}
