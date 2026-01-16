import { ElementConfig, ElementRendererProps } from "../registry/types";
import { MeetingRequestRenderer } from "./renderer";
import { MeetingRequestEditor } from "./editor";

function MeetingRequestElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <MeetingRequestEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <MeetingRequestRenderer {...props} />;
}

export const meetingRequestConfig: ElementConfig = {
  metadata: {
    type: "meetingRequest",
    title: "Meeting Request",
    icon: "Calendar",
    category: "Booking",
    description: "Add meeting request form"
  },
  defaultData: () => ({
    calendarId: "",
    meetingTypes: [],
    defaultDuration: 60,
    timezone: "UTC",
    requireApproval: false
  }),
  Renderer: MeetingRequestElementRenderer,
  Editor: MeetingRequestEditor
};

export default meetingRequestConfig;
