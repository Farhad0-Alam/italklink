import { useState } from "react";
import { Layers, Palette, Settings, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EditorTabId = "content" | "design" | "settings";

interface ElementEditorTabsProps {
  activeTab: EditorTabId;
  onTabChange: (tab: EditorTabId) => void;
  elementType?: string;
  elementTitle?: string;
  onClose?: () => void;
  className?: string;
  compact?: boolean;
}

const tabs = [
  { id: "content" as const, label: "Content", icon: Layers },
  { id: "design" as const, label: "Design", icon: Palette },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

export function ElementEditorTabs({
  activeTab,
  onTabChange,
  elementType,
  elementTitle,
  onClose,
  className,
  compact = false,
}: ElementEditorTabsProps) {
  return (
    <div className={cn("bg-white border-b border-gray-200", className)}>
      {onClose && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
              {elementTitle || elementType || "Edit Element"}
            </span>
          </div>
        </div>
      )}
      
      <div className="flex bg-gray-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 transition-all duration-200",
                "border-b-2 text-sm font-medium",
                isActive
                  ? "border-orange-500 text-orange-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100",
                compact && "py-2"
              )}
            >
              <Icon className={cn("w-4 h-4", compact && "w-3.5 h-3.5")} />
              <span className={cn(compact && "text-xs")}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ElementEditorPanelProps {
  activeTab: EditorTabId;
  onTabChange: (tab: EditorTabId) => void;
  elementType?: string;
  elementTitle?: string;
  onClose?: () => void;
  contentPanel: React.ReactNode;
  designPanel: React.ReactNode;
  settingsPanel: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function ElementEditorPanel({
  activeTab,
  onTabChange,
  elementType,
  elementTitle,
  onClose,
  contentPanel,
  designPanel,
  settingsPanel,
  className,
  compact = false,
}: ElementEditorPanelProps) {
  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      <ElementEditorTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        elementType={elementType}
        elementTitle={elementTitle}
        onClose={onClose}
        compact={compact}
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className={cn("p-3", compact && "p-2")}>
          {activeTab === "content" && contentPanel}
          {activeTab === "design" && designPanel}
          {activeTab === "settings" && settingsPanel}
        </div>
      </div>
    </div>
  );
}

export function useElementEditorTabs(defaultTab: EditorTabId = "content") {
  const [activeTab, setActiveTab] = useState<EditorTabId>(defaultTab);
  
  return {
    activeTab,
    setActiveTab,
    isContent: activeTab === "content",
    isDesign: activeTab === "design",
    isSettings: activeTab === "settings",
  };
}
