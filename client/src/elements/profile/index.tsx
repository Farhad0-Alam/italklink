import { ProfileSectionEditor } from "@/components/ProfileSectionEditor";
import { ProfileSectionRenderer } from "@/components/ProfileSectionRenderer";
import { ElementConfig, ElementRendererProps } from "../registry/types";

function ProfileRenderer({ element, isEditing, onUpdate, onSave, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  if (isEditing) {
    return (
      <div className="w-full">
        <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
          <ProfileSectionEditor
            data={elementData}
            onChange={(newData) => handleDataUpdate(newData)}
            onSave={onSave}
            cardData={cardData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ProfileSectionRenderer
        data={elementData}
        cardData={cardData}
      />
    </div>
  );
}

export const profileConfig: ElementConfig = {
  metadata: {
    type: "profile",
    title: "Profile Section",
    icon: "User",
    category: "Layout",
    description: "Add profile section with photo, name, and title"
  },
  defaultData: () => ({
    enabled: true,
    showCoverImage: true,
    showProfilePhoto: true,
    showLogo: true,
    showName: true,
    showTitle: true,
    showCompany: true,
    showBio: true,
    fullName: "",
    title: "",
    company: "",
    bio: "",
    brandColor: "#22c55e",
    accentColor: "#16a34a",
    layout: "classic" as const,
    alignment: "center" as const,
    profileImageStyles: {
      visible: true,
      size: 120,
      shape: "circle",
      borderWidth: 3,
      borderColor: "#22c55e",
      animation: "none",
      useBrandColor: true,
      animationColors: { start: "#22c55e", end: "#16a34a" },
      shadow: 0,
      opacity: 100,
    },
    coverImageStyles: {
      height: 200,
      borderWidth: 0,
      borderColor: "#22c55e",
      animation: "none",
      profilePositionX: 50,
      profilePositionY: 100,
      shapeDividerTop: {
        enabled: false,
        preset: "wave",
        color: "#ffffff",
        width: 100,
        height: 60,
        invert: false,
      },
      shapeDividerBottom: {
        enabled: false,
        preset: "wave",
        color: "#ffffff",
        width: 100,
        height: 60,
        invert: false,
      },
    },
    sectionStyles: {
      basicInfo: {
        nameColor: "#ffffff",
        nameFont: "Inter",
        nameFontSize: 24,
        nameFontWeight: "700",
        nameTextStyle: "normal",
        nameSpacing: 8,
        namePositionX: 0,
        namePositionY: 0,
        titleColor: "#4b5563",
        titleFont: "Inter",
        titleFontSize: 14,
        titleFontWeight: "400",
        titleTextStyle: "normal",
        titleSpacing: 8,
        titlePositionX: 0,
        titlePositionY: 0,
        companyColor: "#6b7280",
        companyFont: "Inter",
        companyFontSize: 14,
        companyFontWeight: "400",
        companyTextStyle: "normal",
        companySpacing: 8,
        companyPositionX: 0,
        companyPositionY: 0,
        textGroupHorizontal: 0,
        textGroupVertical: 0,
      },
    },
  }),
  Renderer: ProfileRenderer
};

export default profileConfig;
