import { ElementRendererProps } from "../registry/types";

export function HTMLRenderer({ element }: ElementRendererProps) {
  const elementData = element.data || {};

  if (!elementData.content || !elementData.content.trim()) {
    return (
      <div className="w-full max-w-[430px] mx-auto">
        <div 
          className="border-2 border-dashed border-slate-300 p-8 text-center text-slate-500"
          style={{ width: '430px', maxWidth: '100%', height: `${elementData.height || 300}px` }}
          data-testid="html-placeholder"
        >
          <i className="fas fa-code text-4xl mb-4"></i>
          <p>Add HTML content to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[430px] mx-auto">
      <div className="html-element-preview w-full" data-testid="html-element-preview">
        <iframe
          srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  ${elementData.content}
</body>
</html>`}
          style={{ 
            width: '430px',
            maxWidth: '100%',
            height: `${elementData.height || 300}px`,
            border: 'none',
            borderRadius: '0'
          }}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          title="Custom HTML Content"
          data-testid="html-iframe"
        />
      </div>
    </div>
  );
}
