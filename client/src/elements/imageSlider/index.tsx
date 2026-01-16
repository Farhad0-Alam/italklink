import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ElementConfig, ElementRendererProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";

function ImageSliderRenderer({ element, isEditing, onUpdate }: ElementRendererProps) {
  const elementData = element.data || {};
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(elementData.autoplay || false);

  const images = elementData?.images || [];

  const handleDataUpdate = useCallback((newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  }, [element, onUpdate]);

  useEffect(() => {
    if (isAutoPlay && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => prev < images.length - 1 ? prev + 1 : 0);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, images.length]);

  if (isEditing) {
    const addImage = () => {
      const newImage = { id: generateFieldId(), src: "", alt: "" };
      handleDataUpdate({ images: [...images, newImage] });
    };

    const updateImage = (index: number, field: string, value: string) => {
      const updatedImages = [...images];
      updatedImages[index] = { ...updatedImages[index], [field]: value };
      handleDataUpdate({ images: updatedImages });
    };

    const removeImage = (index: number) => {
      const updatedImages = images.filter((_: any, i: number) => i !== index);
      handleDataUpdate({ images: updatedImages });
    };

    return (
      <div className="mb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Autoplay</span>
            <Switch
              checked={elementData?.autoplay || false}
              onCheckedChange={(checked) => handleDataUpdate({ autoplay: checked })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400 block">Images</label>
            {images.map((image: any, index: number) => (
              <div key={image.id || index} className="bg-slate-800 p-2 rounded space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={image.src || ''}
                    onChange={(e) => updateImage(index, 'src', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white text-sm flex-1"
                    placeholder="Image URL"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
                <Input
                  value={image.alt || ''}
                  onChange={(e) => updateImage(index, 'alt', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white text-sm"
                  placeholder="Alt text"
                />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addImage} className="w-full">
              <i className="fas fa-plus mr-2"></i>Add Image
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

export const imageSliderConfig: ElementConfig = {
  metadata: {
    type: "imageSlider",
    title: "Image Slider",
    icon: "Image",
    category: "Interactive",
    description: "Image carousel/slider"
  },
  defaultData: () => ({
    images: [],
    autoplay: true,
    interval: 3000,
    showArrows: true,
    showDots: true,
    height: "300px"
  }),
  Renderer: ImageSliderRenderer
};

export default imageSliderConfig;
