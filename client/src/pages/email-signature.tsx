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

  customFields: { label: string; value: string }[];

  profilePhoto: string;
  companyLogo: string;

  primaryColor: string;
  secondaryColor: string;

  signatureFont: string;
  signatureSize: number;
  signatureColor: string;

  nameSize: number;
  nameColor: string;
  titleSize: number;
  titleColor: string;
  companySize: number;
  companyColor: string;

  headerFont: string;
  headerSize: number;
  headerColor: string;
  contactFont: string;
  contactInfoSize: number;
  contactInfoColor: string;
  contactIconSize: number;
  contactIconColor: string;

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
  const [templateVariant, setTemplateVariant] = useState<
    "minimal" | "standard" | "full"
  >("standard");
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  const templates = [
    { id: "minimal", name: "Minimal", description: "Clean & Simple Design" },
    { id: "standard", name: "Standard", description: "Balanced Professional Look" },
    { id: "full", name: "Full Featured", description: "Complete with All Options" },
  ];
  
  const nextTemplate = () => {
    setCarouselIndex((prev) => (prev + 1) % templates.length);
    setTemplateVariant(templates[(carouselIndex + 1) % templates.length].id as "minimal" | "standard" | "full");
  };
  
  const prevTemplate = () => {
    setCarouselIndex((prev) => (prev - 1 + templates.length) % templates.length);
    setTemplateVariant(templates[(carouselIndex - 1 + templates.length) % templates.length].id as "minimal" | "standard" | "full");
  };
  
  const selectTemplate = (index: number) => {
    setCarouselIndex(index);
    setTemplateVariant(templates[index].id as "minimal" | "standard" | "full");
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
    contactSection: true,
    contactInfoStyle: true,
    contactIconStyle: true,
    contactFont: true,
    contactSize: true,
    contactColor: true,
    iconSize: true,
    iconColor: true,
    imagesSection: true,
    socialLinksSection: true,
    optionalFeaturesSection: true,
  });
  const [signatureData, setSignatureData] = useState<SignatureData>({
    signatureName: "John Doe",
    name: "John Doe",
    title: "Senior Marketing Manager",
    company: "Acme Corporation",
    cellPhone: "+1 (555) 123-4567",
    officePhone: "+1 (555) 987-6543",
    email: "john.doe@acme.com",
    website: "www.acme.com",
    address: "123 Business Ave, Suite 100, New York, NY 10001",
    customFields: [],
    profilePhoto:
      "https://ui-avatars.com/api/?name=John+Doe&size=200&background=FF6A00&color=fff&bold=true",
    companyLogo: "https://via.placeholder.com/200x80/FF6A00/FFFFFF?text=ACME",
    primaryColor: "#FF6A00",
    secondaryColor: "#333333",
    signatureFont: "Alex Brush",
    signatureSize: 20,
    signatureColor: "#333333",
    nameSize: 24,
    nameColor: "#333333",
    titleSize: 16,
    titleColor: "#666666",
    companySize: 16,
    companyColor: "#666666",
    headerFont: "Arial",
    headerSize: 18,
    headerColor: "#FF6A00",
    contactFont: "Arial",
    contactInfoSize: 20,
    contactInfoColor: "#333333",
    contactIconSize: 16,
    contactIconColor: "#FF6A00",
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

  const addSocialLink = () => {
    setSignatureData((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: "facebook", url: "", icon: "SiFacebook" },
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
      customFields: [...prev.customFields, { label: "", value: "" }],
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
    field: "label" | "value",
    value: string,
  ) => {
    setSignatureData((prev) => {
      const newFields = [...prev.customFields];
      newFields[index] = { ...newFields[index], [field]: value };
      return { ...prev, customFields: newFields };
    });
  };

  const generateSimpleSignature = (): string => {
    const baseUrl = window.location.origin;
    const phoneIcon = `${baseUrl}/signature/phone.png`;
    const emailIcon = `${baseUrl}/signature/email.png`;
    const websiteIcon = `${baseUrl}/signature/website.png`;
    const cellIcon = `${baseUrl}/signature/cell.png`;
    const locationIcon = `${baseUrl}/signature/location.png`;
    const ecardIcon = `${baseUrl}/signature/ecard.png`;

    const {
      signatureName,
      name,
      title,
      company,
      cellPhone,
      email,
      website,
      profilePhoto,
      primaryColor,
      socialLinks,
      customFields,
      signatureFont,
      signatureSize,
      signatureColor,
      nameSize,
      nameColor,
      titleSize,
      titleColor,
      companySize,
      companyColor,
      contactFont,
      contactInfoSize,
      contactInfoColor,
      contactIconSize,
      contactIconColor,
    } = signatureData;

    const socialIconsHTML = socialLinks
      .map((link) => {
        const platform = socialPlatforms.find((p) => p.value === link.platform);
        const iconSVG = getSocialIconSVG(link.platform);
        return `<a href="${link.url}" style="display:inline-block;margin:0 5px;"><img src="${iconSVG}" alt="${platform?.label}" width="${contactIconSize}" height="${contactIconSize}" style="border:0;display:block;"></a>`;
      })
      .join("");

    const customFieldsHTML = customFields
      .filter((f) => f.label && f.value)
      .map((field) => {
        return `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding-bottom: 2px;">${field.label}: ${field.value}</td></tr>`;
      })
      .join("");

    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0; padding: 0;">
  <tr>
    <td>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${
            profilePhoto
              ? `
          <td style="padding-right: 20px; vertical-align: middle;">
            <img src="${profilePhoto}" alt="${name}" width="100" height="100" style="border-radius: 50%; display: block; border: 3px solid ${primaryColor};">
          </td>
          `
              : ""
          }
          <td style="vertical-align: top; padding-top: 2px;">
            <table cellpadding="0" cellspacing="0" border="0">
              ${signatureName ? `<tr><td style="font-family: '${signatureFont}', cursive; font-size: ${signatureSize}px; color: ${signatureColor}; padding-bottom: 2px;">${signatureName}</td></tr>` : ""}
              <tr>
                <td style="font-family: Arial, sans-serif; font-size: ${nameSize}px; font-weight: bold; color: ${nameColor}; padding-bottom: 3px;">
                  ${name}${title ? ` <span style="color: ${nameColor}; opacity: 0.7; margin: 0 8px;">|</span> <span style="font-family: Arial, sans-serif; font-size: ${titleSize}px; color: ${titleColor};">${title}</span>` : ''}
                </td>
              </tr>
              ${company ? `<tr><td style="font-family: Arial, sans-serif; font-size: ${companySize}px; color: ${companyColor}; padding-bottom: 5px;">${company}</td></tr>` : ""}
              ${cellPhone ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding-bottom: 2px;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${cellIcon}" alt="" style="width:100%; height:100%; display:block;"></span>${cellPhone}</td></tr>` : ""}
              ${email ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; padding-bottom: 2px;"><a href="mailto:${email}" style="color: ${contactInfoColor}; text-decoration: none;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${emailIcon}" alt="" style="width:100%; height:100%; display:block;"></span>${email}</a></td></tr>` : ""}
              ${website ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; padding-bottom: 2px;"><a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${contactInfoColor}; text-decoration: none;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${websiteIcon}" alt="" style="width:100%; height:100%; display:block;"></span>${website}</a></td></tr>` : ""}
              ${customFieldsHTML}
              ${socialIconsHTML ? `<tr><td style="padding-top: 5px;">${socialIconsHTML}</td></tr>` : ""}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
    `.trim();
  };

  const generateAdvancedSignature = (): string => {
    const baseUrl = window.location.origin;
    const phoneIcon = `${baseUrl}/signature/phone.png`;
    const emailIcon = `${baseUrl}/signature/email.png`;
    const websiteIcon = `${baseUrl}/signature/website.png`;
    const cellIcon = `${baseUrl}/signature/cell.png`;
    const locationIcon = `${baseUrl}/signature/location.png`;
    const ecardIcon = `${baseUrl}/signature/ecard.png`;

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
      profilePhoto,
      companyLogo,
      primaryColor,
      secondaryColor,
      socialLinks,
      showCTA,
      ctaText,
      ctaUrl,
      customFields,
      signatureFont,
      signatureSize,
      signatureColor,
      nameSize,
      nameColor,
      titleSize,
      titleColor,
      companySize,
      companyColor,
      contactFont,
      contactInfoSize,
      contactInfoColor,
      contactIconSize,
      contactIconColor,
    } = signatureData;

    const socialIconsHTML = socialLinks
      .map((link) => {
        const iconSVG = getSocialIconSVG(link.platform);
        return `<a href="${link.url}" style="display:inline-block;margin:0 5px;"><img src="${iconSVG}" alt="${link.platform}" width="${contactIconSize + 12}" height="${contactIconSize + 12}" style="border:0;display:block;"></a>`;
      })
      .join("");

    const customFieldsHTML = customFields
      .filter((f) => f.label && f.value)
      .map((field) => {
        return `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding: 2px 0;">${field.label}: ${field.value}</td></tr>`;
      })
      .join("");

    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width: 650px; margin: 0; padding: 0;">
  <tr>
    <td>
      <table cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 20px;">
        <tr>
          ${
            profilePhoto
              ? `
          <td style="padding-right: 25px; vertical-align: middle;">
            <img src="${profilePhoto}" alt="${name}" width="120" height="120" style="border-radius: 50%; display: block; border: 4px solid ${primaryColor};">
          </td>
          `
              : ""
          }
          <td style="vertical-align: top; border-left: 3px solid ${primaryColor}; padding-left: 20px;">
            <table cellpadding="0" cellspacing="0" border="0">
              ${signatureName ? `<tr><td style="font-family: '${signatureFont}', cursive; font-size: ${signatureSize}px; color: ${signatureColor}; padding-bottom: 2px;">${signatureName}</td></tr>` : ""}
              <tr>
                <td style="font-family: Arial, sans-serif; font-size: ${nameSize}px; font-weight: bold; color: ${nameColor}; padding-bottom: 3px;">
                  ${name}${title ? ` <span style="color: ${nameColor}; opacity: 0.7; margin: 0 8px;">|</span> <span style="font-family: Arial, sans-serif; font-size: ${titleSize}px; color: ${titleColor};">${title}</span>` : ''}
                </td>
              </tr>
              ${company ? `<tr><td style="font-family: Arial, sans-serif; font-size: ${companySize}px; color: ${companyColor}; padding-bottom: 10px;">${company}</td></tr>` : ""}
              ${officePhone ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding: 2px 0;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${phoneIcon}" alt="" style="width:100%; height:100%; display:block;"></span><a href="tel:${officePhone}" style="color: ${contactInfoColor}; text-decoration: none;">${officePhone}</a></td></tr>` : ""}
              ${cellPhone ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding: 2px 0;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${cellIcon}" alt="" style="width:100%; height:100%; display:block;"></span><a href="tel:${cellPhone}" style="color: ${contactInfoColor}; text-decoration: none;">${cellPhone}</a></td></tr>` : ""}
              ${email ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; padding: 2px 0;"><a href="mailto:${email}" style="color: ${contactInfoColor}; text-decoration: none;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${emailIcon}" alt="" style="width:100%; height:100%; display:block;"></span>${email}</a></td></tr>` : ""}
              ${website ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; padding: 2px 0;"><a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${contactInfoColor}; text-decoration: none;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${websiteIcon}" alt="" style="width:100%; height:100%; display:block;"></span>${website}</a></td></tr>` : ""}
              ${address ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${Math.round(contactInfoSize * 0.9)}px; color: ${contactInfoColor}; opacity: 0.8; padding: 2px 0;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${locationIcon}" alt="" style="width:100%; height:100%; display:block;"></span>${address}</td></tr>` : ""}
              ${customFieldsHTML}
              ${socialIconsHTML ? `<tr><td style="padding-top: 10px;">${socialIconsHTML}</td></tr>` : ""}
            </table>
          </td>
        </tr>
        ${
          companyLogo || showCTA
            ? `
        <tr>
          <td colspan="2" style="padding-top: 20px; border-top: 1px solid #e0e0e0; margin-top: 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                ${companyLogo ? `<td style="vertical-align: middle;"><img src="${companyLogo}" alt="Company Logo" style="max-height: 50px; display: block;"></td>` : ""}
                ${
                  showCTA && ctaUrl
                    ? `
                <td style="text-align: right; vertical-align: middle;">
                  <a href="${ctaUrl}" style="background-color: ${primaryColor}; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">${ctaText}</a>
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

  const generatePremiumSignature = (): string => {
    const baseUrl = window.location.origin;
    const phoneIcon = `${baseUrl}/signature/phone.png`;
    const emailIcon = `${baseUrl}/signature/email.png`;
    const websiteIcon = `${baseUrl}/signature/website.png`;
    const cellIcon = `${baseUrl}/signature/cell.png`;
    const locationIcon = `${baseUrl}/signature/location.png`;
    const ecardIcon = `${baseUrl}/signature/ecard.png`;

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
      nameSize,
      nameColor,
      titleSize,
      titleColor,
      companySize,
      companyColor,
      contactFont,
      contactInfoSize,
      contactInfoColor,
      contactIconSize,
      contactIconColor,
    } = signatureData;

    const socialIconsHTML = socialLinks
      .map((link) => {
        const iconSVG = getSocialIconSVG(link.platform);
        return `<a href="${link.url}" style="display:inline-block;margin:0 6px;"><img src="${iconSVG}" alt="${link.platform}" width="${contactIconSize + 16}" height="${contactIconSize + 16}" style="border:0;display:block;border-radius:50%;"></a>`;
      })
      .join("");

    const customFieldsHTML = customFields
      .filter((f) => f.label && f.value)
      .map((field) => {
        return `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding: 2px 0; font-weight: 500;">${field.label}: ${field.value}</td></tr>`;
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
          <td style="padding-right: 25px; vertical-align: middle; width: 140px;">
            <img src="${profilePhoto}" alt="${name}" width="140" height="140" style="border-radius: 50%; display: block; border: 5px solid ${primaryColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          </td>
          `
              : ""
          }
          <td style="vertical-align: top;">
            <table cellpadding="0" cellspacing="0" border="0">
              ${signatureName ? `<tr><td style="font-family: '${signatureFont}', cursive; font-size: ${signatureSize}px; color: ${signatureColor}; padding-bottom: 2px;">${signatureName}</td></tr>` : ""}
              <tr>
                <td style="font-family: Arial, sans-serif; font-size: ${nameSize}px; font-weight: bold; color: ${nameColor}; padding-bottom: 3px;">
                  ${name}${title ? ` <span style="color: ${nameColor}; opacity: 0.7; margin: 0 8px;">|</span> <span style="font-family: Arial, sans-serif; font-size: ${titleSize}px; color: ${titleColor}; font-weight: 600;">${title}</span>` : ''}
                </td>
              </tr>
              ${company ? `<tr><td style="font-family: Arial, sans-serif; font-size: ${companySize}px; color: ${companyColor}; padding-bottom: 15px;">${company}</td></tr>` : ""}
              <tr><td style="height: 2px; background-color: ${primaryColor}; margin: 10px 0;"></td></tr>
              ${officePhone ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding: 2px 0;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${phoneIcon}" alt="" style="width:100%; height:100%; display:block;"></span><a href="tel:${officePhone}" style="color: ${contactInfoColor}; text-decoration: none; font-weight: 500;">${officePhone}</a></td></tr>` : ""}
              ${cellPhone ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding: 2px 0;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${cellIcon}" alt="" style="width:100%; height:100%; display:block;"></span><a href="tel:${cellPhone}" style="color: ${contactInfoColor}; text-decoration: none; font-weight: 500;">${cellPhone}</a></td></tr>` : ""}
              ${email ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; padding: 2px 0;"><a href="mailto:${email}" style="color: ${contactInfoColor}; text-decoration: none; font-weight: 500;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${emailIcon}" alt="" style="width:100%; height:100%; display:block;"></span>${email}</a></td></tr>` : ""}
              ${website ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; padding: 2px 0;"><a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${contactInfoColor}; text-decoration: none; font-weight: 500;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${websiteIcon}" alt="" style="width:100%; height:100%; display:block;"></span>${website}</a></td></tr>` : ""}
              ${address ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${Math.round(contactInfoSize * 0.9)}px; color: ${contactInfoColor}; opacity: 0.8; padding: 2px 0;"><span style="display:inline-block; width:${contactIconSize}px; height:${contactIconSize}px; background-color:${contactIconColor}; margin-right:8px; vertical-align:middle; position:relative;"><img src="${locationIcon}" alt="" style="width:100%; height:100%; display:block;"></span>${address}</td></tr>` : ""}
              ${customFieldsHTML}
              ${socialIconsHTML ? `<tr><td style="padding-top: 15px;">${socialIconsHTML}</td></tr>` : ""}
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
                ${companyLogo ? `<td style="vertical-align: middle; width: 50%;"><img src="${companyLogo}" alt="Company Logo" style="max-height: 60px; display: block;"></td>` : ""}
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

  const getSocialIconSVG = (platform: string): string => {
    const icons: Record<string, string> = {
      facebook:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iIzE4NzdGMiIgZD0iTTI0IDEyYzAtNi42MjctNS4zNzMtMTItMTItMTJTMCA1LjM3MyAwIDEyczUuMzczIDEyIDEyIDEyIDEyLTUuMzczIDEyLTEyeiIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xMy41IDIxdi03LjVoMi41bC4zNzUtM0gxMy41VjguNWMwLS44MzMuMTktMS41IDEuNS0xLjVoMS41VjRzLTEuMzUtLjI1LTIuNS0uMjVjLTIuNTUgMC00LjUgMS43NS00LjUgNS4yNXYyLjI1SDd2M2gyLjV2Ny41eiIvPjwvc3ZnPg==",
      linkedin:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iIzAwNzdCNSIgZD0iTTIwLjQ0NyAyMC40NTJoLTMuNTU0di01LjU2OWMwLTEuMzI4LS4wMjctMy4wMzctMS44NTItMy4wMzctMS44NTMgMC0yLjEzNiAxLjQ0NS0yLjEzNiAyLjkzOXY1LjY2N0g5LjM1MVY5aDMuNDE0djEuNTYxaC4wNDZjLjQ3Ny0uOSAxLjYzNy0xLjg1IDMuMzctMS44NSAzLjYwMSAwIDQuMjY3IDIuMzcgNC4yNjcgNS40NTV2Ni4yODZ6TTUuMzM3IDcuNDMzYTIuMDYyIDIuMDYyIDAgMCAxLTIuMDYzLTIuMDY1IDIuMDY0IDIuMDY0IDAgMSAxIDIuMDYzIDIuMDY1em0xLjc4MiAxMy4wMTlIMy41NTVWOWgzLjU2NHYxMS40NTJ6TTIyLjIyNSAwSC4yNjRDLS4xMTcgMC0uNS4zODMtLjUuODV2MjIuM2MwIC40NjYuMzgzLjg1Ljg1Ljg1aDIxLjk2Yy40NjcgMCAuODUtLjM4NC44NS0uODVWLjg1Yy4wMDEtLjQ2Ny0uMzgyLS44NS0uODQ5LS44NWwtLjAwMS0uMDAxeiIvPjwvc3ZnPg==",
      instagram:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iLjUiIHgyPSIuNSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2Y1OGUyOSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2M4MzNhYiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0xMiAyLjE2M2MzLjIwNCAwIDMuNTg0LjAxMiA0Ljg1LjA3IDMuMjUyLjE0OCA0Ljc3MSAxLjY5MSA0LjkxOSA0LjkxOS4wNTggMS4yNjUuMDY5IDEuNjQ1LjA2OSA0Ljg0OXMtLjAxMiAzLjU4NC0uMDY5IDQuODQ5Yy0uMTQ5IDMuMjI1LTEuNjY0IDQuNzcxLTQuOTE5IDQuOTE5LTEuMjY2LjA1OC0xLjY0NC4wNy00Ljg1LjA3cy0zLjU4NC0uMDEyLTQuODQ5LS4wN2MtMy4yNi0uMTQ5LTQuNzcxLTEuNjk5LTQuOTE5LTQuOTItLjA1OC0xLjI2NS0uMDctMS42NDQtLjA3LTQuODQ5czAxMi0zLjU4NC4wMTItNC44NDljLjE0OS0zLjIyNyAxLjY2NC00Ljc3MSA0LjkxOS00LjkxOSAxLjI2Ni0uMDU3IDEuNjQ1LS4wNjkgNC44NS0uMDY5TTEyIDBDOC43NDEgMCA4LjMzMy4wMTQgNy4wNTMuMDcyIDIuNjk1LjI3Mi40IDIuNjk2LjA3MyA3LjA1Mi4wMTQgOC4zMzMgMCA4Ljc0MSAwIDEyczAxNC44LjMzMyA0LjA0Ny4wNzIgNS4zNTggMiA3LjMwNCA3LjA1MyAyMy45MjggMjMuNjg2IDIxLjkyNyA3LjA1IDIzLjk4NiA4LjMzMyAyNCAxMnMtLjAxNCAzLjY2Ny0uMDcyIDQuOTQ3Yy0uMjAyIDQuMzU4LTIuMzA4IDYuNjU2LTYuNTY4IDYuOTI3QzE1LjY2NyAyMy45ODYgMTUuMjU5IDI0IDEyIDI0cy0zLjY2Ny0uMDE0LTQuOTQ3LS4wNzJjLTQuMjU0LS4yNzItNi4zNzMtMi41ODYtNi41NjgtNi45MjctLjA1OS0xLjI4LS4wNzMtMS42ODgtLjA3My00Ljk0N3MuMDE0LTMuNjY3LjA3Mi00Ljk0N0MuMjc0IDIuNjg2IDIuNDIgLjM1IDYuODkxLjA3MyA4LjMzMy4wMTQgOC43NDEgMCAxMiAwem0wIDUuODM4YTYuMTYyIDYuMTYyIDAgMSAwIDAgMTIuMzI0IDYuMTYyIDYuMTYyIDAgMCAwIDAtMTIuMzI0ek0xMiAxNmE0IDQgMCAxIDEgMC04IDQgNCAwIDAgMSAwIDh6bTYuNDA2LTExLjg0NWExLjQ0IDEuNDQgMCAxIDAgMCAyLjg4MSAxLjQ0IDEuNDQgMCAwIDAgMC0yLjg4MXoiLz48L3N2Zz4=",
      twitter:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTIzLjk1MyA0LjU3YTEwIDEwIDAgMCAxLTIuODI1Ljc3NSA0LjkyOCA0LjkyOCAwIDAgMCAyLjE2My0yLjcyM2MtLjk1MS41NTUtMi4wMDUuOTU5LTMuMTI3IDEuMTg0YTQuOTIgNC45MiAwIDAgMC04LjM4NCA0LjQ4MkM3LjY5IDguMDk1IDQuMDY3IDYuMTMgMS42NCAzLjE2MmE0LjgyMiA0LjgyMiAwIDAgMC0uNjY2IDIuNDc1YzAgMS43MS44NyAzLjIxMyAyLjE4OCA0LjA5NmE0LjkwNCA0LjkwNCAwIDAgMS0yLjIyOC0uNjE2di4wNmE0LjkyMyA0LjkyMyAwIDAgMCAzLjk0NiA0LjgyNyA0Ljk5NiA0Ljk5NiAwIDAgMS0yLjIxMi4wODUgNC45MzYgNC45MzYgMCAwIDAgNC42MDQgMy40MTcgOS44NjcgOS44NjcgMCAwIDEtNi4xMDIgMi4xMDVjLS4zOSAwLS43NzktLjAyMy0xLjE3LS4wNjdhMTMuOTk1IDEzLjk5NSAwIDAgMCA3LjU1NyAyLjIwOWM5LjA1MyAwIDE0LjAwMi03LjQ5NiAxNC4wMDItMTMuOTg2IDAtLjIxIDAtLjQyMy0uMDE1LS42MzRhMTAuMDI1IDEwLjAyNSAwIDAgMCAyLjQ1Ny0yLjU0OXoiLz48L3N2Zz4=",
      youtube:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iI0ZGMDAwMCIgZD0iTTIzLjQ5OCA2LjE4NmEzLjAxNiAzLjAxNiAwIDAgMC0yLjEyMi0yLjEzNkMxOS41MDUgMy41NDUgMTIgMy41NDUgMTIgMy41NDVzLTcuNTA1IDAtOS4zNzcuNTA1QTMuMDE3IDMuMDE3IDAgMCAwIC41MDIgNi4xODZDMCA4LjA3IDAgMTIgMCAxMnMwIDMuOTMuNTAyIDUuODE0YTMuMDE2IDMuMDE2IDAgMCAwIDIuMTIyIDIuMTM2YzEuODcxLjUwNSA5LjM3Ni41MDUgOS4zNzYuNTA1czcuNTA1IDAgOS4zNzctLjUwNWEzLjAxNSAzLjAxNSAwIDAgMCAyLjEyMi0yLjEzNkMyNCAzNS45MyAyNCAxMiAyNCAxMnMwLTMuOTMtLjUwMi01LjgxNHpNOS41NDUgMTUuNTY4VjguNDMybDYuMjczIDMuNTY4LTYuMjczIDMuNTY4eiIvPjwvc3ZnPg==",
      tiktok:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTEyLjUyNS4wMmMxLjMxLS4wMiAyLjYxLS4wMSAzLjkxLS4wMiAxLjEyIDEuNjQgMi4zNiAzLjQzIDQuNzcgMy43NXY0LjIzYy0xLjU3LS4xLTMuMDgtLjY4LTQuNDItMS40Mi0uMjggNC42MiAwIDkuMjYtLjAyIDEzLjg4LS4yOCA0LjM1LTQuNjggNy44Ni05LjAzIDcuNTYtNC4xOS4zNS04LjgtMy40NS04LjQ2LTcuOTMtLjAxLTQuNDIgNC4wOS04LjA3IDguNDktNy43NnYtNC40M2MtNS4xOS0uNzQtMTAuMjcgMy43Ni0xMC40NSA5LjQtLjIgNy43MSA1LjYgMTQuNjMgMTMuMDggMTQuNzcgNy43NS44NSAxNS4zOC01LjM4IDE1Ljg0LTEzLjUuOTYtNi43LjAzLTEzLjQzLjAzLTIwLjE1LjMxLS4wMS43MS0uMDMgMS4wMi0uMDNsMC0uMDF6Ii8+PC9zdmc+",
      whatsapp:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iIzI1RDM2NiIgZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzczIDAgMTJzNS4zNzMgMTIgMTIgMTIgMTItNS4zNzMgMTItMTJTMTguNjI3IDAgMTIgMHptNS44OTQgMTcuNzU0YTYuNyA2LjcgMCAwIDEtNC40MjEgMi4xMTNjLS45MjcuMTEzLTEuODQ3LS4wMDYtMi43MTctLjMyNS0yLjY0LTEuMDA1LTUuMDE0LTMuMjY3LTYuMDE2LTUuOTA3LS4zMzItLjkyNS0uNDUyLTEuOTIxLS40NTItMi45MjMgMC0yLjAxNS45MzItMy45MjEgMi41NDItNS4zMDMuNjU0LS41NjEgMS42MzQtLjkxOCAyLjY5My0uOTYuMjA5LS4wMDguNDE3LjAwNS42MjYuMDM2LjQ5LjA3Ny43NTYuNDI1Ljk0Ni44NzIuMzIzLjc2Ni43NTEgMS41MDUuOTc3IDIuMzA3LjA3Mi4yNjMuMDQ0LjUzLS4wNzIuNzctLjMyNi42NzQtLjg3NCAxLjI0OC0xLjI1OCAxLjkyOS0uMTIuMjEzLS4wNjQuNDc1LjA4Ni42NzguNDIxLjU2OC45NjcgMS4wMjIgMS41MDkgMS40NzMuODc0LjcyIDEuODggMS4yOTcgMy4wNDYgMS41NzguMjg1LjA2OS41NzcuMDQ4Ljg0Ny0uMDc3LjM3Mi0uMTczLjY4OS0uNDM5Ljk4Ni0uNzI0LjQ0My0uNDI1Ljg1OC0uOTM2IDEuNDQ1LTEuMTcuMjE4LS4wODYuNDYzLS4wNy42OTcuMDI5LjkzNC4zOTYgMS44NzIuNzg4IDIuODA3IDEuMTg0LjI5Ny4xMjYuNjA4LjI2LjgzNy41MjkuMTk2LjIzMi4zMDguNTIuMzY5LjgxMS4wNzcuMzY4LjA1OS43NC0uMDI4IDEuMTA0LS40MTggMS43NDItMS45NDQgMy4xMTEtMy42NzIgMy42MzF6Ii8+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTE3LjQ4IDE0LjkzNGMtLjI5Mi0uMTUtMS43My0uODU4LTIuMDA0LS45NTQtLjI3My0uMDk3LS40NzMtLjE0NS0uNjczLjE0NS0uMi4yODktLjc3NS45NjQtLjk1IDEuMTYyLS4xNzUuMTk3LS4zNS4yMjItLjY0Mi4wNzMtLjI5MS0uMTUtMS4yMjgtLjQ1NC0yLjMzOC0xLjQ0NS0uODY0LS43NzMtMS40NDgtMS43MzEtMS42MTYtMi4wMi0uMTY5LS4yOS0uMDE4LS40NDYuMTI4LS41OS4xMzEtLjEzLjI5Mi0uMzM5LjQzOC0uNTA5LjE0NS0uMTY5LjE5NC0uMjkuMjkxLS40ODYuMDk3LS4xOTcuMDQ5LS4zNjgtLjAyNC0uNTA5LS4wNzMtLjE0NS0uNjczLTEuNjI0LS45MjEtMi4yMjctLjI0Mi0uNTktLjQ4OC0uNTA5LS42NzMtLjUxOC0uMTc0LS4wMDgtLjM3My0uMDEtLjU3My0uMDEtLjIgMC0uNTI1LjA3My0uOC4zNjgtLjI3NS4yOS0xLjA0OCAxLjAyNC0xLjA0OCAyLjUwMiAwIDEuNDc3IDEuMDczIDIuOTA0IDEuMjIxIDMuMTAyLjE0NS4xOTcgMi4xMDMgMy4yMTkgNS4xMDEgNC41MTIuNzEzLjMwOCAxLjI2OS40OTMgMS43MDIuNjMuNzE1LjIyNyAxLjM2Ni4xOTUgMS44ODEuMTE4LjU3NC0uMDg1IDEuNzcyLS43MjUgMi4wMjEtMS40MjYuMjUxLS43MDEuMjUxLTEuMzAyLjE3Ni0xLjQyNi0uMDczLS4xMjItLjI3My0uMTk2LS41NzMtLjM0Nm0tNS40ODEgNy41NTdoLS4wMDRhOC45NDcgOC45NDcgMCAwIDEtNC41NjQtMS4yNDhsLS4zMjctLjE5NC0zLjM5My44OSA5MDUuMzg5LTMuMzM2LS4yMTMtLjMzOGE4LjkxIDguOTEgMCAwIDEtMS4zNjUtNC42ODZBNC45MiA4LjkyIDAgMCAxIDEyIDMuMTExYTguOTI4IDguOTI4IDAgMCAxIDcuNTQ4IDQuMDY1IDguOTQzIDguOTQzIDAgMCAxIDEuMzQgNC43MTdjLS4wMDEgNC45MzQtNC4wMSA4Ljk0My04LjkxNyA4Ljk0M3oiLz48L3N2Zz4=",
      pinterest:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iI0UwMTIxQiIgZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzcyIDAgMTJjMCAzLjA3NiAxLjE1OCA1Ljg4MyAzLjA2IDguMDA3LS4wMy0uNDg4LS4wMDYtMS4wNzQuMTExLTEuNjA1LjEyOC0uNTguNzgyLTMuMzEyLjc4Mi0zLjMxMnMtLjIwNC0uNDA4LS4yMDQtMS4wMTJjMC0uOTQ4LjU1LTEuNjU2IDEuMjMyLTEuNjU2LjU4MSAwIDEuMDg4LjQzNiAxLjA4OCAxLjE2IDAgLjcwNS0uNDQ4IDEuNzYtLjY4IDIuNzM0LS4xOTQuODIxLjQxMSAxLjQ5MiAxLjIyIDEuNDkyIDEuNDY0IDAgMi41OTItMS41NDQgMi41OTItMy43NzIgMC0xLjk3Mi0xLjQxNy0zLjM0OC0zLjQ0LTMuMzQ4LTIuMzQ0IDAtMy43MiAxLjc1Ni0zLjcyIDMuNTcgMCAuNzA3LjI3MiAxLjQ2NS42MTIgMS44NzguMDY3LjA4MS4wNzcuMTUyLjA1Ni4yMzUtLjA2MS4yNTQtLjE5Ni44MDEtLjIyMy45MTctLjAzNS4xNTItLjExNi4xODQtLjI2OC4xMTEtMSAwLS40NjUtMS42MjUtMS40NjUtMy42NDMgMC0yLjU5NSAxLjg4NC01LjAxNiA1LjYwOS01LjAxNiAyLjk0IDAgNS4yMjggMi4wOTYgNS4yMjggNC44OTIgMCAyLjkxNi0xLjgzOCA1LjI2MS00LjM5IDUuMjYxLS44NTcgMC0xLjY2NC0uNDQ1LTEuOTQtLjk3MWwtLjUyOCAxLjk5OGMtLjE5LjczNS0uNzA2IDEuNjU1LTEuMDUgMi4yMTcuNzkuMjQ0IDEuNjI5LjM3NiAyLjQ5OC4zNzYgNC42MjcgMCA4LjM3Ny0zLjc1IDguMzc3LTguMzc3QzIwLjM3NyAzLjc1IDE2LjYyNyAwIDEyIDB6Ii8+PC9zdmc+",
      github:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTEyIDBjLTYuNjI2IDAtMTIgNS4zNzMtMTIgMTIgMCA1LjMwMiAzLjQzOCA5LjggOC4yMDcgMTEuMzg3LjU5OS4xMTEuNzkzLS4yNjEuNzkzLS41Nzd2LTIuMjM0Yy0zLjMzOC43MjYtNC4wMzMtMS40MTYtNC4wMzMtMS40MTYtLjU0Ni0xLjM4Ny0xLjMzMy0xLjc1Ni0xLjMzMy0xLjc1Ni0xLjA4OS0uNzQ1LjA4My0uNzI5LjA4My0uNzI5IDEuMjA1LjA4NCAxLjgzOSAxLjIzNyAxLjgzOSAxLjIzNyAxLjA3IDEuODM0IDIuODA3IDEuMzA0IDMuNDkyLjk5Ny4xMDctLjc3NS40MTgtMS4zMDUuNzYyLTEuNjA0LTIuNjY1LS4zMDUtNS40NjctMS4zMzQtNS40NjctNS45MzEgMC0xLjMxMS40NjktMi4zODEgMS4yMzYtMy4yMjEtLjEyNC0uMzAzLS41MzUtMS41MjQuMTE3LTMuMTc2IDAgMCAxLjAwOC0uMzIyIDMuMzAxIDEuMjNBMTEuNTA5IDExLjUwOSAwIDAgMSAxMiA1Ljg4M2MxLjAyLjAwNSAyLjA0Ny4xMzggMy4wMDYuNDA0IDIuMjkxLTEuNTUyIDMuMjk3LTEuMjMgMy4yOTctMS4yMy42NTMgMS42NTMuMjQyIDIuODc0LjExOCAzLjE3Ni43NzcuODQgMS4yMzUgMS45MTEgMS4yMzUgMy4yMjEgMCA0LjYwOS0yLjgwNyA1LjYyNC01LjQ3OSA1LjkyMS40My4zNzIuODIzIDEuMTAyLjgyMyAyLjIyMnYzLjI5M2MwIC4zMTkuMTkyLjY5NC44MDEuNTc2QzIwLjU2NiAyMS43OTcgMjQgMTcuMyAyNCAxMmMwLTYuNjI3LTUuMzczLTEyLTEyLTEyeiIvPjwvc3ZnPg==",
    };
    return icons[platform] || icons.facebook;
  };

  const generateSignatureHTML = (): string => {
    return generatePremiumSignature();
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
            <CardContent className="p-3">
              <div className="relative">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevTemplate}
                    className="z-10 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 w-8 h-8"
                    data-testid="btn-carousel-prev"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex-1 flex gap-2 overflow-hidden">
                    {templates.map((template, index) => (
                      <div
                        key={template.id}
                        onClick={() => selectTemplate(index)}
                        className={`flex-shrink-0 w-1/3 cursor-pointer transition-all ${
                          index === carouselIndex ? "scale-100" : "scale-75 opacity-50"
                        }`}
                        data-testid={`template-card-${template.id}`}
                      >
                        <div
                          className={`border-2 rounded-lg overflow-hidden shadow-md transition-all ${
                            index === carouselIndex
                              ? "border-blue-500 dark:border-blue-400"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center p-1">
                            <div className="text-center text-xs">
                              <div className="font-bold text-slate-600 dark:text-slate-300 text-xs">
                                {template.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextTemplate}
                    className="z-10 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 w-8 h-8"
                    data-testid="btn-carousel-next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-center mt-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
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
                    <div className="space-y-2">
                      {signatureData.customFields.map((field, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-2 gap-2 items-center"
                        >
                          <Input
                            value={field.label}
                            onChange={(e) =>
                              updateCustomField(index, "label", e.target.value)
                            }
                            placeholder="Label (e.g., LinkedIn)"
                            data-testid={`input-custom-field-label-${index}`}
                          />
                          <div className="flex gap-2">
                            <Input
                              value={field.value}
                              onChange={(e) =>
                                updateCustomField(
                                  index,
                                  "value",
                                  e.target.value,
                                )
                              }
                              placeholder="Value"
                              data-testid={`input-custom-field-value-${index}`}
                            />
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

            {/* Images */}
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader
                className="cursor-pointer py-2 px-3"
                onClick={() => toggleSection("imagesSection")}
                data-testid="toggle-images-section"
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    Images
                  </CardTitle>
                  {collapsedSections.imagesSection ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {!collapsedSections.imagesSection && (
                  <>
                <div className="space-y-1">
                  <Label htmlFor="profilePhoto" className="text-xs">Profile Photo</Label>
                  <Input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleImageUpload("profilePhoto", e.target.files[0])
                    }
                    data-testid="input-profile-photo"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="companyLogo" className="text-xs">Company Logo</Label>
                  <Input
                    id="companyLogo"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleImageUpload("companyLogo", e.target.files[0])
                    }
                    data-testid="input-company-logo"
                  />
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
                  <div key={index} className="flex gap-2">
                    <Select
                      value={link.platform}
                      onValueChange={(v) =>
                        updateSocialLink(index, "platform", v)
                      }
                    >
                      <SelectTrigger
                        className="w-40"
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
                      className="flex-1"
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

          <div className="space-y-4">
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 sticky top-4">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  This is how your signature will look
                </p>
                <div
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white min-h-[160px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }}
                  data-testid="signature-preview"
                />

                <div className="flex gap-1.5 mt-2">
                  <Button
                    onClick={copyToClipboard}
                    className="flex-1 gap-1 h-8 text-xs"
                    size="sm"
                    data-testid="button-copy"
                  >
                    <Copy className="w-3 h-3" />
                    Copy HTML
                  </Button>
                  <Button
                    onClick={downloadHTML}
                    variant="outline"
                    className="flex-1 gap-1 h-8 text-xs"
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
                  className="w-full mt-1.5 gap-1 h-8 text-xs"
                  size="sm"
                  data-testid="button-preview-email"
                >
                  <Mail className="w-3 h-3" />
                  Preview in Email
                </Button>

                {/* Platform-Specific Instructions */}
                {platformInstructions[selectedPlatform] && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mt-2">
                    <div className="flex items-start gap-1.5">
                      <Info className="w-3 h-3 text-blue-900 dark:text-blue-300 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                          How to use
                        </h3>
                        <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-0.5 list-decimal list-inside">
                          {platformInstructions[selectedPlatform].steps.map((step, idx) => (
                            <li key={idx} className="text-xs">{step}</li>
                          ))}
                        </ol>
                        <div className="mt-1.5 pt-1.5 border-t border-blue-200 dark:border-blue-700">
                          <p className="text-xs text-blue-800 dark:text-blue-200"><strong>Setup Location:</strong> {platformInstructions[selectedPlatform].location}</p>
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
