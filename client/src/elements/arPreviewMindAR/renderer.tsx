import ARPreviewMindAR from "@/elements/ARPreviewMindAR";
import { ElementRendererProps } from "../registry/types";

export function ARPreviewRenderer({ element }: ElementRendererProps) {
  const elementData = element.data || {};

  return (
    <div className="mb-4">
      <ARPreviewMindAR
        modelUrl={elementData.modelUrl}
        markerPattern={elementData.markerPattern}
        scale={elementData.scale}
      />
    </div>
  );
}
