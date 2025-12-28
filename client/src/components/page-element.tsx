import { PageElement } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect, useCallback } from "react";
import { generateFieldId } from "@/lib/card-data";
import { AIChat } from "@/components/ai-chat";
import { IngestForm } from "@/components/IngestForm";
import { URLManager } from "@/components/URLManager";
import { DocumentManager, DocumentItem } from "@/components/DocumentManager";
import { RAGChatBox } from "@/components/RAGChatBox";
import { KnowledgeManager } from "@/components/KnowledgeManager";
import { TextChunkManager } from "@/components/TextChunkManager";
import { VoiceAgentElement } from "@/components/VoiceAgentElement";
import { VoiceAssistantCard } from "@/components/VoiceAssistantCard";
import { MessageCircle } from "lucide-react";
import { MenuPageElement } from "@/modules/multi-page/components/MenuPageElement";
import ARPreviewMindAR from "@/elements/ARPreviewMindAR";
import { compileMind } from "@/builder/api/ar";
import { PdfViewerButton } from "@/components/PdfViewerButton";
import { SubscribeForm as SubscribeFormComponent } from "@/components/SubscribeForm";
import { InstallButtonElement } from "@/components/InstallButtonElement";
import { ShopElement } from "@/components/shop-element";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ContactLinksRenderer } from '@/components/ContactLinksRenderer';
import { SocialLinksRenderer } from '@/components/SocialLinksRenderer';
import { ContactSectionEditor } from '@/components/ContactSectionEditor';
import { SocialSectionEditor } from '@/components/SocialSectionEditor';
import {
  schemaToEditorContact,
  editorToSchemaContact,
  schemaToEditorSocial,
  editorToSchemaSocial,
} from '@/lib/element-adapters';
import { IconPicker } from '@/components/icon-picker';
import { ProfileSectionEditor } from '@/components/ProfileSectionEditor';
import { ProfileSectionRenderer } from '@/components/ProfileSectionRenderer';

// Helper function to convert hex color to rgba
function hexToRgba(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Sortable Image Item Component
interface SortableImageItemProps {
  image: { id: string; src: string; alt?: string; };
  index: number;
  onDelete: () => void;
  onUpdateAlt: (alt: string) => void;
}

function SortableImageItem({ image, index, onDelete, onUpdateAlt }: SortableImageItemProps) {
  const [showAltInput, setShowAltInput] = useState(false);
  const [altText, setAltText] = useState(image.alt || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAltUpdate = useCallback(() => {
    onUpdateAlt(altText);
    setShowAltInput(false);
  }, [altText, onUpdateAlt]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAltUpdate();
    }
    if (e.key === 'Escape') {
      setAltText(image.alt || '');
      setShowAltInput(false);
    }
  }, [handleAltUpdate, image.alt]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl overflow-hidden bg-slate-600 shadow-lg transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105 z-50' : 'hover:shadow-xl'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-20 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <i className="fas fa-grip-vertical text-white text-xs"></i>
      </div>

      {/* Delete Button */}
      <Button
        onClick={onDelete}
        variant="destructive"
        size="sm"
        className="absolute top-2 right-2 w-8 h-8 p-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20"
      >
        <i className="fas fa-times"></i>
      </Button>

      {/* Image Index */}
      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
        #{index + 1}
      </div>

      {/* Image */}
      <div className="aspect-square">
        <img
          src={image.src}
          alt={image.alt || ''}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Alt Text Input */}
      {showAltInput ? (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 backdrop-blur-sm">
          <Input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            onBlur={handleAltUpdate}
            onKeyDown={handleKeyDown}
            placeholder="Image description..."
            className="text-xs bg-transparent border-none text-white placeholder:text-slate-300 p-0 h-auto focus:ring-0"
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setShowAltInput(true)}
          className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          {image.alt || 'Add description...'}
        </button>
      )}
    </div>
  );
}

// Contact Form Renderer Component - wraps hooks to avoid React hook rules violation
function ContactFormRenderer({ element, isEditing, handleDataUpdate }: any) {
  type FieldType = "text" | "email" | "tel" | "textarea" | "date" | "select" | "checkbox";

  // Built-in field keys (only 5 default fields - users can add more with +Add Field)
  type BuiltInFieldKey =
    | "name"
    | "email"
    | "phone"
    | "subject"
    | "message";

  type FieldConfig = {
    key: string; // Can be built-in or custom (e.g., "custom_1234567890")
    enabled: boolean;
    type: FieldType;
    label: string;
    placeholder: string;
    required?: boolean;
    rows?: number; // only for textarea
    options?: string[]; // only for select
    isCustom?: boolean; // true for user-added custom fields
  };

  const builtInKeys: BuiltInFieldKey[] = [
    "name", "email", "phone", "subject", "message"
  ];

  const defaultFieldConfig: Record<BuiltInFieldKey, FieldConfig> = {
    name: {
      key: "name",
      enabled: true,
      type: "text",
      label: "Name",
      placeholder: "Your Name",
      required: true,
    },
    email: {
      key: "email",
      enabled: true,
      type: "email",
      label: "Email",
      placeholder: "Your Email",
      required: true,
    },
    phone: {
      key: "phone",
      enabled: false,
      type: "tel",
      label: "Phone",
      placeholder: "Your Phone",
      required: false,
    },
    subject: {
      key: "subject",
      enabled: false,
      type: "text",
      label: "Subject",
      placeholder: "Subject",
      required: false,
    },
    message: {
      key: "message",
      enabled: true,
      type: "textarea",
      label: "Message",
      placeholder: "Your Message",
      required: true,
      rows: 3,
    },
  };

  // Backward compatibility:
  // - If element.data.fieldConfigs exists => use it
  // - else fallback to element.data.fields (old array) and map to configs
  const normalizeFieldConfigs = (): FieldConfig[] => {
    const saved = element.data?.fieldConfigs;
    if (Array.isArray(saved) && saved.length) {
      // merge with defaults to avoid missing keys after upgrades
      const result: FieldConfig[] = [];
      const seenKeys = new Set<string>();

      // First, process saved fields in order (preserves order including custom fields)
      saved.forEach((f: any) => {
        if (!f?.key) return;
        const isBuiltIn = builtInKeys.includes(f.key as BuiltInFieldKey);
        const base = isBuiltIn ? (defaultFieldConfig as any)[f.key] : null;
        
        seenKeys.add(f.key);
        result.push({
          ...(base || {}),
          ...f,
          key: f.key,
          enabled: !!f.enabled,
          required: typeof f.required === "boolean" ? f.required : (base?.required ?? false),
          type: ([
            "text",
            "email",
            "tel",
            "textarea",
            "date",
            "select",
            "checkbox",
          ].includes(f.type)
            ? f.type
            : (base?.type ?? "text")) as FieldType,
          rows: typeof f.rows === "number" ? f.rows : (base?.rows ?? 3),
          options: Array.isArray(f.options) ? f.options : (base?.options ?? []),
          label: f.label || (base?.label ?? f.key),
          placeholder: f.placeholder || (base?.placeholder ?? ""),
          isCustom: !isBuiltIn || f.isCustom,
        });
      });

      // Add any missing built-in keys (disabled by default)
      builtInKeys.forEach((k) => {
        if (!seenKeys.has(k)) {
          result.push({ ...defaultFieldConfig[k], enabled: false });
        }
      });

      return result;
    }

    const oldFields: string[] = element.data?.fields || ["name", "email", "message"];
    return builtInKeys.map((k) => ({
      ...defaultFieldConfig[k],
      enabled: oldFields.includes(k),
    }));
  };

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string>("");

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const fieldConfigs = normalizeFieldConfigs();
  const enabledFields = fieldConfigs.filter((f) => f.enabled);

  // helpful derived list of email-type fields (for auto-reply recipient select)
  const emailFieldOptions = fieldConfigs.filter((f) => f.type === "email");

  // Modern settings (with defaults)
  const backgroundColor = element.data?.backgroundColor || "#f8fafc";
  const borderColor = element.data?.borderColor || "#e2e8f0";
  const inputBorderColor = element.data?.inputBorderColor || "#cbd5e1";
  const titleColor = element.data?.titleColor || "#1e293b";
  const borderRadius = element.data?.borderRadius ?? 8;

  const inputBgColor = element.data?.inputBgColor || "#ffffff";
  const inputTextColor = element.data?.inputTextColor || "#0f172a";
  const showLabels = element.data?.showLabels ?? false;
  const layout = element.data?.layout || "stack"; // stack | twoColumn
  const gap = element.data?.gap ?? 12; // px

  const buttonColor = element.data?.buttonColor || "#1e293b";
  const buttonTextColor = element.data?.buttonTextColor || "#ffffff";
  const buttonText = element.data?.buttonText || "Send Message";

  const successMessage =
    element.data?.successMessage || "✅ Message sent successfully!";
  const errorMessage =
    element.data?.errorMessage || "❌ Failed to send message. Please try again.";

  // Modern automation / advanced
  const redirectUrl = element.data?.redirectUrl || "";
  const openRedirectNewTab = element.data?.openRedirectNewTab ?? false;

  const enableHoneypot = element.data?.enableHoneypot ?? true;
  const enableGDPR = element.data?.enableGDPR ?? false;
  const gdprText =
    element.data?.gdprText ||
    "I agree to be contacted and allow you to store my submitted information.";

  const includeMeta = element.data?.includeMeta ?? true;
  const includeUTM = element.data?.includeUTM ?? true;

  // Optional client-side webhook (best-effort, CORS dependent)
  const clientWebhookUrl = element.data?.clientWebhookUrl || "";

  // NEW: Google Sheets integration options
  const googleSheetsEnabled = element.data?.googleSheetsEnabled ?? false;
  const googleSheetsSheetId = element.data?.googleSheetsSheetId || "";
  const googleSheetsTabName = element.data?.googleSheetsTabName || "Sheet1";

  // NEW: Auto-reply email options
  const autoReplyEnabled = element.data?.autoReplyEnabled ?? false;
  const autoReplyFromName = element.data?.autoReplyFromName || "";
  const autoReplyFromEmail = element.data?.autoReplyFromEmail || "";
  const autoReplyEmailFieldKey =
    element.data?.autoReplyEmailFieldKey || "email";
  const autoReplySubject =
    element.data?.autoReplySubject || "Thank you for contacting us";
  const autoReplyMessage =
    element.data?.autoReplyMessage ||
    "Hi {{name}},\n\nThanks for reaching out. We’ll get back to you soon.\n\nBest regards,\n{{from_name}}";

  const buildMeta = () => {
    const meta: any = {
      timestamp: new Date().toISOString(),
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "",
    };

    if (includeUTM && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const utmKeys = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
      ];
      const utm: any = {};
      utmKeys.forEach((k) => {
        const v = params.get(k);
        if (v) utm[k] = v;
      });
      meta.utm = utm;
    }

    return meta;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("");

    try {
      // Honeypot check (client-side)
      if (enableHoneypot && formData._hp) {
        setSubmitStatus(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // GDPR required check
      if (enableGDPR && !formData._gdpr) {
        setSubmitStatus("Please accept the consent checkbox.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        formData,
        formConfig: {
          ...element.data,
          googleSheetsEnabled,
          googleSheetsSheetId,
          googleSheetsTabName,
          autoReplyEnabled,
          autoReplyFromName,
          autoReplyFromEmail,
          autoReplyEmailFieldKey,
          autoReplySubject,
          autoReplyMessage,
        },
        meta: includeMeta ? buildMeta() : undefined,
      };

      const response = await fetch("/api/contact-form/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus(successMessage);
        setFormData({});

        // best-effort client-side webhook (optional)
        if (clientWebhookUrl) {
          try {
            fetch(clientWebhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }).catch(() => {});
          } catch {}
        }

        // redirect (optional)
        if (redirectUrl) {
          setTimeout(() => {
            if (openRedirectNewTab) window.open(redirectUrl, "_blank");
            else window.location.href = redirectUrl;
          }, 400);
        }
      } else {
        setSubmitStatus(errorMessage);
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      setSubmitStatus(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------- EDIT MODE (FULL CUSTOMIZATION UI) --------
  if (isEditing) {
    const setField = (key: string, patch: Partial<FieldConfig>) => {
      const next = normalizeFieldConfigs().map((f) =>
        f.key === key ? { ...f, ...patch } : f
      );
      handleDataUpdate({ fieldConfigs: next });

      // keep old "fields" array updated for older parts of app
      const fieldsLegacy = next.filter((f) => f.enabled).map((f) => f.key);
      handleDataUpdate({ fields: fieldsLegacy });
    };

    const addCustomField = () => {
      const uniqueKey = `custom_${Date.now()}`;
      const newField: FieldConfig = {
        key: uniqueKey,
        enabled: true,
        type: "text",
        label: "New Field",
        placeholder: "Enter value",
        required: false,
        isCustom: true,
      };
      const current = normalizeFieldConfigs();
      const next = [...current, newField];
      handleDataUpdate({ fieldConfigs: next });
    };

    const deleteField = (key: string) => {
      const current = normalizeFieldConfigs();
      const next = current.filter((f) => f.key !== key);
      handleDataUpdate({ fieldConfigs: next });
      // Update legacy fields array
      const fieldsLegacy = next.filter((f) => f.enabled).map((f) => f.key);
      handleDataUpdate({ fields: fieldsLegacy });
    };

    const moveField = (fromIndex: number, toIndex: number) => {
      const current = normalizeFieldConfigs();
      const next = [...current];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      handleDataUpdate({ fieldConfigs: next });
    };

    return (
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">Form Title</label>
          <Input
            value={element.data?.title || ""}
            onChange={(e) => handleDataUpdate({ title: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="Contact Me"
          />
        </div>

        {/* Fields (Modern) */}
        <div className="bg-slate-700 p-3 rounded space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white text-sm font-medium flex items-center gap-2">
              <i className="fas fa-sliders"></i>
              Form Fields
            </h4>
            <button
              type="button"
              onClick={addCustomField}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              data-testid="button-add-field"
            >
              <i className="fas fa-plus text-[10px]"></i>
              Add Field
            </button>
          </div>

          <div className="space-y-3">
            {fieldConfigs.map((f, index) => (
              <div
                key={f.key}
                className="bg-slate-800/50 rounded p-3 space-y-2 border border-slate-600 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5 mr-1">
                      <button
                        type="button"
                        onClick={() => index > 0 && moveField(index, index - 1)}
                        disabled={index === 0}
                        className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-[10px] p-0.5"
                        title="Move up"
                      >
                        <i className="fas fa-chevron-up"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => index < fieldConfigs.length - 1 && moveField(index, index + 1)}
                        disabled={index === fieldConfigs.length - 1}
                        className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-[10px] p-0.5"
                        title="Move down"
                      >
                        <i className="fas fa-chevron-down"></i>
                      </button>
                    </div>
                    <label className="text-sm text-slate-200 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!f.enabled}
                        onChange={() =>
                          setField(f.key, { enabled: !f.enabled })
                        }
                        className="rounded border-slate-500 bg-slate-600 text-green-500 focus:ring-green-500"
                      />
                      <span className="capitalize">{f.label || f.key}</span>
                      {f.isCustom && (
                        <span className="text-[10px] bg-green-600/50 text-green-200 px-1.5 py-0.5 rounded">Custom</span>
                      )}
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-300 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!f.required}
                        disabled={!f.enabled}
                        onChange={() =>
                          setField(f.key, { required: !f.required })
                        }
                        className="rounded border-slate-500 bg-slate-600 text-green-500 focus:ring-green-500"
                      />
                      Required
                    </label>
                    {f.isCustom && (
                      <button
                        type="button"
                        onClick={() => deleteField(f.key)}
                        className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                        title="Delete field"
                        data-testid={`button-delete-field-${f.key}`}
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Label
                    </label>
                    <Input
                      value={f.label}
                      disabled={!f.enabled}
                      onChange={(e) =>
                        setField(f.key, { label: e.target.value })
                      }
                      className="bg-slate-600 border-slate-500 text-white text-xs"
                      placeholder="Label"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Placeholder
                    </label>
                    <Input
                      value={f.placeholder}
                      disabled={!f.enabled}
                      onChange={(e) =>
                        setField(f.key, { placeholder: e.target.value })
                      }
                      className="bg-slate-600 border-slate-500 text-white text-xs"
                      placeholder="Placeholder"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 block mb-1">
                      Type
                    </label>
                    <Select
                      value={f.type}
                      onValueChange={(v) =>
                        setField(f.key, { type: v as FieldType })
                      }
                      disabled={!f.enabled}
                    >
                      <SelectTrigger className="bg-slate-600 border-slate-500 text-white text-xs">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="tel">Phone</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {f.type === "textarea" && (
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Rows
                    </label>
                    <input
                      type="range"
                      min={2}
                      max={8}
                      value={f.rows ?? 3}
                      disabled={!f.enabled}
                      onChange={(e) =>
                        setField(f.key, { rows: Number(e.target.value) })
                      }
                      className="w-full accent-green-500"
                    />
                    <div className="text-xs text-slate-300">
                      {f.rows ?? 3} rows
                    </div>
                  </div>
                )}

                {f.type === "select" && (
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Options (comma separated)
                    </label>
                    <Input
                      disabled={!f.enabled}
                      value={(f.options || []).join(", ")}
                      onChange={(e) =>
                        setField(f.key, {
                          options: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className="bg-slate-600 border-slate-500 text-white text-xs"
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Layout & UX */}
        <div className="bg-slate-700 p-3 rounded space-y-3">
          <h4 className="text-white text-sm font-medium flex items-center gap-2">
            <i className="fas fa-table-columns"></i>
            Layout & UX
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Layout</label>
              <Select
                value={layout}
                onValueChange={(v) => handleDataUpdate({ layout: v })}
              >
                <SelectTrigger className="bg-slate-600 border-slate-500 text-white text-xs">
                  <SelectValue placeholder="Layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stack">Stack</SelectItem>
                  <SelectItem value="twoColumn">Two Column</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Gap ({gap}px)
              </label>
              <input
                type="range"
                min="6"
                max="24"
                value={gap}
                onChange={(e) =>
                  handleDataUpdate({ gap: Number(e.target.value) })
                }
                className="w-full accent-green-500"
              />
            </div>

            <div className="col-span-2 flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
              <div className="text-sm text-slate-200">Show Labels</div>
              <Switch
                checked={showLabels}
                onCheckedChange={(v) => handleDataUpdate({ showLabels: v })}
              />
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="bg-slate-700 p-3 rounded space-y-3">
          <h4 className="text-white text-sm font-medium flex items-center gap-2">
            <i className="fas fa-square"></i>
            Button Settings
          </h4>
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Button Text
            </label>
            <Input
              value={buttonText}
              onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
              className="bg-slate-600 border-slate-500 text-white"
              placeholder="Send Message"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Button Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={buttonColor}
                  onChange={(e) =>
                    handleDataUpdate({ buttonColor: e.target.value })
                  }
                  className="w-8 h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                />
                <Input
                  value={buttonColor}
                  onChange={(e) =>
                    handleDataUpdate({ buttonColor: e.target.value })
                  }
                  className="bg-slate-600 border-slate-500 text-white text-xs flex-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={buttonTextColor}
                  onChange={(e) =>
                    handleDataUpdate({ buttonTextColor: e.target.value })
                  }
                  className="w-8 h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                />
                <Input
                  value={buttonTextColor}
                  onChange={(e) =>
                    handleDataUpdate({ buttonTextColor: e.target.value })
                  }
                  className="bg-slate-600 border-slate-500 text-white text-xs flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Styling */}
        <div className="bg-slate-700 p-3 rounded space-y-3">
          <h4 className="text-white text-sm font-medium flex items-center gap-2">
            <i className="fas fa-palette"></i>
            Form Styling
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Background
              </label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) =>
                  handleDataUpdate({ backgroundColor: e.target.value })
                }
                className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Border Color
              </label>
              <input
                type="color"
                value={borderColor}
                onChange={(e) =>
                  handleDataUpdate({ borderColor: e.target.value })
                }
                className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Input Border
              </label>
              <input
                type="color"
                value={inputBorderColor}
                onChange={(e) =>
                  handleDataUpdate({ inputBorderColor: e.target.value })
                }
                className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Title Color
              </label>
              <input
                type="color"
                value={titleColor}
                onChange={(e) =>
                  handleDataUpdate({ titleColor: e.target.value })
                }
                className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Input BG
              </label>
              <input
                type="color"
                value={inputBgColor}
                onChange={(e) =>
                  handleDataUpdate({ inputBgColor: e.target.value })
                }
                className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Input Text
              </label>
              <input
                type="color"
                value={inputTextColor}
                onChange={(e) =>
                  handleDataUpdate({ inputTextColor: e.target.value })
                }
                className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Border Radius: {borderRadius}px
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={borderRadius}
              onChange={(e) =>
                handleDataUpdate({ borderRadius: Number(e.target.value) })
              }
              className="w-full accent-green-500"
            />
          </div>
        </div>

        {/* Automation */}
        <div className="bg-slate-700 p-3 rounded space-y-3">
          <h4 className="text-white text-sm font-medium flex items-center gap-2">
            <i className="fas fa-bolt"></i>
            Automation (Modern)
          </h4>

          {/* Redirect */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Redirect URL (after success)
            </label>
            <Input
              value={redirectUrl}
              onChange={(e) =>
                handleDataUpdate({ redirectUrl: e.target.value })
              }
              className="bg-slate-600 border-slate-500 text-white"
              placeholder="https://your-site.com/thank-you"
            />
            <div className="mt-2 flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
              <div className="text-sm text-slate-200">
                Open redirect in new tab
              </div>
              <Switch
                checked={openRedirectNewTab}
                onCheckedChange={(v) =>
                  handleDataUpdate({ openRedirectNewTab: v })
                }
              />
            </div>
          </div>

          {/* Client-side Webhook */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Client-side Webhook URL (optional, CORS needed)
            </label>
            <Input
              value={clientWebhookUrl}
              onChange={(e) =>
                handleDataUpdate({ clientWebhookUrl: e.target.value })
              }
              className="bg-slate-600 border-slate-500 text-white"
              placeholder="https://hooks.zapier.com/hooks/catch/xxxx/yyyy"
            />
            <p className="text-xs text-slate-300 mt-1">
              Tip: For best reliability use backend automation in{" "}
              <code>/api/contact-form/submit</code>.
            </p>
          </div>

          {/* Google Sheets */}
          <div className="pt-3 mt-2 border-t border-slate-600 space-y-2">
            <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
              <div className="text-sm text-slate-200">
                Send submissions to Google Sheets
              </div>
              <Switch
                checked={googleSheetsEnabled}
                onCheckedChange={(v) =>
                  handleDataUpdate({ googleSheetsEnabled: v })
                }
              />
            </div>

            {googleSheetsEnabled && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Sheet ID
                  </label>
                  <Input
                    value={googleSheetsSheetId}
                    onChange={(e) =>
                      handleDataUpdate({ googleSheetsSheetId: e.target.value })
                    }
                    className="bg-slate-600 border-slate-500 text-white text-xs"
                    placeholder="Google Sheet ID"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Tab Name
                  </label>
                  <Input
                    value={googleSheetsTabName}
                    onChange={(e) =>
                      handleDataUpdate({ googleSheetsTabName: e.target.value })
                    }
                    className="bg-slate-600 border-slate-500 text-white text-xs"
                    placeholder="Sheet1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Auto-reply */}
          <div className="pt-3 mt-2 border-t border-slate-600 space-y-2">
            <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
              <div className="text-sm text-slate-200">
                Send auto-reply email to user
              </div>
              <Switch
                checked={autoReplyEnabled}
                onCheckedChange={(v) =>
                  handleDataUpdate({ autoReplyEnabled: v })
                }
              />
            </div>

            {autoReplyEnabled && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      From Name
                    </label>
                    <Input
                      value={autoReplyFromName}
                      onChange={(e) =>
                        handleDataUpdate({
                          autoReplyFromName: e.target.value,
                        })
                      }
                      className="bg-slate-600 border-slate-500 text-white text-xs"
                      placeholder="Your Brand / Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      From Email
                    </label>
                    <Input
                      value={autoReplyFromEmail}
                      onChange={(e) =>
                        handleDataUpdate({
                          autoReplyFromEmail: e.target.value,
                        })
                      }
                      className="bg-slate-600 border-slate-500 text-white text-xs"
                      placeholder="no-reply@yourdomain.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Use Email From Field
                  </label>
                  <Select
                    value={autoReplyEmailFieldKey}
                    onValueChange={(v) =>
                      handleDataUpdate({ autoReplyEmailFieldKey: v })
                    }
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white text-xs">
                      <SelectValue placeholder="Select email field" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailFieldOptions.length === 0 && (
                        <SelectItem value="email">email</SelectItem>
                      )}
                      {emailFieldOptions.map((f) => (
                        <SelectItem key={f.key} value={f.key}>
                          {f.label} ({f.key})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-300 mt-1">
                    This field’s value will receive the auto-reply.
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Subject
                  </label>
                  <Input
                    value={autoReplySubject}
                    onChange={(e) =>
                      handleDataUpdate({
                        autoReplySubject: e.target.value,
                      })
                    }
                    className="bg-slate-600 border-slate-500 text-white text-xs"
                    placeholder="Thank you for contacting us"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Message (supports {"{{name}}"}, {"{{from_name}}"})
                  </label>
                  <Textarea
                    value={autoReplyMessage}
                    onChange={(e) =>
                      handleDataUpdate({
                        autoReplyMessage: e.target.value,
                      })
                    }
                    className="bg-slate-600 border-slate-500 text-white text-xs"
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Admin Notification */}
          <div className="pt-3 mt-2 border-t border-slate-600 space-y-2">
            <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
              <div className="text-sm text-slate-200">
                Send notification to admin
              </div>
              <Switch
                checked={!!element.data?.notifyAdminEmail}
                onCheckedChange={(v) =>
                  handleDataUpdate({ notifyAdminEmail: v ? '' : undefined })
                }
              />
            </div>

            {element.data?.notifyAdminEmail !== undefined && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Admin Email Address
                  </label>
                  <Input
                    value={element.data?.notifyAdminEmail || ''}
                    onChange={(e) =>
                      handleDataUpdate({ notifyAdminEmail: e.target.value })
                    }
                    className="bg-slate-600 border-slate-500 text-white text-xs"
                    placeholder="admin@yourdomain.com"
                  />
                  <p className="text-xs text-slate-300 mt-1">
                    Receive email notifications for each form submission.
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Notification Subject
                  </label>
                  <Input
                    value={element.data?.notifyAdminSubject || ''}
                    onChange={(e) =>
                      handleDataUpdate({ notifyAdminSubject: e.target.value })
                    }
                    className="bg-slate-600 border-slate-500 text-white text-xs"
                    placeholder="New Contact Form Submission"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Advanced */}
        <div className="bg-slate-700 p-3 rounded space-y-3">
          <h4 className="text-white text-sm font-medium flex items-center gap-2">
            <i className="fas fa-shield-halved"></i>
            Advanced
          </h4>

          <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
            <div className="text-sm text-slate-200">
              Enable Honeypot (anti-spam)
            </div>
            <Switch
              checked={enableHoneypot}
              onCheckedChange={(v) =>
                handleDataUpdate({ enableHoneypot: v })
              }
            />
          </div>

          <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
            <div className="text-sm text-slate-200">
              Include Meta (url, userAgent, time)
            </div>
            <Switch
              checked={includeMeta}
              onCheckedChange={(v) =>
                handleDataUpdate({ includeMeta: v })
              }
            />
          </div>

          <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
            <div className="text-sm text-slate-200">Include UTM params</div>
            <Switch
              checked={includeUTM}
              onCheckedChange={(v) =>
                handleDataUpdate({ includeUTM: v })
              }
            />
          </div>

          <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
            <div className="text-sm text-slate-200">
              GDPR Consent Checkbox
            </div>
            <Switch
              checked={enableGDPR}
              onCheckedChange={(v) =>
                handleDataUpdate({ enableGDPR: v })
              }
            />
          </div>

          {enableGDPR && (
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Consent Text
              </label>
              <Input
                value={gdprText}
                onChange={(e) =>
                  handleDataUpdate({ gdprText: e.target.value })
                }
                className="bg-slate-600 border-slate-500 text-white"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Success Message
              </label>
              <Input
                value={successMessage}
                onChange={(e) =>
                  handleDataUpdate({ successMessage: e.target.value })
                }
                className="bg-slate-600 border-slate-500 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Error Message
              </label>
              <Input
                value={errorMessage}
                onChange={(e) =>
                  handleDataUpdate({ errorMessage: e.target.value })
                }
                className="bg-slate-600 border-slate-500 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------- VIEW MODE (MODERN FORM RENDER) --------
  const gridClass =
    layout === "twoColumn"
      ? "grid grid-cols-1 sm:grid-cols-2"
      : "grid grid-cols-1";

  return (
    <div
      className="p-4 border"
      style={{
        backgroundColor,
        borderColor,
        borderRadius: `${borderRadius}px`,
      }}
    >
      <h3
        className="font-bold mb-4 text-xl tracking-wide"
        style={{ color: titleColor }}
      >
        {element.data?.title || "Contact Me"}
      </h3>

      <form onSubmit={handleFormSubmit} style={{ display: "block" }}>
        {enableHoneypot && (
          <input
            type="text"
            name="_hp"
            value={formData._hp || ""}
            onChange={(e) => handleInputChange("_hp", e.target.value)}
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />
        )}

        <div className={`${gridClass}`} style={{ gap: `${gap}px` }}>
          {enabledFields.map((f) => {
            const commonStyle: React.CSSProperties = {
              borderColor: inputBorderColor,
              backgroundColor: inputBgColor,
              color: inputTextColor,
            };

            const labelEl = showLabels ? (
              <label
                className="text-sm mb-1 block text-slate-700"
                style={{ color: titleColor }}
              >
                {f.label}
                {f.required ? (
                  <span className="ml-1 text-red-500">*</span>
                ) : null}
              </label>
            ) : null;

            const value = formData[f.key] ?? "";

            if (f.type === "textarea") {
              return (
                <div
                  key={f.key}
                  className={
                    layout === "twoColumn" ? "sm:col-span-2" : ""
                  }
                >
                  {labelEl}
                  <textarea
                    placeholder={f.placeholder}
                    value={value}
                    onChange={(e) =>
                      handleInputChange(f.key, e.target.value)
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={commonStyle}
                    rows={f.rows ?? 3}
                    required={!!f.required}
                  />
                </div>
              );
            }

            if (f.type === "select") {
              return (
                <div key={f.key}>
                  {labelEl}
                  <select
                    value={value}
                    onChange={(e) =>
                      handleInputChange(f.key, e.target.value)
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={commonStyle}
                    required={!!f.required}
                  >
                    <option value="">
                      {f.placeholder || "Select an option"}
                    </option>
                    {(f.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (f.type === "checkbox") {
              return (
                <div key={f.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) =>
                      handleInputChange(f.key, e.target.checked)
                    }
                    className="w-4 h-4 border rounded focus:ring-2 focus:ring-green-500"
                    style={commonStyle}
                  />
                  <span
                    className="text-sm"
                    style={{ color: titleColor }}
                  >
                    {f.label}
                  </span>
                </div>
              );
            }

            // text, email, tel, date
            return (
              <div key={f.key}>
                {labelEl}
                <input
                  type={f.type === "date" ? "date" : f.type}
                  placeholder={f.placeholder}
                  value={value}
                  onChange={(e) =>
                    handleInputChange(f.key, e.target.value)
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={commonStyle}
                  required={!!f.required}
                />
              </div>
            );
          })}
        </div>

        {enableGDPR && (
          <label className="flex items-start gap-2 mt-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={!!formData._gdpr}
              onChange={(e) =>
                handleInputChange("_gdpr", e.target.checked)
              }
              className="mt-1"
              required
            />
            <span>{gdprText}</span>
          </label>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 rounded font-medium disabled:opacity-50 transition-opacity mt-4"
          style={{
            backgroundColor: buttonColor,
            color: buttonTextColor,
          }}
        >
          {isSubmitting ? "Sending..." : buttonText}
        </button>

        {submitStatus && (
          <div className="text-sm text-center mt-2">
            {submitStatus}
          </div>
        )}
      </form>
    </div>
  );
}


// Availability Widget Component
interface AvailabilityWidgetProps {
  eventTypeSlug?: string;
  timezone?: string;
  displayStyle?: string;
  daysToShow?: number;
  primaryColor?: string;
  showBookingButton?: boolean;
  bookingButtonText?: string;
  openInNewTab?: boolean;
  isInteractive?: boolean;
}

function AvailabilityWidget({
  eventTypeSlug = '30min-meeting',
  timezone = 'auto',
  displayStyle = 'compact',
  daysToShow = 7,
  primaryColor = '#22c55e',
  showBookingButton = true,
  bookingButtonText = 'Book a slot',
  openInNewTab = false,
  isInteractive = true
}: AvailabilityWidgetProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  // Generate mock availability data
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call
    const timer = setTimeout(() => {
      const mockSlots = [];
      const today = new Date();

      for (let i = 0; i < daysToShow; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Mock availability - some days available, some busy, some with multiple slots
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isAvailable = !isWeekend && Math.random() > 0.3;

        if (isAvailable) {
          // Add multiple time slots for available days
          const timeSlots = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];
          timeSlots.forEach((time, timeIndex) => {
            if (Math.random() > 0.4) { // 60% chance each slot is available
              mockSlots.push({
                id: `${i}-${timeIndex}`,
                day: `${dayName}, ${dateStr}`,
                time,
                available: true,
                date: date.toISOString().split('T')[0]
              });
            }
          });
        } else {
          // Add one busy slot for non-available days
          mockSlots.push({
            id: `${i}-busy`,
            day: `${dayName}, ${dateStr}`,
            time: isWeekend ? 'Weekend' : 'No slots',
            available: false,
            date: date.toISOString().split('T')[0]
          });
        }
      }

      setAvailableSlots(mockSlots);
      setIsLoading(false);
    }, 800); // Simulate loading delay

    return () => clearTimeout(timer);
  }, [daysToShow, eventTypeSlug]);

  const handleSlotClick = useCallback((slot: any) => {
    if (!isInteractive || !slot.available) return;

    const bookingUrl = `/booking/${eventTypeSlug}?date=${slot.date}&time=${encodeURIComponent(slot.time)}&source=availability`;

    if (openInNewTab) {
      window.open(bookingUrl, '_blank');
    } else {
      window.location.href = bookingUrl;
    }
  }, [eventTypeSlug, isInteractive, openInNewTab]);

  const handleBookingClick = useCallback(() => {
    if (!isInteractive) return;

    const bookingUrl = `/booking/${eventTypeSlug}?source=availability`;

    if (openInNewTab) {
      window.open(bookingUrl, '_blank');
    } else {
      window.location.href = bookingUrl;
    }
  }, [eventTypeSlug, isInteractive, openInNewTab]);

  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="availability-loading">
        {Array.from({ length: Math.min(daysToShow, 5) }).map((_, index) => (
          <div key={`loading-${index}`} className="flex items-center justify-between p-3 bg-white rounded border animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            <div className="h-4 bg-slate-200 rounded w-16"></div>
            <div className="h-4 bg-slate-200 rounded w-12"></div>
          </div>
        ))}
        {showBookingButton && (
          <div className="mt-4 text-center">
            <div className="h-10 bg-slate-200 rounded w-32 mx-auto animate-pulse"></div>
          </div>
        )}
      </div>
    );
  }

  if (displayStyle === 'minimal') {
    return (
      <div className="space-y-2">
        <div className="text-center text-sm text-slate-600 mb-3">
          <i className="fas fa-clock mr-1"></i>
          {availableSlots.filter(slot => slot.available).length} slots available
        </div>
        {showBookingButton && (
          <div className="text-center">
            <Button
              onClick={handleBookingClick}
              style={{
                backgroundColor: primaryColor,
                color: "#ffffff",
              }}
              className="px-4 py-2 rounded font-medium hover:shadow-lg transition-all"
              data-testid="button-book-availability"
            >
              <i className="fas fa-calendar-alt mr-2"></i>
              {bookingButtonText}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {availableSlots.map((slot, index) => (
        <div 
          key={slot.id} 
          className={`flex items-center justify-between p-3 bg-white rounded border transition-all ${
            slot.available && isInteractive ? 'hover:shadow-md hover:border-slate-300 cursor-pointer' : ''
          }`}
          onClick={() => handleSlotClick(slot)}
          data-testid={`availability-slot-${index}`}
        >
          <span className="text-sm font-medium text-slate-700" data-testid={`availability-day-${index}`}>
            {displayStyle === 'detailed' ? slot.day : slot.day.split(',')[0]}
          </span>
          <span className="text-sm text-slate-600" data-testid={`availability-time-${index}`}>
            {slot.time}
          </span>
          <div className="flex items-center">
            <div 
              className={`w-2 h-2 rounded-full mr-2 ${
                slot.available ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className={`text-xs ${
              slot.available ? "text-green-600" : "text-red-600"
            }`}>
              {slot.available ? "Available" : "Busy"}
            </span>
          </div>
        </div>
      ))}

      {showBookingButton && (
        <div className="mt-4 text-center">
          <Button
            onClick={handleBookingClick}
            style={{
              backgroundColor: primaryColor,
              color: "#ffffff",
            }}
            className="px-4 py-2 rounded font-medium hover:shadow-lg transition-all"
            data-testid="button-book-availability"
          >
            <i className="fas fa-calendar-alt mr-2"></i>
            {bookingButtonText}
          </Button>
        </div>
      )}
    </div>
  );
}

// Enhanced Image Slider Component with Modern Design
interface ImageSliderComponentProps {
  images: { id: string; src: string; alt?: string; }[];
  defaultView?: string;
  autoPlay?: boolean;
  orientation?: string;
  displayMode?: string;
}

function ImageSliderComponent({ images, defaultView, autoPlay, orientation, displayMode }: ImageSliderComponentProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay || false);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => prev < images.length - 1 ? prev + 1 : 0);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, images.length]);

  // Simple, clean carousel for card display
  return (
    <div className="w-full">
      {/* Main Carousel - Clean Design for Card */}
      <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-lg">
        <div className="relative" style={{ aspectRatio: 'auto' }}>
          {/* Current Image - Full Display */}
          <div className="relative">
            <img
              src={images[currentSlide]?.src}
              alt={images[currentSlide]?.alt || ''}
              className={`w-full ${
                displayMode === 'cover' 
                  ? 'h-64 object-cover' 
                  : orientation === 'vertical' 
                    ? 'max-h-96 object-contain' 
                    : orientation === 'horizontal'
                      ? 'max-h-64 object-contain'
                      : 'max-h-80 object-contain'
              }`}
              key={currentSlide}
            />
          </div>

          {/* Navigation Arrows - Only if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide(prev => prev > 0 ? prev - 1 : images.length - 1)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200 shadow-lg"
              >
                <i className="fas fa-chevron-left text-sm"></i>
              </button>
              <button
                onClick={() => setCurrentSlide(prev => prev < images.length - 1 ? prev + 1 : 0)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200 shadow-lg"
              >
                <i className="fas fa-chevron-right text-sm"></i>
              </button>
            </>
          )}

          {/* Simple dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white scale-125' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Testimonials Slider Component
interface TestimonialsSliderProps {
  testimonials: any[];
}

function TestimonialsSlider({ testimonials }: TestimonialsSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id || `testimonial-${index}`} className="w-full flex-shrink-0 px-2">
              <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <i key={`star-${i}`} className="fas fa-star text-yellow-400"></i>
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold text-slate-800">{testimonial.name}</p>
                    {testimonial.title && (
                      <p className="text-sm text-slate-600">{testimonial.title}</p>
                    )}
                    {testimonial.company && (
                      <p className="text-sm text-slate-500">{testimonial.company}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {testimonials.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide(prev => prev > 0 ? prev - 1 : testimonials.length - 1)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors"
            data-testid="testimonials-prev"
          >
            <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <button
            onClick={() => setCurrentSlide(prev => prev < testimonials.length - 1 ? prev + 1 : 0)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors"
            data-testid="testimonials-next"
          >
            <i className="fas fa-chevron-right text-sm"></i>
          </button>
          <div className="flex justify-center mt-4 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-green-500' : 'bg-slate-300'
                }`}
                data-testid={`testimonials-dot-${index}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}


interface PageElementProps {
  element: PageElement;
  isEditing?: boolean;
  onUpdate?: (element: PageElement) => void;
  onDelete?: (elementId: string) => void;
  onSave?: (dataOverride?: any) => Promise<void>;
  isInteractive?: boolean;
  cardData?: any; // Business card data for theme colors
  onNavigatePage?: (pageId: string) => void;
}

export function PageElementRenderer({ element, isEditing = false, onUpdate, onDelete, onSave, isInteractive = true, cardData, onNavigatePage }: PageElementProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [voiceAgentSections, setVoiceAgentSections] = useState({
    basic: true,
    voice: false,
    knowledge: false,
    scripts: false,
    integrations: false,
    callSettings: false,
    audio: false
  });

  // Define sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper function to safely access element data
  const getData = () => element.data || {};

  const handleDataUpdate = useCallback((newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  }, [element, onUpdate]);

  const toggleVoiceSection = useCallback((section: keyof typeof voiceAgentSections) => {
    setVoiceAgentSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const renderElement = () => {
    const elementData = element.data || {};

    switch (element.type) {
      case "heading":
        const HeadingTag = elementData.level as keyof JSX.IntrinsicElements || 'h1';
        const headingColor = elementData?.color || cardData?.headingColor || "#0f0f0f";

        return (
          <div className={`text-${elementData.alignment || 'left'} mb-4`}>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={elementData?.text || ''}
                  onChange={(e) => handleDataUpdate({ text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Heading text"
                />
                <div className="flex gap-2">
                  <select
                    value={elementData?.level || 'h1'}
                    onChange={(e) => handleDataUpdate({ level: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                  >
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                  </select>
                  <select
                    value={elementData?.alignment || 'left'}
                    onChange={(e) => handleDataUpdate({ alignment: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                  <input
                    type="color"
                    value={elementData?.color || cardData?.headingColor || "#0f0f0f"}
                    onChange={(e) => handleDataUpdate({ color: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                  />
                  {elementData?.color && (
                    <button
                      onClick={() => handleDataUpdate({ color: undefined })}
                      className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                    >
                      <i className="fas fa-undo mr-1"></i>
                      Reset to Theme
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <HeadingTag 
                className={`font-bold ${
                  elementData.level === 'h1' ? 'text-2xl' : 
                  elementData.level === 'h2' ? 'text-xl' : 'text-lg'
                }`}
                style={{ color: headingColor }}
              >
                {elementData.text}
              </HeadingTag>
            )}
          </div>
        );

      case "paragraph":
        const paragraphColor = elementData?.color || cardData?.paragraphColor || "#141414";

        return (
          <div className={`text-${elementData.alignment || 'left'} mb-4`}>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={elementData?.text || ''}
                  onChange={(e) => handleDataUpdate({ text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Paragraph text"
                  rows={3}
                />
                <select
                  value={elementData?.alignment || 'left'}
                  onChange={(e) => handleDataUpdate({ alignment: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                  <input
                    type="color"
                    value={elementData?.color || cardData?.paragraphColor || "#141414"}
                    onChange={(e) => handleDataUpdate({ color: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                  />
                  {elementData?.color && (
                    <button
                      onClick={() => handleDataUpdate({ color: undefined })}
                      className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                    >
                      <i className="fas fa-undo mr-1"></i>
                      Reset to Theme
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: paragraphColor }}>
                {elementData.text}
              </p>
            )}
          </div>
        );

      case "link":
        return (
          <div className="mb-1">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={elementData?.text || ''}
                  onChange={(e) => handleDataUpdate({ text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Link text"
                />
                <Input
                  value={elementData?.url || ''}
                  onChange={(e) => handleDataUpdate({ url: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="https://example.com"
                />
                <select
                  value={elementData?.style || 'button'}
                  onChange={(e) => handleDataUpdate({ style: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                >
                  <option value="button">Button</option>
                  <option value="text">Text Link</option>
                </select>

                {elementData?.style === 'button' && (
                  (() => {
                    // Compute theme-based fallback colors for the color pickers
                    const theme = cardData?.theme || { brandColor: "#1e40af", secondaryColor: "#a855f7", tertiaryColor: "#ffffff" };
                    const defaultBgColor = theme.brandColor || "#1e40af";
                    const defaultTextColor = theme.tertiaryColor || "#ffffff";
                    const defaultBorderColor = theme.secondaryColor || "#a855f7";

                    return (
                      <div className="space-y-3 pt-2 border-t border-slate-600">
                        <p className="text-xs text-gray-300 font-medium">Button Styling</p>

                        {/* Icon Input */}
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Icon (Optional)</label>
                          <IconPicker
                            value={elementData?.buttonIcon || ''}
                            onChange={(icon) => handleDataUpdate({ buttonIcon: icon })}
                          />
                          <p className="text-xs text-gray-500 mt-1">Browse to select from FontAwesome icons</p>
                        </div>

                        {/* Background Color */}
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Background Color</label>
                          <input
                            type="color"
                            value={elementData?.buttonBgColor || defaultBgColor}
                            onChange={(e) => handleDataUpdate({ buttonBgColor: e.target.value })}
                            className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                          />
                          {elementData?.buttonBgColor && (
                            <button
                              onClick={() => handleDataUpdate({ buttonBgColor: undefined })}
                              className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                            >
                              <i className="fas fa-undo mr-1"></i>
                              Reset to Theme
                            </button>
                          )}
                        </div>

                        {/* Text Color */}
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                          <input
                            type="color"
                            value={elementData?.buttonTextColor || defaultTextColor}
                            onChange={(e) => handleDataUpdate({ buttonTextColor: e.target.value })}
                            className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                          />
                          {elementData?.buttonTextColor && (
                            <button
                              onClick={() => handleDataUpdate({ buttonTextColor: undefined })}
                              className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                            >
                              <i className="fas fa-undo mr-1"></i>
                              Reset to Theme
                            </button>
                          )}
                        </div>

                        {/* Border Color */}
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Border Color</label>
                          <input
                            type="color"
                            value={elementData?.buttonBorderColor || defaultBorderColor}
                            onChange={(e) => handleDataUpdate({ buttonBorderColor: e.target.value })}
                            className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                          />
                          {elementData?.buttonBorderColor && (
                            <button
                              onClick={() => handleDataUpdate({ buttonBorderColor: undefined })}
                              className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                            >
                              <i className="fas fa-undo mr-1"></i>
                              Reset to Theme
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            ) : (
              elementData.style === "button" ? (
                (() => {
                  // Helper function to adjust color brightness
                  const adjustColor = (hex: string, amount: number): string => {
                    const num = parseInt(hex.replace("#", ""), 16);
                    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
                    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
                    const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
                    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
                  };

                  const theme = cardData?.theme || { brandColor: "#1e40af", secondaryColor: "#a855f7", tertiaryColor: "#ffffff" };
                  const buttonBg = elementData?.buttonBgColor || theme.brandColor || "#1e40af";
                  const buttonText = elementData?.buttonTextColor || theme.tertiaryColor || "#ffffff";
                  const buttonBorder = elementData?.buttonBorderColor || theme.secondaryColor || "#a855f7";

                  return (
                    <button
                      onClick={() => window.open(elementData.url, '_blank')}
                      className="w-full py-3 px-4 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors"
                      style={{
                        backgroundColor: buttonBg,
                        color: buttonText,
                        borderBottom: `4px solid ${adjustColor(buttonBorder, -20)}`,
                      }}
                    >
                      {elementData?.buttonIcon && (
                        <i className={`${elementData.buttonIcon} text-lg mr-3`}></i>
                      )}
                      {elementData.text}
                    </button>
                  );
                })()
              ) : (
                <a
                  href={elementData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-talklink-500 hover:text-talklink-600 underline"
                >
                  {elementData.text}
                </a>
              )
            )}
          </div>
        );

      case "image":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        handleDataUpdate({ src: e.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  value={elementData?.alt || ''}
                  onChange={(e) => handleDataUpdate({ alt: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Image description"
                />
              </div>
            ) : (
              elementData.src && (
                <img
                  src={elementData.src}
                  alt={elementData.alt || ''}
                  className="w-full max-w-sm mx-auto rounded-lg"
                />
              )
            )}
          </div>
        );

      case "qrcode":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-4 bg-slate-700 p-4 rounded-lg">
                {/* QR Content */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">QR Code Content</label>
                  <Input
                    value={elementData?.value || ''}
                    onChange={(e) => handleDataUpdate({ value: e.target.value })}
                    className="bg-slate-600 border-slate-500 text-white"
                    placeholder="Enter URL or text"
                  />
                </div>

                {/* Size */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Size: {elementData.size || 200}px
                  </label>
                  <input
                    type="range"
                    value={elementData?.size || 200}
                    onChange={(e) => handleDataUpdate({ size: parseInt(e.target.value) })}
                    min="120"
                    max="300"
                    className="w-full accent-talklink-500"
                  />
                </div>

                {/* Simple Frame Options */}
                <div>
                  <label className="block text-white text-sm font-medium mb-3">Frame Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleDataUpdate({ frameStyle: 'none' })}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        (!elementData?.frameStyle || elementData?.frameStyle === 'none')
                          ? 'bg-talklink-500 border-talklink-400 text-white'
                          : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <div className="w-8 h-8 mx-auto mb-1 bg-slate-400 rounded"></div>
                      None
                    </button>
                    <button
                      onClick={() => handleDataUpdate({ frameStyle: 'rounded' })}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        elementData?.frameStyle === 'rounded'
                          ? 'bg-talklink-500 border-talklink-400 text-white'
                          : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <div className="w-8 h-8 mx-auto mb-1 bg-slate-400 rounded-lg border-2 border-green-500"></div>
                      Border
                    </button>
                    <button
                      onClick={() => handleDataUpdate({ frameStyle: 'corners' })}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        elementData?.frameStyle === 'corners'
                          ? 'bg-talklink-500 border-talklink-400 text-white'
                          : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <div className="w-8 h-8 mx-auto mb-1 bg-slate-400 rounded relative">
                        <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-green-500 rounded-tl"></div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-green-500 rounded-tr"></div>
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-green-500 rounded-bl"></div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-green-500 rounded-br"></div>
                      </div>
                      Corners
                    </button>
                  </div>
                </div>

                {/* Custom Label */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={elementData?.customLabel || false}
                    onChange={(e) => handleDataUpdate({ customLabel: e.target.checked })}
                    className="accent-talklink-500"
                  />
                  <label className="text-white text-sm">Add custom label</label>
                </div>

                {elementData?.customLabel && (
                  <Input
                    value={elementData?.labelText || ''}
                    onChange={(e) => handleDataUpdate({ labelText: e.target.value })}
                    placeholder="Follow us on X"
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {elementData.value && (
                  <>
                    <div className="relative">
                      {/* QR Code Container */}
                      <div 
                        className={`transition-all ${
                          elementData.frameStyle === 'rounded' ? 'rounded-lg' : 'rounded'
                        }`}
                        style={{
                          backgroundColor: 'white',
                          padding: '11px',
                          border: elementData.frameStyle === 'rounded' ? `6px solid ${cardData?.brandColor || '#22c55e'}` : 'none',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <QRCodeSVG
                          value={elementData.value}
                          size={elementData.size || 200}
                          level="H"
                          includeMargin={false}
                          fgColor="#1e293b"
                          bgColor="#ffffff"
                        />
                      </div>

                      {/* Corner Brackets Style */}
                      {elementData.frameStyle === 'corners' && (
                        <>
                          {/* Top Left Corner */}
                          <div 
                            className="absolute -top-1 -left-1 w-6 h-6"
                            style={{
                              borderLeft: `6px solid ${cardData?.brandColor || '#22c55e'}`,
                              borderTop: `6px solid ${cardData?.brandColor || '#22c55e'}`
                            }}
                          ></div>
                          {/* Top Right Corner */}
                          <div 
                            className="absolute -top-1 -right-1 w-6 h-6"
                            style={{
                              borderRight: `6px solid ${cardData?.brandColor || '#22c55e'}`,
                              borderTop: `6px solid ${cardData?.brandColor || '#22c55e'}`
                            }}
                          ></div>
                          {/* Bottom Left Corner */}
                          <div 
                            className="absolute -bottom-1 -left-1 w-6 h-6"
                            style={{
                              borderLeft: `6px solid ${cardData?.brandColor || '#22c55e'}`,
                              borderBottom: `6px solid ${cardData?.brandColor || '#22c55e'}`
                            }}
                          ></div>
                          {/* Bottom Right Corner */}
                          <div 
                            className="absolute -bottom-1 -right-1 w-6 h-6"
                            style={{
                              borderRight: `6px solid ${cardData?.brandColor || '#22c55e'}`,
                              borderBottom: `6px solid ${cardData?.brandColor || '#22c55e'}`
                            }}
                          ></div>
                        </>
                      )}
                    </div>

                    {/* Custom Label */}
                    {elementData.customLabel && elementData.labelText && (
                      <div 
                        className="mt-3 px-4 py-2 rounded-full text-white font-medium text-sm"
                        style={{backgroundColor: cardData?.brandColor || '#22c55e'}}
                      >
                        {elementData.labelText}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );

      case "contactSection": {
        if (isEditing) {
          // Convert schema data (numbers) to editor format (strings) for editing
          const editorData = schemaToEditorContact(elementData);

          // Handle updates from the editor
          const handleEditorChange = (updatedEditorData: any) => {
            // Convert editor format (strings) back to schema (numbers)
            const schemaData = editorToSchemaContact(updatedEditorData);
            handleDataUpdate(schemaData);
          };

          return (
            <div className="mb-6" key={`contact-${element.id}`}>
              <ContactSectionEditor
                data={editorData}
                onChange={handleEditorChange}
              />
            </div>
          );
        }

        return <ContactLinksRenderer key={`contact-render-${element.id}`} data={elementData} />;
      }

      case "socialSection": {
        if (isEditing) {
          // Convert schema data (numbers) to editor format (strings) for editing
          const editorData = schemaToEditorSocial(elementData);

          // Handle updates from the editor
          const handleEditorChange = (updatedEditorData: any) => {
            // Convert editor format (strings) back to schema (numbers)
            const schemaData = editorToSchemaSocial(updatedEditorData);
            handleDataUpdate(schemaData);
          };

          return (
            <div className="mb-6" key={`social-${element.id}`}>
              <SocialSectionEditor
                data={editorData}
                onChange={handleEditorChange}
              />
            </div>
          );
        }

        return <SocialLinksRenderer key={`social-render-${element.id}`} data={elementData} />;
      }

      case "actionButtons": {
        // Safe cardData access with defaults
        const theme = cardData ?? {};

        const adjustColor = (hex: string, amount: number): string => {
          const num = parseInt(hex.replace("#", ""), 16);
          const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
          const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
          const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
          return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
        };

        const handleSaveContact = () => {
          const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${theme.fullName || 'Contact'}
${theme.title ? `TITLE:${theme.title}\n` : ''}${theme.company ? `ORG:${theme.company}\n` : ''}${theme.email ? `EMAIL:${theme.email}\n` : ''}${theme.phone ? `TEL:${theme.phone}\n` : ''}${theme.location ? `ADR:;;${theme.location};;;;\n` : ''}${theme.website ? `URL:${theme.website}\n` : ''}END:VCARD`;

          const blob = new Blob([vCard], { type: "text/vcard" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${theme.fullName || 'contact'}.vcf`;
          link.click();
        };

        const handleShare = async () => {
          if (navigator.share) {
            try {
              await navigator.share({
                title: theme.fullName || 'Business Card',
                url: window.location.href,
              });
            } catch (err) {
              console.log("Share cancelled");
            }
          } else {
            // Safe clipboard fallback with guard
            if (navigator.clipboard && navigator.clipboard.writeText) {
              try {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              } catch (err) {
                alert("Unable to copy link. Please copy manually: " + window.location.href);
              }
            } else {
              alert("Share not supported. Copy this link: " + window.location.href);
            }
          }
        };

        if (isEditing) {
          return (
            <div className="mb-4 p-4 bg-slate-700 rounded-lg border border-slate-600 space-y-4">
              <div>
                <p className="text-white text-sm font-medium mb-1">
                  <i className="fas fa-hand-pointer mr-2"></i>
                  Save & Share Buttons
                </p>
                <p className="text-xs text-gray-400">
                  Customize button colors or leave empty for theme defaults
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Add to Contacts Button Colors */}
                <div className="space-y-3">
                  <p className="text-xs text-gray-300 font-medium">Add to Contacts</p>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Button Color</label>
                    <input
                      type="color"
                      value={elementData?.addToContactsBgColor || ""}
                      onChange={(e) => handleDataUpdate({ addToContactsBgColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Border Color</label>
                    <input
                      type="color"
                      value={elementData?.addToContactsBorderColor || ""}
                      onChange={(e) => handleDataUpdate({ addToContactsBorderColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                    <input
                      type="color"
                      value={elementData?.addToContactsTextColor || ""}
                      onChange={(e) => handleDataUpdate({ addToContactsTextColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                    />
                  </div>
                </div>

                {/* Share Button Colors */}
                <div className="space-y-3">
                  <p className="text-xs text-gray-300 font-medium">Share Button</p>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Button Color</label>
                    <input
                      type="color"
                      value={elementData?.shareBgColor || ""}
                      onChange={(e) => handleDataUpdate({ shareBgColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Border Color</label>
                    <input
                      type="color"
                      value={elementData?.shareBorderColor || ""}
                      onChange={(e) => handleDataUpdate({ shareBorderColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                    <input
                      type="color"
                      value={elementData?.shareTextColor || ""}
                      onChange={(e) => handleDataUpdate({ shareTextColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDataUpdate({})}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fas fa-undo mr-1"></i>
                  Reset to Theme Colors
                </button>
              </div>
            </div>
          );
        }

        const addToContactsBg = elementData?.addToContactsBgColor || theme.secondaryColor || "#a855f7";
        const addToContactsBorder = elementData?.addToContactsBorderColor || theme.brandColor || "#1e40af";
        const addToContactsText = elementData?.addToContactsTextColor || theme.tertiaryColor || "#ffffff";
        const shareBg = elementData?.shareBgColor || theme.brandColor || "#1e40af";
        const shareBorder = elementData?.shareBorderColor || theme.secondaryColor || "#a855f7";
        const shareText = elementData?.shareTextColor || theme.tertiaryColor || "#ffffff";

        return (
          <div className="flex gap-1 mb-1">
            {/* Add to Contacts Button */}
            <button
              onClick={handleSaveContact}
              className="py-3 px-4 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors flex-1"
              style={{
                backgroundColor: addToContactsBg,
                color: addToContactsText,
                borderBottom: `4px solid ${adjustColor(addToContactsBorder, -20)}`,
              }}
            >
              <i className="fas fa-address-book text-lg mr-3"></i>
              Add to Contacts
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors"
              style={{
                backgroundColor: shareBg,
                color: shareText,
                borderBottom: `4px solid ${adjustColor(shareBorder, -20)}`,
                width: "30%",
              }}
            >
              <i className="fas fa-share-alt text-lg"></i>
              <span className="ml-2">Share</span>
            </button>
          </div>
        );
      }

      case "video":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={elementData?.url || ''}
                  onChange={(e) => handleDataUpdate({ url: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="YouTube/Vimeo URL"
                />
                <Input
                  value={elementData?.thumbnail || ''}
                  onChange={(e) => handleDataUpdate({ thumbnail: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Thumbnail URL (optional)"
                />
              </div>
            ) : (
              elementData.url && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                  {elementData.url.includes('youtube.com') || elementData.url.includes('youtu.be') ? (
                    <iframe
                      src={elementData.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      className="w-full h-full border-0"
                      allowFullScreen
                      title="YouTube video"
                    />
                  ) : elementData.url.includes('vimeo.com') ? (
                    <iframe
                      src={elementData.url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      className="w-full h-full border-0"
                      allowFullScreen
                      title="Vimeo video"
                    />
                  ) : (
                    <video controls className="w-full h-full">
                      <source src={elementData.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )
            )}
          </div>
        );

      case "contactForm":
        return (
          <ContactFormRenderer
            key={`contact-form-${element.id}`}
            element={element}
            isEditing={isEditing}
            handleDataUpdate={handleDataUpdate}
            onUpdate={onUpdate}
          />
        );

      case "accordion":
        const accordionItems = elementData.items || [];
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-4">
                {/* Items */}
                <div className="space-y-2">
                  {accordionItems.map((item: any, index: number) => (
                    <div key={item.id || `accordion-${index}`} className="bg-slate-600 p-3 rounded">
                      <Input
                        value={item.title || ''}
                        onChange={(e) => {
                          const newItems = [...accordionItems];
                          newItems[index] = { ...item, title: e.target.value };
                          handleDataUpdate({ items: newItems });
                        }}
                        className="bg-slate-700 border-slate-600 text-white mb-2"
                        placeholder="Question title"
                      />
                      <Textarea
                        value={item.content || ''}
                        onChange={(e) => {
                          const newItems = [...accordionItems];
                          newItems[index] = { ...item, content: e.target.value };
                          handleDataUpdate({ items: newItems });
                        }}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Answer content"
                        rows={2}
                      />
                      {accordionItems.length > 1 && (
                        <Button
                          onClick={() => {
                            const newItems = accordionItems.filter((_, i) => i !== index);
                            handleDataUpdate({ items: newItems });
                          }}
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={() => {
                      const newItem = {
                        id: Math.random().toString(36).substring(7),
                        title: "New Question",
                        content: "New Answer"
                      };
                      handleDataUpdate({ items: [...accordionItems, newItem] });
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <i className="fas fa-plus mr-1"></i>
                    Add Item
                  </Button>
                </div>

                {/* Styling Section */}
                <div className="bg-slate-700 p-3 rounded space-y-3">
                  <h4 className="text-white text-sm font-medium flex items-center gap-2">
                    <i className="fas fa-palette"></i>
                    Styling
                  </h4>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Title Color</label>
                      <input
                        type="color"
                        value={elementData?.titleColor || cardData?.brandColor || "#0f0f0f"}
                        onChange={(e) => handleDataUpdate({ ...elementData, titleColor: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                      />
                      {elementData?.titleColor && (
                        <button
                          onClick={() => handleDataUpdate({ ...elementData, titleColor: undefined })}
                          className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                        >
                          <i className="fas fa-undo mr-1"></i>
                          Reset
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Content Color</label>
                      <input
                        type="color"
                        value={elementData?.contentColor || cardData?.secondaryColor || "#525252"}
                        onChange={(e) => handleDataUpdate({ ...elementData, contentColor: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                      />
                      {elementData?.contentColor && (
                        <button
                          onClick={() => handleDataUpdate({ ...elementData, contentColor: undefined })}
                          className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                        >
                          <i className="fas fa-undo mr-1"></i>
                          Reset
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Border Color</label>
                      <input
                        type="color"
                        value={elementData?.borderColor || cardData?.tertiaryColor || "#e2e8f0"}
                        onChange={(e) => handleDataUpdate({ ...elementData, borderColor: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                      />
                      {elementData?.borderColor && (
                        <button
                          onClick={() => handleDataUpdate({ ...elementData, borderColor: undefined })}
                          className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                        >
                          <i className="fas fa-undo mr-1"></i>
                          Reset
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Background Color</label>
                      <input
                        type="color"
                        value={elementData?.backgroundColor || cardData?.backgroundColor || "#ffffff"}
                        onChange={(e) => handleDataUpdate({ ...elementData, backgroundColor: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                      />
                      {elementData?.backgroundColor && (
                        <button
                          onClick={() => handleDataUpdate({ ...elementData, backgroundColor: undefined })}
                          className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                        >
                          <i className="fas fa-undo mr-1"></i>
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Border Width */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Border Width: {elementData.borderWidth !== undefined ? elementData.borderWidth : 1}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={elementData.borderWidth !== undefined ? elementData.borderWidth : 1}
                      onChange={(e) => handleDataUpdate({ ...elementData, borderWidth: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* Shape */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Shape</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleDataUpdate({ ...elementData, shape: "rounded" })}
                        className={`px-3 py-2 text-xs rounded transition-colors ${
                          (elementData?.shape || "rounded") === "rounded" 
                            ? "bg-talklink-500 text-white" 
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                        }`}
                      >
                        <i className="fas fa-square mr-1" style={{ borderRadius: "4px" }}></i>
                        Rounded
                      </button>
                      <button
                        onClick={() => handleDataUpdate({ ...elementData, shape: "square" })}
                        className={`px-3 py-2 text-xs transition-colors ${
                          elementData?.shape === "square" 
                            ? "bg-talklink-500 text-white" 
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                        }`}
                      >
                        <i className="fas fa-square mr-1"></i>
                        Square
                      </button>
                      <button
                        onClick={() => handleDataUpdate({ ...elementData, shape: "circle" })}
                        className={`px-3 py-2 text-xs rounded-full transition-colors ${
                          elementData?.shape === "circle" 
                            ? "bg-talklink-500 text-white" 
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                        }`}
                      >
                        <i className="fas fa-circle mr-1"></i>
                        Circle
                      </button>
                    </div>
                  </div>

                  {/* Shadow Intensity */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Shadow Intensity: {elementData.shadowIntensity !== undefined ? elementData.shadowIntensity : 2}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={elementData.shadowIntensity !== undefined ? elementData.shadowIntensity : 2}
                      onChange={(e) => handleDataUpdate({ ...elementData, shadowIntensity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* Font Sizes */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Title Size: {elementData.titleFontSize !== undefined ? elementData.titleFontSize : 16}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={elementData.titleFontSize !== undefined ? elementData.titleFontSize : 16}
                        onChange={(e) => handleDataUpdate({ ...elementData, titleFontSize: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Content Size: {elementData.contentFontSize !== undefined ? elementData.contentFontSize : 14}px
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="20"
                        value={elementData.contentFontSize !== undefined ? elementData.contentFontSize : 14}
                        onChange={(e) => handleDataUpdate({ ...elementData, contentFontSize: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {accordionItems.map((item: any) => {
                  const titleColor = elementData?.titleColor || cardData?.brandColor || "#0f0f0f";
                  const contentColor = elementData?.contentColor || cardData?.secondaryColor || "#525252";
                  const borderColor = elementData?.borderColor || cardData?.tertiaryColor || "#e2e8f0";
                  const backgroundColor = elementData?.backgroundColor || cardData?.backgroundColor || "#ffffff";
                  const shadowIntensity = elementData?.shadowIntensity ?? 2;
                  const titleFontSize = elementData?.titleFontSize ?? 16;
                  const contentFontSize = elementData?.contentFontSize ?? 14;
                  const borderWidth = elementData.borderWidth !== undefined ? elementData.borderWidth : 1;
                  const shape = elementData?.shape || "rounded";

                  const getBorderRadius = () => {
                    switch(shape) {
                      case "square": return "0px";
                      case "circle": return "999px";
                      case "rounded":
                      default: return "8px";
                    }
                  };

                  return (
                    <details 
                      key={item.id} 
                      style={{
                        backgroundColor,
                        border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
                        borderRadius: getBorderRadius(),
                        boxShadow: shadowIntensity > 0 ? `0 ${shadowIntensity}px ${shadowIntensity * 2}px rgba(0,0,0,${shadowIntensity * 0.05})` : 'none',
                        outline: 'none',
                        ...(borderWidth === 0 ? {
                          borderBlockStart: 'none',
                          borderBlockEnd: 'none',
                          borderInlineStart: 'none',
                          borderInlineEnd: 'none'
                        } : {})
                      } as React.CSSProperties}
                    >
                      <summary 
                        className="cursor-pointer p-3 font-medium hover:opacity-80 flex items-center justify-between"
                        style={{
                          color: titleColor,
                          fontSize: `${titleFontSize}px`,
                          borderRadius: getBorderRadius(),
                          borderBottom: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none'
                        }}
                      >
                        <span>{item.title}</span>
                        <i className="fas fa-chevron-down text-xs" style={{ color: titleColor, opacity: 0.6 }}></i>
                      </summary>
                      <div 
                        className="p-3 pt-0 leading-relaxed"
                        style={{
                          color: contentColor,
                          fontSize: `${contentFontSize}px`
                        }}
                      >
                        {item.content}
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "imageSlider":
        const sliderImages = elementData.images || [];
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <h3 className="text-white text-sm font-medium">Image Gallery</h3>
                    <span className="text-xs text-slate-400">({sliderImages.length} images)</span>
                  </div>
                  <div className="text-xs text-slate-400">Drag to reorder</div>
                </div>

                {/* Upload Button */}
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const newImage = {
                            id: Math.random().toString(36).substring(7),
                            src: event.target?.result as string,
                            alt: file.name.split('.')[0]
                          };
                          handleDataUpdate({ 
                            images: [...sliderImages, newImage] 
                          });
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="bg-slate-700 border-slate-600 text-white file:bg-talklink-500 file:text-white file:border-none file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-talklink-600"
                  />
                </div>

                {/* Image Preview with Drag & Drop */}
                {sliderImages.length > 0 && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => {
                      const {active, over} = event;
                      if (active.id !== over?.id) {
                        const oldIndex = sliderImages.findIndex((img: any) => img.id === active.id);
                        const newIndex = sliderImages.findIndex((img: any) => img.id === over?.id);
                        const reorderedImages = arrayMove(sliderImages, oldIndex, newIndex);
                        handleDataUpdate({ images: reorderedImages });
                      }
                    }}
                  >
                    <SortableContext items={sliderImages.map((img: any) => img.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {sliderImages.map((img: any, index: number) => (
                          <SortableImageItem
                            key={img.id}
                            image={img}
                            index={index}
                            onDelete={() => {
                              const newImages = sliderImages.filter((_: any, i: number) => i !== index);
                              handleDataUpdate({ images: newImages });
                            }}
                            onUpdateAlt={(alt) => {
                              const updatedImages = sliderImages.map((image: any, i: number) => 
                                i === index ? { ...image, alt } : image
                              );
                              handleDataUpdate({ images: updatedImages });
                            }}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

                {/* Empty State */}
                {sliderImages.length === 0 && (
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
                      <i className="fas fa-images text-slate-400 text-xl"></i>
                    </div>
                    <p className="text-slate-400 text-sm">Upload images to create your gallery</p>
                    <p className="text-slate-500 text-xs mt-1">Supports multiple image formats</p>
                  </div>
                )}

                {/* Gallery Settings */}
                {sliderImages.length > 0 && (
                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-4">
                    <h4 className="text-white text-sm font-medium flex items-center">
                      <i className="fas fa-cog mr-2 text-slate-400"></i>
                      Gallery Settings
                    </h4>

                    <div className="space-y-4">
                      {/* Image Orientation Setting */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-2">Image Orientation</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleDataUpdate({ orientation: 'mixed' })}
                            className={`p-3 rounded-lg border text-xs transition-colors ${
                              (!elementData?.orientation || elementData?.orientation === 'mixed')
                                ? 'bg-talklink-500 border-talklink-400 text-white'
                                : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                            }`}
                          >
                            <div className="w-8 h-6 mx-auto mb-1 bg-slate-400 rounded grid grid-cols-2 gap-0.5">
                              <div className="bg-slate-300 rounded-sm"></div>
                              <div className="bg-slate-300 rounded-sm"></div>
                            </div>
                            Mixed
                          </button>
                          <button
                            onClick={() => handleDataUpdate({ orientation: 'horizontal' })}
                            className={`p-3 rounded-lg border text-xs transition-colors ${
                              elementData?.orientation === 'horizontal'
                                ? 'bg-talklink-500 border-talklink-400 text-white'
                                : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                            }`}
                          >
                            <div className="w-8 h-5 mx-auto mb-1 bg-slate-400 rounded"></div>
                            Landscape
                          </button>
                          <button
                            onClick={() => handleDataUpdate({ orientation: 'vertical' })}
                            className={`p-3 rounded-lg border text-xs transition-colors ${
                              elementData?.orientation === 'vertical'
                                ? 'bg-talklink-500 border-talklink-400 text-white'
                                : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                            }`}
                          >
                            <div className="w-5 h-8 mx-auto mb-1 bg-slate-400 rounded"></div>
                            Portrait
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Choose optimal display for your image collection
                        </p>
                      </div>

                      {/* Auto-play Setting */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs text-slate-300 font-medium">Auto-play slides</label>
                          <p className="text-xs text-slate-500">Automatically advance images every 4 seconds</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={elementData?.autoPlay || false}
                          onChange={(e) => handleDataUpdate({ autoPlay: e.target.checked })}
                          className="rounded border-slate-500 text-talklink-500 focus:ring-talklink-500"
                        />
                      </div>

                      {/* Image Display Mode */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-2">Display Mode</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleDataUpdate({ displayMode: 'contain' })}
                            className={`p-2 rounded-lg border text-xs transition-colors ${
                              (!elementData?.displayMode || elementData?.displayMode === 'contain')
                                ? 'bg-talklink-500 border-talklink-400 text-white'
                                : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                            }`}
                          >
                            Fit Full Image
                          </button>
                          <button
                            onClick={() => handleDataUpdate({ displayMode: 'cover' })}
                            className={`p-2 rounded-lg border text-xs transition-colors ${
                              elementData?.displayMode === 'cover'
                                ? 'bg-talklink-500 border-talklink-400 text-white'
                                : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                            }`}
                          >
                            Crop to Fill
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              sliderImages.length > 0 && (
                <ImageSliderComponent 
                  images={sliderImages}
                  defaultView={elementData?.defaultView}
                  autoPlay={elementData?.autoPlay}
                  orientation={elementData?.orientation}
                  displayMode={elementData?.displayMode}
                />
              )
            )}
          </div>
        );

      case "testimonials":
        const testimonialsData = elementData.testimonials || [];
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">
              {elementData.title}
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                {/* Title Section - Same Color as Display Style */}
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                  <label className="block text-white text-sm font-medium mb-2">
                    <i className="fas fa-heading mr-2"></i>
                    Section Title
                  </label>
                  <Input
                    value={elementData.title || ''}
                    onChange={(e) => handleDataUpdate({ title: e.target.value })}
                    placeholder="What Our Clients Say"
                    className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                  />
                </div>

                {/* Display Style Section - Different Color */}
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                  <label className="block text-white text-sm font-medium mb-2">
                    <i className="fas fa-layout mr-2"></i>
                    Display Style
                  </label>
                  <select
                    value={elementData.displayStyle || 'cards'}
                    onChange={(e) => handleDataUpdate({ displayStyle: e.target.value })}
                    className="bg-slate-600 border-slate-500 text-white rounded px-3 py-2 w-full hover:bg-slate-500 transition-colors"
                  >
                    <option value="cards">Cards</option>
                    <option value="slider">Slider</option>
                    <option value="grid">Grid</option>
                  </select>
                </div>
                {/* Testimonials List */}
                {testimonialsData.map((testimonial: any, index: number) => (
                  <div key={testimonial.id || `testimonial-edit-${index}`} className="p-3 bg-slate-800 rounded border space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Testimonial {index + 1}</span>
                      <Button
                        onClick={() => {
                          const newTestimonials = testimonialsData.filter((t: any) => t.id !== testimonial.id);
                          handleDataUpdate({ testimonials: newTestimonials });
                        }}
                        variant="destructive"
                        size="sm"
                        className="w-6 h-6 p-0"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={testimonial.name || ''}
                        onChange={(e) => {
                          const newTestimonials = testimonialsData.map((t: any) => 
                            t.id === testimonial.id ? { ...t, name: e.target.value } : t
                          );
                          handleDataUpdate({ testimonials: newTestimonials });
                        }}
                        placeholder="Customer name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        value={testimonial.title || ''}
                        onChange={(e) => {
                          const newTestimonials = testimonialsData.map((t: any) => 
                            t.id === testimonial.id ? { ...t, title: e.target.value } : t
                          );
                          handleDataUpdate({ testimonials: newTestimonials });
                        }}
                        placeholder="Job title"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <Input
                      value={testimonial.company || ''}
                      onChange={(e) => {
                        const newTestimonials = testimonialsData.map((t: any) => 
                          t.id === testimonial.id ? { ...t, company: e.target.value } : t
                        );
                        handleDataUpdate({ testimonials: newTestimonials });
                      }}
                      placeholder="Company name"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Textarea
                      value={testimonial.content || ''}
                      onChange={(e) => {
                        const newTestimonials = testimonialsData.map((t: any) => 
                          t.id === testimonial.id ? { ...t, content: e.target.value } : t
                        );
                        handleDataUpdate({ testimonials: newTestimonials });
                      }}
                      placeholder="Testimonial text"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm">Rating:</span>
                      <select
                        value={testimonial.rating || 5}
                        onChange={(e) => {
                          const newTestimonials = testimonialsData.map((t: any) => 
                            t.id === testimonial.id ? { ...t, rating: parseInt(e.target.value) } : t
                          );
                          handleDataUpdate({ testimonials: newTestimonials });
                        }}
                        className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                      >
                        <option value={1}>1 Star</option>
                        <option value={2}>2 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={5}>5 Stars</option>
                      </select>
                    </div>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    const newTestimonial = {
                      id: generateFieldId(),
                      name: "Customer Name",
                      title: "Job Title",
                      company: "Company Name",
                      content: "Great service and experience!",
                      rating: 5
                    };
                    handleDataUpdate({ testimonials: [...testimonialsData, newTestimonial] });
                  }}
                  className="w-full"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Testimonial
                </Button>
              </div>
            ) : (
              elementData.displayStyle === 'slider' ? (
                <TestimonialsSlider testimonials={testimonialsData} />
              ) : (
                <div className={`grid gap-4 ${
                  elementData.displayStyle === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                }`}>
                  {testimonialsData.map((testimonial: any) => (
                    <div key={testimonial.id || `testimonial-${testimonial.name}`} className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                      <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => (
                          <i key={`star-${i}`} className={`fas fa-star text-sm ${
                            i < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-slate-300'
                          }`}></i>
                        ))}
                      </div>
                      <p className="text-slate-600 mb-4 italic">"{testimonial.content}"</p>
                      <div className="flex items-center space-x-3">
                        {testimonial.avatar && (
                          <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800">{testimonial.name}</p>
                          {testimonial.title && <p className="text-sm text-slate-600">{testimonial.title}</p>}
                          {testimonial.company && <p className="text-sm text-slate-500">{testimonial.company}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        );

      case "googleMaps":
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-black mb-4 text-center">
              {elementData.title}
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={elementData.title || ''}
                  onChange={(e) => handleDataUpdate({ title: e.target.value })}
                  placeholder="Location section title"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  value={elementData.address || ''}
                  onChange={(e) => handleDataUpdate({ address: e.target.value })}
                  placeholder="Address or location"
                  className="bg-slate-700 border-slate-600 text-white"
                />

                {/* Display Mode Selection */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <label className="block text-white text-sm font-medium mb-3">Display Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleDataUpdate({ displayMode: 'address' })}
                      className={`p-4 rounded-lg border text-sm transition-colors ${
                        elementData.displayMode === 'address'
                          ? 'bg-talklink-500 border-talklink-400 text-white'
                          : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <i className="fas fa-map-marker-alt text-lg"></i>
                        <span>Address with Pin</span>
                        <span className="text-xs opacity-75">Simple text display</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDataUpdate({ displayMode: 'map' })}
                      className={`p-4 rounded-lg border text-sm transition-colors ${
                        (!elementData.displayMode || elementData.displayMode === 'map')
                          ? 'bg-talklink-500 border-talklink-400 text-white'
                          : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <i className="fas fa-map text-lg"></i>
                        <span>Interactive Map</span>
                        <span className="text-xs opacity-75">Full Google Maps</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Map-specific settings - only show when map mode is selected */}
                {(!elementData.displayMode || elementData.displayMode === 'map') && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-black text-sm mb-1 block">Zoom Level</label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={elementData.zoom || 15}
                          onChange={(e) => handleDataUpdate({ zoom: parseInt(e.target.value) || 15 })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-black text-sm mb-1 block">Map Type</label>
                        <select
                          value={elementData.mapType || 'roadmap'}
                          onChange={(e) => handleDataUpdate({ mapType: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white rounded px-2 py-2 w-full"
                        >
                          <option value="roadmap">Roadmap</option>
                          <option value="satellite">Satellite</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={elementData.showMarker || false}
                        onChange={(e) => handleDataUpdate({ showMarker: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-black text-sm">Show location marker</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Display based on selected mode
              elementData.displayMode === 'address' ? (
                // Simple Address Display with Location Pin
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <i className="fas fa-map-marker-alt text-white text-lg"></i>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">Our Location</h4>
                      <p className="text-slate-600 leading-relaxed">{elementData.address}</p>
                      <div className="mt-4">
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(elementData.address || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-talklink-500 hover:text-talklink-600 font-medium transition-colors"
                        >
                          <i className="fas fa-external-link-alt text-sm"></i>
                          <span>View on Google Maps</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Interactive Google Maps (default)
                <div className="bg-slate-100 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(elementData.address || '')}&zoom=${elementData.zoom || 15}&maptype=${elementData.mapType || 'roadmap'}`}
                    width="100%"
                    height={elementData.height || 300}
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                  ></iframe>
                </div>
              )
            )}
          </div>
        );

      case "aiChatbot":
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-black mb-4 text-center">
              {elementData.title}
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={elementData.title || ''}
                  onChange={(e) => handleDataUpdate({ title: e.target.value })}
                  placeholder="Chatbot section title"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  value={elementData.welcomeMessage || ''}
                  onChange={(e) => handleDataUpdate({ welcomeMessage: e.target.value })}
                  placeholder="Welcome message"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <div className="space-y-2">
                  <label className="text-black text-sm">Knowledge Base Content:</label>
                  <Textarea
                    value={elementData.knowledgeBase?.textContent || ''}
                    onChange={(e) => handleDataUpdate({ 
                      knowledgeBase: { 
                        ...elementData.knowledgeBase, 
                        textContent: e.target.value 
                      } 
                    })}
                    placeholder="Enter knowledge base content..."
                    rows={4}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Input
                  value={elementData.knowledgeBase?.websiteUrl || ''}
                  onChange={(e) => handleDataUpdate({ 
                    knowledgeBase: { 
                      ...elementData.knowledgeBase, 
                      websiteUrl: e.target.value 
                    } 
                  })}
                  placeholder="Website URL for knowledge extraction"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <div className="space-y-2">
                  <label className="text-black text-sm">PDF Documents:</label>
                  <Input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const newPdf = {
                            id: generateFieldId(),
                            name: file.name,
                            content: event.target?.result as string,
                            uploadedAt: new Date()
                          };
                          const currentPdfs = elementData.knowledgeBase?.pdfFiles || [];
                          handleDataUpdate({ 
                            knowledgeBase: { 
                              ...elementData.knowledgeBase, 
                              pdfFiles: [...currentPdfs, newPdf] 
                            } 
                          });
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  {(elementData.knowledgeBase?.pdfFiles || []).map((pdf: any) => (
                    <div key={pdf.id} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                      <span className="text-white text-sm">{pdf.name}</span>
                      <Button
                        onClick={() => {
                          const newPdfs = (elementData.knowledgeBase?.pdfFiles || []).filter((p: any) => p.id !== pdf.id);
                          handleDataUpdate({ 
                            knowledgeBase: { 
                              ...elementData.knowledgeBase, 
                              pdfFiles: newPdfs 
                            } 
                          });
                        }}
                        variant="destructive"
                        size="sm"
                        className="w-6 h-6 p-0"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-black text-sm mb-1 block">Position</label>
                    <select
                      value={elementData.appearance?.position || 'bottom-right'}
                      onChange={(e) => handleDataUpdate({ 
                        appearance: { 
                          ...elementData.appearance, 
                          position: e.target.value as any 
                        } 
                      })}
                      className="bg-slate-700 border-slate-600 text-white rounded px-2 py-2 w-full"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="embedded">Embedded</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-black text-sm mb-1 block">Primary Color</label>
                    <Input
                      type="color"
                      value={elementData?.appearance?.primaryColor || '#22C55E'}
                      onChange={(e) => handleDataUpdate({ 
                        appearance: { 
                          ...(elementData?.appearance || {}), 
                          primaryColor: e.target.value 
                        } 
                      })}
                      className="bg-slate-700 border-slate-600 text-white h-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={elementData.isEnabled || false}
                    onChange={(e) => handleDataUpdate({ isEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-black text-sm">Enable chatbot</span>
                </div>
              </div>
            ) : (
              elementData.isEnabled && (
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: elementData.appearance?.primaryColor || '#22C55E' }}
                    >
                      <i className="fas fa-robot"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{elementData.title}</h4>
                      <p className="text-sm text-slate-600">AI Assistant</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg mb-4">
                    <p className="text-slate-700 text-sm">{elementData.welcomeMessage}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Knowledge Base: {elementData.knowledgeBase?.textContent ? 'Text' : ''} {elementData.knowledgeBase?.websiteUrl ? 'Website' : ''} {(elementData.knowledgeBase?.pdfFiles || []).length > 0 ? `${(elementData.knowledgeBase?.pdfFiles || []).length} PDFs` : ''}</span>
                    <button 
                      className="px-3 py-1 rounded text-white text-xs hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: elementData.appearance?.primaryColor || '#22C55E' }}
                      onClick={() => setIsChatOpen(true)}
                      data-testid="button-start-chat"
                    >
                      Start Chat
                    </button>
                  </div>
                </div>
              )
            )}

            {/* AI Chat Dialog */}
            {element.type === "aiChatbot" && (
              <AIChat
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                knowledgeBase={elementData.knowledgeBase}
                welcomeMessage={elementData.welcomeMessage}
                primaryColor={elementData.appearance?.primaryColor}
              />
            )}
          </div>
        );

      case "ragKnowledge":
        const [ragKnowledgeSections, setRagKnowledgeSections] = useState({
          basic: true,
          textContent: false,
          urls: false,
          documents: false,
          chunks: false,
          settings: false,
        });

        const toggleRagSection = useCallback((section: string) => {
          setRagKnowledgeSections(prev => ({
            ...prev,
            [section]: !prev[section as keyof typeof prev]
          }));
        }, []);

        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-black mb-4 text-center">
              {elementData.title}
            </h3>
            <p className="text-center text-gray-600 mb-6">{elementData.description}</p>

            {isEditing ? (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto p-3 bg-slate-800 rounded-lg border border-slate-600">
                {/* Basic Settings */}
                <Collapsible open={ragKnowledgeSections.basic}>
                  <CollapsibleTrigger
                    onClick={() => toggleRagSection('basic')}
                    className="w-full flex justify-between items-center p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <span className="font-semibold text-white text-sm">📝 Basic Settings</span>
                    <i className={`fas fa-chevron-${ragKnowledgeSections.basic ? 'up' : 'down'} text-slate-300`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <Input
                      value={elementData.title || ''}
                      onChange={(e) => handleDataUpdate({ title: e.target.value })}
                      placeholder="Knowledge assistant title"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Textarea
                      value={elementData.description || ''}
                      onChange={(e) => handleDataUpdate({ description: e.target.value })}
                      placeholder="Description"
                      className="bg-slate-700 border-slate-600 text-white"
                      rows={2}
                    />
                  </CollapsibleContent>
                </Collapsible>

                {/* Text Content */}
                <Collapsible open={ragKnowledgeSections.textContent}>
                  <CollapsibleTrigger
                    onClick={() => toggleRagSection('textContent')}
                    className="w-full flex justify-between items-center p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <span className="font-semibold text-white text-sm">📄 Text Content</span>
                    <i className={`fas fa-chevron-${ragKnowledgeSections.textContent ? 'up' : 'down'} text-slate-300`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <TextChunkManager
                      maxChunks={50}
                      className="bg-slate-700 border-slate-600"
                      onChunksAdded={() => {
                        // Refresh chunks list
                        toggleRagSection('chunks');
                        setTimeout(() => toggleRagSection('chunks'), 100);
                      }}
                    />
                  </CollapsibleContent>
                </Collapsible>

                {/* Website URLs */}
                <Collapsible open={ragKnowledgeSections.urls}>
                  <CollapsibleTrigger
                    onClick={() => toggleRagSection('urls')}
                    className="w-full flex justify-between items-center p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <span className="font-semibold text-white text-sm">🌐 Website URLs</span>
                    <i className={`fas fa-chevron-${ragKnowledgeSections.urls ? 'up' : 'down'} text-slate-300`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <URLManager
                      title="+ Add Website URLs"
                      description="Add unlimited website URLs for comprehensive knowledge extraction"
                      onIngest={async (urls) => {
                        console.log('URLs ingested:', urls);
                        // Refresh chunks list
                        toggleRagSection('chunks');
                        setTimeout(() => toggleRagSection('chunks'), 100);
                      }}
                      maxUrls={100}
                      className="bg-slate-700 border-slate-500"
                    />
                  </CollapsibleContent>
                </Collapsible>

                {/* Documents */}
                <Collapsible open={ragKnowledgeSections.documents}>
                  <CollapsibleTrigger
                    onClick={() => toggleRagSection('documents')}
                    className="w-full flex justify-between items-center p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <span className="font-semibold text-white text-sm">📎 Documents</span>
                    <i className={`fas fa-chevron-${ragKnowledgeSections.documents ? 'up' : 'down'} text-slate-300`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <DocumentManager
                      title="+ Add Documents (One by One)"
                      description="Upload documents one by one for precise knowledge management"
                      documents={(elementData.knowledgeBase?.pdfFiles || []).map((pdf: any) => ({
                        id: pdf.id || generateFieldId(),
                        name: pdf.name,
                        content: pdf.content,
                        size: pdf.size,
                        status: 'success' as const
                      }))}
                      onDocumentsChange={(documents: DocumentItem[]) => {
                        handleDataUpdate({
                          knowledgeBase: {
                            ...elementData.knowledgeBase,
                            pdfFiles: documents.map(doc => ({
                              id: doc.id,
                              name: doc.name,
                              content: doc.content,
                              size: doc.size
                            }))
                          }
                        });
                      }}
                      onDocumentsIngested={() => {
                        // Refresh chunks list
                        toggleRagSection('chunks');
                        setTimeout(() => toggleRagSection('chunks'), 100);
                      }}
                      maxDocuments={50}
                      acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf']}
                      className="bg-slate-700 border-slate-500"
                    />
                  </CollapsibleContent>
                </Collapsible>

                {/* Knowledge Base Chunks - Dedicated Section */}
                <div className="bg-slate-700 p-3 rounded-lg border-2 border-slate-500">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📚</span>
                    <span className="font-semibold text-white text-sm">Knowledge Base Chunks</span>
                  </div>
                  <KnowledgeManager cardId={element.id} />
                </div>

                {/* Settings */}
                <Collapsible open={ragKnowledgeSections.settings}>
                  <CollapsibleTrigger
                    onClick={() => toggleRagSection('settings')}
                    className="w-full flex justify-between items-center p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <span className="font-semibold text-white text-sm">⚙️ Settings</span>
                    <i className={`fas fa-chevron-${ragKnowledgeSections.settings ? 'up' : 'down'} text-slate-300`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={elementData.showChatBox || false}
                        onChange={(e) => handleDataUpdate({ showChatBox: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-white text-sm">Show Chat Interface</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-white text-sm block">Welcome Message:</label>
                      <Input
                        value={elementData.welcomeMessage || 'Hi! How can I help you today?'}
                        onChange={(e) => handleDataUpdate({ welcomeMessage: e.target.value })}
                        placeholder="Hi! How can I help you today?"
                        className="bg-slate-600 border-slate-500 text-white text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white text-sm block">Primary Color:</label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={elementData.primaryColor || '#22c55e'}
                          onChange={(e) => handleDataUpdate({ primaryColor: e.target.value })}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <span className="text-slate-400 text-sm">{elementData.primaryColor || '#22c55e'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={elementData.enableStreaming !== false}
                        onChange={(e) => handleDataUpdate({ enableStreaming: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-white text-sm">Enable Response Streaming</span>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                {/* AI Assistant Card - Similar to AI Chatbot */}
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: elementData.primaryColor || '#22c55e' }}
                  >
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {elementData.title || 'AI Assistant'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {elementData.description || 'AI Assistant'}
                    </p>
                  </div>
                </div>

                {/* Welcome Message */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-center text-gray-700 dark:text-gray-300">
                    Hi! How can I help you today?
                  </p>
                </div>

                {/* Knowledge Base Label and Start Chat Button */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Knowledge Base:</span>
                  {elementData.showChatBox && (
                    <Button
                      onClick={() => setIsChatOpen(true)}
                      className="text-white px-6 py-2 rounded-lg shadow-md hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: elementData.primaryColor || '#22c55e' }}
                      data-testid="button-start-chat"
                    >
                      Start Chat
                    </Button>
                  )}
                </div>

                {/* RAG Chat Dialog */}
                {element.type === "ragKnowledge" && (
                  <RAGChatBox
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    primaryColor={elementData.primaryColor}
                    isEditing={isEditing}
                  />
                )}

                {/* Technical note for card creators - only visible during editing */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <p><strong>For Card Creators:</strong> Edit this element to manage knowledge base content. End users will only see the chat interface above.</p>
                </div>
              </div>
            )}
          </div>
        );

      case "installButton":
        // PWA Install Button - Customizable page element
        return (
          <InstallButtonElement 
            element={element}
            isEditing={isEditing}
            onUpdate={onUpdate}
            cardData={cardData}
          />
        );

      case "voiceAgent":
        return (
          <div className="mb-6">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800 text-lg">AI Voice Agent Settings</h3>
                  <i className="fas fa-phone-volume text-green-600 text-xl"></i>
                </div>

                {/* Basic Settings Section */}
                <Collapsible open={voiceAgentSections.basic}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('basic')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-voice-basic-settings"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-cog text-blue-600"></i>
                      <span className="font-medium text-slate-700">Basic Settings</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.basic ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Phone Number *</label>
                      <Input
                        value={elementData.phoneNumber || ''}
                        onChange={(e) => handleDataUpdate({ phoneNumber: e.target.value })}
                        placeholder="+1-555-0000"
                        className="text-black"
                        data-testid="input-phone-number"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Agent Name</label>
                      <Input
                        value={elementData.agentName || 'AI Assistant'}
                        onChange={(e) => handleDataUpdate({ agentName: e.target.value })}
                        placeholder="AI Assistant"
                        className="text-black"
                        data-testid="input-agent-name"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Is Active</label>
                      <Switch
                        checked={elementData.isActive !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ isActive: checked })}
                        data-testid="switch-is-active"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Agent Mode</label>
                      <Select
                        value={elementData.agentMode || 'answering'}
                        onValueChange={(value) => handleDataUpdate({ agentMode: value })}
                      >
                        <SelectTrigger className="text-black" data-testid="select-agent-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="answering">Answering</SelectItem>
                          <SelectItem value="qualification">Qualification</SelectItem>
                          <SelectItem value="booking">Booking</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Voice Customization Section */}
                <Collapsible open={voiceAgentSections.voice}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('voice')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-voice-customization"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-microphone text-purple-600"></i>
                      <span className="font-medium text-slate-700">Voice Customization</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.voice ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Voice Provider</label>
                      <Select
                        value={elementData.voiceProvider || 'openai'}
                        onValueChange={(value) => handleDataUpdate({ voiceProvider: value })}
                      >
                        <SelectTrigger className="text-black" data-testid="select-voice-provider">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="azure">Azure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Voice Gender</label>
                      <Select
                        value={elementData.voiceGender || 'neutral'}
                        onValueChange={(value) => handleDataUpdate({ voiceGender: value })}
                      >
                        <SelectTrigger className="text-black" data-testid="select-voice-gender">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Voice Language</label>
                      <Input
                        value={elementData.voiceLanguage || 'en'}
                        onChange={(e) => handleDataUpdate({ voiceLanguage: e.target.value })}
                        placeholder="en"
                        className="text-black"
                        data-testid="input-voice-language"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Voice Tone</label>
                      <Select
                        value={elementData.voiceTone || 'professional'}
                        onValueChange={(value) => handleDataUpdate({ voiceTone: value })}
                      >
                        <SelectTrigger className="text-black" data-testid="select-voice-tone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="energetic">Energetic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-slate-700 font-medium">Speech Speed</label>
                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                          {elementData.speechSpeed || 100}
                        </span>
                      </div>
                      <Slider
                        min={50}
                        max={150}
                        step={1}
                        value={[elementData.speechSpeed || 100]}
                        onValueChange={(value) => handleDataUpdate({ speechSpeed: value[0] })}
                        className="cursor-pointer"
                        data-testid="slider-speech-speed"
                      />
                      <div className="flex justify-between mt-1 text-xs text-slate-400">
                        <span>Slow (50)</span>
                        <span>Fast (150)</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Knowledge Base Section */}
                <Collapsible open={voiceAgentSections.knowledge}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('knowledge')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-knowledge-base"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-brain text-indigo-600"></i>
                      <span className="font-medium text-slate-700">Knowledge Base</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.knowledge ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Use Knowledge Base</label>
                      <Switch
                        checked={elementData.useKnowledgeBase !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ useKnowledgeBase: checked })}
                        data-testid="switch-use-knowledge-base"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-slate-700 font-medium">Context Limit</label>
                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                          {elementData.contextLimit || 3}
                        </span>
                      </div>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[elementData.contextLimit || 3]}
                        onValueChange={(value) => handleDataUpdate({ contextLimit: value[0] })}
                        className="cursor-pointer"
                        data-testid="slider-context-limit"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-slate-700 font-medium">Confidence Threshold (%)</label>
                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                          {elementData.confidenceThreshold || 70}%
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[elementData.confidenceThreshold || 70]}
                        onValueChange={(value) => handleDataUpdate({ confidenceThreshold: value[0] })}
                        className="cursor-pointer"
                        data-testid="slider-confidence-threshold"
                      />
                    </div>

                    {/* Text Content Input */}
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-2 block">Knowledge Base Content</label>
                      <Textarea
                        value={elementData.knowledgeBase?.textContent || ''}
                        onChange={(e) => handleDataUpdate({ 
                          knowledgeBase: { 
                            ...elementData.knowledgeBase, 
                            textContent: e.target.value 
                          } 
                        })}
                        placeholder="Enter knowledge base content directly..."
                        rows={4}
                        className="w-full text-black"
                        data-testid="textarea-knowledge-content"
                      />
                      {elementData.knowledgeBase?.textContent && (
                        <Button
                          onClick={async () => {
                            const textContent = elementData.knowledgeBase?.textContent;
                            if (!textContent || textContent.trim().length < 10) {
                              alert('Please enter at least 10 characters of text');
                              return;
                            }

                            try {
                              const response = await fetch('/api/ingest-text', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  text: textContent,
                                  title: elementData.agentName || 'Voice Agent Knowledge Base'
                                })
                              });

                              const result = await response.json();

                              if (result.success) {
                                alert('Knowledge base content saved successfully!');
                              } else {
                                alert('Failed to save: ' + (result.error || 'Unknown error'));
                              }
                            } catch (error) {
                              console.error('Error saving knowledge base:', error);
                              alert('Failed to save knowledge base content');
                            }
                          }}
                          className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                          data-testid="button-save-knowledge"
                        >
                          <i className="fas fa-save mr-2"></i>
                          Save to Knowledge Base
                        </Button>
                      )}
                    </div>

                    {/* Document Upload */}
                    <div>
                      <DocumentManager
                        title="📄 Upload Documents"
                        description="Upload PDFs, Word docs, and text files"
                        documents={(elementData.knowledgeBase?.pdfFiles || []).map((pdf: any) => ({
                          id: pdf.id || generateFieldId(),
                          name: pdf.name,
                          content: pdf.content,
                          size: pdf.size,
                          status: 'success' as const
                        }))}
                        onDocumentsChange={(documents: DocumentItem[]) => {
                          handleDataUpdate({
                            knowledgeBase: {
                              ...elementData.knowledgeBase,
                              pdfFiles: documents.map(doc => ({
                                id: doc.id,
                                name: doc.name,
                                content: doc.content,
                                size: doc.size
                              }))
                            }
                          });
                        }}
                        maxDocuments={50}
                        acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf']}
                        className="bg-white border-slate-200"
                      />
                    </div>

                    {/* URL Manager */}
                    <div>
                      <URLManager
                        title="🌐 Add Website URLs"
                        description="Extract knowledge from websites"
                        onIngest={async (urls) => {
                          // URLs are automatically ingested through the URLManager component
                          console.log('URLs ingested:', urls);
                          handleDataUpdate({
                            knowledgeBase: {
                              ...elementData.knowledgeBase,
                              urls: urls
                            }
                          });
                        }}
                        maxUrls={100}
                        className="bg-white border-slate-200"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Scripts & Messages Section */}
                <Collapsible open={voiceAgentSections.scripts}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('scripts')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-scripts-messages"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-file-alt text-orange-600"></i>
                      <span className="font-medium text-slate-700">Scripts & Messages</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.scripts ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Greeting</label>
                      <Textarea
                        value={elementData.greeting || ''}
                        onChange={(e) => handleDataUpdate({ greeting: e.target.value })}
                        placeholder="Hello! I'm your AI assistant. How can I help you today?"
                        className="text-black min-h-[80px]"
                        data-testid="textarea-greeting"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">System Prompt</label>
                      <Textarea
                        value={elementData.systemPrompt || ''}
                        onChange={(e) => handleDataUpdate({ systemPrompt: e.target.value })}
                        placeholder="You are a helpful AI assistant representing our company..."
                        className="text-black min-h-[100px]"
                        data-testid="textarea-system-prompt"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Fallback Message</label>
                      <Textarea
                        value={elementData.fallbackMessage || ''}
                        onChange={(e) => handleDataUpdate({ fallbackMessage: e.target.value })}
                        placeholder="I'm sorry, I didn't understand that. Could you please rephrase?"
                        className="text-black min-h-[80px]"
                        data-testid="textarea-fallback-message"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">End Call Message</label>
                      <Textarea
                        value={elementData.endCallMessage || ''}
                        onChange={(e) => handleDataUpdate({ endCallMessage: e.target.value })}
                        placeholder="Thank you for calling. Have a great day!"
                        className="text-black min-h-[80px]"
                        data-testid="textarea-end-call-message"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Integrations Section */}
                <Collapsible open={voiceAgentSections.integrations}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('integrations')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-integrations"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-plug text-teal-600"></i>
                      <span className="font-medium text-slate-700">Integrations</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.integrations ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Enable Appointment Booking</label>
                      <Switch
                        checked={elementData.enableAppointmentBooking || false}
                        onCheckedChange={(checked) => handleDataUpdate({ enableAppointmentBooking: checked })}
                        data-testid="switch-enable-appointment-booking"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Enable Lead Qualification</label>
                      <Switch
                        checked={elementData.enableLeadQualification || false}
                        onCheckedChange={(checked) => handleDataUpdate({ enableLeadQualification: checked })}
                        data-testid="switch-enable-lead-qualification"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Enable CRM Sync</label>
                      <Switch
                        checked={elementData.enableCrmSync !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ enableCrmSync: checked })}
                        data-testid="switch-enable-crm-sync"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Booking Confirmation Message</label>
                      <Textarea
                        value={elementData.bookingConfirmationMessage || ''}
                        onChange={(e) => handleDataUpdate({ bookingConfirmationMessage: e.target.value })}
                        placeholder="Your appointment has been confirmed. You'll receive a confirmation email shortly."
                        className="text-black min-h-[80px]"
                        data-testid="textarea-booking-confirmation"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Call Settings Section */}
                <Collapsible open={voiceAgentSections.callSettings}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('callSettings')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-call-settings"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-phone text-green-600"></i>
                      <span className="font-medium text-slate-700">Call Settings</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.callSettings ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Enable Voicemail</label>
                      <Switch
                        checked={elementData.enableVoicemail !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ enableVoicemail: checked })}
                        data-testid="switch-enable-voicemail"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Voicemail Message</label>
                      <Textarea
                        value={elementData.voicemailMessage || ''}
                        onChange={(e) => handleDataUpdate({ voicemailMessage: e.target.value })}
                        placeholder="Please leave a message and we'll get back to you shortly."
                        className="text-black min-h-[80px]"
                        data-testid="textarea-voicemail-message"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Enable Call Recording</label>
                      <Switch
                        checked={elementData.enableCallRecording || false}
                        onCheckedChange={(checked) => handleDataUpdate({ enableCallRecording: checked })}
                        data-testid="switch-enable-call-recording"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Max Call Duration (seconds)</label>
                      <Input
                        type="number"
                        value={elementData.maxCallDuration || 600}
                        onChange={(e) => handleDataUpdate({ maxCallDuration: parseInt(e.target.value) || 600 })}
                        placeholder="600"
                        className="text-black"
                        data-testid="input-max-call-duration"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Default: 600 seconds (10 minutes)
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Audio Quality Section */}
                <Collapsible open={voiceAgentSections.audio}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('audio')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-audio-quality"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-volume-up text-red-600"></i>
                      <span className="font-medium text-slate-700">Audio Quality</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.audio ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Audio Quality</label>
                      <Select
                        value={elementData.audioQuality || 'high'}
                        onValueChange={(value) => handleDataUpdate({ audioQuality: value })}
                      >
                        <SelectTrigger className="text-black" data-testid="select-audio-quality">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Noise Cancellation</label>
                      <Switch
                        checked={elementData.noiseCancellation !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ noiseCancellation: checked })}
                        data-testid="switch-noise-cancellation"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Echo Cancellation</label>
                      <Switch
                        checked={elementData.echoCancellation !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ echoCancellation: checked })}
                        data-testid="switch-echo-cancellation"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ) : (
              <VoiceAgentElement
                phoneNumber={elementData.phoneNumber || '+1-555-0000'}
                agentName={elementData.agentName || 'AI Assistant'}
                description={elementData.description || 'Call us anytime to speak with our AI assistant'}
                buttonText={elementData.buttonText || 'Call Now'}
                primaryColor={elementData.primaryColor || '#22c55e'}
                showAgentInfo={elementData.showAgentInfo !== false}
                isEditing={isEditing}
                knowledgeBase={elementData.knowledgeBase}
                cardId={cardData?.id}
              />
            )}
          </div>
        );

      case "voiceAssistant":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800 text-lg">
                    <i className="fas fa-microphone-alt text-purple-600 mr-2"></i>
                    Voice Assistant Settings
                  </h3>
                  <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    variant="ghost"
                    size="sm"
                  >
                    <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-slate-600`}></i>
                  </Button>
                </div>

                {isExpanded && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Business Name</label>
                      <Input
                        value={elementData.businessName || ''}
                        onChange={(e) => handleDataUpdate({ businessName: e.target.value })}
                        placeholder="Your Business Name"
                        className="text-black"
                        data-testid="input-business-name"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Assistant Name</label>
                      <Input
                        value={elementData.assistantName || 'AI Assistant'}
                        onChange={(e) => handleDataUpdate({ assistantName: e.target.value })}
                        placeholder="AI Assistant"
                        className="text-black"
                        data-testid="input-assistant-name"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={elementData.primaryColor || '#8b5cf6'}
                          onChange={(e) => handleDataUpdate({ primaryColor: e.target.value })}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={elementData.primaryColor || '#8b5cf6'}
                          onChange={(e) => handleDataUpdate({ primaryColor: e.target.value })}
                          placeholder="#8b5cf6"
                          className="flex-1 text-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-2 block">Knowledge Base</label>
                      <Textarea
                        value={elementData.knowledgeBase?.textContent || ''}
                        onChange={(e) => handleDataUpdate({ 
                          knowledgeBase: { 
                            ...elementData.knowledgeBase, 
                            textContent: e.target.value 
                          } 
                        })}
                        placeholder="Enter information about your business, services, FAQ, pricing, etc..."
                        rows={6}
                        className="w-full text-black"
                        data-testid="textarea-knowledge-base"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        This information will be used to train your AI assistant about your business
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-2 block">System Prompt</label>
                      <Textarea
                        value={elementData.knowledgeBase?.systemPrompt || ''}
                        onChange={(e) => handleDataUpdate({ 
                          knowledgeBase: { 
                            ...elementData.knowledgeBase, 
                            systemPrompt: e.target.value 
                          } 
                        })}
                        placeholder="You are a helpful AI assistant for [Business Name]. Be professional and friendly..."
                        rows={3}
                        className="w-full text-black"
                        data-testid="textarea-system-prompt"
                      />
                    </div>

                    {/* Document Upload */}
                    <div>
                      <DocumentManager
                        title="📄 Upload Business Documents"
                        description="Upload PDFs, brochures, and documents about your business"
                        documents={(elementData.knowledgeBase?.documents || []).map((doc: any) => ({
                          id: doc.id || generateFieldId(),
                          name: doc.name,
                          content: doc.content,
                          size: doc.size,
                          status: 'success' as const
                        }))}
                        onDocumentsChange={(documents: DocumentItem[]) => {
                          handleDataUpdate({
                            knowledgeBase: {
                              ...elementData.knowledgeBase,
                              documents: documents.map(doc => ({
                                id: doc.id,
                                name: doc.name,
                                content: doc.content,
                                size: doc.size
                              }))
                            }
                          });
                        }}
                        maxDocuments={10}
                        acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.md']}
                        className="bg-white border-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <VoiceAssistantCard
                businessName={elementData.businessName || cardData?.businessName || 'Our Business'}
                agentName={elementData.assistantName || 'AI Assistant'}
                primaryColor={elementData.primaryColor || '#8b5cf6'}
                knowledgeBase={elementData.knowledgeBase}
                isEditing={isEditing}
                cardId={cardData?.id}
              />
            )}
          </div>
        );

      case "appleWallet":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800">Apple Wallet Element</h3>
                  <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    variant="ghost"
                    size="sm"
                  >
                    <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-slate-600`}></i>
                  </Button>
                </div>

                {isExpanded && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Button Title</label>
                      <Input
                        value={elementData.title || ''}
                        onChange={(e) => handleDataUpdate({ title: e.target.value })}
                        placeholder="Add to Apple Wallet"
                        className="text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Subtitle</label>
                      <Input
                        value={elementData.subtitle || ''}
                        onChange={(e) => handleDataUpdate({ subtitle: e.target.value })}
                        placeholder="Save this business card to your iPhone or Mac"
                        className="text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Button Style</label>
                      <select
                        value={elementData.buttonStyle || 'default'}
                        onChange={(e) => handleDataUpdate({ buttonStyle: e.target.value as "default" | "minimal" | "full" })}
                        className="w-full p-2 border border-slate-300 rounded text-black"
                      >
                        <option value="default">Default</option>
                        <option value="minimal">Minimal</option>
                        <option value="full">Full Width</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Custom Color (optional)</label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={elementData.customColor || "#000000"}
                          onChange={(e) => handleDataUpdate({ customColor: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={elementData.customColor || ""}
                          onChange={(e) => handleDataUpdate({ customColor: e.target.value })}
                          placeholder="#000000 or leave empty for default black"
                          className="flex-1 text-black"
                        />
                        {elementData.customColor && (
                          <Button
                            onClick={() => handleDataUpdate({ customColor: "" })}
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-red-500"
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/wallet/apple/${cardData?.id || ''}/create`, {
                        method: 'POST',
                      });

                      if (response.status === 501) {
                        alert('Apple Wallet integration is being set up. Coming soon!');
                        return;
                      }

                      if (!response.ok) {
                        throw new Error('Failed to generate Apple pass');
                      }

                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${cardData?.fullName || 'BusinessCard'}.pkpass`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('Error generating Apple pass:', error);
                      alert('Failed to create Apple Wallet pass. Please try again.');
                    }
                  }}
                  className={`
                    ${elementData.buttonStyle === 'full' ? 'w-full' : elementData.buttonStyle === 'minimal' ? 'px-4 py-2' : 'px-6 py-3'}
                    bg-black hover:bg-gray-800 text-white border-black
                    transition-all duration-200
                  `}
                  style={elementData.customColor ? { backgroundColor: elementData.customColor } : {}}
                  data-testid="button-apple-wallet-element"
                >
                  {elementData.showIcon && <i className="fas fa-wallet mr-2"></i>}
                  {elementData.title || 'Add to Apple Wallet'}
                </Button>
                {elementData.subtitle && (
                  <p className="text-xs text-slate-500 mt-2">{elementData.subtitle}</p>
                )}
              </div>
            )}
          </div>
        );

      case "googleWallet":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800">Google Wallet Element</h3>
                  <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    variant="ghost"
                    size="sm"
                  >
                    <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-slate-600`}></i>
                  </Button>
                </div>

                {isExpanded && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Button Title</label>
                      <Input
                        value={elementData.title || ''}
                        onChange={(e) => handleDataUpdate({ title: e.target.value })}
                        placeholder="Add to Google Wallet"
                        className="text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Subtitle</label>
                      <Input
                        value={elementData.subtitle || ''}
                        onChange={(e) => handleDataUpdate({ subtitle: e.target.value })}
                        placeholder="Save this business card to your Android phone"
                        className="text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Button Style</label>
                      <select
                        value={elementData.buttonStyle || 'default'}
                        onChange={(e) => handleDataUpdate({ buttonStyle: e.target.value as "default" | "minimal" | "full" })}
                        className="w-full p-2 border border-slate-300 rounded text-black"
                      >
                        <option value="default">Default</option>
                        <option value="minimal">Minimal</option>
                        <option value="full">Full Width</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Custom Color (optional)</label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={elementData.customColor || "#2563eb"}
                          onChange={(e) => handleDataUpdate({ customColor: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={elementData.customColor || ""}
                          onChange={(e) => handleDataUpdate({ customColor: e.target.value })}
                          placeholder="#2563eb or leave empty for default blue"
                          className="flex-1 text-black"
                        />
                        {elementData.customColor && (
                          <Button
                            onClick={() => handleDataUpdate({ customColor: "" })}
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-red-500"
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/wallet/google/${cardData?.id || ''}/create`, {
                        method: 'POST',
                      });

                      if (response.status === 501) {
                        alert('Google Wallet integration is being set up. Coming soon!');
                        return;
                      }

                      if (!response.ok) {
                        throw new Error('Failed to generate Google pass');
                      }

                      const result = await response.json();
                      if (result.addToGoogleWalletUrl) {
                        window.open(result.addToGoogleWalletUrl, '_blank');
                      }
                    } catch (error) {
                      console.error('Error generating Google pass:', error);
                      alert('Failed to create Google Wallet pass. Please try again.');
                    }
                  }}
                  className={`
                    ${elementData.buttonStyle === 'full' ? 'w-full' : elementData.buttonStyle === 'minimal' ? 'px-4 py-2' : 'px-6 py-3'}
                    bg-blue-600 hover:bg-blue-700 text-white border-blue-600
                    transition-all duration-200
                  `}
                  style={elementData.customColor ? { backgroundColor: elementData.customColor } : {}}
                  data-testid="button-google-wallet-element"
                >
                  {elementData.showIcon && <i className="fas fa-credit-card mr-2"></i>}
                  {elementData.title || 'Add to Google Wallet'}
                </Button>
                {elementData.subtitle && (
                  <p className="text-xs text-slate-500 mt-2">{elementData.subtitle}</p>
                )}
              </div>
            )}
          </div>
        );

      case 'digitalWallet':
        return (
          <div className="mb-6">
            {isEditing && (
              <div className="mb-4 p-4 bg-slate-100 rounded-lg">
                <h3 className="font-medium mb-3">Digital Wallet Settings</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Section Title</label>
                      <Input
                        value={elementData.title || 'Save to Digital Wallet'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...elementData, 
                            title: e.target.value 
                          } 
                        })}
                        placeholder="Section title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Layout</label>
                      <select
                        value={elementData.layout || 'stacked'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...elementData, 
                            layout: e.target.value as "stacked" | "columns"
                          } 
                        })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="stacked">Stacked (1 Column)</option>
                        <option value="columns">Side by Side (2 Columns)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <Input
                      value={elementData.subtitle || 'Add this business card to your phone\'s wallet'}
                      onChange={(e) => onUpdate && onUpdate({ 
                        ...element, 
                        data: { 
                          ...elementData, 
                          subtitle: e.target.value 
                        } 
                      })}
                      placeholder="Description text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={elementData.showApple !== false}
                          onChange={(e) => onUpdate && onUpdate({ 
                            ...element, 
                            data: { 
                              ...elementData, 
                              showApple: e.target.checked 
                            } 
                          })}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium">Apple Wallet</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={elementData.showGoogle !== false}
                          onChange={(e) => onUpdate && onUpdate({ 
                            ...element, 
                            data: { 
                              ...elementData, 
                              showGoogle: e.target.checked 
                            } 
                          })}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        <span className="ml-3 text-sm font-medium">Google Wallet</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Apple Button Text</label>
                      <Input
                        value={elementData.appleButtonText || 'Add to Apple Wallet'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...elementData, 
                            appleButtonText: e.target.value 
                          } 
                        })}
                        placeholder="Apple button text"
                        disabled={!elementData.showApple}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Google Button Text</label>
                      <Input
                        value={elementData.googleButtonText || 'Add to Google Wallet'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...elementData, 
                            googleButtonText: e.target.value 
                          } 
                        })}
                        placeholder="Google button text"
                        disabled={!elementData.showGoogle}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Apple Button Color</label>
                      <Input
                        type="color"
                        value={elementData.appleButtonColor || '#000000'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...elementData, 
                            appleButtonColor: e.target.value 
                          } 
                        })}
                        className="h-10"
                        disabled={!elementData.showApple}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Google Button Color</label>
                      <Input
                        type="color"
                        value={elementData.googleButtonColor || '#2563eb'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...elementData, 
                            googleButtonColor: e.target.value 
                          } 
                        })}
                        className="h-10"
                        disabled={!elementData.showGoogle}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Background Color</label>
                      <Input
                        type="color"
                        value={elementData.backgroundColor || '#1e293b'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...elementData, 
                            backgroundColor: e.target.value 
                          } 
                        })}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Text Color</label>
                      <Input
                        type="color"
                        value={elementData.textColor || '#ffffff'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...elementData, 
                            textColor: e.target.value 
                          } 
                        })}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Font Family</label>
                    <select
                      value={elementData.fontFamily || 'Inter'}
                      onChange={(e) => onUpdate && onUpdate({ 
                        ...element, 
                        data: { 
                          ...elementData, 
                          fontFamily: e.target.value 
                        } 
                      })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Inter">Inter (Default)</option>
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">QR Download Button Text</label>
                    <Input
                      value={elementData.qrButtonText || 'Download QR Code'}
                      onChange={(e) => onUpdate && onUpdate({ 
                        ...element, 
                        data: { 
                          ...elementData, 
                          qrButtonText: e.target.value 
                        } 
                      })}
                      placeholder="QR button text"
                      disabled={!elementData.showQRDownload}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">QR Code Button Color</label>
                    <Input
                      type="color"
                      value={elementData.qrButtonColor || '#000000'}
                      onChange={(e) => onUpdate && onUpdate({ 
                        ...element, 
                        data: { 
                          ...elementData, 
                          qrButtonColor: e.target.value 
                        } 
                      })}
                      className="h-10"
                      disabled={!elementData.showQRDownload}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`show-download-qr-${element.id}`}
                        checked={elementData.showQRDownload || false}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...elementData, 
                            showQRDownload: e.target.checked 
                          } 
                        })}
                        className="rounded"
                      />
                      <label htmlFor={`show-download-qr-${element.id}`} className="text-sm">
                        Show QR Download Option
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`modern-style-${element.id}`}
                        checked={elementData.modernStyle || false}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...elementData, 
                            modernStyle: e.target.checked 
                          } 
                        })}
                        className="rounded"
                      />
                      <label htmlFor={`modern-style-${element.id}`} className="text-sm">
                        Use Modern Card Style
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Digital Wallet Container */}
            <div 
              className={`
                ${elementData.modernStyle 
                  ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 border-2 border-slate-500 shadow-2xl' 
                  : 'border border-slate-700 shadow-lg'
                } 
                rounded-xl p-6
              `}
              style={{
                backgroundColor: elementData.modernStyle ? undefined : (elementData.backgroundColor || '#1e293b'),
                color: elementData.textColor || '#ffffff',
                fontFamily: elementData.fontFamily || 'Inter'
              }}
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {elementData.title || 'Save to Digital Wallet'}
                </h3>
                <p className="text-sm opacity-80">
                  {elementData.subtitle || 'Add this business card to your phone\'s wallet'}
                </p>
              </div>

              <div className={`
                ${elementData.layout === 'columns' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}
              `}>
                {/* Apple Wallet Button */}
                {elementData.showApple !== false && (
                  <Button
                    onClick={async () => {
                      try {
                        console.log('Apple Wallet button clicked for card:', cardData?.id);
                        const response = await fetch(`/api/wallet/apple/${cardData?.id || ''}/create`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        });

                        console.log('Apple Wallet API response status:', response.status);

                        if (!response.ok) {
                          const errorData = await response.json();
                          console.error('Apple Wallet API error:', errorData);
                          throw new Error(`Failed to generate Apple pass: ${errorData.message}`);
                        }

                        const result = await response.json();
                        console.log('Apple Wallet API response:', result);

                        if (result.success) {
                          alert(`✅ ${result.message}\n\nApple Wallet pass data generated successfully. In production, this would download a .pkpass file that can be added to Apple Wallet.`);
                        } else {
                          throw new Error(result.message || 'Failed to create Apple Wallet pass');
                        }
                      } catch (error) {
                        console.error('Error generating Apple pass:', error);
                        alert(`Failed to create Apple Wallet pass: ${error.message}`);
                      }
                    }}
                    className="w-full h-12 text-white transition-all duration-200 flex items-center justify-center space-x-3 hover:opacity-90"
                    style={{
                      backgroundColor: elementData.appleButtonColor || '#000000',
                      borderColor: elementData.appleButtonColor || '#000000'
                    }}
                    data-testid="button-add-apple-wallet"
                  >
                    <i className="fab fa-apple text-lg"></i>
                    <span className="font-medium">{elementData.appleButtonText || 'Add to Apple Wallet'}</span>
                  </Button>
                )}

                {/* Google Wallet Button */}
                {elementData.showGoogle !== false && (
                  <Button
                    onClick={async () => {
                      try {
                        console.log('Google Wallet button clicked for card:', cardData?.id);
                        const response = await fetch(`/api/wallet/google/${cardData?.id || ''}/create`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        });

                        console.log('Google Wallet API response status:', response.status);

                        if (!response.ok) {
                          const errorData = await response.json();
                          console.error('Google Wallet API error:', errorData);
                          throw new Error(`Failed to generate Google pass: ${errorData.message}`);
                        }

                        const result = await response.json();
                        console.log('Google Wallet API result:', result);

                        if (result.success) {
                          if (result.saveUrl) {
                            console.log('Opening Google Wallet URL:', result.saveUrl);
                            // Production mode - open Google Wallet save URL
                            window.open(result.saveUrl, '_blank');
                            alert(`✅ ${result.message}\n\nGoogle Wallet pass created! Opening in new tab...`);
                          } else if (result.passType === 'google_wallet_demo') {
                            // Demo mode - show explanation
                            const demoInfo = result.demoInfo;
                            alert(`🔧 ${result.message}

📋 Business Card Data Ready:
• Name: ${demoInfo.businessCardData.name}
• Title: ${demoInfo.businessCardData.title}
• Company: ${demoInfo.businessCardData.company}
• Contact: ${demoInfo.businessCardData.contact}

🚀 For Production Setup:
${demoInfo.requirements.map((req: string, i: number) => `${i + 1}. ${req}`).join('\n')}

💡 In production, this would open Google Wallet to save the business card pass.`);
                          } else {
                            throw new Error('Unknown response format');
                          }
                        } else {
                          throw new Error(result.message || 'Failed to create Google Wallet pass');
                        }
                      } catch (error: any) {
                        console.error('Error generating Google pass:', error);
                        alert(`Failed to create Google Wallet pass: ${error.message}`);
                      }
                    }}
                    className="w-full h-12 text-white transition-all duration-200 flex items-center justify-center space-x-3 hover:opacity-90"
                    style={{
                      backgroundColor: elementData.googleButtonColor || '#2563eb',
                      borderColor: elementData.googleButtonColor || '#2563eb'
                    }}
                    data-testid="button-add-google-wallet"
                  >
                    <i className="fab fa-google text-lg"></i>
                    <span className="font-medium">{elementData.googleButtonText || 'Add to Google Wallet'}</span>
                  </Button>
                )}
              </div>

              {/* QR Download Option */}
              {elementData.showQRDownload && (
                <div className="mt-4">
                  <Button
                    onClick={async () => {
                      try {
                        console.log('QR Download button clicked for card:', cardData?.id);
                        // Generate QR code download link for business card
                        const shareUrl = `${window.location.origin}/${cardData?.shareSlug || cardData?.id}`;
                        console.log('Share URL for QR:', shareUrl);

                        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&bgcolor=ffffff&color=${(elementData.qrButtonColor || '000000').replace('#', '')}&data=${encodeURIComponent(shareUrl)}`;
                        console.log('QR API URL:', qrUrl);

                        // Fetch the QR code image
                        const response = await fetch(qrUrl);
                        if (!response.ok) {
                          throw new Error('Failed to generate QR code');
                        }

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);

                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${cardData?.fullName || 'BusinessCard'}-QR.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);

                        console.log('QR code download triggered');
                      } catch (error: any) {
                        console.error('Error downloading QR code:', error);
                        alert(`Failed to download QR code: ${error.message}`);
                      }
                    }}
                    variant="outline"
                    className="w-full h-10 border-slate-500 hover:bg-slate-700 hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
                    style={{
                      borderColor: elementData.qrButtonColor || '#000000',
                      backgroundColor: elementData.qrButtonColor || '#000000',
                      color: '#ffffff'
                    }}
                    data-testid="button-download-qr"
                  >
                    <i className="fas fa-download"></i>
                    <span>{elementData.qrButtonText || 'Download QR Code'}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'navigationMenu':
        // Extract available pages from cardData
        const availablePages = ((cardData?.pages as any[]) || [])
          .filter((page: any) => page.key !== 'home') // Exclude home/card page
          .map((page: any) => ({
            id: page.id,
            label: page.label,
            path: page.path || page.key || page.id
          }));

        return (
          <MenuPageElement 
            data={elementData}
            isEditing={isEditing}
            onChange={(data) => onUpdate && onUpdate({ ...element, data })}
            availablePages={availablePages}
            onNavigate={onNavigatePage}
          />
        );

      case 'arPreviewMindAR':
        return (
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">AR Preview Settings</h3>

                {/* Generate from Card Image Button */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Auto-Generate AR Target
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        const result = await compileMind(file);
                        handleDataUpdate({
                          mindFileUrl: result.mindFileUrl,
                          planeTextureUrl: result.textureUrl || elementData.planeTextureUrl
                        });

                        if (result.mindFileUrl) {
                          alert('AR target generated successfully!');
                        } else if (result.message) {
                          alert(`Image uploaded successfully!\n\n${result.message}`);
                        } else {
                          alert('Image uploaded successfully! Please enter a .mind file URL manually.');
                        }
                      } catch (error: any) {
                        alert(`Failed to process image: ${error.message}`);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  <p className="text-xs text-gray-500">
                    Upload your business card front image to auto-generate AR target
                  </p>
                </div>

                {/* Mind File URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Mind (.mind) File URL
                  </label>
                  <Input
                    value={elementData.mindFileUrl || ''}
                    onChange={(e) => handleDataUpdate({ mindFileUrl: e.target.value })}
                    placeholder="https://example.com/targets.mind"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    {elementData.mindFileUrl ? 'AR target configured' : 'Upload image above or paste .mind URL manually'}
                  </p>
                </div>

                {/* Poster URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Poster URL (Fallback)
                  </label>
                  <Input
                    value={elementData.posterUrl || ''}
                    onChange={(e) => handleDataUpdate({ posterUrl: e.target.value })}
                    placeholder="https://example.com/poster.jpg"
                    className="text-sm"
                  />
                </div>

                {/* Plane Texture URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Plane Texture URL
                  </label>
                  <Input
                    value={elementData.planeTextureUrl || ''}
                    onChange={(e) => handleDataUpdate({ planeTextureUrl: e.target.value })}
                    placeholder="https://example.com/texture.jpg"
                    className="text-sm"
                  />
                </div>

                {/* Plane Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Plane Width (m)
                    </label>
                    <Input
                      type="number"
                      min="0.1"
                      max="2"
                      step="0.05"
                      value={elementData.planeWidth || 0.8}
                      onChange={(e) => handleDataUpdate({ planeWidth: parseFloat(e.target.value) })}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Plane Height (m)
                    </label>
                    <Input
                      type="number"
                      min="0.1"
                      max="2"
                      step="0.05"
                      value={elementData.planeHeight || 0.45}
                      onChange={(e) => handleDataUpdate({ planeHeight: parseFloat(e.target.value) })}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={elementData.accent || '#0ea5e9'}
                    onChange={(e) => handleDataUpdate({ accent: e.target.value })}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>

                {/* CTAs */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Call-to-Action Buttons
                  </label>
                  <div className="space-y-2">
                    {(elementData.ctas || []).map((cta: any, index: number) => (
                      <div key={`cta-${index}`} className="flex gap-2 items-center p-2 border rounded">
                        <Input
                          value={cta.label || ''}
                          onChange={(e) => {
                            const newCtas = [...(elementData.ctas || [])];
                            newCtas[index] = { ...cta, label: e.target.value };
                            handleDataUpdate({ ctas: newCtas });
                          }}
                          placeholder="Button label"
                          className="text-sm"
                        />
                        <select
                          value={cta.action || 'link'}
                          onChange={(e) => {
                            const newCtas = [...(elementData.ctas || [])];
                            newCtas[index] = { ...cta, action: e.target.value };
                            handleDataUpdate({ ctas: newCtas });
                          }}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="link">Link</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="tel">Call</option>
                          <option value="mailto">Email</option>
                        </select>
                        <Input
                          value={cta.value || ''}
                          onChange={(e) => {
                            const newCtas = [...(elementData.ctas || [])];
                            newCtas[index] = { ...cta, value: e.target.value };
                            handleDataUpdate({ ctas: newCtas });
                          }}
                          placeholder="URL/phone/email"
                          className="text-sm"
                        />
                        <Button
                          onClick={() => {
                            const newCtas = (elementData.ctas || []).filter((_: any, i: number) => i !== index);
                            handleDataUpdate({ ctas: newCtas });
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => {
                        const newCtas = [...(elementData.ctas || []), { label: 'New Action', action: 'link', value: '' }];
                        handleDataUpdate({ ctas: newCtas });
                      }}
                      variant="outline"
                      size="sm"
                      className="text-purple-600 hover:text-purple-800"
                    >
                      + Add CTA
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <ARPreviewMindAR
                mindFileUrl={elementData.mindFileUrl}
                posterUrl={elementData.posterUrl}
                planeTextureUrl={elementData.planeTextureUrl}
                planeWidth={elementData.planeWidth}
                planeHeight={elementData.planeHeight}
                accent={elementData.accent}
                ctas={elementData.ctas}
              />
            )}
          </div>
        );

      // Appointment booking elements
      case "bookAppointment":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">Book Appointment Element</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                    <Input
                      value={elementData.title || ""}
                      onChange={(e) => handleDataUpdate({ title: e.target.value })}
                      placeholder="Book Appointment"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
                    <Input
                      value={elementData.buttonText || ""}
                      onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
                      placeholder="Book Now"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Subtitle</label>
                  <Input
                    value={elementData.subtitle || ""}
                    onChange={(e) => handleDataUpdate({ subtitle: e.target.value })}
                    placeholder="Schedule a meeting with me"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Event Type Slug</label>
                    <Input
                      value={elementData.eventTypeSlug || ""}
                      onChange={(e) => handleDataUpdate({ eventTypeSlug: e.target.value })}
                      placeholder="consultation"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Duration (min)</label>
                    <Input
                      type="number"
                      value={elementData.duration || 30}
                      onChange={(e) => handleDataUpdate({ duration: parseInt(e.target.value) })}
                      min="15"
                      max="180"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Color</label>
                    <Input
                      type="color"
                      value={elementData.buttonColor || "#22c55e"}
                      onChange={(e) => handleDataUpdate({ buttonColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Text Color</label>
                    <Input
                      type="color"
                      value={elementData.textColor || "#ffffff"}
                      onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={elementData.openInNewTab || false}
                      onCheckedChange={(checked) => handleDataUpdate({ openInNewTab: checked })}
                    />
                    <label className="text-sm font-medium text-slate-700">Open in new tab</label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Icon</label>
                    <Select value={elementData.icon || "calendar"} onValueChange={(value) => handleDataUpdate({ icon: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calendar"><i className="fas fa-calendar-alt mr-2"></i> Calendar</SelectItem>
                        <SelectItem value="clock"><i className="fas fa-clock mr-2"></i> Clock</SelectItem>
                        <SelectItem value="user"><i className="fas fa-user mr-2"></i> User</SelectItem>
                        <SelectItem value="none">No Icon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Size</label>
                    <Select value={elementData.size || "medium"} onValueChange={(value) => handleDataUpdate({ size: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 p-4 rounded-lg border border-slate-200 bg-white">
                <h3 className="text-lg font-bold text-slate-800">{elementData.title || "Book Appointment"}</h3>
                {elementData.subtitle && (
                  <p className="text-sm text-slate-600">{elementData.subtitle}</p>
                )}
                <Button
                  onClick={() => {
                    if (!isInteractive) return;
                    const eventSlug = elementData.eventTypeSlug || 'consultation';
                    const duration = elementData.duration || 30;
                    const bookingUrl = `/booking/${eventSlug}?duration=${duration}&source=card`;

                    if (elementData.openInNewTab) {
                      window.open(bookingUrl, '_blank');
                    } else {
                      window.location.href = bookingUrl;
                    }
                  }}
                  style={{
                    backgroundColor: elementData.buttonColor || "#22c55e",
                    color: elementData.textColor || "#ffffff",
                  }}
                  className={`rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
                    elementData.size === 'small' ? 'px-4 py-1 text-sm' :
                    elementData.size === 'large' ? 'px-8 py-3 text-lg' :
                    'px-6 py-2'
                  }`}
                  data-testid="button-book-appointment"
                >
                  {elementData.icon && elementData.icon !== 'none' && (
                    <i className={`fas fa-${
                      elementData.icon === 'calendar' ? 'calendar-alt' :
                      elementData.icon === 'clock' ? 'clock' :
                      elementData.icon === 'user' ? 'user' : 'calendar-alt'
                    } mr-2`}></i>
                  )}
                  {elementData.buttonText || "Book Now"}
                  {elementData.duration && (
                    <span className="ml-2 text-xs opacity-80">({elementData.duration}min)</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        );

      case "scheduleCall":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">Schedule Call Element</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                    <Input
                      value={elementData.title || ""}
                      onChange={(e) => handleDataUpdate({ title: e.target.value })}
                      placeholder="Schedule a Call"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
                    <Input
                      value={elementData.buttonText || ""}
                      onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
                      placeholder="Schedule Call"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Subtitle</label>
                  <Input
                    value={elementData.subtitle || ""}
                    onChange={(e) => handleDataUpdate({ subtitle: e.target.value })}
                    placeholder="Let's discuss your project"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Event Type Slug</label>
                    <Input
                      value={elementData.eventTypeSlug || ""}
                      onChange={(e) => handleDataUpdate({ eventTypeSlug: e.target.value })}
                      placeholder="phone-call"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Call Type</label>
                    <Select value={elementData.callType || "phone"} onValueChange={(value) => handleDataUpdate({ callType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone"><i className="fas fa-phone mr-2"></i> Phone Call</SelectItem>
                        <SelectItem value="video"><i className="fas fa-video mr-2"></i> Video Call</SelectItem>
                        <SelectItem value="both"><i className="fas fa-phone mr-1"></i><i className="fas fa-video ml-1"></i> Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Color</label>
                    <Input
                      type="color"
                      value={elementData.buttonColor || "#2563eb"}
                      onChange={(e) => handleDataUpdate({ buttonColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Text Color</label>
                    <Input
                      type="color"
                      value={elementData.textColor || "#ffffff"}
                      onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Duration (min)</label>
                    <Input
                      type="number"
                      value={elementData.duration || 30}
                      onChange={(e) => handleDataUpdate({ duration: parseInt(e.target.value) })}
                      min="15"
                      max="180"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Size</label>
                    <Select value={elementData.size || "medium"} onValueChange={(value) => handleDataUpdate({ size: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={elementData.openInNewTab || false}
                      onCheckedChange={(checked) => handleDataUpdate({ openInNewTab: checked })}
                    />
                    <label className="text-sm font-medium text-slate-700">Open in new tab</label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 p-4 rounded-lg border border-slate-200 bg-white">
                <h3 className="text-lg font-bold text-slate-800">{elementData.title || "Schedule a Call"}</h3>
                {elementData.subtitle && (
                  <p className="text-sm text-slate-600">{elementData.subtitle}</p>
                )}
                <Button
                  onClick={() => {
                    if (!isInteractive) return;
                    const eventSlug = elementData.eventTypeSlug || 'phone-call';
                    const duration = elementData.duration || 30;
                    const callType = elementData.callType || 'phone';
                    const bookingUrl = `/booking/${eventSlug}?duration=${duration}&type=${callType}&source=card`;

                    if (elementData.openInNewTab) {
                      window.open(bookingUrl, '_blank');
                    } else {
                      window.location.href = bookingUrl;
                    }
                  }}
                  style={{
                    backgroundColor: elementData.buttonColor || "#2563eb",
                    color: elementData.textColor || "#ffffff",
                  }}
                  className={`rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
                    elementData.size === 'small' ? 'px-4 py-1 text-sm' :
                    elementData.size === 'large' ? 'px-8 py-3 text-lg' :
                    'px-6 py-2'
                  }`}
                  data-testid="button-schedule-call"
                >
                  {elementData.callType === 'phone' && (
                    <i className="fas fa-phone mr-2"></i>
                  )}
                  {elementData.callType === 'video' && (
                    <i className="fas fa-video mr-2"></i>
                  )}
                  {elementData.callType === 'both' && (
                    <>
                      <i className="fas fa-phone mr-1"></i>
                      <i className="fas fa-video mr-2"></i>
                    </>
                  )}
                  {elementData.buttonText || "Schedule Call"}
                  {elementData.duration && (
                    <span className="ml-2 text-xs opacity-80">({elementData.duration}min)</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        );

      case "meetingRequest":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">Meeting Request Element</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                    <Input
                      value={elementData.title || ""}
                      onChange={(e) => handleDataUpdate({ title: e.target.value })}
                      placeholder="Request a Meeting"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
                    <Input
                      value={elementData.buttonText || ""}
                      onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
                      placeholder="Request Meeting"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Subtitle</label>
                  <Input
                    value={elementData.subtitle || ""}
                    onChange={(e) => handleDataUpdate({ subtitle: e.target.value })}
                    placeholder="Let's meet to discuss opportunities"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Event Type Slug</label>
                    <Input
                      value={elementData.eventTypeSlug || ""}
                      onChange={(e) => handleDataUpdate({ eventTypeSlug: e.target.value })}
                      placeholder="discovery-meeting"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Meeting Type</label>
                    <Select value={elementData.meetingType || "business"} onValueChange={(value) => handleDataUpdate({ meetingType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business"><i className="fas fa-handshake mr-2"></i> Business Meeting</SelectItem>
                        <SelectItem value="consultation"><i className="fas fa-user-tie mr-2"></i> Consultation</SelectItem>
                        <SelectItem value="discovery"><i className="fas fa-search mr-2"></i> Discovery Call</SelectItem>
                        <SelectItem value="demo"><i className="fas fa-desktop mr-2"></i> Product Demo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Border Color</label>
                    <Input
                      type="color"
                      value={elementData.borderColor || "#7c3aed"}
                      onChange={(e) => handleDataUpdate({ borderColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Text Color</label>
                    <Input
                      type="color"
                      value={elementData.textColor || "#7c3aed"}
                      onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Duration (min)</label>
                    <Input
                      type="number"
                      value={elementData.duration || 60}
                      onChange={(e) => handleDataUpdate({ duration: parseInt(e.target.value) })}
                      min="15"
                      max="180"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Style</label>
                    <Select value={elementData.style || "outlined"} onValueChange={(value) => handleDataUpdate({ style: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outlined">Outlined</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Size</label>
                    <Select value={elementData.size || "medium"} onValueChange={(value) => handleDataUpdate({ size: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={elementData.openInNewTab || false}
                    onCheckedChange={(checked) => handleDataUpdate({ openInNewTab: checked })}
                  />
                  <label className="text-sm font-medium text-slate-700">Open in new tab</label>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 p-4 rounded-lg border border-slate-200 bg-white">
                <h3 className="text-lg font-bold text-slate-800">{elementData.title || "Request a Meeting"}</h3>
                {elementData.subtitle && (
                  <p className="text-sm text-slate-600">{elementData.subtitle}</p>
                )}
                <Button
                  onClick={() => {
                    if (!isInteractive) return;
                    const eventSlug = elementData.eventTypeSlug || 'discovery-meeting';
                    const duration = elementData.duration || 60;
                    const meetingType = elementData.meetingType || 'business';
                    const bookingUrl = `/booking/${eventSlug}?duration=${duration}&type=${meetingType}&source=card&style=meeting`;

                    if (elementData.openInNewTab) {
                      window.open(bookingUrl, '_blank');
                    } else {
                      window.location.href = bookingUrl;
                    }
                  }}
                  style={{
                    backgroundColor: elementData.style === 'filled' ? (elementData.borderColor || "#7c3aed") : "transparent",
                    color: elementData.style === 'filled' ? "#ffffff" : (elementData.textColor || "#7c3aed"),
                    borderColor: elementData.style !== 'minimal' ? (elementData.borderColor || "#7c3aed") : "transparent",
                    borderWidth: elementData.style === 'minimal' ? '0' : '2px',
                  }}
                  className={`rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                    elementData.style === 'outlined' ? 'border-2 hover:shadow-lg' :
                    elementData.style === 'filled' ? 'shadow-lg hover:shadow-xl' :
                    'hover:bg-slate-50'
                  } ${
                    elementData.size === 'small' ? 'px-4 py-1 text-sm' :
                    elementData.size === 'large' ? 'px-8 py-3 text-lg' :
                    'px-6 py-2'
                  }`}
                  variant={elementData.style === 'filled' ? 'default' : 'outline'}
                  data-testid="button-meeting-request"
                >
                  {elementData.meetingType === 'business' && (
                    <i className="fas fa-handshake mr-2"></i>
                  )}
                  {elementData.meetingType === 'consultation' && (
                    <i className="fas fa-user-tie mr-2"></i>
                  )}
                  {elementData.meetingType === 'discovery' && (
                    <i className="fas fa-search mr-2"></i>
                  )}
                  {elementData.meetingType === 'demo' && (
                    <i className="fas fa-desktop mr-2"></i>
                  )}
                  {elementData.buttonText || "Request Meeting"}
                  {elementData.duration && (
                    <span className="ml-2 text-xs opacity-80">({elementData.duration}min)</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        );

      case "availabilityDisplay":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">Availability Display Element</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                    <Input
                      value={elementData.title || ""}
                      onChange={(e) => handleDataUpdate({ title: e.target.value })}
                      placeholder="My Availability"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Subtitle</label>
                    <Input
                      value={elementData.subtitle || ""}
                      onChange={(e) => handleDataUpdate({ subtitle: e.target.value })}
                      placeholder="Choose a convenient time"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Event Type Slug</label>
                    <Input
                      value={elementData.eventTypeSlug || ""}
                      onChange={(e) => handleDataUpdate({ eventTypeSlug: e.target.value })}
                      placeholder="30min-meeting"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Timezone</label>
                    <Select value={elementData.timezone || "auto"} onValueChange={(value) => handleDataUpdate({ timezone: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Primary Color</label>
                    <Input
                      type="color"
                      value={elementData.primaryColor || "#22c55e"}
                      onChange={(e) => handleDataUpdate({ primaryColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Background Color</label>
                    <Input
                      type="color"
                      value={elementData.backgroundColor || "#f8fafc"}
                      onChange={(e) => handleDataUpdate({ backgroundColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Display Style</label>
                    <Select value={elementData.displayStyle || "compact"} onValueChange={(value) => handleDataUpdate({ displayStyle: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Days to Show</label>
                    <Input
                      type="number"
                      value={elementData.daysToShow || 7}
                      onChange={(e) => handleDataUpdate({ daysToShow: parseInt(e.target.value) })}
                      min="3"
                      max="14"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={elementData.showBookingButton !== false}
                      onCheckedChange={(checked) => handleDataUpdate({ showBookingButton: checked })}
                    />
                    <label className="text-sm font-medium text-slate-700">Show booking button</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={elementData.openInNewTab || false}
                      onCheckedChange={(checked) => handleDataUpdate({ openInNewTab: checked })}
                    />
                    <label className="text-sm font-medium text-slate-700">Open in new tab</label>
                  </div>
                </div>
                {elementData.showBookingButton !== false && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Booking Button Text</label>
                    <Input
                      value={elementData.bookingButtonText || ""}
                      onChange={(e) => handleDataUpdate({ bookingButtonText: e.target.value })}
                      placeholder="Book a slot"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="p-4 rounded-lg border border-slate-200"
                style={{ backgroundColor: elementData.backgroundColor || "#f8fafc" }}
                data-testid="availability-display"
              >
                <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">{elementData.title || "My Availability"}</h3>
                {elementData.subtitle && (
                  <p className="text-sm text-slate-600 mb-4 text-center">{elementData.subtitle}</p>
                )}
                <AvailabilityWidget
                  eventTypeSlug={elementData.eventTypeSlug}
                  timezone={elementData.timezone}
                  displayStyle={elementData.displayStyle}
                  daysToShow={elementData.daysToShow}
                  primaryColor={elementData.primaryColor}
                  showBookingButton={elementData.showBookingButton !== false}
                  bookingButtonText={elementData.bookingButtonText}
                  openInNewTab={elementData.openInNewTab}
                  isInteractive={isInteractive}
                />
              </div>
            )}
          </div>
        );

      case "subscribeForm":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">Subscribe Form Element</h4>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                    <Input
                      value={elementData.title || ""}
                      onChange={(e) => handleDataUpdate({ title: e.target.value })}
                      placeholder="Stay Updated"
                      data-testid="input-title"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Description</label>
                    <Textarea
                      value={elementData.description || ""}
                      onChange={(e) => handleDataUpdate({ description: e.target.value })}
                      placeholder="Subscribe to get notified about updates and news."
                      rows={3}
                      data-testid="input-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
                      <Input
                        value={elementData.buttonText || ""}
                        onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
                        placeholder="Subscribe"
                        data-testid="input-buttonText"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Success Message</label>
                      <Input
                        value={elementData.successMessage || ""}
                        onChange={(e) => handleDataUpdate({ successMessage: e.target.value })}
                        placeholder="Thank you for subscribing!"
                        data-testid="input-successMessage"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`requireName-${element.id}`}
                        checked={elementData.requireName || false}
                        onCheckedChange={(checked) => handleDataUpdate({ requireName: checked })}
                        data-testid="checkbox-requireName"
                      />
                      <label htmlFor={`requireName-${element.id}`} className="text-sm font-medium text-slate-700">
                        Require Name
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`requireEmail-${element.id}`}
                        checked={elementData.requireEmail !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ requireEmail: checked })}
                        data-testid="checkbox-requireEmail"
                      />
                      <label htmlFor={`requireEmail-${element.id}`} className="text-sm font-medium text-slate-700">
                        Require Email
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`enablePush-${element.id}`}
                        checked={elementData.enablePushNotifications !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ enablePushNotifications: checked })}
                        data-testid="checkbox-enablePush"
                      />
                      <label htmlFor={`enablePush-${element.id}`} className="text-sm font-medium text-slate-700">
                        Enable Push Notifications
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Primary Color</label>
                      <Input
                        type="color"
                        value={elementData.primaryColor || "#f97316"}
                        onChange={(e) => handleDataUpdate({ primaryColor: e.target.value })}
                        data-testid="input-primaryColor"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Background Color</label>
                      <Input
                        type="color"
                        value={elementData.backgroundColor || "#ffffff"}
                        onChange={(e) => handleDataUpdate({ backgroundColor: e.target.value })}
                        data-testid="input-backgroundColor"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Text Color</label>
                      <Input
                        type="color"
                        value={elementData.textColor || "#1e293b"}
                        onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                        data-testid="input-textColor"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <SubscribeFormComponent
                cardId={cardData?.id || ""}
                title={elementData.title}
                description={elementData.description}
                buttonText={elementData.buttonText}
                successMessage={elementData.successMessage}
                requireName={elementData.requireName}
                requireEmail={elementData.requireEmail}
                enablePushNotifications={elementData.enablePushNotifications}
                primaryColor={elementData.primaryColor}
                backgroundColor={elementData.backgroundColor}
                textColor={elementData.textColor}
              />
            )}
          </div>
        );

      case "html":
        return (
          <div className="w-full max-w-[430px] mx-auto">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">Custom HTML Element</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">HTML Content</label>
                    <Textarea
                      value={elementData.content || ""}
                      onChange={(e) => handleDataUpdate({ content: e.target.value })}
                      placeholder="Enter your HTML code here..."
                      className="min-h-[200px] font-mono text-sm"
                      data-testid="html-content-editor"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Height (px)</label>
                      <Input
                        type="number"
                        value={elementData.height || 300}
                        onChange={(e) => handleDataUpdate({ height: parseInt(e.target.value) || 300 })}
                        min={100}
                        max={1000}
                        className="w-24"
                        data-testid="html-height-input"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={elementData.sandbox !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ sandbox: checked })}
                        data-testid="html-sandbox-checkbox"
                      />
                      <label className="text-sm font-medium text-slate-700">Security sandboxing (recommended)</label>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Security Note: JavaScript and external scripts will be disabled for safety.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="html-element-preview w-full" data-testid="html-element-preview">
                {elementData.content && elementData.content.trim() ? (
                  <iframe
                    srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  ${elementData.content}
</body>
</html>`}
                    style={{ 
                      width: '430px',
                      maxWidth: '100%',
                      height: `${elementData.height || 300}px`,
                      border: 'none',
                      borderRadius: '0'
                    }}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                    title="Custom HTML Content"
                    data-testid="html-iframe"
                  />
                ) : (
                  <div 
                    className="border-2 border-dashed border-slate-300 p-8 text-center text-slate-500"
                    style={{ width: '430px', maxWidth: '100%', height: `${elementData.height || 300}px` }}
                    data-testid="html-placeholder"
                  >
                    <i className="fas fa-code text-4xl mb-4"></i>
                    <p>Add HTML content to see preview</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "pdfViewer":
        return (
          <div className="w-full max-w-[430px] mx-auto">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">PDF Viewer</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Upload PDF File *</label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type === 'application/pdf') {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            handleDataUpdate({ 
                              pdf_file: base64,
                              file_name: file.name
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full"
                      data-testid="pdf-file-input"
                    />
                    {elementData.file_name && (
                      <p className="text-xs text-green-600 mt-1">
                        <i className="fas fa-check mr-1"></i>
                        Uploaded: {elementData.file_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
                    <Input
                      value={elementData.button_text || "View PDF"}
                      onChange={(e) => handleDataUpdate({ button_text: e.target.value })}
                      placeholder="View PDF"
                      className="w-full"
                      data-testid="pdf-button-text-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Button Color</label>
                      <Input
                        type="color"
                        value={elementData.buttonColor || "#6b21a8"}
                        onChange={(e) => handleDataUpdate({ buttonColor: e.target.value })}
                        className="w-full h-10"
                        data-testid="pdf-button-color-input"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Text Color</label>
                      <Input
                        type="color"
                        value={elementData.textColor || "#ffffff"}
                        onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                        className="w-full h-10"
                        data-testid="pdf-text-color-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      Scale ({Math.round((elementData.scale || 1.0) * 100)}%)
                    </label>
                    <Input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={elementData.scale || 1.0}
                      onChange={(e) => handleDataUpdate({ scale: parseFloat(e.target.value) })}
                      className="w-full"
                      data-testid="pdf-scale-input"
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      Adjust PDF zoom level (50% - 300%)
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <p className="text-sm text-purple-800">
                      <i className="fas fa-info-circle mr-2"></i>
                      PDF will open in a modal with clickable links, zoom controls, and download options.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pdf-viewer-element w-full flex justify-center" data-testid="pdf-viewer-element">
                {elementData.pdf_file ? (
                  <PdfViewerButton
                    pdf_file={elementData.pdf_file}
                    button_text={elementData.button_text || "View PDF"}
                    scale={elementData.scale || 1.0}
                    file_name={elementData.file_name || ""}
                    buttonColor={elementData.buttonColor || "#6b21a8"}
                    textColor={elementData.textColor || "#ffffff"}
                    className="w-full max-w-xs"
                  />
                ) : (
                  <div className="border-2 border-dashed border-purple-300 p-8 text-center text-purple-500 rounded-2xl">
                    <i className="fas fa-file-pdf text-4xl mb-4"></i>
                    <p>Upload PDF file to see preview</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "profile":
        return (
          <div className="w-full">
            {isEditing ? (
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <ProfileSectionEditor
                  data={elementData}
                  onChange={(newData) => handleDataUpdate(newData)}
                  onSave={onSave}
                  cardData={cardData}
                />
              </div>
            ) : (
              <ProfileSectionRenderer
                data={elementData}
                cardData={cardData}
              />
            )}
          </div>
        );

      case "shop":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-shopping-bag text-green-600"></i>
                    Digital Shop
                  </h3>
                  <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">Draggable</span>
                </div>
                <p className="text-sm text-slate-600">
                  Showcase your digital products directly on your business card.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Shop Title</label>
                    <Input
                      value={elementData.title || "My Digital Products"}
                      onChange={(e) => handleDataUpdate({ title: e.target.value })}
                      placeholder="Enter shop title"
                      data-testid="shop-element-title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Description</label>
                    <Input
                      value={elementData.description || ""}
                      onChange={(e) => handleDataUpdate({ description: e.target.value })}
                      placeholder="Enter shop description"
                      data-testid="shop-element-description"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Max Items to Display</label>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={elementData.maxItems || 6}
                      onChange={(e) => handleDataUpdate({ maxItems: parseInt(e.target.value) })}
                      data-testid="shop-element-maxitems"
                    />
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    <i className="fas fa-info-circle mr-2"></i>
                    Shows your latest digital products with search and purchase options.
                  </p>
                </div>
              </div>
            ) : (
              <div className="shop-element w-full" data-testid="shop-element">
                <ShopElement
                  sellerId={cardData?.userId || ""}
                  title={elementData.title || "My Digital Products"}
                  description={elementData.description}
                  maxItems={elementData.maxItems || 6}
                />
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="mb-4 p-4 bg-slate-100 rounded-lg text-center text-slate-600">
            Element type not implemented yet
          </div>
        );
    }
  };

  return (
    <div className="relative group">
      {renderElement()}
    </div>
  );
}