import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";

function TestimonialsContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const testimonials = data.testimonials || [];

  const addTestimonial = () => {
    const newTestimonial = {
      id: generateFieldId(),
      name: "John Doe",
      title: "CEO",
      company: "Company",
      content: "Great service!",
      rating: 5
    };
    onChange({ ...data, testimonials: [...testimonials, newTestimonial] });
  };

  const updateTestimonial = (index: number, field: string, value: any) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, testimonials: updated });
  };

  const removeTestimonial = (index: number) => {
    const updated = testimonials.filter((_: any, i: number) => i !== index);
    onChange({ ...data, testimonials: updated });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">Testimonials ({testimonials.length})</h4>
        <Button variant="outline" size="sm" onClick={addTestimonial}>
          <i className="fas fa-plus mr-2"></i>Add
        </Button>
      </div>

      {testimonials.map((t: any, index: number) => (
        <div key={t.id || index} className="bg-gray-50 p-3 rounded-lg border space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTestimonial(index)}
              className="text-red-400 hover:text-red-500 h-6 w-6 p-0"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <Input
              value={t.name || ''}
              onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
              className="text-sm"
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Title</label>
              <Input
                value={t.title || ''}
                onChange={(e) => updateTestimonial(index, 'title', e.target.value)}
                className="text-sm"
                placeholder="CEO"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Company</label>
              <Input
                value={t.company || ''}
                onChange={(e) => updateTestimonial(index, 'company', e.target.value)}
                className="text-sm"
                placeholder="Company Inc."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Testimonial</label>
            <Textarea
              value={t.content || ''}
              onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
              className="text-sm"
              placeholder="What they said..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Rating: {t.rating || 5} ★</label>
            <input
              type="range"
              min="1"
              max="5"
              value={t.rating || 5}
              onChange={(e) => updateTestimonial(index, 'rating', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Avatar URL (Optional)</label>
            <Input
              value={t.avatar || ''}
              onChange={(e) => updateTestimonial(index, 'avatar', e.target.value)}
              className="text-sm"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </div>
      ))}

      {testimonials.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <i className="fas fa-quote-left text-2xl mb-2"></i>
          <p className="text-sm">No testimonials yet</p>
          <p className="text-xs">Click "Add" to add your first testimonial</p>
        </div>
      )}
    </div>
  );
}

function TestimonialsDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Layout</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Display Style</label>
            <select
              value={data.layout || "cards"}
              onChange={(e) => onChange({ ...data, layout: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="cards">Cards</option>
              <option value="slider">Slider</option>
              <option value="list">List</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Columns (Cards only)</label>
            <select
              value={data.columns || "1"}
              onChange={(e) => onChange({ ...data, columns: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="1">1 Column</option>
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showRating !== false}
                onChange={(e) => onChange({ ...data, showRating: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Star Ratings
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showAvatar !== false}
                onChange={(e) => onChange({ ...data, showAvatar: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Avatars
            </label>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Card Style</h4>
        <BackgroundPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Spacing</h4>
        <SpacingPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

function TestimonialsSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Slider Settings</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.autoplay || false}
                onChange={(e) => onChange({ ...data, autoplay: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Autoplay
            </label>
          </div>

          {data.autoplay && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Interval (seconds)</label>
              <Input
                type="number"
                value={data.autoplayInterval || 5}
                onChange={(e) => onChange({ ...data, autoplayInterval: Number(e.target.value) })}
                min={2}
                max={15}
                className="text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Visibility</h4>
        <VisibilitySettingsPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced</h4>
        <AdvancedSettingsPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

export function TestimonialsEditor({ element, onUpdate }: ElementEditorProps) {
  const { activeTab, setActiveTab } = useElementEditorTabs("content");
  const elementIdRef = useRef(element.id);
  const isLocalUpdateRef = useRef(false);

  const [editorData, setEditorData] = useState(() => element.data || {});

  useEffect(() => {
    if (element.id !== elementIdRef.current) {
      elementIdRef.current = element.id;
      setEditorData(element.data || {});
    } else if (!isLocalUpdateRef.current && element.data) {
      setEditorData(element.data);
    }
    isLocalUpdateRef.current = false;
  }, [element.id, element.data]);

  const handleChange = useCallback((updatedData: any) => {
    isLocalUpdateRef.current = true;
    setEditorData(updatedData);
    onUpdate({ ...element, data: updatedData });
  }, [element, onUpdate]);

  return (
    <div className="h-full">
      <ElementEditorPanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        elementType="testimonials"
        elementTitle="Testimonials"
        compact
        contentPanel={<TestimonialsContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<TestimonialsDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<TestimonialsSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
