import { ElementConfig, ElementRendererProps } from "../registry/types";
import { ImageSliderRenderer } from "./renderer";
import { ImageSliderEditor } from "./editor";

function ImageSliderElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <ImageSliderEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <ImageSliderRenderer {...props} />;
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
  Renderer: ImageSliderElementRenderer,
  Editor: ImageSliderEditor
};

export default imageSliderConfig;
