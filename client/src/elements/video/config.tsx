import { ElementConfig, ElementRendererProps } from "../registry/types";
import { VideoRenderer } from "./renderer";
import { VideoEditor } from "./editor";

function VideoElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <VideoEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <VideoRenderer {...props} />;
}

export const videoConfig: ElementConfig = {
  metadata: {
    type: "video",
    title: "Video",
    icon: "Video",
    category: "Basic",
    description: "Embed a YouTube or Vimeo video"
  },
  defaultData: () => ({ 
    url: "", 
    autoplay: false,
    controls: true,
    loop: false,
    muted: true,
    thumbnail: ""
  }),
  Renderer: VideoElementRenderer,
  Editor: VideoEditor
};

export default videoConfig;
