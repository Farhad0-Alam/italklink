import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadVCard } from "@/lib/vcard";
import { UserPlus } from "lucide-react";
import { PageElement, BusinessCard } from "@shared/schema";

interface AddToContactsElementProps {
  element: PageElement & { type: "addToContacts" };
  isEditing?: boolean;
  handleDataUpdate?: (updates: Partial<typeof element.data>) => void;
  card?: BusinessCard;
  trackButtonClick?: (
    cardId: string,
    buttonType: string,
    buttonLabel: string,
    buttonAction: string,
    buttonLink?: string
  ) => Promise<void>;
}

export function AddToContactsElement({
  element,
  isEditing,
  handleDataUpdate,
  card,
  trackButtonClick,
}: AddToContactsElementProps) {
  const handleAddToContacts = () => {
    if (!card) return;

    // Track the button click
    if (trackButtonClick && card.id) {
      trackButtonClick(
        card.id,
        "add-to-contacts-button",
        element.data.buttonText || "Add to Contacts",
        "download",
        "vcard"
      ).catch(console.error);
    }

    // Download vCard
    downloadVCard(card);
  };

  // Helper function to get button styles based on style type
  const getButtonStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (element.data.style === "filled") {
      styles.backgroundColor = element.data.buttonColor || "#22c55e";
      styles.color = element.data.textColor || "#ffffff";
      styles.borderBottom = `4px solid ${adjustColor(element.data.buttonColor || "#22c55e", -20)}`;
    } else if (element.data.style === "outline") {
      styles.backgroundColor = "transparent";
      styles.border = `2px solid ${element.data.buttonColor || "#22c55e"}`;
      styles.color = element.data.buttonColor || "#22c55e";
    } else if (element.data.style === "ghost") {
      styles.backgroundColor = "transparent";
      styles.color = element.data.buttonColor || "#22c55e";
    }
    
    return styles;
  };

  // Helper function to adjust color brightness
  const adjustColor = (color: string, amount: number): string => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));
    const newHex = ((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, "0");
    return `#${newHex}`;
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
        <h3 className="text-lg font-bold mb-3 text-slate-800">
          Add to Contacts Button
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Button Text
            </label>
            <Input
              value={element.data.buttonText || "Add to Contacts"}
              onChange={(e) => handleDataUpdate?.({ buttonText: e.target.value })}
              className="w-full"
              data-testid="add-to-contacts-button-text"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Button Style
            </label>
            <select
              value={element.data.style || "filled"}
              onChange={(e) => handleDataUpdate?.({ style: e.target.value as "filled" | "outline" | "ghost" })}
              className="w-full p-2 border rounded-md"
              data-testid="add-to-contacts-button-style"
            >
              <option value="filled">Filled</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Button Color
              </label>
              <Input
                type="color"
                value={element.data.buttonColor || "#22c55e"}
                onChange={(e) => handleDataUpdate?.({ buttonColor: e.target.value })}
                className="w-full h-10"
                data-testid="add-to-contacts-button-color"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Text Color
              </label>
              <Input
                type="color"
                value={element.data.textColor || "#ffffff"}
                onChange={(e) => handleDataUpdate?.({ textColor: e.target.value })}
                className="w-full h-10"
                data-testid="add-to-contacts-text-color"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={element.data.showIcon !== false}
              onChange={(e) => handleDataUpdate?.({ showIcon: e.target.checked })}
              className="rounded"
              data-testid="add-to-contacts-show-icon"
            />
            <label className="text-sm text-slate-700">Show icon</label>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <i className="fas fa-info-circle mr-2"></i>
              This button downloads a vCard file with all contact information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Display mode
  if (!card) {
    return (
      <div className="text-center text-gray-500 p-4">
        <p>Contact information not available</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center mb-4">
      <button
        onClick={handleAddToContacts}
        className="py-3 px-6 rounded-xl flex items-center justify-center font-semibold text-sm transition-all hover:transform hover:scale-105"
        style={getButtonStyles()}
        data-testid="button-save-contact"
      >
        {element.data.showIcon !== false && (
          <>
            {element.data.buttonIcon === "UserPlus" ? (
              <UserPlus className="w-5 h-5 mr-2" style={{ color: element.data.iconColor || element.data.textColor }} />
            ) : (
              <i className="fas fa-address-book text-lg mr-3" style={{ color: element.data.iconColor || element.data.textColor }}></i>
            )}
          </>
        )}
        {element.data.buttonText || "Add to Contacts"}
      </button>
    </div>
  );
}