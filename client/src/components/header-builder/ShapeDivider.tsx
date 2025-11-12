import { memo, useRef } from "react";
import type { ShapeDivider as ShapeDividerType } from "@/lib/header-schema";
import { SHAPE_PRESETS } from "@/lib/header-schema";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ShapeDividerProps {
  divider: ShapeDividerType;
  position: "top" | "bottom";
  canvasWidth?: number;
  onCustomSVGUpload?: (svgPath: string) => void;
  onRemoveCustomSVG?: () => void;
  showUploadControls?: boolean;
}

export const ShapeDivider = memo(({ 
  divider, 
  position, 
  canvasWidth = 430, 
  onCustomSVGUpload, 
  onRemoveCustomSVG, 
  showUploadControls = false 
}: ShapeDividerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!divider.enabled) return null;

  // Get SVG path - either from preset or custom
  const svgPath = divider.preset === "custom" 
    ? divider.customPath 
    : SHAPE_PRESETS[divider.preset];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onCustomSVGUpload) return;

    if (!file.type.includes('svg')) {
      alert('Please upload a valid SVG file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const svgContent = e.target?.result as string;
      // Extract path data from SVG content
      const pathMatch = svgContent.match(/<path[^>]*d="([^"]+)"/i);
      if (pathMatch) {
        onCustomSVGUpload(pathMatch[1]);
      } else {
        alert('Could not extract path data from SVG. Please ensure your SVG contains a <path> element with a "d" attribute.');
      }
    };
    reader.readAsText(file);
  };

  if (!svgPath) {
    // Show custom SVG upload interface when no path is available
    if (showUploadControls && divider.preset === "custom") {
      return (
        <div 
          style={{
            position: "absolute",
            [position]: 0,
            left: 0,
            right: 0,
            height: `${divider.height}px`,
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.1)",
            border: "2px dashed rgba(0,0,0,0.3)",
            borderRadius: "8px"
          }}
        >
          <div className="text-center p-4">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-3">Upload custom SVG shape</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
            >
              Choose SVG File
            </Button>
          </div>
        </div>
      );
    }
    return null;
  }

  const viewBox = "0 0 1000 100"; // Elementor standard viewBox
  const width = divider.width || 100; // Width percentage (default 100%)
  const heightScale = (divider.height || 100) / 100; // Convert height to scale factor
  
  // Build transform string for SVG
  const transforms = [];
  if (divider.flip) transforms.push("scaleY(-1)");
  if (divider.flipHorizontal) transforms.push("scaleX(-1)");
  transforms.push(`scaleY(${heightScale})`); // Apply height scaling
  const transform = transforms.join(" ");

  // Calculate left offset and width to ensure full coverage
  const leftOffset = width > 100 ? -(width - 100) / 2 : 0;
  
  const style: React.CSSProperties = {
    position: "absolute",
    [position]: 0,
    left: `${leftOffset}%`,
    width: `${width}%`,
    height: "100px", // Fixed container height, scaling handled by transform
    zIndex: 1,
    pointerEvents: "none",
    opacity: divider.opacity,
    overflow: "visible" // Allow shape to extend beyond container
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={style}>
        <svg
          width="100%"
          height="100%"
          viewBox={viewBox}
          preserveAspectRatio="none"
          style={{ 
            display: "block", 
            transform,
            transformOrigin: `center ${position}` // Scale from top or bottom edge
          }}
        >
          <path
            d={svgPath}
            fill={divider.color}
          />
        </svg>
      </div>
      
      {/* Custom SVG controls */}
      {showUploadControls && divider.preset === "custom" && (
        <div style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          zIndex: 2
        }}>
          <div className="flex gap-1">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white"
            >
              <Upload className="w-3 h-3" />
            </Button>
            {onRemoveCustomSVG && (
              <Button
                onClick={onRemoveCustomSVG}
                variant="outline"
                size="sm"
                className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
});