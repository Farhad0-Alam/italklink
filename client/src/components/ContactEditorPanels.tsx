import { useState } from "react";
import { SelectItem } from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PanelLabel,
  PanelInput,
  PanelSelect,
  PanelCheckbox,
  PanelSlider,
  PanelColorPicker,
  PanelButton,
  SidebarSection,
  panelTheme
} from "./sidebar-panel-theme";
import { IconPicker } from "@/components/icon-picker";

function SortableContactItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-3 touch-manipulation"
      >
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
      {children}
    </div>
  );
}

interface Contact {
  id: string;
  label: string;
  value: string;
  icon: string;
  actionType?: 'tel' | 'sms' | 'email' | 'url' | 'vcard' | 'map' | 'appointment' | 'download' | 'copy' | 'share' | 'install';
}

const actionTypes = [
  { value: 'tel', label: 'Phone Call', icon: 'fas fa-phone' },
  { value: 'sms', label: 'SMS/Text', icon: 'fas fa-comment-sms' },
  { value: 'email', label: 'Email', icon: 'fas fa-envelope' },
  { value: 'url', label: 'Website URL', icon: 'fas fa-link' },
  { value: 'vcard', label: 'Save Contact', icon: 'fas fa-address-card' },
  { value: 'map', label: 'Open in Maps', icon: 'fas fa-map-marker-alt' },
  { value: 'appointment', label: 'Book Appointment', icon: 'fas fa-calendar-check' },
] as const;

const actionTypePlaceholders: Record<string, string> = {
  tel: '+1-234-567-8900',
  sms: '+1-234-567-8900',
  email: 'email@example.com',
  url: 'https://example.com',
  vcard: 'Auto-generated',
  map: '123 Main St, City',
  appointment: 'https://calendly.com/link',
};

export interface ContactSectionData {
  contacts?: Contact[];
  iconColor?: string;
  iconSize?: string;
  iconBgColor?: string;
  view?: 'icon-text' | 'text-only' | 'icon-only';
  shape?: 'circle' | 'square' | 'rounded' | 'auto';
  alignment?: 'left' | 'center' | 'right' | 'justified';
  skin?: 'gradient' | 'minimal' | 'framed' | 'boxed' | 'flat';
  columns?: string;
  textPosition?: 'left' | 'right' | 'top' | 'bottom';
  enableHoverColor?: boolean;
  iconHoverColor?: string;
  bgHoverColor?: string;
  fontFamily?: string;
  fontSize?: string;
  textColor?: string;
  gap?: string;
  visible?: boolean;
  cssClasses?: string;
  customId?: string;
}

interface ContactEditorPanelProps {
  data: ContactSectionData;
  onChange: (data: ContactSectionData) => void;
}

export function ContactContentPanel({ data, onChange }: ContactEditorPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const contacts = data.contacts || [];
      const oldIndex = contacts.findIndex((c) => c.id === active.id);
      const newIndex = contacts.findIndex((c) => c.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange({ ...data, contacts: arrayMove(contacts, oldIndex, newIndex) });
      }
    }
  };

  const addContact = () => {
    onChange({
      ...data,
      contacts: [...(data.contacts || []), {
        id: `contact_${Date.now()}`,
        label: "Contact",
        value: "",
        icon: "fas fa-phone",
        actionType: "tel",
      }],
    });
  };

  const updateContact = (index: number, updates: Partial<Contact>) => {
    const contacts = [...(data.contacts || [])];
    contacts[index] = { ...contacts[index], ...updates };
    onChange({ ...data, contacts });
  };

  const removeContact = (index: number) => {
    onChange({ ...data, contacts: (data.contacts || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Contact Methods</h4>
        <button
          onClick={addContact}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md touch-manipulation"
        >
          <i className="fas fa-plus" />
          Add
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={data.contacts?.map(c => c.id) || []} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {data.contacts?.map((contact, index) => (
              <SortableContactItem key={contact.id} id={contact.id}>
                <div className="p-3 ml-10 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                      <input
                        type="text"
                        value={contact.label}
                        onChange={(e) => updateContact(index, { label: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Label"
                      />
                    </div>
                    <button
                      onClick={() => removeContact(index)}
                      className="self-end p-2 text-red-500 hover:bg-red-50 rounded-md touch-manipulation"
                    >
                      <i className="fas fa-trash text-sm" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
                    <input
                      type="text"
                      value={contact.value}
                      onChange={(e) => updateContact(index, { value: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder={actionTypePlaceholders[contact.actionType || 'tel']}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Action</label>
                      <select
                        value={contact.actionType || "tel"}
                        onChange={(e) => updateContact(index, { actionType: e.target.value as Contact['actionType'] })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {actionTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                      <IconPicker
                        value={contact.icon}
                        onChange={(icon) => updateContact(index, { icon })}
                      />
                    </div>
                  </div>
                </div>
              </SortableContactItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {(!data.contacts || data.contacts.length === 0) && (
        <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
          No contacts yet. Click "Add" to create one.
        </div>
      )}
    </div>
  );
}

export function ContactDesignPanel({ data, onChange }: ContactEditorPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Icon Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.iconColor || "#9333ea"}
              onChange={(e) => onChange({ ...data, iconColor: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border border-gray-300"
            />
            <span className="text-xs text-gray-500">{data.iconColor || "#9333ea"}</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Background</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.iconBgColor || "#f3f4f6"}
              onChange={(e) => onChange({ ...data, iconBgColor: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border border-gray-300"
            />
            <span className="text-xs text-gray-500">{data.iconBgColor || "#f3f4f6"}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Icon Size</label>
        <input
          type="range"
          min="16"
          max="48"
          value={parseInt(data.iconSize || "24")}
          onChange={(e) => onChange({ ...data, iconSize: e.target.value })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs text-gray-500">{data.iconSize || "24"}px</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">View</label>
          <select
            value={data.view || "icon-text"}
            onChange={(e) => onChange({ ...data, view: e.target.value as any })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="icon-text">Icon & Text</option>
            <option value="icon-only">Icon Only</option>
            <option value="text-only">Text Only</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Shape</label>
          <select
            value={data.shape || "circle"}
            onChange={(e) => onChange({ ...data, shape: e.target.value as any })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Alignment</label>
          <select
            value={data.alignment || "center"}
            onChange={(e) => onChange({ ...data, alignment: e.target.value as any })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Skin</label>
          <select
            value={data.skin || "minimal"}
            onChange={(e) => onChange({ ...data, skin: e.target.value as any })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="minimal">Minimal</option>
            <option value="framed">Framed</option>
            <option value="boxed">Boxed</option>
            <option value="flat">Flat</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Gap (px)</label>
        <input
          type="number"
          value={data.gap || "12"}
          onChange={(e) => onChange({ ...data, gap: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          min="0"
          max="48"
        />
      </div>

      <div className="border-t border-gray-200 pt-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.enableHoverColor || false}
            onChange={(e) => onChange({ ...data, enableHoverColor: e.target.checked })}
            className="rounded border-gray-300"
          />
          Enable Hover Effects
        </label>
        {data.enableHoverColor && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Icon Hover</label>
              <input
                type="color"
                value={data.iconHoverColor || "#a855f7"}
                onChange={(e) => onChange({ ...data, iconHoverColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">BG Hover</label>
              <input
                type="color"
                value={data.bgHoverColor || "#4c1d95"}
                onChange={(e) => onChange({ ...data, bgHoverColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ContactSettingsPanel({ data, onChange }: ContactEditorPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.visible !== false}
            onChange={(e) => onChange({ ...data, visible: e.target.checked })}
            className="rounded border-gray-300 w-5 h-5"
          />
          Element Visible
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-7">Hide this element without deleting it</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Columns</label>
          <select
            value={data.columns || "auto"}
            onChange={(e) => onChange({ ...data, columns: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="auto">Auto</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Text Position</label>
          <select
            value={data.textPosition || "right"}
            onChange={(e) => onChange({ ...data, textPosition: e.target.value as any })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">CSS Classes</label>
        <input
          type="text"
          value={data.cssClasses || ""}
          onChange={(e) => onChange({ ...data, cssClasses: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          placeholder="custom-class another-class"
        />
        <p className="text-xs text-gray-500 mt-1">Add custom CSS classes</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Custom ID</label>
        <input
          type="text"
          value={data.customId || ""}
          onChange={(e) => onChange({ ...data, customId: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          placeholder="my-contact-section"
        />
        <p className="text-xs text-gray-500 mt-1">Add a custom HTML ID</p>
      </div>
    </div>
  );
}
