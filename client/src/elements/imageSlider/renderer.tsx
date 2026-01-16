import { useState, useEffect } from "react";
import { ElementRendererProps } from "../registry/types";

export function ImageSliderRenderer({ element }: ElementRendererProps) {
  const elementData = element.data || {};
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(elementData.autoplay || false);
  const images = elementData?.images || [];

  useEffect(() => {
    if (isAutoPlay && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => prev < images.length - 1 ? prev + 1 : 0);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, images.length]);

  useEffect(() => {
    setIsAutoPlay(elementData.autoplay || false);
  }, [elementData.autoplay]);

  if (images.length === 0) {
    return (
      <div className="mb-4 p-8 bg-slate-100 rounded-lg text-center text-slate-500 border-2 border-dashed border-slate-300">
        <i className="fas fa-images text-3xl mb-2"></i>
        <p>No images added</p>
      </div>
    );
  }

  return (
    <div className="mb-4 w-full">
      <div className="relative rounded-xl overflow-hidden bg-slate-100 shadow-lg">
        <div className="relative">
          <img
            src={images[currentSlide]?.src}
            alt={images[currentSlide]?.alt || ''}
            className="w-full max-h-80 object-contain"
            key={currentSlide}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide(prev => prev > 0 ? prev - 1 : images.length - 1)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
              >
                <i className="fas fa-chevron-left text-sm"></i>
              </button>
              <button
                onClick={() => setCurrentSlide(prev => prev < images.length - 1 ? prev + 1 : 0)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
              >
                <i className="fas fa-chevron-right text-sm"></i>
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white scale-125' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
