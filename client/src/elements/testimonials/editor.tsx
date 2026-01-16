import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ElementEditorProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";

export function TestimonialsEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};
  const testimonials = elementData?.testimonials || [];

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  const addTestimonial = () => {
    const newTestimonial = {
      id: generateFieldId(),
      name: "John Doe",
      title: "CEO",
      company: "Company",
      content: "Great service!",
      rating: 5
    };
    handleDataUpdate({ testimonials: [...testimonials, newTestimonial] });
  };

  const updateTestimonial = (index: number, field: string, value: any) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    handleDataUpdate({ testimonials: updated });
  };

  const removeTestimonial = (index: number) => {
    const updated = testimonials.filter((_: any, i: number) => i !== index);
    handleDataUpdate({ testimonials: updated });
  };

  return (
    <div className="mb-4">
      <div className="space-y-3">
        {testimonials.map((t: any, index: number) => (
          <div key={t.id || index} className="bg-slate-800 p-3 rounded space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Testimonial {index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTestimonial(index)}
                className="text-red-400 hover:text-red-300"
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
            <Input
              value={t.name || ''}
              onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white text-sm"
              placeholder="Name"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={t.title || ''}
                onChange={(e) => updateTestimonial(index, 'title', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-sm"
                placeholder="Title"
              />
              <Input
                value={t.company || ''}
                onChange={(e) => updateTestimonial(index, 'company', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-sm"
                placeholder="Company"
              />
            </div>
            <Textarea
              value={t.content || ''}
              onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white text-sm"
              placeholder="Testimonial content"
              rows={2}
            />
            <div>
              <label className="text-xs text-gray-400 block mb-1">Rating: {t.rating || 5} stars</label>
              <input
                type="range"
                min="1"
                max="5"
                value={t.rating || 5}
                onChange={(e) => updateTestimonial(index, 'rating', Number(e.target.value))}
                className="w-full accent-yellow-400"
              />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addTestimonial} className="w-full">
          <i className="fas fa-plus mr-2"></i>Add Testimonial
        </Button>
      </div>
    </div>
  );
}
