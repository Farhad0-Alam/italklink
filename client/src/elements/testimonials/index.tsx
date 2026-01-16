import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ElementConfig, ElementRendererProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";

function TestimonialsRenderer({ element, isEditing, onUpdate }: ElementRendererProps) {
  const elementData = element.data || {};
  const [currentSlide, setCurrentSlide] = useState(0);
  const testimonials = elementData?.testimonials || [];

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  if (isEditing) {
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

  if (testimonials.length === 0) {
    return (
      <div className="mb-4 p-8 bg-slate-100 rounded-lg text-center text-slate-500 border-2 border-dashed border-slate-300">
        <i className="fas fa-quote-left text-3xl mb-2"></i>
        <p>No testimonials added</p>
      </div>
    );
  }

  return (
    <div className="mb-4 relative">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {testimonials.map((testimonial: any, index: number) => (
            <div key={testimonial.id || index} className="w-full flex-shrink-0 px-2">
              <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-yellow-400"></i>
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-slate-800">{testimonial.name}</p>
                  {testimonial.title && (
                    <p className="text-sm text-slate-600">{testimonial.title}</p>
                  )}
                  {testimonial.company && (
                    <p className="text-sm text-slate-500">{testimonial.company}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {testimonials.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide(prev => prev > 0 ? prev - 1 : testimonials.length - 1)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors"
          >
            <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <button
            onClick={() => setCurrentSlide(prev => prev < testimonials.length - 1 ? prev + 1 : 0)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors"
          >
            <i className="fas fa-chevron-right text-sm"></i>
          </button>
          <div className="flex justify-center mt-4 space-x-2">
            {testimonials.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-green-500' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export const testimonialsConfig: ElementConfig = {
  metadata: {
    type: "testimonials",
    title: "Testimonials",
    icon: "MessageSquare",
    category: "Interactive",
    description: "Display customer testimonials"
  },
  defaultData: () => ({
    testimonials: [],
    layout: "grid" as const,
    columns: 1,
    showAvatars: true,
    showStars: true
  }),
  Renderer: TestimonialsRenderer
};

export default testimonialsConfig;
