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
import { ElementEditorPanel, EditorTabId } from "./ElementEditorTabs";

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
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
        className="absolute left-0 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke={panelTheme.colors.textSecondary}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
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
  { value: 'vcard', label: 'Save Contact (vCard)', icon: 'fas fa-address-card' },
  { value: 'map', label: 'Open in Maps', icon: 'fas fa-map-marker-alt' },
  { value: 'appointment', label: 'Book Appointment', icon: 'fas fa-calendar-check' },
  { value: 'download', label: 'Download File', icon: 'fas fa-download' },
  { value: 'copy', label: 'Copy to Clipboard', icon: 'fas fa-copy' },
  { value: 'share', label: 'Share eCard', icon: 'fas fa-share-alt' },
  { value: 'install', label: 'Install App (PWA)', icon: 'fas fa-mobile-alt' },
] as const;

const actionTypePlaceholders: Record<string, string> = {
  tel: '+1-234-567-8900',
  sms: '+1-234-567-8900',
  email: 'email@example.com',
  url: 'https://example.com',
  vcard: 'Generated from Custom Contact Methods',
  map: '123 Main St, City, State',
  appointment: 'https://calendly.com/your-link',
  download: 'https://example.com/file.pdf',
  copy: 'Text to copy',
  share: 'Share message (optional)',
  install: 'App name (optional)',
};

interface ContactSectionData {
  contacts?: Contact[];
  iconColor?: string;
  iconSize?: string;
  iconBgColor?: string;
  iconBorderColor?: string;
  iconBorderSize?: string;
  iconBgSize?: string;
  view?: 'icon-text' | 'text-only' | 'icon-only';
  size?: 'small' | 'medium' | 'large';
  shape?: 'circle' | 'square' | 'rounded' | 'auto';
  alignment?: 'left' | 'center' | 'right' | 'justified';
  showLabel?: boolean;
  iconWidth?: string;
  iconHeight?: string;
  skin?: 'gradient' | 'minimal' | 'framed' | 'boxed' | 'flat';
  columns?: string;
  textPosition?: 'left' | 'right' | 'top' | 'bottom';
  hoverColor?: string;
  enableHoverColor?: boolean;
  iconHoverColor?: string;
  bgHoverColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textColor?: string;
  shadowColor?: string;
  shadowBlur?: string;
  shadowOffsetX?: string;
  shadowOffsetY?: string;
  shadowOpacity?: string;
  gap?: string;
  outerContainer?: {
    enabled?: boolean;
    background?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    padding?: number;
  };
  visible?: boolean;
  cssClasses?: string;
  customId?: string;
}

interface TabbedContactEditorProps {
  data: ContactSectionData;
  onChange: (data: ContactSectionData) => void;
  onClose?: () => void;
  compact?: boolean;
}

export function TabbedContactEditor({ data, onChange, onClose, compact = false }: TabbedContactEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTabId>("content");
  const [collapsedSections, setCollapsedSections] = useState({
    iconStyling: false,
    hoverColor: true,
    fontStyling: true,
    dropShadow: true,
    layout: true,
    outerContainer: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleContactDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const contacts = data.contacts || [];
      const oldIndex = contacts.findIndex((c) => c.id === active.id);
      const newIndex = contacts.findIndex((c) => c.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedContacts = arrayMove(contacts, oldIndex, newIndex);
        onChange({ ...data, contacts: reorderedContacts });
      }
    }
  };

  const addContact = () => {
    const newContact: Contact = {
      id: `contact_${Date.now()}`,
      label: "Contact",
      value: "",
      icon: "fas fa-phone",
      actionType: "tel",
    };
    onChange({
      ...data,
      contacts: [...(data.contacts || []), newContact],
    });
  };

  const updateContact = (index: number, updates: Partial<Contact>) => {
    const contacts = [...(data.contacts || [])];
    contacts[index] = { ...contacts[index], ...updates };
    onChange({ ...data, contacts });
  };

  const removeContact = (index: number) => {
    const contacts = (data.contacts || []).filter((_, i) => i !== index);
    onChange({ ...data, contacts });
  };

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const contentPanel = (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">Contact Methods</h4>
        <PanelButton onClick={addContact} variant="success">
          <i className="fas fa-plus mr-1 text-xs" />
          Add
        </PanelButton>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleContactDragEnd}
      >
        <SortableContext
          items={data.contacts?.map(c => c.id) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {data.contacts?.map((contact, index) => (
              <SortableItem key={contact.id} id={contact.id}>
                <div 
                  className="p-2 rounded ml-8 space-y-2 bg-gray-50 border border-gray-200"
                >
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <PanelLabel>Label</PanelLabel>
                      <PanelInput
                        value={contact.label}
                        onChange={(e) => updateContact(index, { label: e.target.value })}
                        placeholder="Label"
                      />
                    </div>
                    <div className="flex-1">
                      <PanelLabel>Value</PanelLabel>
                      <PanelInput
                        value={contact.value}
                        onChange={(e) => updateContact(index, { value: e.target.value })}
                        placeholder={actionTypePlaceholders[contact.actionType || 'tel'] || 'Value'}
                      />
                    </div>
                    <PanelButton onClick={() => removeContact(index)} variant="danger">
                      <i className="fas fa-trash text-xs" />
                    </PanelButton>
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <PanelLabel>Action Type</PanelLabel>
                      <PanelSelect
                        value={contact.actionType || "tel"}
                        onValueChange={(value) => updateContact(index, { actionType: value as Contact['actionType'] })}
                      >
                        {actionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <i className={`${type.icon} w-4`} />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </PanelSelect>
                    </div>
                    <div className="w-16">
                      <PanelLabel>Icon</PanelLabel>
                      <IconPicker
                        value={contact.icon}
                        onChange={(icon) => updateContact(index, { icon })}
                      />
                    </div>
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {(!data.contacts || data.contacts.length === 0) && (
        <div className="text-center py-6 text-gray-500 text-sm">
          No contacts added. Click "Add" to create your first contact.
        </div>
      )}
    </div>
  );

  const designPanel = (
    <div className="space-y-1">
      <SidebarSection
        title="Icon Styling"
        isOpen={!collapsedSections.iconStyling}
        onToggle={() => toggleSection("iconStyling")}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <PanelLabel>Icon Color</PanelLabel>
              <PanelColorPicker
                value={data.iconColor || "#9333ea"}
                onChange={(e) => onChange({ ...data, iconColor: e.target.value })}
              />
            </div>
            <div>
              <PanelLabel>Background Color</PanelLabel>
              <PanelColorPicker
                value={data.iconBgColor || "transparent"}
                onChange={(e) => onChange({ ...data, iconBgColor: e.target.value })}
              />
            </div>
          </div>

          <PanelSlider
            value={parseInt(data.iconSize || "20")}
            onChange={(value) => onChange({ ...data, iconSize: value.toString() })}
            min={10}
            max={100}
            label="Icon Size"
          />

          <div>
            <PanelLabel>View</PanelLabel>
            <PanelSelect
              value={data.view || "icon-text"}
              onValueChange={(value: 'icon-text' | 'text-only' | 'icon-only') => onChange({ ...data, view: value })}
            >
              <SelectItem value="icon-text">Icon & Text</SelectItem>
              <SelectItem value="text-only">Text Only</SelectItem>
              <SelectItem value="icon-only">Icon Only</SelectItem>
            </PanelSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <PanelLabel>Shape</PanelLabel>
              <PanelSelect
                value={data.shape || "circle"}
                onValueChange={(value: 'circle' | 'square' | 'rounded' | 'auto') => onChange({ ...data, shape: value })}
              >
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </PanelSelect>
            </div>
            <div>
              <PanelLabel>Alignment</PanelLabel>
              <PanelSelect
                value={data.alignment || "center"}
                onValueChange={(value: 'left' | 'center' | 'right' | 'justified') => onChange({ ...data, alignment: value })}
              >
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="justified">Justified</SelectItem>
              </PanelSelect>
            </div>
          </div>

          <div>
            <PanelLabel>Skin</PanelLabel>
            <PanelSelect
              value={data.skin || "minimal"}
              onValueChange={(value: 'gradient' | 'minimal' | 'framed' | 'boxed' | 'flat') => onChange({ ...data, skin: value })}
            >
              <SelectItem value="gradient">Gradient</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="framed">Framed</SelectItem>
              <SelectItem value="boxed">Boxed</SelectItem>
              <SelectItem value="flat">Flat</SelectItem>
            </PanelSelect>
          </div>
        </div>
      </SidebarSection>

      <SidebarSection
        title="Font Styling"
        isOpen={!collapsedSections.fontStyling}
        onToggle={() => toggleSection("fontStyling")}
      >
        <div className="space-y-3">
          <div>
            <PanelLabel>Font Family</PanelLabel>
            <PanelSelect
              value={data.fontFamily || "inherit"}
              onValueChange={(value) => onChange({ ...data, fontFamily: value })}
            >
              <SelectItem value="inherit">Default</SelectItem>
              <SelectItem value="Arial, sans-serif">Arial</SelectItem>
              <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
              <SelectItem value="Georgia, serif">Georgia</SelectItem>
              <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
            </PanelSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <PanelLabel>Font Size (px)</PanelLabel>
              <PanelInput
                type="number"
                value={data.fontSize || "16"}
                onChange={(e) => onChange({ ...data, fontSize: e.target.value })}
              />
            </div>
            <div>
              <PanelLabel>Text Color</PanelLabel>
              <PanelColorPicker
                value={data.textColor || "#000000"}
                onChange={(e) => onChange({ ...data, textColor: e.target.value })}
              />
            </div>
          </div>
        </div>
      </SidebarSection>

      <SidebarSection
        title="Hover Effects"
        isOpen={!collapsedSections.hoverColor}
        onToggle={() => toggleSection("hoverColor")}
      >
        <PanelCheckbox
          id="enableHoverColor"
          checked={data.enableHoverColor || false}
          onCheckedChange={(checked) => onChange({ ...data, enableHoverColor: checked })}
          label="Enable Hover Color"
        />
        
        {data.enableHoverColor && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <PanelLabel>Icon Hover</PanelLabel>
              <PanelColorPicker
                value={data.iconHoverColor || "#a855f7"}
                onChange={(e) => onChange({ ...data, iconHoverColor: e.target.value })}
              />
            </div>
            <div>
              <PanelLabel>BG Hover</PanelLabel>
              <PanelColorPicker
                value={data.bgHoverColor || "#4c1d95"}
                onChange={(e) => onChange({ ...data, bgHoverColor: e.target.value })}
              />
            </div>
          </div>
        )}
      </SidebarSection>

      <SidebarSection
        title="Layout Options"
        isOpen={!collapsedSections.layout}
        onToggle={() => toggleSection("layout")}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <PanelLabel>Columns</PanelLabel>
              <PanelSelect
                value={data.columns || "auto"}
                onValueChange={(value) => onChange({ ...data, columns: value })}
              >
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </PanelSelect>
            </div>
            <div>
              <PanelLabel>Text Position</PanelLabel>
              <PanelSelect
                value={data.textPosition || "right"}
                onValueChange={(value: 'left' | 'right' | 'top' | 'bottom') => onChange({ ...data, textPosition: value })}
              >
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </PanelSelect>
            </div>
          </div>

          <div>
            <PanelLabel>Gap Between Icons (px)</PanelLabel>
            <PanelInput
              type="number"
              value={data.gap || "12"}
              onChange={(e) => onChange({ ...data, gap: e.target.value })}
            />
          </div>
        </div>
      </SidebarSection>
    </div>
  );

  const settingsPanel = (
    <div className="space-y-4">
      <div>
        <PanelLabel>Visibility</PanelLabel>
        <PanelCheckbox
          id="elementVisible"
          checked={data.visible !== false}
          onCheckedChange={(checked) => onChange({ ...data, visible: checked })}
          label="Element Visible"
        />
        <p className="text-xs text-gray-500 mt-1">
          Hide this element without deleting it
        </p>
      </div>

      <div>
        <PanelLabel>CSS Classes</PanelLabel>
        <PanelInput
          value={data.cssClasses || ""}
          onChange={(e) => onChange({ ...data, cssClasses: e.target.value })}
          placeholder="custom-class another-class"
        />
        <p className="text-xs text-gray-500 mt-1">
          Add custom CSS classes (space-separated)
        </p>
      </div>

      <div>
        <PanelLabel>Custom ID</PanelLabel>
        <PanelInput
          value={data.customId || ""}
          onChange={(e) => onChange({ ...data, customId: e.target.value })}
          placeholder="my-contact-section"
        />
        <p className="text-xs text-gray-500 mt-1">
          Add a custom HTML ID for this element
        </p>
      </div>

      <SidebarSection
        title="Container Styling"
        isOpen={!collapsedSections.outerContainer}
        onToggle={() => toggleSection("outerContainer")}
      >
        <PanelCheckbox
          id="enableOuterContainer"
          checked={data.outerContainer?.enabled || false}
          onCheckedChange={(checked) => onChange({ 
            ...data, 
            outerContainer: { ...(data.outerContainer || {}), enabled: checked }
          })}
          label="Enable Container"
        />

        {data.outerContainer?.enabled && (
          <div className="space-y-3 mt-2">
            <div>
              <PanelLabel>Background</PanelLabel>
              <PanelColorPicker
                value={data.outerContainer.background || "#ffffff"}
                onChange={(e) => onChange({ 
                  ...data, 
                  outerContainer: { ...(data.outerContainer || {}), background: e.target.value }
                })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <PanelLabel>Border Radius</PanelLabel>
                <PanelSlider
                  value={data.outerContainer.borderRadius || 8}
                  onChange={(value) => onChange({ 
                    ...data, 
                    outerContainer: { ...(data.outerContainer || {}), borderRadius: value }
                  })}
                  min={0}
                  max={50}
                  label=""
                />
              </div>
              <div>
                <PanelLabel>Padding</PanelLabel>
                <PanelSlider
                  value={data.outerContainer.padding || 16}
                  onChange={(value) => onChange({ 
                    ...data, 
                    outerContainer: { ...(data.outerContainer || {}), padding: value }
                  })}
                  min={0}
                  max={50}
                  label=""
                />
              </div>
            </div>
          </div>
        )}
      </SidebarSection>
    </div>
  );

  return (
    <ElementEditorPanel
      activeTab={activeTab}
      onTabChange={setActiveTab}
      elementType="Contact Section"
      elementTitle="Contact Information"
      onClose={onClose}
      contentPanel={contentPanel}
      designPanel={designPanel}
      settingsPanel={settingsPanel}
      compact={compact}
    />
  );
}
