import { ProfileSectionRenderer as ProfileSection } from "@/components/ProfileSectionRenderer";
import { ElementRendererProps } from "../registry/types";

export function ProfileRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

  return (
    <div className="w-full">
      <ProfileSection
        data={elementData}
        cardData={cardData}
      />
    </div>
  );
}
