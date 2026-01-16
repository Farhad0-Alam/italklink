import { ElementRendererProps } from "../registry/types";

export function VideoRenderer({ element }: ElementRendererProps) {
  const elementData = element.data || {};

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
  };

  const embedUrl = getEmbedUrl(elementData?.url || '');

  if (!embedUrl) {
    return (
      <div className="mb-4 p-8 bg-slate-100 rounded-lg text-center text-slate-500 border-2 border-dashed border-slate-300">
        <i className="fas fa-video text-3xl mb-2"></i>
        <p>No video set</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="aspect-video bg-slate-800 rounded overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
