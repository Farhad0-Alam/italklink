import { ElementConfig, ElementRendererProps } from "../registry/types";
import { GoogleMapsRenderer } from "./renderer";
import { GoogleMapsEditor } from "./editor";

function GoogleMapsElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <GoogleMapsEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <GoogleMapsRenderer {...props} />;
}

export const googleMapsConfig: ElementConfig = {
  metadata: {
    type: "googleMaps",
    title: "Google Maps",
    icon: "Map",
    category: "Interactive",
    description: "Embed a Google Map"
  },
  defaultData: () => ({
    location: "New York, NY",
    zoom: 12,
    height: "300px",
    showMarker: true,
    showControls: true
  }),
  Renderer: GoogleMapsElementRenderer,
  Editor: GoogleMapsEditor
};

export default googleMapsConfig;
