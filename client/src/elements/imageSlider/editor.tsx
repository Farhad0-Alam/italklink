import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ElementEditorProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";

export function ImageSliderEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};
  const images = elementData?.images || [];

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

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
