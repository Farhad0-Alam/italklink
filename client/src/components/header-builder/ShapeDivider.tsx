import { memo } from "react";
import type { ShapeDivider as ShapeDividerType } from "@/lib/header-schema";
import { SHAPE_PRESETS } from "@/lib/header-schema";

interface ShapeDividerProps {
  divider: ShapeDividerType;
  position: "top" | "bottom";
  canvasWidth?: number;
}

export const ShapeDivider = memo(({ divider, position, canvasWidth = 430 }: ShapeDividerProps) => {
  if (!divider.enabled) return null;

  // Get SVG path - either from preset or custom
  const svgPath = divider.preset === "custom" 
    ? divider.customPath 
    : SHAPE_PRESETS[divider.preset];

  if (!svgPath) return null;

  const viewBox = "0 0 1440 320";
  const transform = divider.flip ? "scaleY(-1)" : "";

  const style: React.CSSProperties = {
    position: "absolute",
    [position]: 0,
    left: 0,
    right: 0,
    height: `${divider.height}px`,
    zIndex: 1,
    pointerEvents: "none",
    opacity: divider.opacity
  };

  return (
    <div style={style}>
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="none"
        style={{ 
          display: "block", 
          transform,
          transformOrigin: "center" 
        }}
      >
        <path
          d={svgPath}
          fill={divider.color}
        />
      </svg>
    </div>
  );
});