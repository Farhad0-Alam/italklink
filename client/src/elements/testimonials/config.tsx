import { ElementConfig, ElementRendererProps } from "../registry/types";
import { TestimonialsRenderer } from "./renderer";
import { TestimonialsEditor } from "./editor";

function TestimonialsElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <TestimonialsEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <TestimonialsRenderer {...props} />;
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
  Renderer: TestimonialsElementRenderer,
  Editor: TestimonialsEditor
};

export default testimonialsConfig;
