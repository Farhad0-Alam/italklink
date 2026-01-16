import { ElementConfig, ElementRendererProps } from "../registry/types";
import { ScheduleCallRenderer } from "./renderer";
import { ScheduleCallEditor } from "./editor";

function ScheduleCallElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <ScheduleCallEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <ScheduleCallRenderer {...props} />;
}

export const scheduleCallConfig: ElementConfig = {
  metadata: {
    type: "scheduleCall",
    title: "Schedule Call",
    icon: "Phone",
    category: "Booking",
    description: "Add call scheduling"
  },
  defaultData: () => ({
    calendarId: "",
    duration: 30,
    bufferTime: 5,
    timezone: "UTC",
    confirmationMessage: "Your call has been scheduled!"
  }),
  Renderer: ScheduleCallElementRenderer,
  Editor: ScheduleCallEditor
};

export default scheduleCallConfig;
