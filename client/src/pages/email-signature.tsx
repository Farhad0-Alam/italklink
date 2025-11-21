import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Copy,
  Download,
  Mail,
  X,
  Plus,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Link, useLocation } from "wouter";
import { SiFacebook, SiLinkedin, SiInstagram, SiX, SiYoutube, SiTiktok, SiWhatsapp, SiPinterest, SiGithub } from "react-icons/si";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SignatureData {
  id?: string;
  signatureName: string;
  fullName: string;
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
  socialLinks: { platform: string; url: string }[];
  showDisclaimer: boolean;
  disclaimerText: string;
  showCTA: boolean;
  ctaText: string;
  ctaUrl: string;
  showBanner: boolean;
  bannerText: string;
  platform: string;
  templateVariant: string;
}

const signatureFonts = ["Alex Brush", "Dancing Script", "Great Vibes", "Allura", "Sacramento", "Parisienne", "Mr De Haviland"];
const professionalFonts = ["Arial", "Georgia", "Verdana", "Tahoma", "Times New Roman", "Roboto", "Open Sans", "Lato"];

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

const TEMPLATES = [
  { id: "minimal", name: "Minimal", variant: "minimal" },
  { id: "standard", name: "Standard", variant: "standard" },
  { id: "professional", name: "Professional", variant: "professional" },
  { id: "advanced", name: "Advanced", variant: "advanced" },
  { id: "minimal-modern", name: "Minimal Modern", variant: "minimal_modern" },
  { id: "corporate", name: "Corporate", variant: "corporate" },
  { id: "creative", name: "Creative", variant: "creative" },
  { id: "minimal-clean", name: "Minimal Clean", variant: "minimal_clean" },
  { id: "full-featured", name: "Full Featured", variant: "full" },
];

const defaultSignatureData: SignatureData = {
  signatureName: "John Doe",
  fullName: "John Doe",
  title: "Senior Marketing Manager",
  company: "Acme Corporation",
  cellPhone: "+1 (555) 123-4567",
  officePhone: "+1 (555) 987-6543",
  email: "john.doe@acme.com",
  website: "www.acme.com",
  address: "123 Business Ave, Suite 100, New York, NY 10001",
  customFields: [],
  profilePhoto: "https://ui-avatars.com/api/?name=John+Doe&size=200&background=FF6A00&color=fff&bold=true",
  companyLogo: "https://via.placeholder.com/200x80/FF6A00/FFFFFF?text=ACME",
  primaryColor: "#FF6A00",
  secondaryColor: "#333333",
  signatureFont: "Alex Brush",
  signatureSize: 32,
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
    { platform: "linkedin", url: "https://linkedin.com/in/johndoe" },
    { platform: "twitter", url: "https://twitter.com/johndoe" },
    { platform: "facebook", url: "https://facebook.com/johndoe" },
  ],
  showDisclaimer: false,
  disclaimerText: "This email and any attachments are confidential and intended solely for the recipient.",
  showCTA: false,
  ctaText: "Book a Consultation",
  ctaUrl: "",
  showBanner: false,
  bannerText: "Get in touch today!",
  platform: "outlook",
  templateVariant: "standard",
};

export default function EmailSignature() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [signatureData, setSignatureData] = useState<SignatureData>(defaultSignatureData);
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    signatureSection: true,
    nameSection: true,
    contactSection: true,
    imagesSection: true,
    socialLinksSection: true,
    optionalFeaturesSection: true,
  });
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Fetch signatures
  const { data: signatures = [] } = useQuery({
    queryKey: ['/api/email-signatures'],
    staleTime: 0,
  });

  // Save signature mutation
  const saveMutation = useMutation({
    mutationFn: async (data: SignatureData) => {
      return apiRequest(data.id ? `/api/email-signatures/${data.id}` : '/api/email-signatures', {
        method: data.id ? 'PATCH' : 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-signatures'] });
      toast({ title: "Success", description: "Signature saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save signature" });
    },
  });

  // Delete signature mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/email-signatures/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-signatures'] });
      toast({ title: "Success", description: "Signature deleted" });
    },
  });

  const toggleSection = (k: string) => setCollapsedSections((p) => ({ ...p, [k]: !p[k] }));
  const updateField = (field: keyof SignatureData, value: any) => {
    setSignatureData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field: "profilePhoto" | "companyLogo", file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => updateField(field, reader.result as string);
    reader.readAsDataURL(file);
  };

  const addSocialLink = () => {
    setSignatureData((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "facebook", url: "" }],
    }));
  };

  const removeSocialLink = (index: number) => {
    setSignatureData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const updateSocialLink = (index: number, field: "platform" | "url", value: string) => {
    setSignatureData((prev) => {
      const newLinks = [...prev.socialLinks];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, socialLinks: newLinks };
    });
  };

  const nextTemplate = () => {
    setCarouselIndex((prev) => (prev + 1) % TEMPLATES.length);
    setSignatureData((p) => ({ ...p, templateVariant: TEMPLATES[(carouselIndex + 1) % TEMPLATES.length].variant }));
  };

  const prevTemplate = () => {
    setCarouselIndex((prev) => (prev - 1 + TEMPLATES.length) % TEMPLATES.length);
    setSignatureData((p) => ({ ...p, templateVariant: TEMPLATES[(carouselIndex - 1 + TEMPLATES.length) % TEMPLATES.length].variant }));
  };

  const selectTemplate = (index: number) => {
    setCarouselIndex(index);
    setSignatureData((p) => ({ ...p, templateVariant: TEMPLATES[index].variant }));
  };

  const generateSignatureHTML = (): string => {
    const { signatureName, fullName, title, company, cellPhone, officePhone, email, website, address, profilePhoto, companyLogo, primaryColor, secondaryColor, socialLinks, showCTA, ctaText, ctaUrl, showBanner, bannerText, signatureFont, signatureSize, signatureColor, nameSize, nameColor, titleSize, titleColor, companySize, companyColor, contactFont, contactInfoSize, contactInfoColor, contactIconSize, contactIconColor } = signatureData;

    const socialIconsHTML = socialLinks.map((link) => {
      const iconSVG = getSocialIconSVG(link.platform);
      return `<a href="${link.url}" style="display:inline-block;margin:0 6px;"><img src="${iconSVG}" alt="${link.platform}" width="${contactIconSize + 12}" height="${contactIconSize + 12}" style="border:0;display:block;border-radius:50%;"></a>`;
    }).join("");

    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width: 700px; margin: 0; padding: 0; background-color: #f9f9f9;">
  ${showBanner ? `<tr><td style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: #ffffff; text-align: center; padding: 15px; font-size: 16px; font-weight: bold;">${bannerText}</td></tr>` : ""}
  <tr><td style="background-color: #ffffff; padding: 25px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        ${profilePhoto ? `<td style="padding-right: 25px; vertical-align: middle; width: 140px;"><img src="${profilePhoto}" alt="${fullName}" width="140" height="140" style="border-radius: 50%; display: block; border: 5px solid ${primaryColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.1);"></td>` : ""}
        <td style="vertical-align: top;">
          <table cellpadding="0" cellspacing="0" border="0">
            ${signatureName ? `<tr><td style="font-family: '${signatureFont}', cursive; font-size: ${signatureSize}px; color: ${signatureColor}; padding-bottom: 2px;">${signatureName}</td></tr>` : ""}
            <tr><td style="font-family: Arial, sans-serif; font-size: ${nameSize}px; font-weight: bold; color: ${nameColor}; padding-bottom: 3px;">${fullName}${title ? ` <span style="color: ${nameColor}; opacity: 0.7; margin: 0 8px;">|</span> <span style="font-size: ${titleSize}px; color: ${titleColor}; font-weight: 600;">${title}</span>` : ""}</td></tr>
            ${company ? `<tr><td style="font-family: Arial, sans-serif; font-size: ${companySize}px; color: ${companyColor}; padding-bottom: 15px;">${company}</td></tr>` : ""}
            <tr><td style="height: 2px; background-color: ${primaryColor}; margin: 10px 0;"></td></tr>
            ${cellPhone ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding: 2px 0;"><strong>📱</strong> <a href="tel:${cellPhone}" style="color: ${contactInfoColor}; text-decoration: none;">${cellPhone}</a></td></tr>` : ""}
            ${officePhone ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; color: ${contactInfoColor}; padding: 2px 0;"><strong>☎️</strong> <a href="tel:${officePhone}" style="color: ${contactInfoColor}; text-decoration: none;">${officePhone}</a></td></tr>` : ""}
            ${email ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; padding: 2px 0;"><strong>📧</strong> <a href="mailto:${email}" style="color: ${contactInfoColor}; text-decoration: none;">${email}</a></td></tr>` : ""}
            ${website ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize}px; padding: 2px 0;"><strong>🌐</strong> <a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${contactInfoColor}; text-decoration: none;">${website}</a></td></tr>` : ""}
            ${address ? `<tr><td style="font-family: ${contactFont}, sans-serif; font-size: ${contactInfoSize * 0.9}px; color: ${contactInfoColor}; opacity: 0.8; padding: 2px 0;"><strong>📍</strong> ${address}</td></tr>` : ""}
            ${socialIconsHTML ? `<tr><td style="padding-top: 15px;">${socialIconsHTML}</td></tr>` : ""}
          </table>
        </td>
      </tr>
      ${companyLogo || showCTA ? `<tr><td colspan="2" style="padding-top: 25px; border-top: 2px solid ${primaryColor}; margin-top: 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            ${companyLogo ? `<td style="vertical-align: middle; width: 50%;"><img src="${companyLogo}" alt="Company Logo" style="max-height: 60px; display: block;"></td>` : ""}
            ${showCTA && ctaUrl ? `<td style="text-align: ${companyLogo ? "right" : "center"}; vertical-align: middle;"><a href="${ctaUrl}" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">${ctaText}</a></td>` : ""}
          </tr>
        </table>
      </td></tr>` : ""}
    </table>
  </td></tr>
</table>`.trim();
  };

  const getSocialIconSVG = (platform: string): string => {
    const icons: Record<string, string> = {
      facebook: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iIzE4NzdGMiIgZD0iTTI0IDEyYzAtNi42MjctNS4zNzMtMTItMTItMTJTMCA1LjM3MyAwIDEyczUuMzczIDEyIDEyIDEyIDEyLTUuMzczIDEyLTEyeiIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xMy41IDIxdi03LjVoMi41bC4zNzUtM0gxMy41VjguNWMwLS44MzMuMTktMS41IDEuNS0xLjVoMS41VjRzLTEuMzUtLjI1LTIuNS0uMjVjLTIuNTUgMC00LjUgMS43NS00LjUgNS4yNXYyLjI1SDd2M2gyLjV2Ny41eiIvPjwvc3ZnPg==",
      linkedin: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iIzAwNzdCNSIgZD0iTTIwLjQ0NyAyMC40NTJoLTMuNTU0di01LjU2OWMwLTEuMzI4LS4wMjctMy4wMzctMS44NTItMy4wMzctMS44NTMgMC0yLjEzNiAxLjQ0NS0yLjEzNiAyLjkzOXY1LjY2N0g5LjM1MVY5aDMuNDE0djEuNTYxaC4wNDZjLjQ3Ny0uOSAxLjYzNy0xLjg1IDMuMzctMS44NSAzLjYwMSAwIDQuMjY3IDIuMzcgNC4yNjcgNS40NTV2Ni4yODZ6TTUuMzM3IDcuNDMzYTIuMDYyIDIuMDYyIDAgMCAxLTIuMDYzLTIuMDY1IDIuMDY0IDIuMDY0IDAgMSAxIDIuMDYzIDIuMDY1em0xLjc4MiAxMy4wMTlIMy41NTVWOWgzLjU2NHYxMS40NTJ6TTIyLjIyNSAwSC4yNjRDLS4xMTcgMC0uNS4zODMtLjUuODV2MjIuM2MwIC40NjYuMzgzLjg1Ljg1Ljg1aDIxLjk2Yy40NjcgMCAuODUtLjM4NC44NS0uODVWLjg1Yy4wMDEtLjQ2Ny0uMzgyLS44NS0uODQ5LS44NWwtLjAwMS0uMDAxeiIvPjwvc3ZnPg==",
      instagram: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iLjUiIHgyPSIuNSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2Y1OGUyOSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2M4MzNhYiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0xMiAyLjE2M2MzLjIwNCAwIDMuNTg0LjAxMiA0Ljg1LjA3IDMuMjUyLjE0OCA0Ljc3MSAxLjY5MSA0LjkxOSA0LjkxOS4wNTggMS4yNjUuMDY5IDEuNjQ1LjA2OSA0Ljg0OXMtLjAxMiAzLjU4NC0uMDY5IDQuODQ5Yy0uMTQ5IDMuMjI1LTEuNjY0IDQuNzcxLTQuOTE5IDQuOTE5LTEuMjY2LjA1OC0xLjY0NC4wNy00Ljg1LjA3cy0zLjU4NC0uMDEyLTQuODQ5LS4wN2MtMy4yNi0uMTQ5LTQuNzcxLTEuNjk5LTQuOTE5LTQuOTItLjA1OC0xLjI2NS0uMDctMS42NDQtLjA3LTQuODQ5czAxMi0zLjU4NC4wMTItNC44NDljLjE0OS0zLjIyNyAxLjY2NC00Ljc3MSA0LjkxOS00LjkxOSAxLjI2Ni0uMDU3IDEuNjQ1LS4wNjkgNC44NS0uMDY5TTEyIDBDOC43NDEgMCA4LjMzMy4wMTQgNy4wNTMuMDcyIDIuNjk1LjI3Mi40IDIuNjk2LjA3MyA3LjA1Mi4wMTQgOC4zMzMgMCA4Ljc0MSAwIDEyczAxNC44LjMzMyA0LjA0Ny4wNzIgNS4zNTggMiA3LjMwNCA3LjA1MyAyMy45MjggMjMuNjg2IDIxLjkyNyA3LjA1IDIzLjk4NiA4LjMzMyAyNCAxMnMtLjAxNCAzLjY2Ny0uMDcyIDQuOTQ3Yy0uMjAyIDQuMzU4LTIuMzA4IDYuNjU2LTYuNTY4IDYuOTI3QzE1LjY2NyAyMy45ODYgMTUuMjU5IDI0IDEyIDI0cy0zLjY2Ny0uMDE0LTQuOTQ3LS4wNzJjLTQuMjU0LS4yNzItNi4zNzMtMi41ODYtNi41NjgtNi45MjctLjA1OS0xLjI4LS4wNzMtMS42ODgtLjA3My00Ljk0N3MuMDE0LTMuNjY3LjA3Mi00Ljk0N0MuMjc0IDIuNjg2IDIuNDIuMzUgNi44OTEuMDczIDguMzMzLjAxNCA4Ljc0MSAwIDEyIDB6bTAgNS44MzhhNi4xNjIgNi4xNjIgMCAxIDAgMCAxMi4zMjQgNi4xNjIgNi4xNjIgMCAwIDAgMC0xMi4zMjR6TTEyIDE2YTQgNCAwIDEgMSAwLTggNCA0IDAgMCAxIDAgOHptNi40MDYtMTEuODQ1YTEuNDQgMS40NCAwIDEgMCAwIDIuODgxIDEuNDQgMS40NCAwIDAgMCAwLTIuODgxeiIvPjwvc3ZnPg==",
      twitter: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTIzLjk1MyA0LjU3YTEwIDEwIDAgMCAxLTIuODI1Ljc3NSA0LjkyOCA0LjkyOCAwIDAgMCAyLjE2My0yLjcyM2MtLjk1MS41NTUtMi4wMDUuOTU5LTMuMTI3IDEuMTg0YTQuOTIgNC45MiAwIDAgMC04LjM4NCA0LjQ4MkM3LjY5IDguMDk1IDQuMDY3IDYuMTMgMS42NCAzLjE2MmE0LjgyMiA0LjgyMiAwIDAgMC0uNjY2IDIuNDc1YzAgMS43MS44NyAzLjIxMyAyLjE4OCA0LjA5NmE0LjkwNCA0LjkwNCAwIDAgMS0yLjIyOC0uNjE2di4wNmE0LjkyMyA0LjkyMyAwIDAgMCAzLjk0NiA0LjgyN2E0Ljk5NiA0Ljk5NiAwIDAgMS0yLjIxMi4wODUgNC45MzYgNC45MzYgMCAwIDAgNC42MDQgMy40MTdhOS44NjcgOS44NjcgMCAwIDEtNi4xMDIgMi4xMDVjLS4zOSAwLS43NzktLjAyMy0xLjE3LS4wNjdhMTMuOTk1IDEzLjk5NSAwIDAgMCA3LjU1NyAyLjIwOWM5LjA1MyAwIDE0LjAwMi03LjQ5NiAxNC4wMDItMTMuOTg2IDAtLjIxIDAtLjQyMyAtLjAxNS0uNjM0YTEwLjAyNSAxMC4wMjUgMCAwIDAgMi40NTctMi41NDl6Ii8+PC9zdmc+",
      youtube: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iI0ZGMDAwMCIgZD0iTTIzLjQ5OCA2LjE4NmEzLjAxNiAzLjAxNiAwIDAgMC0yLjEyMi0yLjEzNkMxOS41MDUgMy41NDUgMTIgMy41NDUgMTIgMy41NDVzLTcuNTA1IDAtOS4zNzcuNTA1QTMuMDE3IDMuMDE3IDAgMCAwIC41MDIgNi4xODZDMCA4LjA3IDAgMTIgMCAxMnMwIDMuOTMuNTAyIDUuODE0YTMuMDE2IDMuMDE2IDAgMCAwIDIuMTIyIDIuMTM2YzEuODcxLjUwNSA5LjM3Ni41MDUgOS4zNzYuNTA1czcuNTA1IDAgOS4zNzctLjUwNWEzLjAxNSAzLjAxNSAwIDAgMCAyLjEyMi0yLjEzNkMyNCAzNS45MyAyNCAxMiAyNCAxMnMwLTMuOTMtLjUwMi01LjgxNHpNOS41NDUgMTUuNTY4VjguNDMybDYuMjczIDMuNTY4LTYuMjczIDMuNTY4eiIvPjwvc3ZnPg==",
      tiktok: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTEyLjUyNS4wMmMxLjMxLS4wMiAyLjYxLS4wMSAzLjkxLS4wMiAxLjEyIDEuNjQgMi4zNiAzLjQzIDQuNzcgMy43NXY0LjIzYy0xLjU3LS4xLTMuMDgtLjY4LTQuNDItMS40Mi0uMjggNC42MiAwIDkuMjYtLjAyIDEzLjg4LS4yOCA0LjM1LTQuNjggNy44Ni05LjAzIDcuNTYtNC4xOS4zNS04LjgtMy40NS04LjQ2LTcuOTMtLjAxLTQuNDIgNC4wOS04LjA3IDguNDktNy43NnYtNC40M2MtNS4xOS0uNzQtMTAuMjcgMy43Ni0xMC40NSA5LjQtLjIgNy43MSA1LjYgMTQuNjMgMTMuMDggMTQuNzcgNy43NS44NSAxNS4zOC01LjM4IDE1Ljg0LTEzLjUuOTYtNi43LjAzLTEzLjQzLjAzLTIwLjE1LjMxLS4wMS43MS0uMDMgMS4wMi0uMDNsMC0uMDF6Ii8+PC9zdmc+",
      whatsapp: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iIzI1RDM2NiIgZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzczIDAgMTJzNS4zNzMgMTIgMTIgMTIgMTItNS4zNzMgMTItMTJTMTguNjI3IDAgMTIgMHptNS44OTQgMTcuNzU0YTYuNyA2LjcgMCAwIDEtNC40MjEgMiAyLjEwMyAzLjIxOSA1LjEwMSA0LjUxMi43MTMuMzA4IDEuMjY5LjQ5MyAxLjcwMi42MyAxLjcxNS4yMjcgMS4zNjYuMTk1IDEuODgxLjExOC41NzQtLjA4NSAxLjc3Mi0uNzI1IDIuMDIxLTEuNDI2LjI1MS0uNzAxLjI1MS0xLjMwMi4xNzYtMS40MjYtLjA3My0uMTIyLS4yNzMtLjI0OS0uNDYtLjM3OC0uMjQtLjE3LS44MzQtLjQwNi0xLjEyLS40NzItLjc2NS0uMTgyLTEuNzA5LS4xMDYtMi4yNTcuMDU1LTEuODU5LjUwMy0zLjI4IDEuNDYxLTMuODgyIDIuODUtLjEyLjI4Ny0uMjI3LjY2Ni0uMzEgMS4wNTgtLjA4My40Ny0uMjExIDEuMDYtLjM3MiAxLjQ5Ni0uMzM5LjkxNS0xLjA1IDEuODI3LTEuNzA5IDIuMzgxLS41Mi40NTktMS4yMzUuNzY0LTEuODQxLjczNWgtLjAzYy0uMzE0LS4wMDgtLjYyNy0uMDM1LS45NTItLjA4NXoiLz48L3N2Zz4=",
      pinterest: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iI0U2MDAwIiBkPSJNMTIgMEM2LjE4MyAwIC4xODMgNi4xODMuMTgzIDEyczUuIDEyIDExLjgxNyAxMlMyMy44MTcgMTcuODE3IDIzLjgxNyAxMiAyMy44MTcgNTkuNjY3IDEyIDAuMDA1ek0xMiAyMkM2LjkxIDIyIDIuNzI3IDE3LjgxNyAyLjcyNyAxMnMyLjczLTEwIDEwLTEwIDExLjI3MyA0LjE4MyAxMS4yNzMgMTAtMy43MjcgMTAtMTAuNzI3IDEweiIvPjwvc3ZnPg==",
      github: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iIzMzMzMzMyIgZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJjMCA0LjQxOSAyLjg2NSA4LjE3IDYuODM5IDkuNDljLjUuMDkyLjY4My0uMjE3LjY4My0uNDgzIDAtLjIzNy0uMDA4LS44NjgtLjAxMi0xLjcwMy0yLjc4LjYwMy0zLjM2OS0xLjM0My0zLjM2OS0xLjM0My0uNDU0LTEuMTU2LTEuMTExLTEuNDYzLTEuMTExLTEuNDYzLS45MDgtLjYyLjA2OS0uNjA4LjA2OS0uNjA4IDEuMDA0LjA3IDEuNTMxIDEuMDMyIDEuNTMxIDEuMDMyLjg5MiAxLjUzIDIuMzQgMS40NzMgMi45MTEgMS4xMjcuMDkxLS44NzcuMzQ5LTEuNDczLjYzNS0xLjgxMy0yLjIyLS4yNTMtNC41NTYtMS4xMTEtNC41NTYtNC45MzIgMC0xLjA5MS4zODgtMi4wMzggMS4wMjctMi43NTItLjEwMy0uMjUzLS40NDUtMS4zMDIuMDk3LTIuNzEyIDAgMCAuODMtLjI3NiAyLjcyMS4xLjc4OS0uMjE5IDEuNjMtLjMyOCAyLjQ2OS0uMzMyLjg0LjAwNCAxLjY4MS4xMTMgMi40NjkuMzMyIDEuODkxLS4zNzYgMi43MjEtLjEgMi43MjEtLjEuNTQzIDEuNDEuMjAxIDIuNDU5LjA5NyAyLjcxMi42NDAuNzE0IDEuMDI3IDEuNjYxIDEuMDI3IDIuNzUyIDAgMy44MzItMi4zNDMgNC43NTUtNC41NjEgNTAwNS4wMDUuMjk1LjI1My40NzQuNTYyLjQ3NC45Yzcgc2V0IHRvIDAgLjU0Mi0uMDQ1LTEuMDY4LS4xMzcgMS4yOTUtLjIyNCAyLjM5My0uMjI0IDIuMzEzIDAgLjI2Ni4xODMuNTc2LjY4OC40ODMgMy44NzQtMS4yOTYgNi42NzYtNS4wNzMgNi42NzYtOS41MDQgMC01LjUyMy00LjQ3Ny0xMC05Ljk5OC0xMHoiLz48L3N2Zz4=",
    };
    return icons[platform] || icons.facebook;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSignatureHTML());
    toast({ title: "Copied", description: "Signature HTML copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Email Signature Generator</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Create professional email signatures with 9 beautiful templates</p>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Email Platforms */}
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold">Email Platform</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-3">
                  {emailPlatforms.map((p) => (
                    <button key={p.id} onClick={() => updateField("platform", p.id)} className={`p-3 rounded-lg border-2 text-center text-xs font-medium transition ${signatureData.platform === p.id ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : "border-slate-200 dark:border-slate-600"}`} data-testid={`button-platform-${p.id}`}>
                      <span className="text-lg block mb-1">{p.icon}</span>
                      {p.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Template Carousel */}
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold">Choose Template (9 Options)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <button onClick={prevTemplate} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" data-testid="button-prev-template">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    {TEMPLATES.map((t, i) => (
                      <button key={t.id} onClick={() => selectTemplate(i)} className={`p-3 rounded-lg border-2 text-center text-xs font-medium transition ${carouselIndex === i ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-600"}`} data-testid={`button-template-${t.id}`}>
                        {t.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={nextTemplate} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" data-testid="button-next-template">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Form Sections */}
            {[
              { key: "signatureSection", title: "Handwritten Signature", fields: ["signatureName", "signatureFont", "signatureSize", "signatureColor"] },
              { key: "nameSection", title: "Name/Title/Company", fields: ["fullName", "title", "company", "nameSize", "nameColor", "titleSize", "titleColor", "companySize", "companyColor"] },
              { key: "contactSection", title: "Contact Info", fields: ["cellPhone", "officePhone", "email", "website", "address", "contactFont", "contactInfoSize", "contactInfoColor", "contactIconSize", "contactIconColor"] },
              { key: "imagesSection", title: "Images", fields: ["profilePhoto", "companyLogo"] },
              { key: "socialLinksSection", title: "Social Links", fields: [] },
              { key: "optionalFeaturesSection", title: "Optional Features", fields: ["showCTA", "ctaText", "ctaUrl", "showBanner", "bannerText", "showDisclaimer", "disclaimerText"] },
            ].map((section) => (
              <Card key={section.key} className="bg-white dark:bg-slate-800">
                <CardHeader className="cursor-pointer py-2 px-3" onClick={() => toggleSection(section.key)} data-testid={`toggle-${section.key}`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{section.title}</CardTitle>
                    {collapsedSections[section.key] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </CardHeader>
                {!collapsedSections[section.key] && (
                  <CardContent className="p-3 space-y-3">
                    {section.key === "signatureSection" && (
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Signature Name</Label>
                          <Input value={signatureData.signatureName} onChange={(e) => updateField("signatureName", e.target.value)} data-testid="input-signature-name" />
                        </div>
                        <div>
                          <Label className="text-xs">Font</Label>
                          <Select value={signatureData.signatureFont} onValueChange={(v) => updateField("signatureFont", v)}>
                            <SelectTrigger data-testid="select-signature-font">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {signatureFonts.map((f) => (
                                <SelectItem key={f} value={f}>
                                  {f}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Size: {signatureData.signatureSize}px</Label>
                          <input type="range" min="24" max="48" value={signatureData.signatureSize} onChange={(e) => updateField("signatureSize", parseInt(e.target.value))} className="w-full" data-testid="slider-signature-size" />
                        </div>
                      </div>
                    )}

                    {section.key === "nameSection" && (
                      <div className="space-y-2">
                        <Input placeholder="Full Name" value={signatureData.fullName} onChange={(e) => updateField("fullName", e.target.value)} data-testid="input-full-name" />
                        <Input placeholder="Title" value={signatureData.title} onChange={(e) => updateField("title", e.target.value)} data-testid="input-title" />
                        <Input placeholder="Company" value={signatureData.company} onChange={(e) => updateField("company", e.target.value)} data-testid="input-company" />
                      </div>
                    )}

                    {section.key === "contactSection" && (
                      <div className="space-y-2">
                        <Input placeholder="Cell Phone" value={signatureData.cellPhone} onChange={(e) => updateField("cellPhone", e.target.value)} data-testid="input-cell-phone" />
                        <Input placeholder="Office Phone" value={signatureData.officePhone} onChange={(e) => updateField("officePhone", e.target.value)} data-testid="input-office-phone" />
                        <Input placeholder="Email" type="email" value={signatureData.email} onChange={(e) => updateField("email", e.target.value)} data-testid="input-email" />
                        <Input placeholder="Website" value={signatureData.website} onChange={(e) => updateField("website", e.target.value)} data-testid="input-website" />
                        <Input placeholder="Address" value={signatureData.address} onChange={(e) => updateField("address", e.target.value)} data-testid="input-address" />
                      </div>
                    )}

                    {section.key === "imagesSection" && (
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Profile Photo</Label>
                          <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload("profilePhoto", e.target.files[0])} data-testid="input-profile-photo" />
                        </div>
                        <div>
                          <Label className="text-xs">Company Logo</Label>
                          <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload("companyLogo", e.target.files[0])} data-testid="input-company-logo" />
                        </div>
                      </div>
                    )}

                    {section.key === "socialLinksSection" && (
                      <div className="space-y-2">
                        <Button type="button" size="sm" variant="outline" onClick={addSocialLink} className="gap-1 w-full" data-testid="button-add-social-link">
                          <Plus className="w-4 h-4" />
                          Add Social Link
                        </Button>
                        {signatureData.socialLinks.map((link, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Select value={link.platform} onValueChange={(v) => updateSocialLink(idx, "platform", v)}>
                              <SelectTrigger className="w-32" data-testid={`select-social-platform-${idx}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {socialPlatforms.map((p) => (
                                  <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input value={link.url} onChange={(e) => updateSocialLink(idx, "url", e.target.value)} placeholder="https://..." className="flex-1" data-testid={`input-social-url-${idx}`} />
                            <Button type="button" size="sm" variant="ghost" onClick={() => removeSocialLink(idx)} data-testid={`button-remove-social-${idx}`}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.key === "optionalFeaturesSection" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">CTA Button</Label>
                          <Switch checked={signatureData.showCTA} onCheckedChange={(v) => updateField("showCTA", v)} data-testid="switch-show-cta" />
                        </div>
                        {signatureData.showCTA && (
                          <div className="grid grid-cols-2 gap-2">
                            <Input value={signatureData.ctaText} onChange={(e) => updateField("ctaText", e.target.value)} placeholder="Button Text" data-testid="input-cta-text" />
                            <Input value={signatureData.ctaUrl} onChange={(e) => updateField("ctaUrl", e.target.value)} placeholder="Button URL" data-testid="input-cta-url" />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Banner</Label>
                          <Switch checked={signatureData.showBanner} onCheckedChange={(v) => updateField("showBanner", v)} data-testid="switch-show-banner" />
                        </div>
                        {signatureData.showBanner && (
                          <Input value={signatureData.bannerText} onChange={(e) => updateField("bannerText", e.target.value)} placeholder="Banner Text" data-testid="input-banner-text" />
                        )}
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Disclaimer</Label>
                          <Switch checked={signatureData.showDisclaimer} onCheckedChange={(v) => updateField("showDisclaimer", v)} data-testid="switch-show-disclaimer" />
                        </div>
                        {signatureData.showDisclaimer && (
                          <Textarea value={signatureData.disclaimerText} onChange={(e) => updateField("disclaimerText", e.target.value)} placeholder="Disclaimer text..." rows={2} data-testid="textarea-disclaimer" />
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Right Column: Preview & Actions */}
          <div className="col-span-1">
            <Card className="bg-white dark:bg-slate-800 sticky top-4">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold">Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">Signature preview</p>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 min-h-[200px] overflow-y-auto text-xs" dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }} data-testid="signature-preview" />

                <div className="flex gap-1.5">
                  <Button type="button" size="sm" onClick={copyToClipboard} className="flex-1 gap-1 h-8 text-xs" data-testid="button-copy">
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="flex-1 gap-1 h-8 text-xs" data-testid="button-download">
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                </div>

                <Button type="button" onClick={() => saveMutation.mutate(signatureData)} className="w-full h-8 gap-2 text-xs" disabled={saveMutation.isPending} data-testid="button-save">
                  <Save className="w-3 h-3" />
                  {saveMutation.isPending ? "Saving..." : "Save Signature"}
                </Button>

                {signatures.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-semibold mb-2">Saved Signatures ({signatures.length})</p>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {(signatures as any[]).map((sig) => (
                        <div key={sig.id} className="flex items-center justify-between p-2 rounded bg-slate-100 dark:bg-slate-700 text-xs">
                          <button onClick={() => setSignatureData(sig)} className="flex-1 text-left hover:text-blue-600" data-testid={`button-load-sig-${sig.id}`}>
                            {sig.signatureName || "Untitled"}
                          </button>
                          <button onClick={() => deleteMutation.mutate(sig.id)} className="p-1 hover:text-red-600" data-testid={`button-delete-sig-${sig.id}`}>
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
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
