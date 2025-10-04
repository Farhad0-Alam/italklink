import { useState, useEffect } from 'react';
import { Copy, Download, Mail, Palette, Image as ImageIcon, X, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Link } from 'wouter';
import { 
  SiFacebook, 
  SiLinkedin, 
  SiInstagram, 
  SiX, 
  SiYoutube, 
  SiTiktok, 
  SiWhatsapp, 
  SiPinterest,
  SiGithub
} from 'react-icons/si';

interface SignatureData {
  // Basic Info
  signatureName: string;
  name: string;
  title: string;
  company: string;
  cellPhone: string;
  officePhone: string;
  email: string;
  website: string;
  address: string;
  
  // Custom Fields
  customFields: { label: string; value: string }[];
  
  // Images
  profilePhoto: string;
  companyLogo: string;
  
  // Colors
  primaryColor: string;
  secondaryColor: string;
  
  // Social Links
  socialLinks: { platform: string; url: string; icon: string }[];
  
  // Optional Features
  showDisclaimer: boolean;
  disclaimerText: string;
  showCTA: boolean;
  ctaText: string;
  ctaUrl: string;
  showBanner: boolean;
  bannerText: string;
}

const socialPlatforms = [
  { value: 'facebook', label: 'Facebook', icon: SiFacebook },
  { value: 'linkedin', label: 'LinkedIn', icon: SiLinkedin },
  { value: 'instagram', label: 'Instagram', icon: SiInstagram },
  { value: 'twitter', label: 'Twitter/X', icon: SiX },
  { value: 'youtube', label: 'YouTube', icon: SiYoutube },
  { value: 'tiktok', label: 'TikTok', icon: SiTiktok },
  { value: 'whatsapp', label: 'WhatsApp', icon: SiWhatsapp },
  { value: 'pinterest', label: 'Pinterest', icon: SiPinterest },
  { value: 'github', label: 'GitHub', icon: SiGithub },
];

export default function EmailSignature() {
  const { toast } = useToast();
  const [templateType, setTemplateType] = useState<'simple' | 'advanced' | 'premium'>('simple');
  const [signatureData, setSignatureData] = useState<SignatureData>({
    signatureName: '',
    name: '',
    title: '',
    company: '',
    cellPhone: '',
    officePhone: '',
    email: '',
    website: '',
    address: '',
    customFields: [],
    profilePhoto: '',
    companyLogo: '',
    primaryColor: '#FF6A00',
    secondaryColor: '#333333',
    socialLinks: [],
    showDisclaimer: false,
    disclaimerText: 'This email and any attachments are confidential and intended solely for the recipient.',
    showCTA: false,
    ctaText: 'Book a Consultation',
    ctaUrl: '',
    showBanner: false,
    bannerText: 'Get in touch today!',
  });

  const updateField = (field: keyof SignatureData, value: any) => {
    setSignatureData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field: 'profilePhoto' | 'companyLogo', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField(field, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addSocialLink = () => {
    setSignatureData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: 'facebook', url: '', icon: 'SiFacebook' }]
    }));
  };

  const removeSocialLink = (index: number) => {
    setSignatureData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setSignatureData(prev => {
      const newLinks = [...prev.socialLinks];
      newLinks[index] = { ...newLinks[index], [field]: value };
      if (field === 'platform') {
        const platform = socialPlatforms.find(p => p.value === value);
        newLinks[index].icon = platform?.icon.name || 'SiFacebook';
      }
      return { ...prev, socialLinks: newLinks };
    });
  };

  const addCustomField = () => {
    setSignatureData(prev => ({
      ...prev,
      customFields: [...prev.customFields, { label: '', value: '' }]
    }));
  };

  const removeCustomField = (index: number) => {
    setSignatureData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const updateCustomField = (index: number, field: 'label' | 'value', value: string) => {
    setSignatureData(prev => {
      const newFields = [...prev.customFields];
      newFields[index] = { ...newFields[index], [field]: value };
      return { ...prev, customFields: newFields };
    });
  };

  const generateSimpleSignature = (): string => {
    const { signatureName, name, title, company, cellPhone, email, website, profilePhoto, primaryColor, socialLinks, customFields } = signatureData;
    
    const socialIconsHTML = socialLinks.map(link => {
      const platform = socialPlatforms.find(p => p.value === link.platform);
      const iconSVG = getSocialIconSVG(link.platform);
      return `<a href="${link.url}" style="display:inline-block;margin:0 5px;"><img src="${iconSVG}" alt="${platform?.label}" width="24" height="24" style="border:0;display:block;"></a>`;
    }).join('');

    const customFieldsHTML = customFields.filter(f => f.label && f.value).map(field => {
      return `<tr><td style="font-size: 13px; color: #333; padding-bottom: 3px;">${field.label}: ${field.value}</td></tr>`;
    }).join('');

    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0; padding: 0;">
  <tr>
    <td>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${profilePhoto ? `
          <td style="padding-right: 20px; vertical-align: top;">
            <img src="${profilePhoto}" alt="${name}" width="100" height="100" style="border-radius: 50%; display: block; border: 3px solid ${primaryColor};">
          </td>
          ` : ''}
          <td style="vertical-align: top; padding-top: 5px;">
            <table cellpadding="0" cellspacing="0" border="0">
              ${signatureName ? `<tr><td style="font-family: 'Amsterdam One', cursive; font-size: 28px; color: ${primaryColor}; padding-bottom: 5px;">${signatureName}</td></tr>` : ''}
              <tr>
                <td style="font-size: 18px; font-weight: bold; color: ${primaryColor}; padding-bottom: 5px;">${name}</td>
              </tr>
              ${title ? `<tr><td style="font-size: 14px; color: #666; padding-bottom: 3px;">${title}</td></tr>` : ''}
              ${company ? `<tr><td style="font-size: 14px; color: #666; padding-bottom: 10px;">${company}</td></tr>` : ''}
              ${cellPhone ? `<tr><td style="font-size: 13px; color: #333; padding-bottom: 3px;">📱 ${cellPhone}</td></tr>` : ''}
              ${email ? `<tr><td style="font-size: 13px; padding-bottom: 3px;"><a href="mailto:${email}" style="color: #333; text-decoration: none;">✉️ ${email}</a></td></tr>` : ''}
              ${website ? `<tr><td style="font-size: 13px; padding-bottom: 8px;"><a href="${website}" style="color: ${primaryColor}; text-decoration: none;">🌐 ${website}</a></td></tr>` : ''}
              ${customFieldsHTML}
              ${socialIconsHTML ? `<tr><td style="padding-top: 5px;">${socialIconsHTML}</td></tr>` : ''}
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
    const { signatureName, name, title, company, cellPhone, officePhone, email, website, address, profilePhoto, companyLogo, primaryColor, secondaryColor, socialLinks, showCTA, ctaText, ctaUrl, customFields } = signatureData;
    
    const socialIconsHTML = socialLinks.map(link => {
      const iconSVG = getSocialIconSVG(link.platform);
      return `<a href="${link.url}" style="display:inline-block;margin:0 5px;"><img src="${iconSVG}" alt="${link.platform}" width="28" height="28" style="border:0;display:block;"></a>`;
    }).join('');

    const customFieldsHTML = customFields.filter(f => f.label && f.value).map(field => {
      return `<tr><td style="font-size: 14px; color: #333; padding: 3px 0;">${field.label}: ${field.value}</td></tr>`;
    }).join('');

    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width: 650px; margin: 0; padding: 0;">
  <tr>
    <td>
      <table cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 20px;">
        <tr>
          ${profilePhoto ? `
          <td style="padding-right: 25px; vertical-align: top;">
            <img src="${profilePhoto}" alt="${name}" width="120" height="120" style="border-radius: 50%; display: block; border: 4px solid ${primaryColor};">
          </td>
          ` : ''}
          <td style="vertical-align: top; border-left: 3px solid ${primaryColor}; padding-left: 20px;">
            <table cellpadding="0" cellspacing="0" border="0">
              ${signatureName ? `<tr><td style="font-family: 'Amsterdam One', cursive; font-size: 30px; color: ${primaryColor}; padding-bottom: 5px;">${signatureName}</td></tr>` : ''}
              <tr>
                <td style="font-size: 20px; font-weight: bold; color: ${primaryColor}; padding-bottom: 5px;">${name}</td>
              </tr>
              ${title ? `<tr><td style="font-size: 15px; color: ${secondaryColor}; padding-bottom: 10px;">${title}${company ? ` | ${company}` : ''}</td></tr>` : ''}
              ${cellPhone ? `<tr><td style="font-size: 14px; color: #333; padding: 3px 0;">📱 <a href="tel:${cellPhone}" style="color: #333; text-decoration: none;">${cellPhone}</a></td></tr>` : ''}
              ${officePhone ? `<tr><td style="font-size: 14px; color: #333; padding: 3px 0;">☎️ <a href="tel:${officePhone}" style="color: #333; text-decoration: none;">${officePhone}</a></td></tr>` : ''}
              ${email ? `<tr><td style="font-size: 14px; padding: 3px 0;"><a href="mailto:${email}" style="color: #333; text-decoration: none;">✉️ ${email}</a></td></tr>` : ''}
              ${website ? `<tr><td style="font-size: 14px; padding: 3px 0;"><a href="${website}" style="color: ${primaryColor}; text-decoration: none;">🌐 ${website}</a></td></tr>` : ''}
              ${address ? `<tr><td style="font-size: 13px; color: #666; padding: 5px 0;">📍 ${address}</td></tr>` : ''}
              ${customFieldsHTML}
              ${socialIconsHTML ? `<tr><td style="padding-top: 10px;">${socialIconsHTML}</td></tr>` : ''}
            </table>
          </td>
        </tr>
        ${companyLogo || showCTA ? `
        <tr>
          <td colspan="2" style="padding-top: 20px; border-top: 1px solid #e0e0e0; margin-top: 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                ${companyLogo ? `<td style="vertical-align: middle;"><img src="${companyLogo}" alt="Company Logo" style="max-height: 50px; display: block;"></td>` : ''}
                ${showCTA && ctaUrl ? `
                <td style="text-align: right; vertical-align: middle;">
                  <a href="${ctaUrl}" style="background-color: ${primaryColor}; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">${ctaText}</a>
                </td>
                ` : ''}
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}
      </table>
    </td>
  </tr>
</table>
    `.trim();
  };

  const generatePremiumSignature = (): string => {
    const { signatureName, name, title, company, cellPhone, officePhone, email, website, address, profilePhoto, companyLogo, primaryColor, secondaryColor, socialLinks, showCTA, ctaText, ctaUrl, showBanner, bannerText, customFields } = signatureData;
    
    const socialIconsHTML = socialLinks.map(link => {
      const iconSVG = getSocialIconSVG(link.platform);
      return `<a href="${link.url}" style="display:inline-block;margin:0 6px;"><img src="${iconSVG}" alt="${link.platform}" width="32" height="32" style="border:0;display:block;border-radius:50%;"></a>`;
    }).join('');

    const customFieldsHTML = customFields.filter(f => f.label && f.value).map(field => {
      return `<tr><td style="font-size: 14px; color: #333; padding: 5px 0; font-weight: 500;">${field.label}: ${field.value}</td></tr>`;
    }).join('');

    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width: 700px; margin: 0; padding: 0; background-color: #f9f9f9;">
  ${showBanner ? `
  <tr>
    <td style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: #ffffff; text-align: center; padding: 15px; font-size: 16px; font-weight: bold;">
      ${bannerText}
    </td>
  </tr>
  ` : ''}
  <tr>
    <td style="background-color: #ffffff; padding: 25px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          ${profilePhoto ? `
          <td style="padding-right: 25px; vertical-align: top; width: 140px;">
            <img src="${profilePhoto}" alt="${name}" width="140" height="140" style="border-radius: 50%; display: block; border: 5px solid ${primaryColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          </td>
          ` : ''}
          <td style="vertical-align: top;">
            <table cellpadding="0" cellspacing="0" border="0">
              ${signatureName ? `<tr><td style="font-family: 'Amsterdam One', cursive; font-size: 32px; color: ${primaryColor}; padding-bottom: 5px;">${signatureName}</td></tr>` : ''}
              <tr>
                <td style="font-size: 24px; font-weight: bold; color: ${primaryColor}; padding-bottom: 5px;">${name}</td>
              </tr>
              ${title ? `<tr><td style="font-size: 16px; color: ${secondaryColor}; font-weight: 600; padding-bottom: 3px;">${title}</td></tr>` : ''}
              ${company ? `<tr><td style="font-size: 14px; color: #777; padding-bottom: 15px;">${company}</td></tr>` : ''}
              <tr><td style="height: 2px; background-color: ${primaryColor}; margin: 10px 0;"></td></tr>
              ${cellPhone ? `<tr><td style="font-size: 14px; color: #333; padding: 5px 0;">📱 <a href="tel:${cellPhone}" style="color: #333; text-decoration: none; font-weight: 500;">${cellPhone}</a></td></tr>` : ''}
              ${officePhone ? `<tr><td style="font-size: 14px; color: #333; padding: 5px 0;">☎️ <a href="tel:${officePhone}" style="color: #333; text-decoration: none; font-weight: 500;">${officePhone}</a></td></tr>` : ''}
              ${email ? `<tr><td style="font-size: 14px; padding: 5px 0;"><a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none; font-weight: 500;">✉️ ${email}</a></td></tr>` : ''}
              ${website ? `<tr><td style="font-size: 14px; padding: 5px 0;"><a href="${website}" style="color: ${primaryColor}; text-decoration: none; font-weight: 500;">🌐 ${website}</a></td></tr>` : ''}
              ${address ? `<tr><td style="font-size: 13px; color: #666; padding: 5px 0;">📍 ${address}</td></tr>` : ''}
              ${customFieldsHTML}
              ${socialIconsHTML ? `<tr><td style="padding-top: 15px;">${socialIconsHTML}</td></tr>` : ''}
            </table>
          </td>
        </tr>
        ${companyLogo || showCTA ? `
        <tr>
          <td colspan="2" style="padding-top: 25px; border-top: 2px solid ${primaryColor}; margin-top: 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                ${companyLogo ? `<td style="vertical-align: middle; width: 50%;"><img src="${companyLogo}" alt="Company Logo" style="max-height: 60px; display: block;"></td>` : ''}
                ${showCTA && ctaUrl ? `
                <td style="text-align: ${companyLogo ? 'right' : 'center'}; vertical-align: middle;">
                  <a href="${ctaUrl}" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">${ctaText}</a>
                </td>
                ` : ''}
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}
      </table>
    </td>
  </tr>
</table>
    `.trim();
  };

  const getSocialIconSVG = (platform: string): string => {
    // Return base64 encoded SVG icons for each platform
    const icons: Record<string, string> = {
      facebook: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iIzE4NzdGMiIgZD0iTTI0IDEyYzAtNi42MjctNS4zNzMtMTItMTItMTJTMCA1LjM3MyAwIDEyczUuMzczIDEyIDEyIDEyIDEyLTUuMzczIDEyLTEyeiIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xMy41IDIxdi03LjVoMi41bC4zNzUtM0gxMy41VjguNWMwLS44MzMuMTktMS41IDEuNS0xLjVoMS41VjRzLTEuMzUtLjI1LTIuNS0uMjVjLTIuNTUgMC00LjUgMS43NS00LjUgNS4yNXYyLjI1SDd2M2gyLjV2Ny41eiIvPjwvc3ZnPg==',
      linkedin: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iIzAwNzdCNSIgZD0iTTIwLjQ0NyAyMC40NTJoLTMuNTU0di01LjU2OWMwLTEuMzI4LS4wMjctMy4wMzctMS44NTItMy4wMzctMS44NTMgMC0yLjEzNiAxLjQ0NS0yLjEzNiAyLjkzOXY1LjY2N0g5LjM1MVY5aDMuNDE0djEuNTYxaC4wNDZjLjQ3Ny0uOSAxLjYzNy0xLjg1IDMuMzctMS44NSAzLjYwMSAwIDQuMjY3IDIuMzcgNC4yNjcgNS40NTV2Ni4yODZ6TTUuMzM3IDcuNDMzYTIuMDYyIDIuMDYyIDAgMCAxLTIuMDYzLTIuMDY1IDIuMDY0IDIuMDY0IDAgMSAxIDIuMDYzIDIuMDY1em0xLjc4MiAxMy4wMTlIMy41NTVWOWgzLjU2NHYxMS40NTJ6TTIyLjIyNSAwSC4yNjRDLS4xMTcgMC0uNS4zODMtLjUuODV2MjIuM2MwIC40NjYuMzgzLjg1Ljg1Ljg1aDIxLjk2Yy40NjcgMCAuODUtLjM4NC44NS0uODVWLjg1Yy4wMDEtLjQ2Ny0uMzgyLS44NS0uODQ5LS44NWwtLjAwMS0uMDAxeiIvPjwvc3ZnPg==',
      instagram: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iLjUiIHgyPSIuNSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2Y1OGUyOSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2M4MzNhYiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0xMiAyLjE2M2MzLjIwNCAwIDMuNTg0LjAxMiA0Ljg1LjA3IDMuMjUyLjE0OCA0Ljc3MSAxLjY5MSA0LjkxOSA0LjkxOS4wNTggMS4yNjUuMDY5IDEuNjQ1LjA2OSA0Ljg0OXMtLjAxMiAzLjU4NC0uMDY5IDQuODQ5Yy0uMTQ5IDMuMjI1LTEuNjY0IDQuNzcxLTQuOTE5IDQuOTE5LTEuMjY2LjA1OC0xLjY0NC4wNy00Ljg1LjA3cy0zLjU4NC0uMDEyLTQuODQ5LS4wN2MtMy4yNi0uMTQ5LTQuNzcxLTEuNjk5LTQuOTE5LTQuOTItLjA1OC0xLjI2NS0uMDctMS42NDQtLjA3LTQuODQ5czAxMi0zLjU4NC4wMTItNC44NDljLjE0OS0zLjIyNyAxLjY2NC00Ljc3MSA0LjkxOS00LjkxOSAxLjI2Ni0uMDU3IDEuNjQ1LS4wNjkgNC44NS0uMDY5TTEyIDBDOC43NDEgMCA4LjMzMy4wMTQgNy4wNTMuMDcyIDIuNjk1LjI3Mi40IDIuNjk2LjA3MyA3LjA1Mi4wMTQgOC4zMzMgMCA4Ljc0MSAwIDEyczAxNC44LjMzMyA0LjA0Ny4wNzIgNS4zNTggMiA3LjMwNCA3LjA1MyAyMy45MjggMjMuNjg2IDIxLjkyNyA3LjA1IDIzLjk4NiA4LjMzMyAyNCAxMnMtLjAxNCAzLjY2Ny0uMDcyIDQuOTQ3Yy0uMjAyIDQuMzU4LTIuMzA4IDYuNjU2LTYuNTY4IDYuOTI3QzE1LjY2NyAyMy45ODYgMTUuMjU5IDI0IDEyIDI0cy0zLjY2Ny0uMDE0LTQuOTQ3LS4wNzJjLTQuMjU0LS4yNzItNi4zNzMtMi41ODYtNi41NjgtNi45MjctLjA1OS0xLjI4LS4wNzMtMS42ODgtLjA3My00Ljk0N3MuMDE0LTMuNjY3LjA3Mi00Ljk0N0MuMjc0IDIuNjg2IDIuNDIgLjM1IDYuODkxLjA3MyA4LjMzMy4wMTQgOC43NDEgMCAxMiAwem0wIDUuODM4YTYuMTYyIDYuMTYyIDAgMSAwIDAgMTIuMzI0IDYuMTYyIDYuMTYyIDAgMCAwIDAtMTIuMzI0ek0xMiAxNmE0IDQgMCAxIDEgMC04IDQgNCAwIDAgMSAwIDh6bTYuNDA2LTExLjg0NWExLjQ0IDEuNDQgMCAxIDAgMCAyLjg4MSAxLjQ0IDEuNDQgMCAwIDAgMC0yLjg4MXoiLz48L3N2Zz4=',
      twitter: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTIzLjk1MyA0LjU3YTEwIDEwIDAgMCAxLTIuODI1Ljc3NSA0LjkyOCA0LjkyOCAwIDAgMCAyLjE2My0yLjcyM2MtLjk1MS41NTUtMi4wMDUuOTU5LTMuMTI3IDEuMTg0YTQuOTIgNC45MiAwIDAgMC04LjM4NCA0LjQ4MkM3LjY5IDguMDk1IDQuMDY3IDYuMTMgMS42NCAzLjE2MmE0LjgyMiA0LjgyMiAwIDAgMC0uNjY2IDIuNDc1YzAgMS43MS44NyAzLjIxMyAyLjE4OCA0LjA5NmE0LjkwNCA0LjkwNCAwIDAgMS0yLjIyOC0uNjE2di4wNmE0LjkyMyA0LjkyMyAwIDAgMCAzLjk0NiA0LjgyNyA0Ljk5NiA0Ljk5NiAwIDAgMS0yLjIxMi4wODUgNC45MzYgNC45MzYgMCAwIDAgNC42MDQgMy40MTcgOS44NjcgOS44NjcgMCAwIDEtNi4xMDIgMi4xMDVjLS4zOSAwLS43NzktLjAyMy0xLjE3LS4wNjdhMTMuOTk1IDEzLjk5NSAwIDAgMCA3LjU1NyAyLjIwOWM5LjA1MyAwIDE0LjAwMi03LjQ5NiAxNC4wMDItMTMuOTg2IDAtLjIxIDAtLjQyMy0uMDE1LS42MzRhMTAuMDI1IDEwLjAyNSAwIDAgMCAyLjQ1Ny0yLjU0OXoiLz48L3N2Zz4=',
      youtube: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iI0ZGMDAwMCIgZD0iTTIzLjQ5OCA2LjE4NmEzLjAxNiAzLjAxNiAwIDAgMC0yLjEyMi0yLjEzNkMxOS41MDUgMy41NDUgMTIgMy41NDUgMTIgMy41NDVzLTcuNTA1IDAtOS4zNzcuNTA1QTMuMDE3IDMuMDE3IDAgMCAwIC41MDIgNi4xODZDMCA4LjA3IDAgMTIgMCAxMnMwIDMuOTMuNTAyIDUuODE0YTMuMDE2IDMuMDE2IDAgMCAwIDIuMTIyIDIuMTM2YzEuODcxLjUwNSA5LjM3Ni41MDUgOS4zNzYuNTA1czcuNTA1IDAgOS4zNzctLjUwNWEzLjAxNSAzLjAxNSAwIDAgMCAyLjEyMi0yLjEzNkMyNCAzNS45MyAyNCAxMiAyNCAxMnMwLTMuOTMtLjUwMi01LjgxNHpNOS41NDUgMTUuNTY4VjguNDMybDYuMjczIDMuNTY4LTYuMjczIDMuNTY4eiIvPjwvc3ZnPg==',
      tiktok: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTEyLjUyNS4wMmMxLjMxLS4wMiAyLjYxLS4wMSAzLjkxLS4wMiAxLjEyIDEuNjQgMi4zNiAzLjQzIDQuNzcgMy43NXY0LjIzYy0xLjU3LS4xLTMuMDgtLjY4LTQuNDItMS40Mi0uMjggNC42MiAwIDkuMjYtLjAyIDEzLjg4LS4yOCA0LjM1LTQuNjggNy44Ni05LjAzIDcuNTYtNC4xOS4zNS04LjgtMy40NS04LjQ2LTcuOTMtLjAxLTQuNDIgNC4wOS04LjA3IDguNDktNy43NnYtNC40M2MtNS4xOS0uNzQtMTAuMjcgMy43Ni0xMC40NSA5LjQtLjIgNy43MSA1LjYgMTQuNjMgMTMuMDggMTQuNzcgNy43NS44NSAxNS4zOC01LjM4IDE1Ljg0LTEzLjUuOTYtNi43LjAzLTEzLjQzLjAzLTIwLjE1LjMxLS4wMS43MS0uMDMgMS4wMi0uMDNsMC0uMDF6Ii8+PC9zdmc+',
      whatsapp: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iIzI1RDM2NiIgZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzczIDAgMTJzNS4zNzMgMTIgMTIgMTIgMTItNS4zNzMgMTItMTJTMTguNjI3IDAgMTIgMHptNS44OTQgMTcuNzU0YTYuNyA2LjcgMCAwIDEtNC40MjEgMi4xMTNjLS45MjcuMTEzLTEuODQ3LS4wMDYtMi43MTctLjMyNS0yLjY0LTEuMDA1LTUuMDE0LTMuMjY3LTYuMDE2LTUuOTA3LS4zMzItLjkyNS0uNDUyLTEuOTIxLS40NTItMi45MjMgMC0yLjAxNS45MzItMy45MjEgMi41NDItNS4zMDMuNjU0LS41NjEgMS42MzQtLjkxOCAyLjY5My0uOTYuMjA5LS4wMDguNDE3LjAwNS42MjYuMDM2LjQ5LjA3Ny43NTYuNDI1Ljk0Ni44NzIuMzIzLjc2Ni43NTEgMS41MDUuOTc3IDIuMzA3LjA3Mi4yNjMuMDQ0LjUzLS4wNzIuNzctLjMyNi42NzQtLjg3NCAxLjI0OC0xLjI1OCAxLjkyOS0uMTIuMjEzLS4wNjQuNDc1LjA4Ni42NzguNDIxLjU2OC45NjcgMS4wMjIgMS41MDkgMS40NzMuODc0LjcyIDEuODggMS4yOTcgMy4wNDYgMS41NzguMjg1LjA2OS41NzcuMDQ4Ljg0Ny0uMDc3LjM3Mi0uMTczLjY4OS0uNDM5Ljk4Ni0uNzI0LjQ0My0uNDI1Ljg1OC0uOTM2IDEuNDQ1LTEuMTcuMjE4LS4wODYuNDYzLS4wNy42OTcuMDI5LjkzNC4zOTYgMS44NzIuNzg4IDIuODA3IDEuMTg0LjI5Ny4xMjYuNjA4LjI2LjgzNy41MjkuMTk2LjIzMi4zMDguNTIuMzY5LjgxMS4wNzcuMzY4LjA1OS43NC0uMDI4IDEuMTA0LS40MTggMS43NDItMS45NDQgMy4xMTEtMy42NzIgMy42MzF6Ii8+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTE3LjQ4IDE0LjkzNGMtLjI5Mi0uMTUtMS43My0uODU4LTIuMDA0LS45NTQtLjI3My0uMDk3LS40NzMtLjE0NS0uNjczLjE0NS0uMi4yODktLjc3NS45NjQtLjk1IDEuMTYyLS4xNzUuMTk3LS4zNS4yMjItLjY0Mi4wNzMtLjI5MS0uMTUtMS4yMjgtLjQ1NC0yLjMzOC0xLjQ0NS0uODY0LS43NzMtMS40NDgtMS43MzEtMS42MTYtMi4wMi0uMTY5LS4yOS0uMDE4LS40NDYuMTI4LS41OS4xMzEtLjEzLjI5Mi0uMzM5LjQzOC0uNTA5LjE0NS0uMTY5LjE5NC0uMjkuMjkxLS40ODYuMDk3LS4xOTcuMDQ5LS4zNjgtLjAyNC0uNTA5LS4wNzMtLjE0NS0uNjczLTEuNjI0LS45MjEtMi4yMjctLjI0Mi0uNTktLjQ4OC0uNTA5LS42NzMtLjUxOC0uMTc0LS4wMDgtLjM3My0uMDEtLjU3My0uMDEtLjIgMC0uNTI1LjA3My0uOC4zNjgtLjI3NS4yOS0xLjA0OCAxLjAyNC0xLjA0OCAyLjUwMiAwIDEuNDc3IDEuMDczIDIuOTA0IDEuMjIxIDMuMTAyLjE0NS4xOTcgMi4xMDMgMy4yMTkgNS4xMDEgNC41MTIuNzEzLjMwOCAxLjI2OS40OTMgMS43MDIuNjMuNzE1LjIyNyAxLjM2Ni4xOTUgMS44ODEuMTE4LjU3NC0uMDg1IDEuNzcyLS43MjUgMi4wMjEtMS40MjYuMjUxLS43MDEuMjUxLTEuMzAyLjE3Ni0xLjQyNi0uMDczLS4xMjItLjI3My0uMTk2LS41NzMtLjM0Nm0tNS40ODEgNy41NTdoLS4wMDRhOC45NDcgOC45NDcgMCAwIDEtNC41NjQtMS4yNDhsLS4zMjctLjE5NC0zLjM5My44OSA5MDUuMzg5LTMuMzM2LS4yMTMtLjMzOGE4LjkxIDguOTEgMCAwIDEtMS4zNjUtNC42ODZBNC45MiA4LjkyIDAgMCAxIDEyIDMuMTExYTguOTI4IDguOTI4IDAgMCAxIDcuNTQ4IDQuMDY1IDguOTQzIDguOTQzIDAgMCAxIDEuMzQgNC43MTdjLS4wMDEgNC45MzQtNC4wMSA4Ljk0My04LjkxNyA4Ljk0M3oiLz48L3N2Zz4=',
      pinterest: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZmlsbD0iI0UwMTIxQiIgZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzcyIDAgMTJjMCAzLjA3NiAxLjE1OCA1Ljg4MyAzLjA2IDguMDA3LS4wMy0uNDg4LS4wMDYtMS4wNzQuMTExLTEuNjA1LjEyOC0uNTguNzgyLTMuMzEyLjc4Mi0zLjMxMnMtLjIwNC0uNDA4LS4yMDQtMS4wMTJjMC0uOTQ4LjU1LTEuNjU2IDEuMjMyLTEuNjU2LjU4MSAwIDEuMDg4LjQzNiAxLjA4OCAxLjE2IDAgLjcwNS0uNDQ4IDEuNzYtLjY4IDIuNzM0LS4xOTQuODIxLjQxMSAxLjQ5MiAxLjIyIDEuNDkyIDEuNDY0IDAgMi41OTItMS41NDQgMi41OTItMy43NzIgMC0xLjk3Mi0xLjQxNy0zLjM0OC0zLjQ0LTMuMzQ4LTIuMzQ0IDAtMy43MiAxLjc1OS0zLjcyIDMuNTczIDAgLjcwOC4yNzMgMS40NjcuNjE1IDEuODguMDY4LjA4MS4wNzcuMTUyLjA1Ny4yMzUtLjA2MS4yNi0uMTk5LjgwNy0uMjI3Ljk0LS4wMzYuMTctLjEyLjIwNi0uMjc1LjEyNC0xLjAyNi0uNDc4LTEuNjY3LTEuOTc3LTEuNjY3LTMuMTgzIDAtMi41OTkgMS44ODgtNS4wODQgNS40NC01LjA4NCAyLjg1NiAwIDUuMDc2IDIuMDM5IDUuMDc2IDQuNzYzIDAgMi44NDUtMS43OTcgNS4xMy00LjI5IDUuMTMtLjgzOCAwLTEuNjI3LS40MzUtMS44OTctLjk1bC0uNTE2IDEuOTY2Yy0uMTg3LjcyLS42OTEgMS42MjMtMS4wMjkgMi4xNzNhMTIgMTIgMCAwIDAgMy4xNDguNDE1YzYuNjI3IDAgMTItNS4zNzMgMTItMTJTMTguNjI3IDAgMTIgMHoiLz48L3N2Zz4=',
      github: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTEyIC4yOTdjLTYuNjMgMC0xMiA1LjM3My0xMiAxMiAwIDUuMzAzIDMuNDM4IDkuOCA4LjIwNSAxMS4zODcuNi4xMTMuODItLjI1OC44Mi0uNTc3IDAtLjI4NS0uMDEtMS4wNC0uMDE1LTIuMDQtMy4zMzguNzI0LTQuMDQyLTEuNjEtNC4wNDItMS42MUMzLjAyIDE4LjQ5IDIuMzkxIDE4LjA2IDIuMzkxIDE4LjA2Yy0xLjA4OC0uNzQ3LjA4My0uNzMyLjA4My0uNzMyIDEuMjA1LjA4NSAxLjgzOCAxLjIzNiAxLjgzOCAxLjIzNiAxLjA3IDEuODM1IDIuODA5IDEuMzA1IDMuNDk1Ljk5OC4xMDgtLjc3Ni40MTctMS4zMDUuNzYtMS42MDUtMi42NjUtLjMtNS40NjYtMS4zMzItNS40NjYtNS45MyAwLTEuMzEuNDY1LTIuMzggMS4yMzUtMy4yMi0uMTM1LS4zMDMtLjU0LTEuNTIzLjEwNS0zLjE3NiAwIDAgMS4wMDUtLjMyMiAzLjMgMS4yMy45Ni0uMjY3IDEuOTgtLjM5OSAzLS40MDUgMS4wMi4wMDYgMi4wNC4xMzggMyAuNDA1IDIuMjgtMS41NTIgMy4yODUtMS4yMyAzLjI4NS0xLjIzLjY0NSAxLjY1My4yNCAyLjg3My4xMiAzLjE3Ni43NjUuODQgMS4yMyAxLjkxIDEuMjMgMy4yMiAwIDQuNjEtMi44MDUgNS42MjUtNS40NzUgNS45Mi40Mi4zNi44MSAxLjA5Ni44MSAyLjIyIDAgMS42MDYtLjAxNSAyLjg5Ni0uMDE1IDMuMjg2IDAgLjMxNS4yMS42OS44MjUuNTdDMjAuNTY1IDIyLjA5MiAyNCAxNy41OTIgMjQgMTIuMjk3YzAtNi42MjctNS4zNzMtMTItMTItMTJ6Ii8+PC9zdmc+',
    };
    return icons[platform] || icons.facebook;
  };

  const generateSignatureHTML = (): string => {
    let html = '';
    switch (templateType) {
      case 'simple':
        html = generateSimpleSignature();
        break;
      case 'advanced':
        html = generateAdvancedSignature();
        break;
      case 'premium':
        html = generatePremiumSignature();
        break;
    }

    // Add disclaimer if enabled
    if (signatureData.showDisclaimer && signatureData.disclaimerText) {
      html += `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width: 600px; margin-top: 15px;">
  <tr>
    <td style="font-size: 10px; color: #999; line-height: 1.4; padding: 10px 0; border-top: 1px solid #e0e0e0;">
      ${signatureData.disclaimerText}
    </td>
  </tr>
</table>
      `;
    }

    return html;
  };

  const copyToClipboard = async () => {
    const html = generateSignatureHTML();
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' }),
        }),
      ]);
      toast({
        title: 'Copied!',
        description: 'Email signature HTML copied to clipboard. Paste it into your email client.',
      });
    } catch (err) {
      // Fallback for browsers that don't support clipboard.write
      const textArea = document.createElement('textarea');
      textArea.value = html;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: 'Copied!',
        description: 'Email signature HTML copied to clipboard.',
      });
    }
  };

  const downloadHTML = () => {
    const html = generateSignatureHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'email-signature.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded!',
      description: 'Email signature HTML file downloaded successfully.',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2" data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Signature Generator</h1>
              <p className="mt-1 text-sm text-gray-600">Create professional email signatures with ease</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={copyToClipboard} className="bg-[#FF6A00] hover:bg-[#FF6A00]/90" data-testid="button-copy-html">
                <Copy className="w-4 h-4 mr-2" />
                Copy HTML
              </Button>
              <Button onClick={downloadHTML} variant="outline" data-testid="button-download-html">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Template</CardTitle>
                <CardDescription>Select a template style for your signature</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={templateType} onValueChange={(v) => setTemplateType(v as any)} data-testid="tabs-template">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="simple" data-testid="tab-simple">Simple</TabsTrigger>
                    <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="premium" data-testid="tab-premium">Premium</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signatureName">Signature (Handwritten Style)</Label>
                  <Input
                    id="signatureName"
                    value={signatureData.signatureName}
                    onChange={(e) => updateField('signatureName', e.target.value)}
                    placeholder="John Doe"
                    className="font-['Amsterdam_One'] text-2xl"
                    data-testid="input-signature-name"
                  />
                  <p className="text-xs text-gray-500">This will appear above your name in handwritten style</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={signatureData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="John Doe"
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={signatureData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="CEO & Founder"
                      data-testid="input-title"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={signatureData.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    placeholder="2TalkLink Inc."
                    data-testid="input-company"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cellPhone">Cell Phone</Label>
                    <Input
                      id="cellPhone"
                      value={signatureData.cellPhone}
                      onChange={(e) => updateField('cellPhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      data-testid="input-cell-phone"
                    />
                  </div>
                  {templateType !== 'simple' && (
                    <div className="space-y-2">
                      <Label htmlFor="officePhone">Office Phone</Label>
                      <Input
                        id="officePhone"
                        value={signatureData.officePhone}
                        onChange={(e) => updateField('officePhone', e.target.value)}
                        placeholder="+1 (555) 987-6543"
                        data-testid="input-office-phone"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={signatureData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="john@2talklink.com"
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={signatureData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://www.2talklink.com"
                    data-testid="input-website"
                  />
                </div>

                {templateType !== 'simple' && (
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={signatureData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="123 Main St, City, State 12345"
                      data-testid="input-address"
                    />
                  </div>
                )}

                {/* Custom Fields */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Custom Fields</Label>
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
                        <div key={index} className="grid grid-cols-2 gap-2 items-center">
                          <Input
                            value={field.label}
                            onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                            placeholder="Label (e.g., LinkedIn)"
                            data-testid={`input-custom-field-label-${index}`}
                          />
                          <div className="flex gap-2">
                            <Input
                              value={field.value}
                              onChange={(e) => updateCustomField(index, 'value', e.target.value)}
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
                  <p className="text-xs text-gray-500">Add any additional information like LinkedIn, Skype, Department, etc.</p>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profilePhoto">Profile Photo</Label>
                  <Input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload('profilePhoto', e.target.files[0])}
                    data-testid="input-profile-photo"
                  />
                </div>

                {templateType !== 'simple' && (
                  <div className="space-y-2">
                    <Label htmlFor="companyLogo">Company Logo</Label>
                    <Input
                      id="companyLogo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload('companyLogo', e.target.files[0])}
                      data-testid="input-company-logo"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={signatureData.primaryColor}
                        onChange={(e) => updateField('primaryColor', e.target.value)}
                        className="w-20 h-10"
                        data-testid="input-primary-color"
                      />
                      <Input
                        value={signatureData.primaryColor}
                        onChange={(e) => updateField('primaryColor', e.target.value)}
                        placeholder="#FF6A00"
                        data-testid="input-primary-color-hex"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={signatureData.secondaryColor}
                        onChange={(e) => updateField('secondaryColor', e.target.value)}
                        className="w-20 h-10"
                        data-testid="input-secondary-color"
                      />
                      <Input
                        value={signatureData.secondaryColor}
                        onChange={(e) => updateField('secondaryColor', e.target.value)}
                        placeholder="#333333"
                        data-testid="input-secondary-color-hex"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Social Links
                  <Button size="sm" onClick={addSocialLink} variant="outline" data-testid="button-add-social">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {signatureData.socialLinks.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Select
                      value={link.platform}
                      onValueChange={(v) => updateSocialLink(index, 'platform', v)}
                    >
                      <SelectTrigger className="w-[180px]" data-testid={`select-social-platform-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {socialPlatforms.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      placeholder="https://..."
                      data-testid={`input-social-url-${index}`}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeSocialLink(index)}
                      data-testid={`button-remove-social-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {signatureData.socialLinks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No social links added yet</p>
                )}
              </CardContent>
            </Card>

            {/* Optional Features */}
            {templateType !== 'simple' && (
              <Card>
                <CardHeader>
                  <CardTitle>Optional Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showCTA">Call-to-Action Button</Label>
                    <Switch
                      id="showCTA"
                      checked={signatureData.showCTA}
                      onCheckedChange={(checked) => updateField('showCTA', checked)}
                      data-testid="switch-show-cta"
                    />
                  </div>
                  {signatureData.showCTA && (
                    <div className="grid grid-cols-2 gap-4 pl-6">
                      <Input
                        value={signatureData.ctaText}
                        onChange={(e) => updateField('ctaText', e.target.value)}
                        placeholder="Button Text"
                        data-testid="input-cta-text"
                      />
                      <Input
                        value={signatureData.ctaUrl}
                        onChange={(e) => updateField('ctaUrl', e.target.value)}
                        placeholder="Button URL"
                        data-testid="input-cta-url"
                      />
                    </div>
                  )}

                  {templateType === 'premium' && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showBanner">Banner</Label>
                      <Switch
                        id="showBanner"
                        checked={signatureData.showBanner}
                        onCheckedChange={(checked) => updateField('showBanner', checked)}
                        data-testid="switch-show-banner"
                      />
                    </div>
                  )}
                  {templateType === 'premium' && signatureData.showBanner && (
                    <div className="pl-6">
                      <Input
                        value={signatureData.bannerText}
                        onChange={(e) => updateField('bannerText', e.target.value)}
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
                      onCheckedChange={(checked) => updateField('showDisclaimer', checked)}
                      data-testid="switch-show-disclaimer"
                    />
                  </div>
                  {signatureData.showDisclaimer && (
                    <div className="pl-6">
                      <Textarea
                        value={signatureData.disclaimerText}
                        onChange={(e) => updateField('disclaimerText', e.target.value)}
                        placeholder="Disclaimer text..."
                        rows={3}
                        data-testid="textarea-disclaimer"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Live Preview Panel */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>This is how your signature will look in emails</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[400px]">
                  <div dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }} />
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">📧 How to use:</p>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Click "Copy HTML" button above</li>
                    <li>Open your email client settings (Gmail, Outlook, etc.)</li>
                    <li>Find the signature section</li>
                    <li>Paste the HTML code</li>
                    <li>Save and you're done!</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
