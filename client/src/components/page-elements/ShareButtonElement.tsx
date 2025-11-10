import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createShareHandler, getSharePlatforms } from "@/lib/share";
import { Share2 } from "lucide-react";
import { PageElement, BusinessCard } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonElementProps {
  element: PageElement & { type: "shareButton" };
  isEditing?: boolean;
  handleDataUpdate?: (updates: Partial<typeof element.data>) => void;
  card?: BusinessCard;
  toast?: (options: { title: string; description?: string; variant?: string }) => void;
  trackButtonClick?: (
    cardId: string,
    buttonType: string,
    buttonLabel: string,
    buttonAction: string,
    buttonLink?: string
  ) => Promise<void>;
}

export function ShareButtonElement({
  element,
  isEditing,
  handleDataUpdate,
  card,
  toast,
  trackButtonClick,
}: ShareButtonElementProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const shareHandler = card
    ? createShareHandler(card, { toast, trackButtonClick })
    : undefined;

  const handleShare = async (platform?: string) => {
    if (!shareHandler) return;
    
    const success = await shareHandler(platform);
    if (success && element.data.showShareMenu) {
      setShowShareMenu(false);
    }
  };

  // Helper function to get button styles based on style type
  const getButtonStyles = () => {
    const styles: CSSProperties = {};
    
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
          Share Button
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Button Text
            </label>
            <Input
              value={element.data.buttonText || "Share"}
              onChange={(e) => handleDataUpdate?.({ buttonText: e.target.value })}
              className="w-full"
              data-testid="share-button-text"
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
              data-testid="share-button-style"
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
                data-testid="share-button-color"
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
                data-testid="share-text-color"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={element.data.showIcon !== false}
                onChange={(e) => handleDataUpdate?.({ showIcon: e.target.checked })}
                className="rounded"
                data-testid="share-show-icon"
              />
              <label className="text-sm text-slate-700">Show icon</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={element.data.showShareMenu !== false}
                onChange={(e) => handleDataUpdate?.({ showShareMenu: e.target.checked })}
                className="rounded"
                data-testid="share-show-menu"
              />
              <label className="text-sm text-slate-700">Show share menu dropdown</label>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <i className="fas fa-info-circle mr-2"></i>
              This button allows sharing the business card via social media or copying the link.
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
        <p>Share information not available</p>
      </div>
    );
  }

  const sharePlatforms = getSharePlatforms();

  // If share menu is enabled, use dropdown
  if (element.data.showShareMenu !== false) {
    return (
      <div className="flex justify-center mb-4">
        <DropdownMenu open={showShareMenu} onOpenChange={setShowShareMenu}>
          <DropdownMenuTrigger asChild>
            <button
              className="py-3 px-6 rounded-xl flex items-center justify-center font-semibold text-sm transition-all hover:transform hover:scale-105"
              style={getButtonStyles()}
              data-testid="button-share-main"
            >
              {element.data.showIcon !== false && (
                <>
                  {element.data.buttonIcon === "Share2" ? (
                    <Share2 className="w-5 h-5 mr-2" style={{ color: element.data.iconColor || element.data.textColor }} />
                  ) : (
                    <i className="fas fa-share-alt text-lg mr-3" style={{ color: element.data.iconColor || element.data.textColor }}></i>
                  )}
                </>
              )}
              {element.data.buttonText || "Share"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {sharePlatforms.map((platform) => (
              <DropdownMenuItem
                key={platform.id}
                onClick={() => handleShare(platform.id)}
                className="cursor-pointer"
                data-testid={`share-platform-${platform.id}`}
              >
                <i className={`${platform.icon} mr-2 w-4`}></i>
                {platform.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Simple button without dropdown menu (uses native share or copy)
  return (
    <div className="flex justify-center mb-4">
      <button
        onClick={() => handleShare()}
        className="py-3 px-6 rounded-xl flex items-center justify-center font-semibold text-sm transition-all hover:transform hover:scale-105"
        style={getButtonStyles()}
        data-testid="button-share-simple"
      >
        {element.data.showIcon !== false && (
          <>
            {element.data.buttonIcon === "Share2" ? (
              <Share2 className="w-5 h-5 mr-2" style={{ color: element.data.iconColor || element.data.textColor }} />
            ) : (
              <i className="fas fa-share-alt text-lg mr-3" style={{ color: element.data.iconColor || element.data.textColor }}></i>
            )}
          </>
        )}
        {element.data.buttonText || "Share"}
      </button>
    </div>
  );
}