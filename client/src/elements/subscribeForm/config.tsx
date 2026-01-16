import { ElementConfig, ElementRendererProps } from "../registry/types";
import { SubscribeFormRenderer } from "./renderer";
import { SubscribeFormEditor } from "./editor";

function SubscribeFormElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <SubscribeFormEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <SubscribeFormRenderer {...props} />;
}

export const subscribeFormConfig: ElementConfig = {
  metadata: {
    type: "subscribeForm",
    title: "Subscribe Form",
    icon: "MessageSquare",
    category: "Advanced",
    description: "Collect email subscriptions"
  },
  defaultData: () => ({
    placeholder: "Enter your email",
    buttonText: "Subscribe",
    successMessage: "Thank you for subscribing!",
    listId: "",
    doubleOptIn: false,
    layout: "inline" as const
  }),
  Renderer: SubscribeFormElementRenderer,
  Editor: SubscribeFormEditor
};

export default subscribeFormConfig;
