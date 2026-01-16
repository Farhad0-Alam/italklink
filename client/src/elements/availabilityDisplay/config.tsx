import { ElementConfig, ElementRendererProps } from "../registry/types";
import { AvailabilityDisplayRenderer } from "./renderer";
import { AvailabilityDisplayEditor } from "./editor";

function AvailabilityDisplayElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <AvailabilityDisplayEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <AvailabilityDisplayRenderer {...props} />;
}

export const availabilityDisplayConfig: ElementConfig = {
  metadata: {
    type: "availabilityDisplay",
    title: "Availability",
    icon: "Calendar",
    category: "Booking",
    description: "Show your availability"
  },
  defaultData: () => ({
    calendarId: "",
    showBookButton: true,
    showTimezone: true,
    daysInAdvance: 30,
    timezone: "UTC",
    layout: "weekly" as const
  }),
  Renderer: AvailabilityDisplayElementRenderer,
  Editor: AvailabilityDisplayEditor
};

export default availabilityDisplayConfig;
