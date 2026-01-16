import { ElementConfig, ElementRendererProps } from "../registry/types";
import { DigitalWalletRenderer } from "./renderer";
import { DigitalWalletEditor } from "./editor";

function DigitalWalletElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <DigitalWalletEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <DigitalWalletRenderer {...props} />;
}

export const digitalWalletConfig: ElementConfig = {
  metadata: {
    type: "digitalWallet",
    title: "Digital Wallet",
    icon: "ShoppingBag",
    category: "Commerce",
    description: "Add payment wallet buttons"
  },
  defaultData: () => ({
    wallets: [],
    position: "bottom-right" as const,
    autoShow: false,
    currencies: ["USD"]
  }),
  Renderer: DigitalWalletElementRenderer,
  Editor: DigitalWalletEditor
};

export default digitalWalletConfig;
