import { useState, useEffect } from "react";
import {
  Copy,
  Download,
  Mail,
  Palette,
  Image as ImageIcon,
  X,
  Plus,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import {
  SiFacebook,
  SiLinkedin,
  SiInstagram,
  SiX,
  SiYoutube,
  SiTiktok,
  SiWhatsapp,
  SiPinterest,
  SiGithub,
} from "react-icons/si";

interface SignatureData {
  signatureName: string;
  name: string;
  title: string;
  company: string;
  cellPhone: string;
  officePhone: string;
  email: string;
  website: string;
  address: string;
  ecardUrl: string;

  customFields: { value: string; icon: string; url: string }[];

  profilePhoto: string;
  profilePhotoShape: "circle" | "square" | "rounded";
  profilePhotoWidth: number;
  profilePhotoHeight: number;
  profilePhotoBorderWidth: number;
  profilePhotoBorderColor: string;
  profilePhotoOpacity: number;
  profilePhotoShadow: "none" | "small" | "medium" | "large";
  profilePhotoRightSideGap: number;

  companyLogo: string;
  companyLogoShape: "circle" | "square" | "rounded";
  companyLogoWidth: number;
  companyLogoHeight: number;
  companyLogoBorderWidth: number;
  companyLogoBorderColor: string;
  companyLogoBackgroundColor: string;
  companyLogoOpacity: number;
  companyLogoShadow: "none" | "small" | "medium" | "large";

  primaryColor: string;
  secondaryColor: string;

  signatureFont: string;
  signatureSize: number;
  signatureColor: string;
  signatureLineHeight: number;

  nameSize: number;
  nameColor: string;
  nameLineHeight: number;
  titleSize: number;
  titleColor: string;
  titleLineHeight: number;
  companySize: number;
  companyColor: string;

  headerFont: string;
  headerSize: number;
  headerColor: string;
  contactFont: string;
  contactInfoSize: number;
  contactInfoColor: string;
  contactLineHeight: number;
  contactLetterSpacing: number;
  contactIconSize: number;
  contactIconColor: string;

  socialIconSize: number;
  socialIconColor: string;
  socialIconShape: "circle" | "square" | "rounded";
  socialIconRadius: number;
  socialIconBorderWidth: number;
  socialIconBorderColor: string;
  socialLinksTopSpacing: number;
  socialLinksBottomSpacing: number;
  socialIconsGap: number;

  dividerHeight: number;
  dividerColor: string;
  dividerMarginTop: number;
  dividerMarginBottom: number;
  dividerWidth: number;

  socialLinks: { platform: string; url: string; icon: string }[];

  showDisclaimer: boolean;
  disclaimerText: string;
  showCTA: boolean;
  ctaText: string;
  ctaUrl: string;
  showBanner: boolean;
  bannerText: string;
}

const signatureFonts = [
  "Alex Brush",
  "Dancing Script",
  "Great Vibes",
  "Allura",
  "Sacramento",
  "Parisienne",
  "Mr De Haviland",
];

const professionalFonts = [
  "Arial",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Times New Roman",
  "Roboto",
  "Open Sans",
  "Lato",
];

const socialPlatforms = [
  { value: "facebook", label: "Facebook", icon: SiFacebook },
  { value: "linkedin", label: "LinkedIn", icon: SiLinkedin },
  { value: "instagram", label: "Instagram", icon: SiInstagram },
  { value: "twitter", label: "Twitter/X", icon: SiX },
  { value: "youtube", label: "YouTube", icon: SiYoutube },
  { value: "tiktok", label: "TikTok", icon: SiTiktok },
  { value: "whatsapp", label: "WhatsApp", icon: SiWhatsapp },
  { value: "pinterest", label: "Pinterest", icon: SiPinterest },
  { value: "github", label: "GitHub", icon: SiGithub },
  { value: "snapchat", label: "Snapchat", icon: SiGithub },
];

const emailPlatforms = [
  { id: "outlook", name: "Outlook", icon: "📧" },
  { id: "new-outlook", name: "New Outlook", icon: "📧" },
  { id: "outlook-365", name: "Outlook 365", icon: "🔵" },
  { id: "apple-mail", name: "Apple Mail", icon: "🍎" },
  { id: "gmail", name: "Gmail", icon: "📨" },
  { id: "thunderbird", name: "Thunderbird", icon: "🦅" },
  { id: "exchange", name: "Exchange Server", icon: "🔄" },
  { id: "microsoft-365", name: "Microsoft 365", icon: "🪟" },
];

const platformInstructions: { [key: string]: { steps: string[]; tips: string[]; location: string } } = {
  "outlook": {
    steps: [
      "Click 'Copy HTML' button in the preview section",
      "Go to File → Options → Mail → Signatures",
      "Click 'New' and enter a signature name",
      "Paste the HTML code into the signature editor",
      "Click 'OK' to save your signature"
    ],
    tips: [
      "Outlook supports most HTML and CSS formatting",
      "Test your signature before using it with important emails",
      "Images must be hosted online (not embedded)"
    ],
    location: "File → Options → Mail → Signatures"
  },
  "new-outlook": {
    steps: [
      "Click 'Copy HTML' button in the preview section",
      "Go to Settings (gear icon) → Mail → Signatures",
      "Click 'New signature' and enter a name",
      "Switch to HTML editor (if available) and paste the code",
      "Save and set as default if needed"
    ],
    tips: [
      "New Outlook has improved HTML support",
      "Some advanced CSS features may be limited",
      "Test with a draft email first"
    ],
    location: "Settings → Mail → Signatures"
  },
  "outlook-365": {
    steps: [
      "Click 'Copy HTML' button in the preview section",
      "Go to Settings (gear icon) → Mail → Signatures",
      "Click 'New signature' and enter a name",
      "In the editor, click the three dots (•••) and select 'Edit HTML'",
      "Paste your HTML code and save"
    ],
    tips: [
      "Office 365 Outlook has excellent HTML support",
      "You can edit signatures from any device",
      "Changes sync automatically across devices"
    ],
    location: "Settings → Mail → Signatures"
  },
  "apple-mail": {
    steps: [
      "Click 'Download' to save as HTML file",
      "Open Apple Mail and go to Mail → Preferences",
      "Click 'Signatures' tab",
      "Click the '+' button to create new signature",
      "Copy and paste the HTML content (may need to format)"
    ],
    tips: [
      "Apple Mail may not fully support complex HTML",
      "Test images to ensure they display correctly",
      "Consider using the simplified version for best compatibility"
    ],
    location: "Mail → Preferences → Signatures"
  },
  "gmail": {
    steps: [
      "Click 'Copy HTML' button in the preview section",
      "Go to Settings (gear icon) → See all settings",
      "Scroll to 'Signature' section",
      "Click in the signature text area",
      "Paste your HTML signature"
    ],
    tips: [
      "Gmail converts HTML to its own format automatically",
      "Complex layouts may look different in Gmail",
      "Use the live preview to verify appearance",
      "Images must be publicly hosted online"
    ],
    location: "Settings → Signature"
  },
  "thunderbird": {
    steps: [
      "Click 'Copy HTML' button in the preview section",
      "Go to Edit → Account Settings → Signature",
      "Select 'HTML signature' checkbox",
      "Paste your HTML code into the text area",
      "Click 'OK' to save"
    ],
    tips: [
      "Make sure to check the 'HTML signature' option",
      "Thunderbird supports most HTML tags",
      "Test your signature with a test email first"
    ],
    location: "Edit → Account Settings → Signature"
  },
  "exchange": {
    steps: [
      "Click 'Copy HTML' button in the preview section",
      "Open Exchange Management Console or Outlook Web App",
      "Go to Settings → Signature",
      "Click 'New' to create a signature",
      "Paste the HTML code and save"
    ],
    tips: [
      "Exchange Server has robust HTML support",
      "Contact your IT administrator if needed",
      "Signatures can be applied to all users via policies",
      "Test in Outlook before deploying organization-wide"
    ],
    location: "Settings → Signature (via OWA or Exchange Console)"
  },
  "microsoft-365": {
    steps: [
      "Click 'Copy HTML' button in the preview section",
      "Go to Settings (gear icon) → View all Outlook settings",
      "Click 'Mail' → 'Compose and reply'",
      "Scroll to 'Email signature' section",
      "Paste your HTML signature"
    ],
    tips: [
      "Microsoft 365 Outlook has full HTML support",
      "Signature syncs across all devices",
      "You can set different signatures per email account",
      "Test before adding to multiple accounts"
    ],
    location: "Settings → Mail → Email signature"
  }
};

export default function EmailSignature() {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("outlook");
  const [templateVariant, setTemplateVariant] = useState<string>("template-2");
  const [carouselIndex, setCarouselIndex] = useState(0);

  const templates = [
    { id: "template-1", name: "Template 1", description: "Clean & Simple Design" },
    { id: "template-2", name: "Template 2", description: "Balanced Professional Look" },
    { id: "template-3", name: "Template 3", description: "Complete with All Options" },
    { id: "template-4", name: "Template 4", description: "Modern Design" },
    { id: "template-5", name: "Template 5", description: "Creative Style" },
    { id: "template-6", name: "Template 6", description: "Corporate Design" },
    { id: "template-7", name: "Template 7", description: "Minimalist Design" },
    { id: "template-8", name: "Template 8", description: "Executive Style" },
    { id: "template-9", name: "Template 9", description: "Professional Plus" },
  ];

  const nextTemplate = () => {
    setCarouselIndex((prev) => prev + 1);
  };

  const prevTemplate = () => {
    setCarouselIndex((prev) => prev - 1);
  };

  const selectTemplate = (index: number) => {
    setCarouselIndex(index % templates.length);
    setTemplateVariant(templates[index % templates.length].id);
  };

  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({
    signatureSection: true,
    signatureStyle: true,
    nameSection: true,
    nameStyle: true,
    titleStyle: true,
    companyStyle: true,
    nameFont: true,
    nameSize: true,
    nameColor: true,
    titleFont: true,
    titleSize: true,
    titleColor: true,
    companyFont: true,
    companySize: true,
    companyColor: true,
    dividerStyle: true,
    contactSection: true,
    contactInfoStyle: true,
    contactIconStyle: true,
    contactFont: true,
    contactSize: true,
    contactColor: true,
    iconSize: true,
    iconColor: true,
    profilePhotoSection: true,
    companyLogoSection: true,
    imagesSection: true,
    socialLinksSection: true,
    socialIconStyle: true,
    optionalFeaturesSection: true,
  });
  const [signatureData, setSignatureData] = useState<SignatureData>({
    signatureName: "John Doe",
    name: "John Doe",
    title: "Senior Marketing Manager",
    company: "Acme Corporation",
    cellPhone: "(555) 123-4567",
    officePhone: "(555) 987-6543",
    email: "john.doe@acme.com",
    website: "www.acme.com",
    address: "123 Business Ave, Suite 100, New York, NY 10001",
    ecardUrl: "",
    customFields: [],
    profilePhoto:
      "https://ui-avatars.com/api/?name=John+Doe&size=200&background=FF6A00&color=fff&bold=true",
    profilePhotoShape: "circle",
    profilePhotoWidth: 100,
    profilePhotoHeight: 100,
    profilePhotoBorderWidth: 2,
    profilePhotoBorderColor: "#FF6A00",
    profilePhotoOpacity: 100,
    profilePhotoShadow: "medium",
    profilePhotoRightSideGap: 1,

    companyLogo: "https://via.placeholder.com/200x80/FF6A00/FFFFFF?text=ACME",
    companyLogoShape: "square",
    companyLogoWidth: 120,
    companyLogoHeight: 60,
    companyLogoBorderWidth: 0,
    companyLogoBorderColor: "#CCCCCC",
    companyLogoBackgroundColor: "#FFFFFF",
    companyLogoOpacity: 100,
    companyLogoShadow: "none",
    primaryColor: "#FF6A00",
    secondaryColor: "#333333",
    signatureFont: "Alex Brush",
    signatureSize: 20,
    signatureColor: "#333333",
    signatureLineHeight: 1,
    nameSize: 17,
    nameColor: "#333333",
    nameLineHeight: 1,
    titleSize: 13,
    titleColor: "#666666",
    titleLineHeight: 1,
    companySize: 13,
    companyColor: "#666666",
    headerFont: "Arial",
    headerSize: 18,
    headerColor: "#FF6A00",
    contactFont: "Arial",
    contactInfoSize: 12,
    contactInfoColor: "#333333",
    contactLineHeight: 1.5,
    contactLetterSpacing: 0,
    contactIconSize: 16,
    contactIconColor: "#FF6A00",
    socialIconSize: 24,
    socialIconColor: "#FF6A00",
    socialIconShape: "circle",
    socialIconRadius: 8,
    socialLinksTopSpacing: 16,
    socialLinksBottomSpacing: 16,
    socialIconsGap: 12,
    socialIconBorderWidth: 0,
    socialIconBorderColor: "#CCCCCC",
    dividerHeight: 3,
    dividerColor: "#FF6A00",
    dividerMarginTop: 5,
    dividerMarginBottom: 5,
    dividerWidth: 100,
    socialLinks: [
      {
        platform: "linkedin",
        url: "https://linkedin.com/in/johndoe",
        icon: "SiLinkedin",
      },
      { platform: "twitter", url: "https://twitter.com/johndoe", icon: "SiX" },
      {
        platform: "facebook",
        url: "https://facebook.com/johndoe",
        icon: "SiFacebook",
      },
    ],
    showDisclaimer: false,
    disclaimerText:
      "This email and any attachments are confidential and intended solely for the recipient.",
    showCTA: false,
    ctaText: "Book a Consultation",
    ctaUrl: "",
    showBanner: false,
    bannerText: "Get in touch today!",
  });

  useEffect(() => {
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${signatureFonts.map((f) => f.replace(/ /g, "+")).join("&family=")}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const toggleSection = (k: string) =>
    setCollapsedSections((p) => ({ ...p, [k]: !p[k] }));

  const updateField = (field: keyof SignatureData, value: any) => {
    setSignatureData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (
    field: "profilePhoto" | "companyLogo",
    file: File,
  ) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField(field, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePhoto = () => {
    updateField("profilePhoto", "");
  };

  const removeCompanyLogo = () => {
    updateField("companyLogo", "");
  };

  const addSocialLink = () => {
    setSignatureData((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: "linkedin", url: "https://linkedin.com/in/", icon: "SiLinkedin" },
      ],
    }));
  };

  const removeSocialLink = (index: number) => {
    setSignatureData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const updateSocialLink = (
    index: number,
    field: "platform" | "url",
    value: string,
  ) => {
    setSignatureData((prev) => {
      const newLinks = [...prev.socialLinks];
      newLinks[index] = { ...newLinks[index], [field]: value };
      if (field === "platform") {
        const platform = socialPlatforms.find((p) => p.value === value);
        newLinks[index].icon = platform?.icon.name || "SiFacebook";
      }
      return { ...prev, socialLinks: newLinks };
    });
  };

  const addCustomField = () => {
    setSignatureData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { value: "", icon: "phone", url: "" }],
    }));
  };

  const removeCustomField = (index: number) => {
    setSignatureData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  const updateCustomField = (
    index: number,
    field: "value" | "icon" | "url",
    value: string,
  ) => {
    setSignatureData((prev) => {
      const newFields = [...prev.customFields];
      newFields[index] = { ...newFields[index], [field]: value };
      return { ...prev, customFields: newFields };
    });
  };


  const generatePremiumSignature = (): string => {
    const baseUrl = window.location.origin;
    // Contact icons
    const phoneIcon = `${baseUrl}/signature/phone.png`;
    const emailIcon = `${baseUrl}/signature/email.png`;
    const websiteIcon = `${baseUrl}/signature/website.png`;
    const cellIcon = `${baseUrl}/signature/cell.png`;
    const locationIcon = `${baseUrl}/signature/location.png`;
    const ecardIcon = `${baseUrl}/signature/ecard.png`;

    // Social media icons
    const facebookIcon = `${baseUrl}/signature/facebook.png`;
    const instagramIcon = `${baseUrl}/signature/instagram.png`;
    const twitterIcon = `${baseUrl}/signature/twitter.png`;
    const youtubeIcon = `${baseUrl}/signature/youtube.png`;
    const linkedinIcon = `${baseUrl}/signature/linkedin.png`;
    const tiktokIcon = `${baseUrl}/signature/tiktok.png`;
    const whatsappIcon = `${baseUrl}/signature/whatsapp.png`;
    const pinterestIcon = `${baseUrl}/signature/pinterest.png`;
    const githubIcon = `${baseUrl}/signature/github.png`;
    const snapchatIcon = `${baseUrl}/signature/snapchat.png`;

    // Social icon map
    const socialIconMap: Record<string, string> = {
      facebook: facebookIcon,
      instagram: instagramIcon,
      twitter: twitterIcon,
      youtube: youtubeIcon,
      linkedin: linkedinIcon,
      tiktok: tiktokIcon,
      whatsapp: whatsappIcon,
      pinterest: pinterestIcon,
      github: githubIcon,
      snapchat: snapchatIcon,
    };

    const {
      signatureName,
      name,
      title,
      company,
      cellPhone,
      officePhone,
      email,
      website,
      address,
      ecardUrl,
      profilePhoto,
      companyLogo,
      primaryColor,
      secondaryColor,
      socialLinks,
      showCTA,
      ctaText,
      ctaUrl,
      showBanner,
      bannerText,
      customFields,
      signatureFont,
      signatureSize,
      signatureColor,
      signatureLineHeight,
      headerFont,
      nameSize,
      nameColor,
      nameLineHeight,
      titleSize,
      titleColor,
      titleLineHeight,
      companySize,
      companyColor,
      contactFont,
      contactInfoSize,
      contactInfoColor,
      contactLineHeight,
      contactLetterSpacing,
      contactIconSize,
      contactIconColor,
      socialIconSize,
      socialIconColor,
      socialIconShape,
      socialIconRadius,
      socialIconBorderWidth,
      socialIconBorderColor,
      socialLinksTopSpacing,
      socialLinksBottomSpacing,
      socialIconsGap,
      dividerHeight,
      dividerColor,
      dividerMarginTop,
      dividerMarginBottom,
      dividerWidth,
      profilePhotoRightSideGap,
    } = signatureData;

    const socialIconsHTML = socialLinks
      .filter((l) => l.url)
      .map((link) => {
        const iconPath = socialIconMap[link.platform] || socialIconMap.facebook;
        const borderRadius = socialIconShape === "circle" ? "50%" : socialIconShape === "rounded" ? `${socialIconRadius || 8}px` : "0px";
        const gapValue = Math.floor(socialIconsGap / 2);
        return `<a href="${link.url}" target="_blank" style="display:inline-block; margin:0 ${gapValue}px; text-decoration:none;"><span style="display:inline-block; width:${socialIconSize || contactIconSize + 10}px; height:${socialIconSize || contactIconSize + 10}px; background-color:${socialIconColor || contactIconColor}; border-radius:${borderRadius}; border:${socialIconBorderWidth}px solid ${socialIconBorderColor}; overflow:hidden; vertical-align:middle;"><img src="${iconPath}" alt="${link.platform}" style="width:100%; height:100%; border:0; display:block;" /></span></a>`;
      })
      .join("");

    const customIconMap: Record<string, string> = {
      phone: phoneIcon,
      email: emailIcon,
      website: websiteIcon,
      cell: cellIcon,
      location: locationIcon,
      ecard: ecardIcon,
      facebook: facebookIcon,
      instagram: instagramIcon,
      twitter: twitterIcon,
      youtube: youtubeIcon,
      linkedin: linkedinIcon,
      tiktok: tiktokIcon,
      whatsapp: whatsappIcon,
      pinterest: pinterestIcon,
      github: githubIcon,
      snapchat: snapchatIcon,
    };

    const customFieldsHTML = customFields
      .filter((f) => f.value)
      .map((field) => {
        const iconPath = field.icon && customIconMap[field.icon] ? customIconMap[field.icon] : phoneIcon;
        if (field.url) {
          return `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding: 2px 0; line-height: ${contactLineHeight}; letter-spacing: ${contactLetterSpacing}px;"><a href="${field.url}" style="color: ${contactInfoColor}; text-decoration: none; font-weight: 500;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${iconPath}" alt="" style="width:100%; height:100%; display:block;"></span>${field.value}</a></td></tr>`;
        }
        return `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding: 2px 0; line-height: ${contactLineHeight}; letter-spacing: ${contactLetterSpacing}px;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${iconPath}" alt="" style="width:100%; height:100%; display:block;"></span>${field.value}</td></tr>`;
      })
      .join("");

    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width: 700px; margin: 0; padding: 0; background-color: #f9f9f9;">
  ${
    showBanner
      ? `
  <tr>
    <td style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: #ffffff; text-align: center; padding: 15px; font-size: 16px; font-weight: bold;">
      ${bannerText}
    </td>
  </tr>
  `
      : ""
  }
  <tr>
    <td style="background-color: #ffffff; padding: 25px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          ${
            profilePhoto
              ? `
          <td style="padding-right: ${profilePhotoRightSideGap}px; vertical-align: middle;">
            <div style="${getContainerStyle('profile')}">
              <img src="${profilePhoto}" alt="${name}" style="${getImageStyle('profile')}">
            </div>
          </td>
          `
              : ""
          }
          <td style="vertical-align: top;">
            <table cellpadding="0" cellspacing="0" border="0">
              ${signatureName ? `<tr><td style="font-family: '${signatureFont}', cursive; font-size: ${signatureSize}px; color: ${signatureColor}; line-height: ${signatureLineHeight};">${signatureName}</td></tr>` : ""}
              <tr>
                <td style="font-family: ${headerFont}, sans-serif; font-size: ${nameSize}px; font-weight: bold; color: ${nameColor}; line-height: ${nameLineHeight};">
                  ${name}
                </td>
              </tr>
              <tr>
                <td style="font-family: ${headerFont}, sans-serif; font-size: ${titleSize}px; color: ${titleColor}; font-weight: 600; line-height: ${titleLineHeight};">
                  ${title}${title && company ? ` <span style="color: ${titleColor}; opacity: 0.7; margin: 0 8px;">|</span> ` : ''}${company ? `<span style="font-family: ${headerFont}, sans-serif; font-size: ${companySize}px; color: ${companyColor}; font-weight: normal;">${company}</span>` : ''}
                </td>
              </tr>
              <tr><td style="padding-top: ${dividerMarginTop}px; padding-bottom: ${dividerMarginBottom}px;"><div style="height: ${dividerHeight}px; background-color: ${dividerColor}; width: ${dividerWidth}%;"></div></td></tr>
              ${officePhone || cellPhone ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding: 2px 0; line-height: ${contactLineHeight}; letter-spacing: ${contactLetterSpacing}px;">
                ${officePhone ? `<span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${phoneIcon}" alt="" style="width:100%; height:100%; display:block;"></span><a href="tel:${officePhone}" style="color: ${contactInfoColor}; text-decoration: none; font-weight: 500;">${officePhone}</a>` : ""}
                ${officePhone && cellPhone ? `<span style="margin: 0 6px;"></span>` : ""}
                ${cellPhone ? `<span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${cellIcon}" alt="" style="width:100%; height:100%; display:block;"></span><a href="tel:${cellPhone}" style="color: ${contactInfoColor}; text-decoration: none; font-weight: 500;">${cellPhone}</a>` : ""}
              </td></tr>` : ""}
              ${email || website ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; padding: 2px 0; line-height: ${contactLineHeight}; letter-spacing: ${contactLetterSpacing}px; color: ${contactInfoColor};">
                ${email ? `<a href="mailto:${email}" style="color: ${contactInfoColor}; text-decoration: none; font-weight: 500;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${emailIcon}" alt="" style="width:100%; height:100%; display:block;"></span>${email}</a>` : ""}
                ${email && website ? `<span style="margin: 0 6px;"></span>` : ""}
                ${website ? `<a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${contactInfoColor}; text-decoration: none; font-weight: 500;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${websiteIcon}" alt="" style="width:100%; height:100%; display:block;"></span>${website}</a>` : ""}
              </td></tr>` : ""}
              ${ecardUrl ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding: 2px 0; line-height: ${contactLineHeight}; letter-spacing: ${contactLetterSpacing}px;"><a href="${ecardUrl}" style="color: ${contactInfoColor}; text-decoration: none; font-weight: 500;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${ecardIcon}" alt="" style="width:100%; height:100%; display:block;"></span>Digital Business Card</a></td></tr>` : ""}
              ${address ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${Math.round(contactInfoSize * 0.9)}px; color: ${contactInfoColor}; opacity: 0.8; padding: 2px 0; line-height: ${contactLineHeight}; letter-spacing: ${contactLetterSpacing}px;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${locationIcon}" alt="" style="width:100%; height:100%; display:block;"></span>${address}</td></tr>` : ""}
              ${customFieldsHTML}
              ${socialIconsHTML ? `<tr><td style="padding-top: ${socialLinksTopSpacing}px; padding-bottom: ${socialLinksBottomSpacing}px;">${socialIconsHTML}</td></tr>` : ""}
            </table>
          </td>
        </tr>
        ${
          companyLogo || showCTA
            ? `
        <tr>
          <td colspan="2" style="padding-top: 25px; border-top: 2px solid ${primaryColor}; margin-top: 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                ${companyLogo ? `<td style="vertical-align: middle; width: 50%; display: flex; justify-content: center;"><div style="${getContainerStyle('logo')}"><img src="${companyLogo}" alt="Company Logo" style="${getImageStyle('logo')}"></div></td>` : ""}
                ${
                  showCTA && ctaUrl
                    ? `
                <td style="text-align: ${companyLogo ? "right" : "center"}; vertical-align: middle;">
                  <a href="${ctaUrl}" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">${ctaText}</a>
                </td>
                `
                    : ""
                }
              </tr>
            </table>
          </td>
        </tr>
        `
            : ""
        }
      </table>
    </td>
  </tr>
</table>
    `.trim();
  };



  // Get template HTML by index
  const getTemplateHTMLByIndex = (index: number): string => {
    switch (index) {
      case 0:
        return generateTemplate1();
      case 1:
        return generateTemplate2();
      case 2:
        return generateTemplate3();
      case 3:
        return generateTemplate4();
      case 4:
        return generateTemplate5();
      case 5:
        return generateTemplate6();
      case 6:
        return generateTemplate7();
      case 7:
        return generateTemplate8();
      case 8:
        return generateTemplate9();
      default:
        return generateTemplate1();
    }
  };

  // Generate signature based on selected template
  const generateSignatureHTML = (): string => {
    return getTemplateHTMLByIndex(carouselIndex);
  };

  // Helper function to get container styles (wrapper div)
  const getContainerStyle = (type: "profile" | "logo"): string => {
    if (type === "profile") {
      const { profilePhotoShape, profilePhotoWidth, profilePhotoHeight, profilePhotoBorderWidth, profilePhotoBorderColor, profilePhotoOpacity, profilePhotoShadow, profilePhotoRightSideGap } = signatureData;

      let borderRadius = "50%";
      if (profilePhotoShape === "square") borderRadius = "0%";
      if (profilePhotoShape === "rounded") borderRadius = "8px";

      let boxShadow = "none";
      if (profilePhotoShadow === "small") boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      if (profilePhotoShadow === "medium") boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
      if (profilePhotoShadow === "large") boxShadow = "0 8px 16px rgba(0,0,0,0.2)";

      return `width: ${profilePhotoWidth}px; height: ${profilePhotoHeight}px; border-radius: ${borderRadius}; border: ${profilePhotoBorderWidth}px solid ${profilePhotoBorderColor}; box-shadow: ${boxShadow}; overflow: hidden; display: flex; align-items: center; justify-content: center;`;
    } else {
      const { companyLogoShape, companyLogoWidth, companyLogoHeight, companyLogoBorderWidth, companyLogoBorderColor, companyLogoBackgroundColor, companyLogoShadow } = signatureData;
      
      let borderRadius = "0%";
      if (companyLogoShape === "circle") borderRadius = "50%";
      if (companyLogoShape === "rounded") borderRadius = "8px";

      let boxShadow = "none";
      if (companyLogoShadow === "small") boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      if (companyLogoShadow === "medium") boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
      if (companyLogoShadow === "large") boxShadow = "0 8px 16px rgba(0,0,0,0.2)";

      return `width: ${companyLogoWidth}px; height: ${companyLogoHeight}px; border-radius: ${borderRadius}; border: ${companyLogoBorderWidth}px solid ${companyLogoBorderColor}; background-color: ${companyLogoBackgroundColor}; box-shadow: ${boxShadow}; overflow: hidden; display: flex; align-items: center; justify-content: center;`;
    }
  };

  // Helper function to get image styles (inner image)
  const getImageStyle = (type: "profile" | "logo"): string => {
    if (type === "profile") {
      const { profilePhotoOpacity } = signatureData;
      return `width: 100%; height: 100%; object-fit: cover; opacity: ${profilePhotoOpacity / 100};`;
    } else {
      const { companyLogoOpacity } = signatureData;
      return `width: 100%; height: 100%; object-fit: contain; opacity: ${companyLogoOpacity / 100};`;
    }
  };

  // Template 1: Classic with Profile Image on Left
  const generateTemplate1 = (): string => {
    return generatePremiumSignature();
  };

  // Template 2: Minimal Clean
  const generateTemplate2 = (): string => {
    const { name, title, company, cellPhone, email, website, primaryColor } = signatureData;
    return `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; padding: 20px 0;">
  <div style="border-left: 4px solid ${primaryColor}; padding-left: 15px;">
    <div style="font-size: 16px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;">${name}</div>
    <div style="font-size: 13px; color: #666; margin-bottom: 12px;">${title}${title && company ? ' | ' : ''}${company}</div>
    ${cellPhone ? `<div style="font-size: 12px; color: #666; margin: 4px 0;">☎ ${cellPhone}</div>` : ''}
    ${email ? `<div style="font-size: 12px; color: #666; margin: 4px 0;">✉ <a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none;">${email}</a></div>` : ''}
    ${website ? `<div style="font-size: 12px; color: #666; margin: 4px 0;">🌐 <a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${primaryColor}; text-decoration: none;">${website}</a></div>` : ''}
  </div>
</div>
    `.trim();
  };

  // Template 3: Corporate Modern
  const generateTemplate3 = (): string => {
    const { name, title, company, cellPhone, email, website, profilePhoto, primaryColor, secondaryColor } = signatureData;
    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width: 600px;">
  <tr>
    <td style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: white; padding: 20px; text-align: center;">
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${name}</div>
      <div style="font-size: 13px;">${title}</div>
    </td>
  </tr>
  <tr>
    <td style="background-color: #f5f5f5; padding: 20px;">
      <table width="100%">
        <tr>
          ${profilePhoto ? `<td style="vertical-align: top; padding-right: 15px;"><div style="${getContainerStyle('profile')}"><img src="${profilePhoto}" alt="${name}" style="${getImageStyle('profile')}"></div></td>` : ''}
          <td style="vertical-align: top;">
            <div style="font-weight: bold; color: #333; margin-bottom: 3px;">${company}</div>
            ${cellPhone ? `<div style="font-size: 12px; color: #666; margin: 3px 0;">Phone: ${cellPhone}</div>` : ''}
            ${email ? `<div style="font-size: 12px; color: #666; margin: 3px 0;">Email: <a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none;">${email}</a></div>` : ''}
            ${website ? `<div style="font-size: 12px; color: #666; margin: 3px 0;">Web: <a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${primaryColor}; text-decoration: none;">${website}</a></div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
    `.trim();
  };

  // Template 4: Creative with Top Bar
  const generateTemplate4 = (): string => {
    const { name, title, company, cellPhone, email, website, primaryColor, profilePhoto, companyLogo } = signatureData;
    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 550px; margin: 0; padding: 0;">
  <tr>
    <td style="background-color: ${primaryColor}; height: 5px;"></td>
  </tr>
  <tr>
    <td style="padding: 25px 20px;">
      <table width="100%">
        <tr>
          <td style="vertical-align: top;">
            <div style="font-size: 18px; font-weight: bold; color: #222; margin-bottom: 2px;">${name}</div>
            <div style="font-size: 13px; color: ${primaryColor}; font-weight: 600; margin-bottom: 10px;">${title}</div>
            <div style="font-size: 12px; color: #666; line-height: 1.6;">
              ${company ? `${company}<br>` : ''}
              ${cellPhone ? `${cellPhone}<br>` : ''}
              ${email ? `<a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none;">${email}</a><br>` : ''}
              ${website ? `<a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${primaryColor}; text-decoration: none;">${website}</a>` : ''}
            </div>
          </td>
          ${profilePhoto ? `<td style="padding-left: 20px; text-align: right;"><img src="${profilePhoto}" alt="${name}" style="${getImageStyle('profile')}"></td>` : ''}
        </tr>
      </table>
    </td>
  </tr>
</table>
    `.trim();
  };

  // Template 5: Elegant Centered
  const generateTemplate5 = (): string => {
    const { name, title, company, cellPhone, email, website, primaryColor, secondaryColor, profilePhoto } = signatureData;
    return `
<div style="font-family: Georgia, serif; text-align: center; max-width: 450px; margin: 0 auto; padding: 30px 0;">
  ${profilePhoto ? `<div style="margin-bottom: 15px; display: flex; justify-content: center;"><div style="${getContainerStyle('profile')}"><img src="${profilePhoto}" alt="${name}" style="${getImageStyle('profile')}"></div></div>` : ''}
  <div style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin-bottom: 5px;">${name}</div>
  <div style="font-size: 14px; color: ${primaryColor}; font-style: italic; margin-bottom: 15px;">${title}</div>
  <div style="border-top: 2px solid ${primaryColor}; border-bottom: 2px solid ${primaryColor}; padding: 15px 0; margin: 15px 0; font-size: 12px; color: #666; line-height: 1.8;">
    ${company ? `<div>${company}</div>` : ''}
    ${cellPhone ? `<div>${cellPhone}</div>` : ''}
    ${email ? `<div><a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none;">${email}</a></div>` : ''}
    ${website ? `<div><a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${primaryColor}; text-decoration: none;">${website}</a></div>` : ''}
  </div>
</div>
    `.trim();
  };

  // Template 6: Colorful Side Bar
  const generateTemplate6 = (): string => {
    const { name, title, company, cellPhone, email, website, primaryColor, secondaryColor, profilePhoto } = signatureData;
    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width: 600px;">
  <tr>
    <td style="background-color: ${primaryColor}; padding: 30px; color: white; width: 150px; vertical-align: top;">
      ${profilePhoto ? `<div style="${getContainerStyle('profile')} margin-bottom: 15px;"><img src="${profilePhoto}" alt="${name}" style="${getImageStyle('profile')}"></div>` : ''}
      <div style="font-size: 12px; line-height: 1.8;">
        ${cellPhone ? `<div style="margin: 8px 0;">📱 ${cellPhone}</div>` : ''}
        ${email ? `<div style="margin: 8px 0; word-break: break-all;"><a href="mailto:${email}" style="color: white; text-decoration: none;">✉ ${email}</a></div>` : ''}
        ${website ? `<div style="margin: 8px 0;"><a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: white; text-decoration: none;">🌐 ${website}</a></div>` : ''}
      </div>
    </td>
    <td style="padding: 30px 20px; background-color: #f9f9f9;">
      <div style="font-size: 18px; font-weight: bold; color: #1a1a1a; margin-bottom: 5px;">${name}</div>
      <div style="font-size: 13px; color: ${primaryColor}; font-weight: 600; margin-bottom: 8px;">${title}</div>
      <div style="font-size: 12px; color: #666;">${company}</div>
    </td>
  </tr>
</table>
    `.trim();
  };

  // Template 7: LinkedIn Style
  const generateTemplate7 = (): string => {
    const { name, title, company, cellPhone, email, website, primaryColor, profilePhoto } = signatureData;
    return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 500px; border: 1px solid #e5e5e5; border-radius: 5px; overflow: hidden;">
  <div style="background-color: ${primaryColor}; height: 3px;"></div>
  <div style="padding: 20px; background-color: white;">
    <table width="100%">
      <tr>
        <td style="vertical-align: top;">
          <div style="font-size: 16px; font-weight: 600; color: #000; margin-bottom: 2px;">${name}</div>
          <div style="font-size: 14px; color: #666; margin-bottom: 12px; line-height: 1.5;">${title}${title && company ? ' at ' : ''}${company}</div>
          <div style="font-size: 13px; color: #999; line-height: 1.6;">
            ${cellPhone ? `📱 ${cellPhone}<br>` : ''}
            ${email ? `📧 <a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none; text-decoration-color: ${primaryColor};">${email}</a><br>` : ''}
            ${website ? `🔗 <a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${primaryColor}; text-decoration: none;">${website}</a>` : ''}
          </div>
        </td>
        ${profilePhoto ? `<td style="padding-left: 15px; text-align: right;"><div style="${getContainerStyle('profile')}"><img src="${profilePhoto}" alt="${name}" style="${getImageStyle('profile')}"></div></td>` : ''}
      </tr>
    </table>
  </div>
</div>
    `.trim();
  };

  // Template 8: Minimalist Box
  const generateTemplate8 = (): string => {
    const { name, title, company, cellPhone, email, website, primaryColor } = signatureData;
    return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 400px;">
  <div style="background-color: ${primaryColor}; color: white; padding: 15px 20px; margin-bottom: 0;">
    <div style="font-size: 15px; font-weight: bold;">${name}</div>
  </div>
  <div style="border: 1px solid #e0e0e0; border-top: none; padding: 15px 20px;">
    <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
      <div style="font-weight: 600; color: #333; margin-bottom: 6px;">${title}</div>
      <div>${company}</div>
    </div>
    <table cellpadding="0" cellspacing="0" style="font-size: 12px; color: #666;">
      ${cellPhone ? `<tr><td>Phone:</td><td style="padding-left: 10px;"><a href="tel:${cellPhone}" style="color: ${primaryColor}; text-decoration: none;">${cellPhone}</a></td></tr>` : ''}
      ${email ? `<tr><td>Email:</td><td style="padding-left: 10px;"><a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none;">${email}</a></td></tr>` : ''}
      ${website ? `<tr><td>Web:</td><td style="padding-left: 10px;"><a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${primaryColor}; text-decoration: none;">${website}</a></td></tr>` : ''}
    </table>
  </div>
</div>
    `.trim();
  };

  // Template 9: Modern Gradient
  const generateTemplate9 = (): string => {
    const { name, title, company, cellPhone, email, website, primaryColor, secondaryColor, profilePhoto } = signatureData;
    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 550px;">
  <tr>
    <td style="background: linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: white; padding: 30px 25px;">
      <table width="100%">
        <tr>
          <td style="vertical-align: middle;">
            <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">${name}</div>
            <div style="font-size: 14px; opacity: 0.95;">${title}</div>
          </td>
          ${profilePhoto ? `<td style="text-align: right; vertical-align: middle;"><div style="${getContainerStyle('profile')}"><img src="${profilePhoto}" alt="${name}" style="${getImageStyle('profile')}"></div></td>` : ''}
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background-color: white; padding: 20px 25px; border-left: 4px solid ${primaryColor};">
      ${company ? `<div style="font-size: 12px; font-weight: 600; color: ${primaryColor}; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">${company}</div>` : ''}
      <table cellpadding="0" cellspacing="0" style="font-size: 12px; color: #666; width: 100%;">
        ${cellPhone ? `<tr><td style="padding-bottom: 6px;"><strong style="color: #333;">T:</strong> <a href="tel:${cellPhone}" style="color: ${primaryColor}; text-decoration: none;">${cellPhone}</a></td></tr>` : ''}
        ${email ? `<tr><td style="padding-bottom: 6px;"><strong style="color: #333;">E:</strong> <a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none;">${email}</a></td></tr>` : ''}
        ${website ? `<tr><td><strong style="color: #333;">W:</strong> <a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${primaryColor}; text-decoration: none;">${website}</a></td></tr>` : ''}
      </table>
    </td>
  </tr>
</table>
    `.trim();
  };

  const copyToClipboard = async () => {
    const html = generateSignatureHTML();
    try {
      await navigator.clipboard.writeText(html);
      toast({
        title: "Copied!",
        description: "Email signature HTML copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const downloadHTML = () => {
    const html = generateSignatureHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-signature.html";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Email signature saved as HTML file",
    });
  };

  const previewInEmail = () => {
    const html = generateSignatureHTML();
    const subject = "Email Signature Preview";
    const body = html;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 md:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Email Signature Generator
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Create professional email signatures in minutes
            </p>
          </div>
        </div>

        {/* Step 1 & 2: Platform Selection and Template Carousel */}
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "30% 70%" }}>
          {/* Step 1: Email Platform Selection */}
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">1. Choose email platform</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {emailPlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-all ${
                      selectedPlatform === platform.id
                        ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                    data-testid={`btn-platform-${platform.id}`}
                  >
                    <span className="text-lg">{platform.icon}</span>
                    <span className="text-xs font-medium text-center text-slate-900 dark:text-white">{platform.name}</span>
                  </button>
                ))}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Looking for another email platform?{" "}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Check out the supported platforms here
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Step 2: Template Carousel */}
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">2. Choose signature template</CardTitle>
            </CardHeader>
            <CardContent className="p-1.5">
              <div className="relative">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevTemplate}
                    className="z-10 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white w-10 h-10 flex-shrink-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    data-testid="btn-carousel-prev"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <div className="flex-1 overflow-hidden flex items-center justify-center py-2">
                    <style>{`
                      @keyframes slideIn {
                        from { opacity: 0; transform: translateX(20px); }
                        to { opacity: 1; transform: translateX(0); }
                      }
                      .carousel-item {
                        animation: slideIn 0.4s ease-out forwards;
                      }
                      .carousel-container {
                        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                        display: flex;
                        gap: 12px;
                      }
                    `}</style>
                    <div className="carousel-container" style={{ transform: `translateX(0)` }}>
                      {templates && templates.map((template, actualIndex) => {
                        const isVisible = actualIndex >= carouselIndex && actualIndex < carouselIndex + 4 || 
                                         (carouselIndex + 4 > templates.length && actualIndex < (carouselIndex + 4) % templates.length);
                        if (!isVisible && !(carouselIndex >= templates.length - 3)) return null;

                        const visibleIndex = actualIndex >= carouselIndex ? actualIndex - carouselIndex : templates.length - carouselIndex + actualIndex;
                        if (visibleIndex >= 4) return null;

                        return (
                          <div
                            key={`${actualIndex}-${template.id}`}
                            onClick={() => selectTemplate(actualIndex)}
                            className="carousel-item flex-shrink-0 cursor-pointer group relative"
                            style={{ width: "200px" }}
                            data-testid={`template-card-${template.id}`}
                          >
                            <div
                              className={`border-3 rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1 ${
                                visibleIndex === 0
                                  ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-800"
                                  : "border-slate-300 dark:border-slate-600 group-hover:border-blue-400 dark:group-hover:border-blue-500"
                              }`}
                              style={{ height: "160px" }}
                            >
                              <div className="h-full bg-white dark:bg-slate-900 flex items-center justify-center p-0 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/0 group-hover:to-black/5 dark:group-hover:to-white/5 transition-all duration-300"></div>
                                <div
                                  style={{
                                    transform: "scale(0.42)",
                                    transformOrigin: "center",
                                    width: "238%",
                                    fontSize: "11px",
                                    lineHeight: "1.3"
                                  }}
                                >
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: getTemplateHTMLByIndex(actualIndex)
                                    }}
                                    style={{ 
                                      margin: 0, 
                                      padding: "8px",
                                      display: "block",
                                      whiteSpace: "normal"
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="text-center mt-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                {template.name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextTemplate}
                    className="z-10 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white w-10 h-10 flex-shrink-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    data-testid="btn-carousel-next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="text-center mt-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight py-0">
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                      More templates
                    </a>
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Step 3 & Preview: Form and Live Preview */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "30% 70%" }}>
          <div className="space-y-2">
            {/* CARD 1: Signature (Handwritten Style) */}
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader
                className="cursor-pointer py-2 px-3"
                onClick={() => toggleSection("signatureSection")}
                data-testid="toggle-signature-section"
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    Signature (Handwritten Style)
                  </CardTitle>
                  {collapsedSections.signatureSection ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {!collapsedSections.signatureSection && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="signatureName" className="text-xs">Signature Name (Optional)</Label>
                      <Input
                        id="signatureName"
                        value={signatureData.signatureName}
                        onChange={(e) =>
                          updateField("signatureName", e.target.value)
                        }
                        placeholder="John Doe"
                        data-testid="input-signature-name"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">Handwritten-style name shown at the top of signature</p>
                    </div>

                    <div className="space-y-3 pt-3">
                    {/* Signature Style Subsection */}
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <div
                        className="flex items-center justify-between cursor-pointer mb-3"
                        onClick={() => toggleSection("signatureStyle")}
                        data-testid="toggle-signature-style"
                      >
                        <Label className="text-sm font-semibold">
                          Signature Style
                        </Label>
                        {collapsedSections.signatureStyle ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                      {!collapsedSections.signatureStyle && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs mb-1">Font</Label>
                            <Select
                              value={signatureData.signatureFont}
                              onValueChange={(v) =>
                                updateField("signatureFont", v)
                              }
                            >
                              <SelectTrigger data-testid="select-signature-font">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {signatureFonts.map((font) => (
                                  <SelectItem key={font} value={font}>
                                    {font}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">
                              Font Size: {signatureData.signatureSize}px
                            </Label>
                            <input
                              type="range"
                              min="20"
                              max="50"
                              value={signatureData.signatureSize}
                              onChange={(e) =>
                                updateField(
                                  "signatureSize",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-signature-size"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1">Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={signatureData.signatureColor}
                                onChange={(e) =>
                                  updateField("signatureColor", e.target.value)
                                }
                                className="w-16 h-9"
                                data-testid="input-signature-color"
                              />
                              <Input
                                value={signatureData.signatureColor}
                                onChange={(e) =>
                                  updateField("signatureColor", e.target.value)
                                }
                                placeholder="#333333"
                                className="flex-1"
                                data-testid="input-signature-color-hex"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">
                              Line Spacing: {signatureData.signatureLineHeight.toFixed(1)}
                            </Label>
                            <input
                              type="range"
                              min="1"
                              max="2.5"
                              step="0.1"
                              value={signatureData.signatureLineHeight}
                              onChange={(e) =>
                                updateField(
                                  "signatureLineHeight",
                                  parseFloat(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-signature-line-height"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* CARD 2: Name/Title/Company */}
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader
                className="cursor-pointer py-2 px-3"
                onClick={() => toggleSection("nameSection")}
                data-testid="toggle-name-section"
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    Name/Title/Company
                  </CardTitle>
                  {collapsedSections.nameSection ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {!collapsedSections.nameSection && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={signatureData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="John Doe"
                        data-testid="input-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={signatureData.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        placeholder="CEO & Founder"
                        data-testid="input-title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={signatureData.company}
                        onChange={(e) => updateField("company", e.target.value)}
                        placeholder="TalkLink Inc."
                        data-testid="input-company"
                      />
                    </div>

                    <div className="space-y-3 pt-3">
                    {/* Name Style Subsection */}
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <div
                        className="flex items-center justify-between cursor-pointer mb-3"
                        onClick={() => toggleSection("nameStyle")}
                        data-testid="toggle-name-style"
                      >
                        <Label className="text-sm font-semibold">
                          Name Style
                        </Label>
                        {collapsedSections.nameStyle ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                      {!collapsedSections.nameStyle && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs mb-1">Font</Label>
                            <Select
                              value={signatureData.headerFont}
                              onValueChange={(v) =>
                                updateField("headerFont", v)
                              }
                            >
                              <SelectTrigger data-testid="select-name-font">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {professionalFonts.map((font) => (
                                  <SelectItem key={font} value={font}>
                                    {font}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">
                              Size: {signatureData.nameSize}px
                            </Label>
                            <input
                              type="range"
                              min="10"
                              max="48"
                              value={signatureData.nameSize}
                              onChange={(e) =>
                                updateField(
                                  "nameSize",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-name-size"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1">Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={signatureData.nameColor}
                                onChange={(e) =>
                                  updateField("nameColor", e.target.value)
                                }
                                className="w-16 h-9"
                                data-testid="input-name-color"
                              />
                              <Input
                                value={signatureData.nameColor}
                                onChange={(e) =>
                                  updateField("nameColor", e.target.value)
                                }
                                placeholder="#333333"
                                className="flex-1"
                                data-testid="input-name-color-hex"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">
                              Line Spacing: {signatureData.nameLineHeight.toFixed(1)}
                            </Label>
                            <input
                              type="range"
                              min="1"
                              max="2.5"
                              step="0.1"
                              value={signatureData.nameLineHeight}
                              onChange={(e) =>
                                updateField(
                                  "nameLineHeight",
                                  parseFloat(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-name-line-height"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Title Style Subsection */}
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <div
                        className="flex items-center justify-between cursor-pointer mb-3"
                        onClick={() => toggleSection("titleStyle")}
                        data-testid="toggle-title-style"
                      >
                        <Label className="text-sm font-semibold">
                          Title Style
                        </Label>
                        {collapsedSections.titleStyle ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                      {!collapsedSections.titleStyle && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs mb-1">Font</Label>
                            <Select
                              value={signatureData.headerFont}
                              onValueChange={(v) =>
                                updateField("headerFont", v)
                              }
                            >
                              <SelectTrigger data-testid="select-title-font">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {professionalFonts.map((font) => (
                                  <SelectItem key={font} value={font}>
                                    {font}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">
                              Size: {signatureData.titleSize}px
                            </Label>
                            <input
                              type="range"
                              min="10"
                              max="32"
                              value={signatureData.titleSize}
                              onChange={(e) =>
                                updateField(
                                  "titleSize",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-title-size"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1">Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={signatureData.titleColor}
                                onChange={(e) =>
                                  updateField("titleColor", e.target.value)
                                }
                                className="w-16 h-9"
                                data-testid="input-title-color"
                              />
                              <Input
                                value={signatureData.titleColor}
                                onChange={(e) =>
                                  updateField("titleColor", e.target.value)
                                }
                                placeholder="#666666"
                                className="flex-1"
                                data-testid="input-title-color-hex"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">
                              Line Spacing: {signatureData.titleLineHeight.toFixed(1)}
                            </Label>
                            <input
                              type="range"
                              min="1"
                              max="2.5"
                              step="0.1"
                              value={signatureData.titleLineHeight}
                              onChange={(e) =>
                                updateField(
                                  "titleLineHeight",
                                  parseFloat(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-title-line-height"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Company Style Subsection */}
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <div
                        className="flex items-center justify-between cursor-pointer mb-3"
                        onClick={() => toggleSection("companyStyle")}
                        data-testid="toggle-company-style"
                      >
                        <Label className="text-sm font-semibold">
                          Company Style
                        </Label>
                        {collapsedSections.companyStyle ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                      {!collapsedSections.companyStyle && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs mb-1">Font</Label>
                            <Select
                              value={signatureData.headerFont}
                              onValueChange={(v) =>
                                updateField("headerFont", v)
                              }
                            >
                              <SelectTrigger data-testid="select-company-font">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {professionalFonts.map((font) => (
                                  <SelectItem key={font} value={font}>
                                    {font}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">
                              Size: {signatureData.companySize}px
                            </Label>
                            <input
                              type="range"
                              min="10"
                              max="32"
                              value={signatureData.companySize}
                              onChange={(e) =>
                                updateField(
                                  "companySize",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-company-size"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1">Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={signatureData.companyColor}
                                onChange={(e) =>
                                  updateField("companyColor", e.target.value)
                                }
                                className="w-16 h-9"
                                data-testid="input-company-color"
                              />
                              <Input
                                value={signatureData.companyColor}
                                onChange={(e) =>
                                  updateField("companyColor", e.target.value)
                                }
                                placeholder="#666666"
                                className="flex-1"
                                data-testid="input-company-color-hex"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Divider Style Subsection */}
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <div
                        className="flex items-center justify-between cursor-pointer mb-3"
                        onClick={() => toggleSection("dividerStyle")}
                        data-testid="toggle-divider-style"
                      >
                        <Label className="text-sm font-semibold">
                          Divider Style
                        </Label>
                        {collapsedSections.dividerStyle ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                      {!collapsedSections.dividerStyle && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">
                              Thickness: {signatureData.dividerHeight}px
                            </Label>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={signatureData.dividerHeight}
                              onChange={(e) =>
                                updateField(
                                  "dividerHeight",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-divider-height"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">
                              Width: {signatureData.dividerWidth}%
                            </Label>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              step="10"
                              value={signatureData.dividerWidth}
                              onChange={(e) =>
                                updateField(
                                  "dividerWidth",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-divider-width"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1">Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={signatureData.dividerColor}
                                onChange={(e) =>
                                  updateField("dividerColor", e.target.value)
                                }
                                className="w-16 h-9"
                                data-testid="input-divider-color"
                              />
                              <Input
                                value={signatureData.dividerColor}
                                onChange={(e) =>
                                  updateField("dividerColor", e.target.value)
                                }
                                placeholder="#FF6A00"
                                className="flex-1"
                                data-testid="input-divider-color-hex"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">
                              Top Spacing: {signatureData.dividerMarginTop}px
                            </Label>
                            <input
                              type="range"
                              min="0"
                              max="30"
                              value={signatureData.dividerMarginTop}
                              onChange={(e) =>
                                updateField(
                                  "dividerMarginTop",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-divider-margin-top"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">
                              Bottom Spacing: {signatureData.dividerMarginBottom}px
                            </Label>
                            <input
                              type="range"
                              min="0"
                              max="30"
                              value={signatureData.dividerMarginBottom}
                              onChange={(e) =>
                                updateField(
                                  "dividerMarginBottom",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-divider-margin-bottom"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* CARD 3: Contact Info */}
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader
                className="cursor-pointer py-2 px-3"
                onClick={() => toggleSection("contactSection")}
                data-testid="toggle-contact-section"
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    Contact Info
                  </CardTitle>
                  {collapsedSections.contactSection ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {!collapsedSections.contactSection && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cellPhone">Cell Phone</Label>
                        <Input
                          id="cellPhone"
                          value={signatureData.cellPhone}
                          onChange={(e) => updateField("cellPhone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          data-testid="input-cell-phone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="officePhone">Office Phone</Label>
                        <Input
                          id="officePhone"
                          value={signatureData.officePhone}
                          onChange={(e) =>
                            updateField("officePhone", e.target.value)
                          }
                          placeholder="+1 (555) 987-6543"
                          data-testid="input-office-phone"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={signatureData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="john@talkl.ink"
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={signatureData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://www.talkl.ink"
                    data-testid="input-website"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ecardUrl">eCard Link</Label>
                  <div className="flex gap-2 items-center">
                    <span className="text-lg">📇</span>
                    <Input
                      id="ecardUrl"
                      value={signatureData.ecardUrl}
                      onChange={(e) => updateField("ecardUrl", e.target.value)}
                      placeholder="https://talkl.ink/yourname"
                      data-testid="input-ecard-url"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={signatureData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="123 Main St, City, State 12345"
                    data-testid="input-address"
                  />
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">
                      Custom Fields
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addCustomField}
                      className="gap-1"
                      data-testid="button-add-custom-field"
                    >
                      <Plus className="w-4 h-4" />
                      Add Field
                    </Button>
                  </div>
                  {signatureData.customFields.length > 0 && (
                    <div className="space-y-3">
                      {signatureData.customFields.map((field, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Label className="text-xs">Value</Label>
                              <Input
                                value={field.value}
                                onChange={(e) =>
                                  updateCustomField(index, "value", e.target.value)
                                }
                                placeholder="Value (e.g., LinkedIn, Skype)"
                                data-testid={`input-custom-field-value-${index}`}
                              />
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCustomField(index)}
                              data-testid={`button-remove-custom-field-${index}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div>
                            <Label className="text-xs">Icon</Label>
                            <Select value={field.icon} onValueChange={(v) => updateCustomField(index, "icon", v)}>
                              <SelectTrigger data-testid={`select-custom-field-icon-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="cell">Cell Phone</SelectItem>
                                <SelectItem value="location">Location</SelectItem>
                                <SelectItem value="ecard">eCard</SelectItem>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="twitter">Twitter/X</SelectItem>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="pinterest">Pinterest</SelectItem>
                                <SelectItem value="github">GitHub</SelectItem>
                                <SelectItem value="snapchat">Snapchat</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs">Link (Optional)</Label>
                            <Input
                              value={field.url}
                              onChange={(e) =>
                                updateCustomField(index, "url", e.target.value)
                              }
                              placeholder="https://... or tel:... or mailto:..."
                              data-testid={`input-custom-field-url-${index}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add any additional information like LinkedIn, Skype,
                    Department, etc.
                  </p>
                </div>

                    <div className="space-y-3 pt-3">
                    {/* Contact Info Style Subsection */}
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <div
                        className="flex items-center justify-between cursor-pointer mb-3"
                        onClick={() => toggleSection("contactInfoStyle")}
                        data-testid="toggle-contact-info-style"
                      >
                        <Label className="text-sm font-semibold">
                          Contact Info Style
                        </Label>
                        {collapsedSections.contactInfoStyle ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                      {!collapsedSections.contactInfoStyle && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs mb-1">Font</Label>
                            <Select
                              value={signatureData.contactFont}
                              onValueChange={(v) =>
                                updateField("contactFont", v)
                              }
                            >
                              <SelectTrigger data-testid="select-contact-font">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {professionalFonts.map((font) => (
                                  <SelectItem key={font} value={font}>
                                    {font}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">
                              Size: {signatureData.contactInfoSize}px
                            </Label>
                            <input
                              type="range"
                              min="10"
                              max="24"
                              value={signatureData.contactInfoSize}
                              onChange={(e) =>
                                updateField(
                                  "contactInfoSize",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-contact-size"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1">Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={signatureData.contactInfoColor}
                                onChange={(e) =>
                                  updateField(
                                    "contactInfoColor",
                                    e.target.value,
                                  )
                                }
                                className="w-16 h-9"
                                data-testid="input-contact-color"
                              />
                              <Input
                                value={signatureData.contactInfoColor}
                                onChange={(e) =>
                                  updateField(
                                    "contactInfoColor",
                                    e.target.value,
                                  )
                                }
                                placeholder="#333333"
                                className="flex-1"
                                data-testid="input-contact-color-hex"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">
                              Line Gap: {signatureData.contactLineHeight.toFixed(1)}
                            </Label>
                            <input
                              type="range"
                              min="1"
                              max="2.5"
                              step="0.1"
                              value={signatureData.contactLineHeight}
                              onChange={(e) =>
                                updateField(
                                  "contactLineHeight",
                                  parseFloat(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-contact-line-height"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">
                              Letter Spacing: {signatureData.contactLetterSpacing}px
                            </Label>
                            <input
                              type="range"
                              min="-2"
                              max="5"
                              value={signatureData.contactLetterSpacing}
                              onChange={(e) =>
                                updateField(
                                  "contactLetterSpacing",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-contact-letter-spacing"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Contact Icon Style Subsection */}
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <div
                        className="flex items-center justify-between cursor-pointer mb-3"
                        onClick={() => toggleSection("contactIconStyle")}
                        data-testid="toggle-contact-icon-style"
                      >
                        <Label className="text-sm font-semibold">
                          Contact Info Icon Style
                        </Label>
                        {collapsedSections.contactIconStyle ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                      {!collapsedSections.contactIconStyle && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">
                              Icon Size: {signatureData.contactIconSize}px
                            </Label>
                            <input
                              type="range"
                              min="12"
                              max="32"
                              value={signatureData.contactIconSize}
                              onChange={(e) =>
                                updateField(
                                  "contactIconSize",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              data-testid="slider-icon-size"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1">Icon Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={signatureData.contactIconColor}
                                onChange={(e) =>
                                  updateField(
                                    "contactIconColor",
                                    e.target.value,
                                  )
                                }
                                className="w-16 h-9"
                                data-testid="input-icon-color"
                              />
                              <Input
                                value={signatureData.contactIconColor}
                                onChange={(e) =>
                                  updateField(
                                    "contactIconColor",
                                    e.target.value,
                                  )
                                }
                                placeholder="#FF6A00"
                                className="flex-1"
                                data-testid="input-icon-color-hex"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Profile Photo */}
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader
                className="cursor-pointer py-2 px-3"
                onClick={() => toggleSection("profilePhotoSection")}
                data-testid="toggle-profile-photo-section"
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    Profile Photo
                  </CardTitle>
                  {collapsedSections.profilePhotoSection ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {!collapsedSections.profilePhotoSection && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="profilePhoto" className="text-xs">Upload Photo</Label>
                      <div className="flex gap-2">
                        <Input
                          id="profilePhoto"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleImageUpload("profilePhoto", e.target.files[0])
                          }
                          className="flex-1"
                          data-testid="input-profile-photo"
                        />
                        {signatureData.profilePhoto && (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={removeProfilePhoto}
                            data-testid="button-remove-profile-photo"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-2 mt-2">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">Styling</h4>

                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Shape</Label>
                          <Select value={signatureData.profilePhotoShape} onValueChange={(v: any) => updateField("profilePhotoShape", v)}>
                            <SelectTrigger className="w-full" data-testid="select-profile-shape">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="circle">Circle</SelectItem>
                              <SelectItem value="square">Square</SelectItem>
                              <SelectItem value="rounded">Rounded Square</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs">Width ({signatureData.profilePhotoWidth}px)</Label>
                          <input type="range" min="20" max="300" value={signatureData.profilePhotoWidth} onChange={(e) => updateField("profilePhotoWidth", Number(e.target.value))} className="w-full" data-testid="input-profile-width" />
                        </div>
                        <div>
                          <Label className="text-xs">Height ({signatureData.profilePhotoHeight}px)</Label>
                          <input type="range" min="20" max="300" value={signatureData.profilePhotoHeight} onChange={(e) => updateField("profilePhotoHeight", Number(e.target.value))} className="w-full" data-testid="input-profile-height" />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Border Width (px)</Label>
                            <Input type="number" value={signatureData.profilePhotoBorderWidth} onChange={(e) => updateField("profilePhotoBorderWidth", Number(e.target.value))} min="0" max="10" data-testid="input-profile-border-width" />
                          </div>
                          <div>
                            <Label className="text-xs">Border Color</Label>
                            <div className="flex gap-2">
                              <input type="color" value={signatureData.profilePhotoBorderColor} onChange={(e) => updateField("profilePhotoBorderColor", e.target.value)} className="w-10 h-9 rounded" data-testid="input-profile-border-color" />
                              <Input value={signatureData.profilePhotoBorderColor} onChange={(e) => updateField("profilePhotoBorderColor", e.target.value)} placeholder="#FF6A00" className="flex-1" data-testid="input-profile-border-color-hex" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Opacity ({signatureData.profilePhotoOpacity}%)</Label>
                            <input type="range" min="0" max="100" value={signatureData.profilePhotoOpacity} onChange={(e) => updateField("profilePhotoOpacity", Number(e.target.value))} className="w-full" data-testid="input-profile-opacity" />
                          </div>
                          <div>
                            <Label className="text-xs">Shadow</Label>
                            <Select value={signatureData.profilePhotoShadow} onValueChange={(v: any) => updateField("profilePhotoShadow", v)}>
                              <SelectTrigger data-testid="select-profile-shadow">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Right Side Gap ({signatureData.profilePhotoRightSideGap}px)</Label>
                          <input type="range" min="0" max="40" value={signatureData.profilePhotoRightSideGap} onChange={(e) => updateField("profilePhotoRightSideGap", Number(e.target.value))} className="w-full" data-testid="input-profile-right-gap" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Company Logo */}
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader
                className="cursor-pointer py-2 px-3"
                onClick={() => toggleSection("companyLogoSection")}
                data-testid="toggle-company-logo-section"
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    Company Logo
                  </CardTitle>
                  {collapsedSections.companyLogoSection ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {!collapsedSections.companyLogoSection && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyLogo" className="text-xs">Upload Logo</Label>
                      <div className="flex gap-2">
                        <Input
                          id="companyLogo"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleImageUpload("companyLogo", e.target.files[0])
                          }
                          className="flex-1"
                          data-testid="input-company-logo"
                        />
                        {signatureData.companyLogo && (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={removeCompanyLogo}
                            data-testid="button-remove-company-logo"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-2 mt-2">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">Styling</h4>

                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Shape</Label>
                          <Select value={signatureData.companyLogoShape} onValueChange={(v: any) => updateField("companyLogoShape", v)}>
                            <SelectTrigger className="w-full" data-testid="select-logo-shape">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="circle">Circle</SelectItem>
                              <SelectItem value="square">Square</SelectItem>
                              <SelectItem value="rounded">Rounded Square</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs">Width ({signatureData.companyLogoWidth}px)</Label>
                          <input type="range" min="20" max="300" value={signatureData.companyLogoWidth} onChange={(e) => updateField("companyLogoWidth", Number(e.target.value))} className="w-full" data-testid="input-logo-width" />
                        </div>
                        <div>
                          <Label className="text-xs">Height ({signatureData.companyLogoHeight}px)</Label>
                          <input type="range" min="20" max="300" value={signatureData.companyLogoHeight} onChange={(e) => updateField("companyLogoHeight", Number(e.target.value))} className="w-full" data-testid="input-logo-height" />
                        </div>

                        <div>
                          <Label className="text-xs">Background Color</Label>
                          <div className="flex gap-2">
                            <input type="color" value={signatureData.companyLogoBackgroundColor} onChange={(e) => updateField("companyLogoBackgroundColor", e.target.value)} className="w-10 h-9 rounded" data-testid="input-logo-background-color" />
                            <Input value={signatureData.companyLogoBackgroundColor} onChange={(e) => updateField("companyLogoBackgroundColor", e.target.value)} placeholder="#FFFFFF" className="flex-1" data-testid="input-logo-background-color-hex" />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Border Width ({signatureData.companyLogoBorderWidth}px)</Label>
                          <input type="range" min="0" max="10" value={signatureData.companyLogoBorderWidth} onChange={(e) => updateField("companyLogoBorderWidth", Number(e.target.value))} className="w-full" data-testid="input-logo-border-width" />
                        </div>

                        <div>
                          <Label className="text-xs">Border Color</Label>
                          <div className="flex gap-2">
                            <input type="color" value={signatureData.companyLogoBorderColor} onChange={(e) => updateField("companyLogoBorderColor", e.target.value)} className="w-10 h-9 rounded" data-testid="input-logo-border-color" />
                            <Input value={signatureData.companyLogoBorderColor} onChange={(e) => updateField("companyLogoBorderColor", e.target.value)} placeholder="#CCCCCC" className="flex-1" data-testid="input-logo-border-color-hex" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Opacity ({signatureData.companyLogoOpacity}%)</Label>
                            <input type="range" min="0" max="100" value={signatureData.companyLogoOpacity} onChange={(e) => updateField("companyLogoOpacity", Number(e.target.value))} className="w-full" data-testid="input-logo-opacity" />
                          </div>
                          <div>
                            <Label className="text-xs">Shadow</Label>
                            <Select value={signatureData.companyLogoShadow} onValueChange={(v: any) => updateField("companyLogoShadow", v)}>
                              <SelectTrigger data-testid="select-logo-shadow">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader
                className="cursor-pointer py-2 px-3"
                onClick={() => toggleSection("socialLinksSection")}
                data-testid="toggle-social-links-section"
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    Social Links
                  </CardTitle>
                  {collapsedSections.socialLinksSection ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {!collapsedSections.socialLinksSection && (
                  <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addSocialLink}
                  className="gap-1 mb-2"
                  data-testid="button-add-social-link"
                >
                  <Plus className="w-4 h-4" />
                  Add Link
                </Button>
                {signatureData.socialLinks.map((link, index) => (
                  <div key={index} className="grid grid-cols-[120px_1fr_32px] gap-2 items-center">
                    <Select
                      value={link.platform}
                      onValueChange={(v) =>
                        updateSocialLink(index, "platform", v)
                      }
                    >
                      <SelectTrigger
                        className="w-full"
                        data-testid={`select-social-platform-${index}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {socialPlatforms.map((platform) => (
                          <SelectItem
                            key={platform.value}
                            value={platform.value}
                          >
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={link.url}
                      onChange={(e) =>
                        updateSocialLink(index, "url", e.target.value)
                      }
                      placeholder="https://..."
                      className="w-full"
                      data-testid={`input-social-url-${index}`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSocialLink(index)}
                      data-testid={`button-remove-social-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {signatureData.socialLinks.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-2">
                    No social links added yet
                  </p>
                )}

                {/* Social Icon Style Subsection */}
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 mt-4">
                  <div
                    className="flex items-center justify-between cursor-pointer mb-3"
                    onClick={() => toggleSection("socialIconStyle")}
                    data-testid="toggle-social-icon-style"
                  >
                    <Label className="text-sm font-semibold">
                      Social Icon Style
                    </Label>
                    {collapsedSections.socialIconStyle ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </div>
                  {!collapsedSections.socialIconStyle && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">
                          Icon Size: {signatureData.socialIconSize}px
                        </Label>
                        <input
                          type="range"
                          min="16"
                          max="48"
                          value={signatureData.socialIconSize}
                          onChange={(e) =>
                            updateField(
                              "socialIconSize",
                              parseInt(e.target.value),
                            )
                          }
                          className="custom-range w-full"
                          data-testid="slider-social-icon-size"
                        />
                      </div>

                      <div>
                        <Label className="text-xs mb-1">Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={signatureData.socialIconColor}
                            onChange={(e) =>
                              updateField(
                                "socialIconColor",
                                e.target.value,
                              )
                            }
                            className="w-16 h-9"
                            data-testid="input-social-icon-color"
                          />
                          <Input
                            value={signatureData.socialIconColor}
                            onChange={(e) =>
                              updateField(
                                "socialIconColor",
                                e.target.value,
                              )
                            }
                            placeholder="#FF6A00"
                            className="flex-1"
                            data-testid="input-social-icon-color-hex"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs mb-1">Icon Shape</Label>
                        <Select
                          value={signatureData.socialIconShape}
                          onValueChange={(v) =>
                            updateField(
                              "socialIconShape",
                              v as "circle" | "square" | "rounded",
                            )
                          }
                        >
                          <SelectTrigger
                            className="w-full"
                            data-testid="select-social-icon-shape"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="circle">Circle</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="rounded">Rounded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">
                          Border Width: {signatureData.socialIconBorderWidth}px
                        </Label>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          value={signatureData.socialIconBorderWidth}
                          onChange={(e) =>
                            updateField(
                              "socialIconBorderWidth",
                              parseInt(e.target.value),
                            )
                          }
                          className="custom-range w-full"
                          data-testid="slider-social-icon-border-width"
                        />
                      </div>

                      <div>
                        <Label className="text-xs mb-1">Border Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={signatureData.socialIconBorderColor}
                            onChange={(e) =>
                              updateField(
                                "socialIconBorderColor",
                                e.target.value,
                              )
                            }
                            className="w-16 h-9"
                            data-testid="input-social-icon-border-color"
                          />
                          <Input
                            value={signatureData.socialIconBorderColor}
                            onChange={(e) =>
                              updateField(
                                "socialIconBorderColor",
                                e.target.value,
                              )
                            }
                            placeholder="#CCCCCC"
                            className="flex-1"
                            data-testid="input-social-icon-border-color-hex"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">
                          Top Spacing: {signatureData.socialLinksTopSpacing}px
                        </Label>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={signatureData.socialLinksTopSpacing}
                          onChange={(e) =>
                            updateField(
                              "socialLinksTopSpacing",
                              parseInt(e.target.value),
                            )
                          }
                          className="custom-range w-full"
                          data-testid="slider-social-top-spacing"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">
                          Bottom Spacing: {signatureData.socialLinksBottomSpacing}px
                        </Label>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={signatureData.socialLinksBottomSpacing}
                          onChange={(e) =>
                            updateField(
                              "socialLinksBottomSpacing",
                              parseInt(e.target.value),
                            )
                          }
                          className="custom-range w-full"
                          data-testid="slider-social-bottom-spacing"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">
                          Icon Gap: {signatureData.socialIconsGap}px
                        </Label>
                        <input
                          type="range"
                          min="4"
                          max="24"
                          value={signatureData.socialIconsGap}
                          onChange={(e) =>
                            updateField(
                              "socialIconsGap",
                              parseInt(e.target.value),
                            )
                          }
                          className="custom-range w-full"
                          data-testid="slider-social-icon-gap"
                        />
                      </div>
                    </div>
                  )}
                </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Optional Features */}
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader
                className="cursor-pointer py-2 px-3"
                onClick={() => toggleSection("optionalFeaturesSection")}
                data-testid="toggle-optional-features-section"
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    Optional Features
                  </CardTitle>
                  {collapsedSections.optionalFeaturesSection ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </div>
              </CardHeader>
              {!collapsedSections.optionalFeaturesSection && (
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showCTA">Call-to-Action Button</Label>
                    <Switch
                      id="showCTA"
                      checked={signatureData.showCTA}
                      onCheckedChange={(checked) =>
                        updateField("showCTA", checked)
                      }
                      data-testid="switch-show-cta"
                    />
                  </div>

                  {signatureData.showCTA && (
                    <div className="grid grid-cols-2 gap-4 pl-6">
                      <Input
                        value={signatureData.ctaText}
                        onChange={(e) => updateField("ctaText", e.target.value)}
                        placeholder="Button Text"
                        data-testid="input-cta-text"
                      />
                      <Input
                        value={signatureData.ctaUrl}
                        onChange={(e) => updateField("ctaUrl", e.target.value)}
                        placeholder="Button URL"
                        data-testid="input-cta-url"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showBanner">Banner</Label>
                    <Switch
                      id="showBanner"
                      checked={signatureData.showBanner}
                      onCheckedChange={(checked) =>
                        updateField("showBanner", checked)
                      }
                      data-testid="switch-show-banner"
                    />
                  </div>

                  {signatureData.showBanner && (
                    <div className="pl-6">
                      <Input
                        value={signatureData.bannerText}
                        onChange={(e) =>
                          updateField("bannerText", e.target.value)
                        }
                        placeholder="Banner Text"
                        data-testid="input-banner-text"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showDisclaimer">Disclaimer</Label>
                    <Switch
                      id="showDisclaimer"
                      checked={signatureData.showDisclaimer}
                      onCheckedChange={(checked) =>
                        updateField("showDisclaimer", checked)
                      }
                      data-testid="switch-show-disclaimer"
                    />
                  </div>

                  {signatureData.showDisclaimer && (
                    <div className="pl-6">
                      <Textarea
                        value={signatureData.disclaimerText}
                        onChange={(e) =>
                          updateField("disclaimerText", e.target.value)
                        }
                        placeholder="Disclaimer text..."
                        rows={3}
                        data-testid="textarea-disclaimer"
                      />
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>

          <div className="space-y-2">
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 sticky top-4">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm text-slate-900 dark:text-white">
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  This is how your signature will look
                </p>
                <div
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-white min-h-[60px] overflow-y-auto text-xs"
                  dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }}
                  data-testid="signature-preview"
                />

                <div className="flex gap-1 mt-1.5">
                  <Button
                    onClick={copyToClipboard}
                    className="flex-1 gap-1 h-7 text-xs py-1"
                    size="sm"
                    data-testid="button-copy"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                  <Button
                    onClick={downloadHTML}
                    variant="outline"
                    className="flex-1 gap-1 h-7 text-xs py-1"
                    size="sm"
                    data-testid="button-download"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                </div>

                <Button
                  onClick={previewInEmail}
                  variant="secondary"
                  className="w-full mt-1 gap-1 h-7 text-xs py-1"
                  size="sm"
                  data-testid="button-preview-email"
                >
                  <Mail className="w-3 h-3" />
                  Preview Email
                </Button>

                {/* Platform-Specific Instructions */}
                {platformInstructions[selectedPlatform] && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-1.5 mt-1.5">
                    <div className="flex items-start gap-1">
                      <Info className="w-3 h-3 text-blue-900 dark:text-blue-300 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-0.5">
                          How to use
                        </h3>
                        <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-0 list-decimal list-inside">
                          {platformInstructions[selectedPlatform].steps.slice(0, 3).map((step, idx) => (
                            <li key={idx} className="text-xs leading-tight">{step}</li>
                          ))}
                        </ol>
                        <div className="mt-1 pt-0.5 border-t border-blue-200 dark:border-blue-700">
                          <p className="text-xs text-blue-800 dark:text-blue-200 leading-tight"><strong>Setup:</strong> {platformInstructions[selectedPlatform].location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
