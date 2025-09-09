import { useState, useEffect } from "react";
import { HeaderPreview } from "./HeaderPreview";
import { HeaderBuilderPanel } from "./HeaderBuilderPanel";
import type { HeaderPreset } from "@/lib/header-schema";
import { defaultHeaderPreset } from "@/lib/header-schema";
import type { BusinessCard } from "@shared/schema";

interface HeaderBuilderProps {
  headerPreset?: HeaderPreset;
  onPresetChange: (preset: HeaderPreset) => void;
  cardData: BusinessCard;
  profileImageSrc?: string;
  className?: string;
}

export const HeaderBuilder = ({ 
  headerPreset = defaultHeaderPreset, 
  onPresetChange,
  cardData,
  profileImageSrc,
  className = ""
}: HeaderBuilderProps) => {
  const [localPreset, setLocalPreset] = useState<HeaderPreset>(headerPreset);

  useEffect(() => {
    setLocalPreset(headerPreset);
  }, [headerPreset]);

  const handlePresetChange = (preset: HeaderPreset) => {
    setLocalPreset(preset);
    onPresetChange(preset);
  };

  const handleSavePreset = (preset: HeaderPreset) => {
    // Save preset to localStorage or API
    const savedPresets = JSON.parse(localStorage.getItem('headerPresets') || '[]');
    const existingIndex = savedPresets.findIndex((p: HeaderPreset) => p.id === preset.id);
    
    const presetToSave = {
      ...preset,
      id: preset.id === 'default' ? `preset-${Date.now()}` : preset.id,
      updatedAt: new Date()
    };
    
    if (existingIndex >= 0) {
      savedPresets[existingIndex] = presetToSave;
    } else {
      savedPresets.push(presetToSave);
    }
    
    localStorage.setItem('headerPresets', JSON.stringify(savedPresets));
    handlePresetChange(presetToSave);
  };

  const handleLoadPreset = (presetId: string) => {
    const savedPresets = JSON.parse(localStorage.getItem('headerPresets') || '[]');
    const preset = savedPresets.find((p: HeaderPreset) => p.id === presetId);
    if (preset) {
      handlePresetChange(preset);
    }
  };

  const handleDeletePreset = (presetId: string) => {
    const savedPresets = JSON.parse(localStorage.getItem('headerPresets') || '[]');
    const filteredPresets = savedPresets.filter((p: HeaderPreset) => p.id !== presetId);
    localStorage.setItem('headerPresets', JSON.stringify(filteredPresets));
  };

  const getAvailablePresets = (): HeaderPreset[] => {
    return JSON.parse(localStorage.getItem('headerPresets') || '[]');
  };

  return (
    <div className={`flex gap-6 ${className}`}>
      {/* Preview Area */}
      <div className="flex-1">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Header Preview</h3>
          <div className="bg-white p-4 rounded-lg shadow-md flex justify-center">
            <HeaderPreview
              headerPreset={localPreset}
              cardData={cardData}
              profileImageSrc={profileImageSrc}
              className="border border-gray-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Builder Panel */}
      <div className="flex-shrink-0">
        <HeaderBuilderPanel
          headerPreset={localPreset}
          onPresetChange={handlePresetChange}
          onSavePreset={handleSavePreset}
          onLoadPreset={handleLoadPreset}
          onDeletePreset={handleDeletePreset}
          availablePresets={getAvailablePresets()}
        />
      </div>
    </div>
  );
};

export * from "./HeaderPreview";
export * from "./HeaderBuilderPanel";
export * from "./ShapeDivider";
export * from "./DragStack";