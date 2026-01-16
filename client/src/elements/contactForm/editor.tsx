import { useState, useEffect } from "react";
import { ElementEditorProps } from "../registry/types";

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

const normalizeFieldConfigs = (data: any): FieldConfig[] => {
  const saved = data?.fieldConfigs;
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

  const oldFields: any[] = data?.fields || ["name", "email", "message"];
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

// Content Tab Component
function ContentTab({ element, handleDataUpdate, localFieldConfigs, setLocalFieldConfigs }: any) {
  const setField = (key: string, patch: Partial<FieldConfig>) => {
    const next = localFieldConfigs.map((f: FieldConfig) =>
      f.key === key ? { ...f, ...patch } : f
    );
    setLocalFieldConfigs(next);

    const fieldsLegacy = next.filter((f: FieldConfig) => f.enabled).map((f: FieldConfig) => f.key);
    handleDataUpdate({ fieldConfigs: next, fields: fieldsLegacy });
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
    const next = [...localFieldConfigs, newField];
    setLocalFieldConfigs(next);
    const fieldsLegacy = next.filter((f: FieldConfig) => f.enabled).map((f: FieldConfig) => f.key);
    handleDataUpdate({ fieldConfigs: next, fields: fieldsLegacy });
  };

  const deleteField = (key: string) => {
    const next = localFieldConfigs.filter((f: FieldConfig) => f.key !== key);
    setLocalFieldConfigs(next);
    const fieldsLegacy = next.filter((f: FieldConfig) => f.enabled).map((f: FieldConfig) => f.key);
    handleDataUpdate({ fieldConfigs: next, fields: fieldsLegacy });
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const next = [...localFieldConfigs];
    const [removed] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, removed);
    setLocalFieldConfigs(next);
    const fieldsLegacy = next.filter((f: FieldConfig) => f.enabled).map((f: FieldConfig) => f.key);
    handleDataUpdate({ fieldConfigs: next, fields: fieldsLegacy });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Form Title</label>
        <input
          type="text"
          value={element.data?.title || ""}
          onChange={(e) => handleDataUpdate({ title: e.target.value })}
          className="w-full bg-slate-700 border-slate-600 text-white px-3 py-2 rounded border"
          placeholder="Contact Me"
        />
      </div>

      {/* Fields */}
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
          {localFieldConfigs.map((f: FieldConfig, index: number) => (
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
                      onClick={() => index < localFieldConfigs.length - 1 && moveField(index, index + 1)}
                      disabled={index === localFieldConfigs.length - 1}
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
                  <input
                    type="text"
                    value={f.label}
                    disabled={!f.enabled}
                    onChange={(e) =>
                      setField(f.key, { label: e.target.value })
                    }
                    className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
                    placeholder="Label"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={f.placeholder}
                    disabled={!f.enabled}
                    onChange={(e) =>
                      setField(f.key, { placeholder: e.target.value })
                    }
                    className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
                    placeholder="Placeholder"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-gray-400 block mb-1">
                    Type
                  </label>
                  <select
                    value={f.type}
                    onChange={(e) =>
                      setField(f.key, { type: e.target.value as FieldType })
                    }
                    disabled={!f.enabled}
                    className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="textarea">Textarea</option>
                    <option value="date">Date</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="radio">Radio</option>
                  </select>
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

              {/* Checkbox Configuration */}
              {f.type === "checkbox" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Checkbox Type
                    </label>
                    <select
                      value={f.isMultiple ? "multiple" : "single"}
                      disabled={!f.enabled}
                      onChange={(e) => {
                        if (e.target.value === "multiple") {
                          setField(f.key, { 
                            isMultiple: true,
                            hint: "",
                            options: f.options && f.options.length > 0 ? f.options : [""]
                          });
                        } else {
                          setField(f.key, { 
                            isMultiple: false,
                            options: [],
                            hint: f.hint || ""
                          });
                        }
                      }}
                      className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
                    >
                      <option value="single">Single Checkbox (e.g., consent)</option>
                      <option value="multiple">Multiple Checkboxes (options)</option>
                    </select>
                  </div>

                  {/* Show options input for multiple checkboxes */}
                  {f.isMultiple && (
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Options (one per line, use | for label/value pairs)
                      </label>
                      <textarea
                        disabled={!f.enabled}
                        value={(f.options || []).join("\n")}
                        onChange={(e) =>
                          setField(f.key, {
                            options: e.target.value.split("\n"),
                          })
                        }
                        onBlur={(e) =>
                          setField(f.key, {
                            options: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="w-full bg-slate-600 border-slate-500 text-white text-xs min-h-[80px] px-2 py-1 rounded border"
                        placeholder="First Name|f_name\nLast Name|l_name\nAgree to terms"
                        rows={3}
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Each line becomes a checkbox. Use "Label|value" format or just "Label".
                      </p>
                    </div>
                  )}

                  {/* Show hint input for single checkbox */}
                  {!f.isMultiple && (
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Hint Text (appears below checkbox)
                      </label>
                      <input
                        type="text"
                        disabled={!f.enabled}
                        value={f.hint || ""}
                        onChange={(e) =>
                          setField(f.key, { hint: e.target.value })
                        }
                        className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
                        placeholder="e.g. I agree to receive marketing emails"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Dropdown Options */}
              {f.type === "dropdown" && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Options (one per line, use | for label/value pairs)
                  </label>
                  <textarea
                    disabled={!f.enabled}
                    value={(f.options || []).join("\n")}
                    onChange={(e) =>
                      setField(f.key, {
                        options: e.target.value.split("\n"),
                      })
                    }
                    onBlur={(e) =>
                      setField(f.key, {
                        options: e.target.value
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full bg-slate-600 border-slate-500 text-white text-xs min-h-[80px] px-2 py-1 rounded border"
                    placeholder="Option 1\nOption 2\nLabel 3|value_3"
                    rows={3}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Each line becomes a dropdown option. Use "Label|value" format or just "Label".
                  </p>
                </div>
              )}

              {/* Radio Options */}
              {f.type === "radio" && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Options (one per line, use | for label/value pairs)
                  </label>
                  <textarea
                    disabled={!f.enabled}
                    value={(f.options || []).join("\n")}
                    onChange={(e) =>
                      setField(f.key, {
                        options: e.target.value.split("\n"),
                      })
                    }
                    onBlur={(e) =>
                      setField(f.key, {
                        options: e.target.value
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full bg-slate-600 border-slate-500 text-white text-xs min-h-[80px] px-2 py-1 rounded border"
                    placeholder="Option 1\nOption 2\nLabel 3|value_3"
                    rows={3}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Each line becomes a radio button. Use "Label|value" format or just "Label".
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Design Tab Component
function DesignTab({ element, handleDataUpdate }: any) {
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

  return (
    <div className="space-y-4">
      {/* Layout & UX */}
      <div className="bg-slate-700 p-3 rounded space-y-3">
        <h4 className="text-white text-sm font-medium flex items-center gap-2">
          <i className="fas fa-table-columns"></i>
          Layout & UX
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Layout</label>
            <select
              value={layout}
              onChange={(e) => handleDataUpdate({ layout: e.target.value })}
              className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
            >
              <option value="stack">Stack</option>
              <option value="twoColumn">Two Column</option>
            </select>
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
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => handleDataUpdate({ showLabels: e.target.checked })}
              className="w-4 h-4 text-green-500 bg-slate-600 border-slate-500 rounded"
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
          <input
            type="text"
            value={buttonText}
            onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
            className="w-full bg-slate-600 border-slate-500 text-white px-2 py-1 rounded border"
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
              <input
                type="text"
                value={buttonColor}
                onChange={(e) =>
                  handleDataUpdate({ buttonColor: e.target.value })
                }
                className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
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
              <input
                type="text"
                value={buttonTextColor}
                onChange={(e) =>
                  handleDataUpdate({ buttonTextColor: e.target.value })
                }
                className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
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
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ element, handleDataUpdate, localFieldConfigs }: any) {
  const emailFieldOptions = localFieldConfigs.filter((f: FieldConfig) => f.type === "email");

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
  const successMessage = element.data?.successMessage || "✅ Message sent successfully!";
  const errorMessage = element.data?.errorMessage || "❌ Failed to send message. Please try again.";

  return (
    <div className="space-y-4">
      {/* Automation */}
      <div className="bg-slate-700 p-3 rounded space-y-3">
        <h4 className="text-white text-sm font-medium flex items-center gap-2">
          <i className="fas fa-bolt"></i>
          Automation
        </h4>

        {/* Redirect */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Redirect URL (after success)
          </label>
          <input
            type="text"
            value={redirectUrl}
            onChange={(e) =>
              handleDataUpdate({ redirectUrl: e.target.value })
            }
            className="w-full bg-slate-600 border-slate-500 text-white px-2 py-1 rounded border"
            placeholder="https://your-site.com/thank-you"
          />
          <div className="mt-2 flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
            <div className="text-sm text-slate-200">
              Open redirect in new tab
            </div>
            <input
              type="checkbox"
              checked={openRedirectNewTab}
              onChange={(e) =>
                handleDataUpdate({ openRedirectNewTab: e.target.checked })
              }
              className="w-4 h-4 text-green-500 bg-slate-600 border-slate-500 rounded"
            />
          </div>
        </div>

        {/* Client-side Webhook */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Client-side Webhook URL (optional, CORS needed)
          </label>
          <input
            type="text"
            value={clientWebhookUrl}
            onChange={(e) =>
              handleDataUpdate({ clientWebhookUrl: e.target.value })
            }
            className="w-full bg-slate-600 border-slate-500 text-white px-2 py-1 rounded border"
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
            <input
              type="checkbox"
              checked={googleSheetsEnabled}
              onChange={(e) =>
                handleDataUpdate({ googleSheetsEnabled: e.target.checked })
              }
              className="w-4 h-4 text-green-500 bg-slate-600 border-slate-500 rounded"
            />
          </div>

          {googleSheetsEnabled && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Sheet ID
                </label>
                <input
                  type="text"
                  value={googleSheetsSheetId}
                  onChange={(e) =>
                    handleDataUpdate({ googleSheetsSheetId: e.target.value })
                  }
                  className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
                  placeholder="Google Sheet ID"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Tab Name
                </label>
                <input
                  type="text"
                  value={googleSheetsTabName}
                  onChange={(e) =>
                    handleDataUpdate({ googleSheetsTabName: e.target.value })
                  }
                  className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
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
            <input
              type="checkbox"
              checked={autoReplyEnabled}
              onChange={(e) =>
                handleDataUpdate({ autoReplyEnabled: e.target.checked })
              }
              className="w-4 h-4 text-green-500 bg-slate-600 border-slate-500 rounded"
            />
          </div>

          {autoReplyEnabled && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={autoReplyFromName}
                    onChange={(e) =>
                      handleDataUpdate({
                        autoReplyFromName: e.target.value,
                      })
                    }
                    className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
                    placeholder="Your Brand / Name"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    From Email
                  </label>
                  <input
                    type="text"
                    value={autoReplyFromEmail}
                    onChange={(e) =>
                      handleDataUpdate({
                        autoReplyFromEmail: e.target.value,
                      })
                    }
                    className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
                    placeholder="no-reply@yourdomain.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Use Email From Field
                </label>
                <select
                  value={autoReplyEmailFieldKey}
                  onChange={(e) =>
                    handleDataUpdate({ autoReplyEmailFieldKey: e.target.value })
                  }
                  className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
                >
                  {emailFieldOptions.length === 0 && (
                    <option value="email">email</option>
                  )}
                  {emailFieldOptions.map((f: FieldConfig) => (
                    <option key={f.key} value={f.key}>
                      {f.label} ({f.key})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-300 mt-1">
                  This field's value will receive the auto-reply.
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={autoReplySubject}
                  onChange={(e) =>
                    handleDataUpdate({
                      autoReplySubject: e.target.value,
                    })
                  }
                  className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
                  placeholder="Thank you for contacting us"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Message (supports {"{{name}}"}, {"{{from_name}}"})
                </label>
                <textarea
                  value={autoReplyMessage}
                  onChange={(e) =>
                    handleDataUpdate({
                      autoReplyMessage: e.target.value,
                    })
                  }
                  className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
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
            <input
              type="checkbox"
              checked={!!element.data?.notifyAdminEmail}
              onChange={(e) =>
                handleDataUpdate({ notifyAdminEmail: e.target.checked ? '' : undefined })
              }
              className="w-4 h-4 text-green-500 bg-slate-600 border-slate-500 rounded"
            />
          </div>

          {element.data?.notifyAdminEmail !== undefined && (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Admin Email Address
                </label>
                <input
                  type="text"
                  value={element.data?.notifyAdminEmail || ''}
                  onChange={(e) =>
                    handleDataUpdate({ notifyAdminEmail: e.target.value })
                  }
                  className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
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
                <input
                  type="text"
                  value={element.data?.notifyAdminSubject || ''}
                  onChange={(e) =>
                    handleDataUpdate({ notifyAdminSubject: e.target.value })
                  }
                  className="w-full bg-slate-600 border-slate-500 text-white text-xs px-2 py-1 rounded border"
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
          Advanced Settings
        </h4>

        <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
          <div className="text-sm text-slate-200">
            Enable Honeypot (anti-spam)
          </div>
          <input
            type="checkbox"
            checked={enableHoneypot}
            onChange={(e) =>
              handleDataUpdate({ enableHoneypot: e.target.checked })
            }
            className="w-4 h-4 text-green-500 bg-slate-600 border-slate-500 rounded"
          />
        </div>

        <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
          <div className="text-sm text-slate-200">
            Include Meta (url, userAgent, time)
          </div>
          <input
            type="checkbox"
            checked={includeMeta}
            onChange={(e) =>
              handleDataUpdate({ includeMeta: e.target.checked })
            }
            className="w-4 h-4 text-green-500 bg-slate-600 border-slate-500 rounded"
          />
        </div>

        <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
          <div className="text-sm text-slate-200">Include UTM params</div>
          <input
            type="checkbox"
            checked={includeUTM}
            onChange={(e) =>
              handleDataUpdate({ includeUTM: e.target.checked })
            }
            className="w-4 h-4 text-green-500 bg-slate-600 border-slate-500 rounded"
          />
        </div>

        <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-600">
          <div className="text-sm text-slate-200">
            GDPR Consent Checkbox
          </div>
          <input
            type="checkbox"
            checked={enableGDPR}
            onChange={(e) =>
              handleDataUpdate({ enableGDPR: e.target.checked })
            }
            className="w-4 h-4 text-green-500 bg-slate-600 border-slate-500 rounded"
          />
        </div>

        {enableGDPR && (
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Consent Text
            </label>
            <input
              type="text"
              value={gdprText}
              onChange={(e) =>
                handleDataUpdate({ gdprText: e.target.value })
              }
              className="w-full bg-slate-600 border-slate-500 text-white px-2 py-1 rounded border"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Success Message
            </label>
            <input
              type="text"
              value={successMessage}
              onChange={(e) =>
                handleDataUpdate({ successMessage: e.target.value })
              }
              className="w-full bg-slate-600 border-slate-500 text-white px-2 py-1 rounded border"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Error Message
            </label>
            <input
              type="text"
              value={errorMessage}
              onChange={(e) =>
                handleDataUpdate({ errorMessage: e.target.value })
              }
              className="w-full bg-slate-600 border-slate-500 text-white px-2 py-1 rounded border"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Editor Component
export function ContactFormEditor({ element, onUpdate, onSave, cardData }: ElementEditorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'settings'>('content');
  const [localFieldConfigs, setLocalFieldConfigs] = useState<FieldConfig[]>(() => normalizeFieldConfigs(element.data));

  useEffect(() => {
    setLocalFieldConfigs(normalizeFieldConfigs(element.data));
  }, [element.data?.fieldConfigs]);

  const handleDataUpdate = (data: any) => {
    onUpdate({ ...element, data: { ...element.data, ...data } });
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-600">
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'content'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
          onClick={() => setActiveTab('content')}
        >
          <i className="fas fa-edit mr-2"></i>
          Content
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'design'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
          onClick={() => setActiveTab('design')}
        >
          <i className="fas fa-palette mr-2"></i>
          Design
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <i className="fas fa-cog mr-2"></i>
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'content' && (
          <ContentTab
            element={element}
            handleDataUpdate={handleDataUpdate}
            localFieldConfigs={localFieldConfigs}
            setLocalFieldConfigs={setLocalFieldConfigs}
          />
        )}
        {activeTab === 'design' && (
          <DesignTab
            element={element}
            handleDataUpdate={handleDataUpdate}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            element={element}
            handleDataUpdate={handleDataUpdate}
            localFieldConfigs={localFieldConfigs}
          />
        )}
      </div>
    </div>
  );
}