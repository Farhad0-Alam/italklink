import { ElementConfig, ElementRendererProps } from "../registry/types";
import { ShopRenderer } from "./renderer";
import { ShopEditor } from "./editor";

function ShopElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <ShopEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <ShopRenderer {...props} />;
}

export const shopConfig: ElementConfig = {
  metadata: {
    type: "shop",
    title: "Digital Shop",
    icon: "ShoppingBag",
    category: "Commerce",
    description: "Display your digital products"
  },
  defaultData: () => ({
    products: [],
    layout: "grid" as const,
    columns: 2,
    showPrices: true,
    showCart: true,
    currency: "USD"
  }),
  Renderer: ShopElementRenderer,
  Editor: ShopEditor
};

export default shopConfig;
