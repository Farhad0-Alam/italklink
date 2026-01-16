import { ElementRendererProps } from "../registry/types";

export function ImageRenderer({ element }: ElementRendererProps) {
  const elementData = element.data || {};

  if (!elementData?.src) {
    return (
      <div className="mb-4 p-8 bg-slate-100 rounded-lg text-center text-slate-500 border-2 border-dashed border-slate-300">
        <i className="fas fa-image text-3xl mb-2"></i>
        <p>No image set</p>
      </div>
    );
  }

  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  return (
    <div className="mb-4">
      <img 
        src={elementData.src} 
        alt={elementData?.alt || ''} 
        className={`w-full h-auto ${radiusMap[elementData?.borderRadius || 'md']}`}
      />
    </div>
  );
}
