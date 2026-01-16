import { useState, useEffect, useCallback } from "react";
import { ElementRendererProps } from "../registry/types";

type FieldType = "text" | "email" | "tel" | "textarea" | "date" | "dropdown" | "checkbox" | "radio";
type BuiltInFieldKey = "name" | "email" | "phone" | "subject" | "message";

type FieldConfig = {
  key: string;
  enabled: boolean;
  type: FieldType;
  label: string;
  placeholder: string;
  required?: boolean;
  rows?: number;
  options?: string[];
  isCustom?: boolean;
  hint?: string;
  isMultiple?: boolean;
};

const builtInKeys: BuiltInFieldKey[] = ["name", "email", "phone", "subject", "message"];

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

export function ContactFormRenderer({ element, isEditing, onUpdate, onDelete, onSave, isInteractive = true, cardData, onNavigatePage }: ElementRendererProps) {
  if (isEditing) {
    return null;
  }

  const normalizeFieldConfigs = (): FieldConfig[] => {
    const saved = element.data?.fieldConfigs;
    const validFieldTypes = ["text", "email", "tel", "textarea", "date", "dropdown", "checkbox", "radio"];

    if (Array.isArray(saved) && saved.length) {
      const result: FieldConfig[] = [];
      const seenKeys = new Set<string>();

      saved.forEach((f: any) => {
        if (!f?.key) return;
        const isBuiltIn = builtInKeys.includes(f.key as BuiltInFieldKey);
        const base = isBuiltIn ? (defaultFieldConfig as any)[f.key] : null;

        seenKeys.add(f.key);

        let normalizedType: FieldType = "text";
        const rawType = f.type?.toLowerCase();
        if (validFieldTypes.includes(rawType)) {
          normalizedType = rawType as FieldType;
        } else if (rawType === "select") {
          normalizedType = "dropdown";
        } else if (base?.type) {
          normalizedType = base.type;
        }

        const isMultipleCheckbox = normalizedType === "checkbox" && Array.isArray(f.options) && f.options.length > 0;

        result.push({
          ...(base || {}),
          ...f,
          key: f.key,
          enabled: !!f.enabled,
          required: typeof f.required === "boolean" ? f.required : (base?.required ?? false),
          type: normalizedType,
          rows: typeof f.rows === "number" ? f.rows : (base?.rows ?? 3),
          options: Array.isArray(f.options) ? f.options : (base?.options ?? []),
          label: f.label || (base?.label ?? f.key),
          placeholder: f.placeholder || (base?.placeholder ?? ""),
          isCustom: !isBuiltIn || !!f.isCustom,
          hint: f.hint || "",
          isMultiple: normalizedType === "checkbox" ? (f.isMultiple !== undefined ? f.isMultiple : isMultipleCheckbox) : false,
        });
      });

      builtInKeys.forEach((k) => {
        if (!seenKeys.has(k)) {
          result.push({ ...defaultFieldConfig[k], enabled: false });
        }
      });

      return result;
    }

    const oldFields: any[] = element.data?.fields || ["name", "email", "message"];
    const result: FieldConfig[] = [];
    const seenKeys = new Set<string>();

    builtInKeys.forEach((k) => {
      seenKeys.add(k);
      result.push({
        ...defaultFieldConfig[k],
        enabled: oldFields.includes(k),
      });
    });

    oldFields.forEach((fieldKey) => {
      if (typeof fieldKey !== 'string') return;
      if (!seenKeys.has(fieldKey)) {
        const label = fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1);
        result.push({
          key: fieldKey,
          enabled: true,
          type: fieldKey === "budget" ? "dropdown" : "text",
          label,
          placeholder: `Enter ${label}`,
          required: false,
          isCustom: true,
          options: fieldKey === "budget" ? ["< $1k", "$1k - $5k", "$5k+"] : [],
        });
        seenKeys.add(fieldKey);
      }
    });

    return result;
  };

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string>("");

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const [localFieldConfigs, setLocalFieldConfigs] = useState<FieldConfig[]>(() => normalizeFieldConfigs());

  useEffect(() => {
    setLocalFieldConfigs(normalizeFieldConfigs());
  }, [element.data?.fieldConfigs]);

  const fieldConfigs = localFieldConfigs;
  const enabledFields = fieldConfigs.filter((f) => f.enabled);

  const backgroundColor = element.data?.backgroundColor || "#f8fafc";
  const borderColor = element.data?.borderColor || "#e2e8f0";
  const inputBorderColor = element.data?.inputBorderColor || "#cbd5e1";
  const titleColor = element.data?.titleColor || "#1e293b";
  const borderRadius = element.data?.borderRadius ?? 8;

  const inputBgColor = element.data?.inputBgColor || "#ffffff";
  const inputTextColor = element.data?.inputTextColor || "#0f172a";
  const showLabels = element.data?.showLabels ?? false;
  const layout = element.data?.layout || "stack";
  const gap = element.data?.gap ?? 12;

  const buttonColor = element.data?.buttonColor || "#1e293b";
  const buttonTextColor = element.data?.buttonTextColor || "#ffffff";
  const buttonText = element.data?.buttonText || "Send Message";

  const successMessage = element.data?.successMessage || "✅ Message sent successfully!";
  const errorMessage = element.data?.errorMessage || "❌ Failed to send message. Please try again.";

  const redirectUrl = element.data?.redirectUrl || "";
  const openRedirectNewTab = element.data?.openRedirectNewTab ?? false;

  const enableHoneypot = element.data?.enableHoneypot ?? true;
  const enableGDPR = element.data?.enableGDPR ?? false;
  const gdprText = element.data?.gdprText || "I agree to be contacted and allow you to store my submitted information.";

  const includeMeta = element.data?.includeMeta ?? true;
  const includeUTM = element.data?.includeUTM ?? true;

  const clientWebhookUrl = element.data?.clientWebhookUrl || "";

  const googleSheetsEnabled = element.data?.googleSheetsEnabled ?? false;
  const googleSheetsSheetId = element.data?.googleSheetsSheetId || "";
  const googleSheetsTabName = element.data?.googleSheetsTabName || "Sheet1";

  const autoReplyEnabled = element.data?.autoReplyEnabled ?? false;
  const autoReplyFromName = element.data?.autoReplyFromName || "";
  const autoReplyFromEmail = element.data?.autoReplyFromEmail || "";
  const autoReplyEmailFieldKey = element.data?.autoReplyEmailFieldKey || "email";
  const autoReplySubject = element.data?.autoReplySubject || "Thank you for contacting us";
  const autoReplyMessage = element.data?.autoReplyMessage || "Hi {{name}},\n\nThanks for reaching out. We'll get back to you soon.\n\nBest regards,\n{{from_name}}";

  const buildMeta = () => {
    const meta: any = {
      timestamp: new Date().toISOString(),
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    };

    if (includeUTM && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
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
      if (enableHoneypot && formData._hp) {
        setSubmitStatus(errorMessage);
        setIsSubmitting(false);
        return;
      }

      if (enableGDPR && !formData._gdpr) {
        setSubmitStatus("Please accept the consent checkbox.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        formData,
        formConfig: {
          title: element.data?.title,
          successMessage,
          errorMessage,
          redirectUrl,
          openRedirectNewTab,
          enableHoneypot,
          enableGDPR,
          gdprText,
          googleSheetsEnabled,
          googleSheetsSheetId,
          googleSheetsTabName,
          autoReplyEnabled,
          autoReplyFromName,
          autoReplyFromEmail,
          autoReplyEmailFieldKey,
          autoReplySubject,
          autoReplyMessage,
          notifyAdminEmail: element.data?.notifyAdminEmail,
          notifyAdminSubject: element.data?.notifyAdminSubject,
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

        if (clientWebhookUrl) {
          try {
            fetch(clientWebhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }).catch(() => {});
          } catch {}
        }

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

  const parseOption = (option: string): { label: string; value: string } => {
    const parts = option.split("|");
    if (parts.length === 2) {
      return { label: parts[0].trim(), value: parts[1].trim() };
    }
    return { label: option.trim(), value: option.trim() };
  };

  const gridClass = layout === "twoColumn" ? "grid grid-cols-1 sm:grid-cols-2" : "grid grid-cols-1";

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
                {f.required ? <span className="ml-1 text-red-500">*</span> : null}
              </label>
            ) : null;

            const value = formData[f.key] ?? (f.type === "checkbox" && f.isMultiple ? [] : "");

            if (f.type === "textarea") {
              return (
                <div key={f.key} className={layout === "twoColumn" ? "sm:col-span-2" : ""}>
                  {labelEl}
                  <textarea
                    placeholder={f.placeholder}
                    value={value}
                    onChange={(e) => handleInputChange(f.key, e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={commonStyle}
                    rows={f.rows ?? 3}
                    required={!!f.required}
                  />
                </div>
              );
            }

            if (f.type === "dropdown") {
              return (
                <div key={f.key}>
                  {labelEl}
                  <select
                    value={value}
                    onChange={(e) => handleInputChange(f.key, e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={commonStyle}
                    required={!!f.required}
                  >
                    <option value="">{f.placeholder || "Select an option"}</option>
                    {(f.options || []).filter(Boolean).map((option) => {
                      const { label, value: optionValue } = parseOption(option);
                      return (
                        <option key={optionValue} value={optionValue}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              );
            }

            if (f.type === "radio") {
              return (
                <div key={f.key}>
                  {labelEl}
                  <div className="space-y-2 mt-1">
                    {(f.options || []).filter(Boolean).map((option) => {
                      const { label, value: optionValue } = parseOption(option);
                      return (
                        <label key={optionValue} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={f.key}
                            value={optionValue}
                            checked={value === optionValue}
                            onChange={(e) => handleInputChange(f.key, e.target.value)}
                            className="w-4 h-4 border rounded-full focus:ring-2 focus:ring-green-500"
                            required={!!f.required}
                            style={{ borderColor: inputBorderColor }}
                          />
                          <span className="text-sm" style={{ color: titleColor }}>
                            {label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (f.type === "checkbox") {
              if (f.isMultiple && f.options && f.options.length > 0) {
                return (
                  <div key={f.key}>
                    {labelEl}
                    <div className="space-y-2 mt-1">
                      {(f.options || []).filter(Boolean).map((option) => {
                        const { label, value: optionValue } = parseOption(option);
                        const isChecked = (value || []).includes(optionValue);

                        return (
                          <label key={optionValue} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const currentValues = value || [];
                                let newValues;
                                if (e.target.checked) {
                                  newValues = [...currentValues, optionValue];
                                } else {
                                  newValues = currentValues.filter((v: string) => v !== optionValue);
                                }
                                handleInputChange(f.key, newValues);
                              }}
                              className="w-4 h-4 border rounded focus:ring-2 focus:ring-green-500"
                              required={!!f.required && (value || []).length === 0}
                              style={{ borderColor: inputBorderColor }}
                            />
                            <span className="text-sm" style={{ color: titleColor }}>
                              {label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <div key={f.key} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!value}
                      onChange={(e) => handleInputChange(f.key, e.target.checked)}
                      className="w-4 h-4 border rounded focus:ring-2 focus:ring-green-500"
                      required={!!f.required}
                      style={commonStyle}
                    />
                    <span className="text-sm" style={{ color: titleColor }}>
                      {f.label}
                    </span>
                  </div>
                  {f.hint && <p className="text-xs text-gray-500 ml-6">{f.hint}</p>}
                </div>
              );
            }

            return (
              <div key={f.key}>
                {labelEl}
                <input
                  type={f.type === "date" ? "date" : f.type}
                  placeholder={f.placeholder}
                  value={value}
                  onChange={(e) => handleInputChange(f.key, e.target.value)}
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
              onChange={(e) => handleInputChange("_gdpr", e.target.checked)}
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