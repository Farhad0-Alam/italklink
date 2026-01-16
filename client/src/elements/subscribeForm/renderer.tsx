import { SubscribeForm as SubscribeFormComponent } from "@/components/SubscribeForm";
import { ElementRendererProps } from "../registry/types";

export function SubscribeFormRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

  return (
    <div className="mb-4">
      <SubscribeFormComponent
        cardId={cardData?.id}
        title={elementData.title}
        description={elementData.description}
        buttonText={elementData.buttonText}
        successMessage={elementData.successMessage}
        enablePush={elementData.enablePush !== false}
        enableEmail={elementData.enableEmail !== false}
      />
    </div>
  );
}
