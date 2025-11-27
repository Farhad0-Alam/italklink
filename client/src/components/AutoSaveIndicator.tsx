import { useAutoSave } from "@/contexts/AutoSaveContext";
import { Loader2, Check, AlertCircle, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoSaveIndicatorProps {
  className?: string;
  showText?: boolean;
}

export function AutoSaveIndicator({ className, showText = true }: AutoSaveIndicatorProps) {
  const { status, lastSaved, error } = useAutoSave();

  const getStatusContent = () => {
    switch (status) {
      case "saving":
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: "Saving...",
          color: "text-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-950",
        };
      case "saved":
        return {
          icon: <Check className="w-4 h-4" />,
          text: "Saved",
          color: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-950",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: error || "Save failed",
          color: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-950",
        };
      case "dirty":
        return {
          icon: <Cloud className="w-4 h-4" />,
          text: "Unsaved changes",
          color: "text-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-950",
        };
      default:
        if (lastSaved) {
          const timeAgo = getTimeAgo(lastSaved);
          return {
            icon: <Cloud className="w-4 h-4" />,
            text: `Saved ${timeAgo}`,
            color: "text-gray-400",
            bgColor: "bg-gray-50 dark:bg-gray-900",
          };
        }
        return null;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return "earlier";
  };

  const content = getStatusContent();
  
  if (!content) return null;

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
        content.color,
        content.bgColor,
        className
      )}
      data-testid="auto-save-indicator"
    >
      {content.icon}
      {showText && <span>{content.text}</span>}
    </div>
  );
}

export function AutoSaveIndicatorCompact({ className }: { className?: string }) {
  const { status, error } = useAutoSave();

  const getIcon = () => {
    switch (status) {
      case "saving":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "saved":
        return <Check className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" title={error || "Save failed"} />;
      case "dirty":
        return <Cloud className="w-4 h-4 text-amber-500" />;
      default:
        return <Cloud className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={cn("flex items-center", className)} data-testid="auto-save-indicator-compact">
      {getIcon()}
    </div>
  );
}
