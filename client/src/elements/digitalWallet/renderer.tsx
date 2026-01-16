import { WalletButtons } from "@/components/WalletButtons";
import { ElementRendererProps } from "../registry/types";

export function DigitalWalletRenderer({ cardData }: ElementRendererProps) {
  return (
    <div className="mb-4">
      <WalletButtons cardData={cardData} />
    </div>
  );
}
