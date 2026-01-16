import { ElementConfig, ElementRendererProps } from "../registry/types";
import { BookAppointmentRenderer } from "./renderer";
import { BookAppointmentEditor } from "./editor";

function BookAppointmentElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <BookAppointmentEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <BookAppointmentRenderer {...props} />;
}

export const bookAppointmentConfig: ElementConfig = {
  metadata: {
    type: "bookAppointment",
    title: "Book Appointment",
    icon: "Calendar",
    category: "Booking",
    description: "Add appointment booking"
  },
  defaultData: () => ({
    calendarId: "",
    service: "",
    duration: 30,
    timezone: "UTC",
    confirmationMessage: "Your appointment has been booked!",
    showCalendar: true
  }),
  Renderer: BookAppointmentElementRenderer,
  Editor: BookAppointmentEditor
};

export default bookAppointmentConfig;
