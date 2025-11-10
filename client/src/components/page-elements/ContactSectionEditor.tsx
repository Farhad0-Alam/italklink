import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
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
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

// Sortable item component
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
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
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
}

interface ContactSectionData {
  contacts?: Contact[];
  // Icon Styling
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
  // Hover Color
  hoverColor?: string;
  enableHoverColor?: boolean;
  iconHoverColor?: string;
  bgHoverColor?: string;
  // Font Styling
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textColor?: string;
  // Drop Shadow
  shadowColor?: string;
  shadowBlur?: string;
  shadowOffsetX?: string;
  shadowOffsetY?: string;
  shadowOpacity?: string;
  // Container Styling
  containerBackground?: string;
  containerBorderColor?: string;
  containerBorderWidth?: string;
  containerBorderRadius?: string;
  containerPadding?: string;
  gap?: string;
  enableContainerStyling?: boolean;
  containerWidth?: string;
  containerHeight?: string;
  enableContainerShadow?: boolean;
  containerShadowColor?: string;
  containerShadowOpacity?: string;
  containerShadowBlur?: string;
  containerShadowOffsetX?: string;
  containerShadowOffsetY?: string;
}

interface ContactSectionEditorProps {
  data: ContactSectionData;
  onChange: (data: ContactSectionData) => void;
}

export function ContactSectionEditor({ data, onChange }: ContactSectionEditorProps) {
  const [collapsedSections, setCollapsedSections] = useState({
    iconStyling: false,
    hoverColor: false,
    fontStyling: false,
    dropShadow: false,
    containerStyling: false,
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
      icon: "fa-phone",
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

  return (
        <div className="space-y-4" onPointerDown={(e) => e.stopPropagation()}>
          {/* Custom Contact Methods */}
          <div className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 space-y-4">
            <h4 className="text-md font-medium text-purple-300">Custom Contact Methods</h4>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleContactDragEnd}
            >
              <SortableContext
                items={data.contacts?.map(c => c.id) || []}
                strategy={verticalListSortingStrategy}
              >
                {data.contacts?.map((contact, index) => (
                  <SortableItem key={contact.id} id={contact.id}>
                    <div className="flex gap-2 items-end bg-slate-800/50 p-3 rounded-lg border border-slate-700 ml-8">
                      <div className="flex-1">
                        <Label className="text-white">Label</Label>
                        <Input
                          value={contact.label}
                          onChange={(e) => updateContact(index, { label: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Contact label"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-white">Value</Label>
                        <Input
                          value={contact.value}
                          onChange={(e) => updateContact(index, { value: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Contact value"
                        />
                      </div>
                      <div className="w-40">
                        <Label className="text-white">Icon</Label>
                        <Select
                          value={contact.icon}
                          onValueChange={(value) => updateContact(index, { icon: value })}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue>
                              <i className={`fas ${contact.icon} mr-2`} />
                              {contact.icon}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="fa-phone">
                              <i className="fas fa-phone mr-2" />Phone
                            </SelectItem>
                            <SelectItem value="fa-envelope">
                              <i className="fas fa-envelope mr-2" />Email
                            </SelectItem>
                            <SelectItem value="fa-map-marker-alt">
                              <i className="fas fa-map-marker-alt mr-2" />Location
                            </SelectItem>
                            <SelectItem value="fa-globe">
                              <i className="fas fa-globe mr-2" />Website
                            </SelectItem>
                            <SelectItem value="fa-mobile-alt">
                              <i className="fas fa-mobile-alt mr-2" />Mobile
                            </SelectItem>
                            <SelectItem value="fa-fax">
                              <i className="fas fa-fax mr-2" />Fax
                            </SelectItem>
                            <SelectItem value="fa-link">
                              <i className="fas fa-link mr-2" />Link
                            </SelectItem>
                            <SelectItem value="fa-clock">
                              <i className="fas fa-clock mr-2" />Hours
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => removeContact(index)}
                        className="bg-red-600 hover:bg-red-700"
                        size="icon"
                      >
                        <i className="fas fa-trash" />
                      </Button>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>

            <Button
              onClick={addContact}
              className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              <i className="fas fa-plus mr-2" />
              Add Custom Contact
            </Button>
          </div>

          {/* Icon Styling */}
          <Collapsible open={!collapsedSections.iconStyling}>
            <div 
              className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 cursor-pointer"
              onClick={() => toggleSection("iconStyling")}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-purple-300">Icon Styling</h4>
                <i className={`fas ${collapsedSections.iconStyling ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
              </div>
            </div>
            <CollapsibleContent>
              <div className="bg-purple-900/30 border-x border-b border-purple-600/30 rounded-b-lg p-4 -mt-1 space-y-3">
                <div>
                  <Label className="text-white">Icon Color</Label>
                  <Input
                    type="color"
                    value={data.iconColor || "#9333ea"}
                    onChange={(e) => onChange({ ...data, iconColor: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label className="text-white">Icon Size (px)</Label>
                  <Input
                    type="number"
                    value={data.iconSize || "20"}
                    onChange={(e) => onChange({ ...data, iconSize: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Background Color</Label>
                  <Input
                    type="color"
                    value={data.iconBgColor || "transparent"}
                    onChange={(e) => onChange({ ...data, iconBgColor: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label className="text-white">Border Color</Label>
                  <Input
                    type="color"
                    value={data.iconBorderColor || "transparent"}
                    onChange={(e) => onChange({ ...data, iconBorderColor: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label className="text-white">Border Size (px)</Label>
                  <Input
                    type="number"
                    value={data.iconBorderSize || "0"}
                    onChange={(e) => onChange({ ...data, iconBorderSize: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Icon Background Size (px)</Label>
                  <Input
                    type="number"
                    value={data.iconBgSize || "40"}
                    onChange={(e) => onChange({ ...data, iconBgSize: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">View</Label>
                  <Select
                    value={data.view || "icon-text"}
                    onValueChange={(value: 'icon-text' | 'text-only' | 'icon-only') => onChange({ ...data, view: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="icon-text">Icon & Text</SelectItem>
                      <SelectItem value="text-only">Text Only</SelectItem>
                      <SelectItem value="icon-only">Icon Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Size</Label>
                  <Select
                    value={data.size || "medium"}
                    onValueChange={(value: 'small' | 'medium' | 'large') => onChange({ ...data, size: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Shape</Label>
                  <Select
                    value={data.shape || "circle"}
                    onValueChange={(value: 'circle' | 'square' | 'rounded' | 'auto') => onChange({ ...data, shape: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Alignment</Label>
                  <Select
                    value={data.alignment || "center"}
                    onValueChange={(value: 'left' | 'center' | 'right' | 'justified') => onChange({ ...data, alignment: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="justified">Justified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showLabel"
                    checked={data.showLabel !== false}
                    onCheckedChange={(checked) => onChange({ ...data, showLabel: checked as boolean })}
                  />
                  <Label htmlFor="showLabel" className="text-white cursor-pointer">
                    Show Label
                  </Label>
                </div>
                <div>
                  <Label className="text-white">Icon Width: {data.iconWidth || "40"}px</Label>
                  <Slider
                    value={[parseInt(data.iconWidth || "40")]}
                    onValueChange={(value) => onChange({ ...data, iconWidth: value[0].toString() })}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-white">Icon Height: {data.iconHeight || "40"}px</Label>
                  <Slider
                    value={[parseInt(data.iconHeight || "40")]}
                    onValueChange={(value) => onChange({ ...data, iconHeight: value[0].toString() })}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Hover Color */}
          <Collapsible open={!collapsedSections.hoverColor}>
            <div 
              className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 cursor-pointer"
              onClick={() => toggleSection("hoverColor")}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-purple-300">Hover Color</h4>
                <i className={`fas ${collapsedSections.hoverColor ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
              </div>
            </div>
            <CollapsibleContent>
              <div className="bg-purple-900/30 border-x border-b border-purple-600/30 rounded-b-lg p-4 -mt-1 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableHoverColor"
                    checked={data.enableHoverColor || false}
                    onCheckedChange={(checked) => onChange({ ...data, enableHoverColor: checked as boolean })}
                  />
                  <Label htmlFor="enableHoverColor" className="text-white cursor-pointer">
                    Enable Hover Color
                  </Label>
                </div>
                <div>
                  <Label className="text-white">Icon Hover Color</Label>
                  <Input
                    type="color"
                    value={data.iconHoverColor || "#a855f7"}
                    onChange={(e) => onChange({ ...data, iconHoverColor: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label className="text-white">Background Hover Color</Label>
                  <Input
                    type="color"
                    value={data.bgHoverColor || "rgba(168, 85, 247, 0.1)"}
                    onChange={(e) => onChange({ ...data, bgHoverColor: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Font Styling */}
          <Collapsible open={!collapsedSections.fontStyling}>
            <div 
              className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 cursor-pointer"
              onClick={() => toggleSection("fontStyling")}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-purple-300">Font Styling</h4>
                <i className={`fas ${collapsedSections.fontStyling ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
              </div>
            </div>
            <CollapsibleContent>
              <div className="bg-purple-900/30 border-x border-b border-purple-600/30 rounded-b-lg p-4 -mt-1 space-y-3">
                <div>
                  <Label className="text-white">Font Family</Label>
                  <Select
                    value={data.fontFamily || "inherit"}
                    onValueChange={(value) => onChange({ ...data, fontFamily: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="inherit">Default</SelectItem>
                      <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                      <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                      <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                      <SelectItem value="Georgia, serif">Georgia</SelectItem>
                      <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Font Size (px)</Label>
                  <Input
                    type="number"
                    value={data.fontSize || "16"}
                    onChange={(e) => onChange({ ...data, fontSize: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Font Weight</Label>
                  <Select
                    value={data.fontWeight || "400"}
                    onValueChange={(value) => onChange({ ...data, fontWeight: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="300">Light</SelectItem>
                      <SelectItem value="400">Normal</SelectItem>
                      <SelectItem value="500">Medium</SelectItem>
                      <SelectItem value="600">Semi-Bold</SelectItem>
                      <SelectItem value="700">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Font Style</Label>
                  <Select
                    value={data.fontStyle || "normal"}
                    onValueChange={(value: 'normal' | 'italic' | 'oblique') => onChange({ ...data, fontStyle: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="italic">Italic</SelectItem>
                      <SelectItem value="oblique">Oblique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Text Color</Label>
                  <Input
                    type="color"
                    value={data.textColor || "#ffffff"}
                    onChange={(e) => onChange({ ...data, textColor: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Drop Shadow */}
          <Collapsible open={!collapsedSections.dropShadow}>
            <div 
              className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 cursor-pointer"
              onClick={() => toggleSection("dropShadow")}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-purple-300">Drop Shadow</h4>
                <i className={`fas ${collapsedSections.dropShadow ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
              </div>
            </div>
            <CollapsibleContent>
              <div className="bg-purple-900/30 border-x border-b border-purple-600/30 rounded-b-lg p-4 -mt-1 space-y-3">
                <div>
                  <Label className="text-white">Shadow Color</Label>
                  <Input
                    type="text"
                    value={data.shadowColor || "rgba(0,0,0,0.3)"}
                    onChange={(e) => onChange({ ...data, shadowColor: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="rgba(0,0,0,0.3)"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-white">Blur (px)</Label>
                    <Input
                      type="number"
                      value={data.shadowBlur || "0"}
                      onChange={(e) => onChange({ ...data, shadowBlur: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Offset X (px)</Label>
                    <Input
                      type="number"
                      value={data.shadowOffsetX || "0"}
                      onChange={(e) => onChange({ ...data, shadowOffsetX: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Offset Y (px)</Label>
                    <Input
                      type="number"
                      value={data.shadowOffsetY || "0"}
                      onChange={(e) => onChange({ ...data, shadowOffsetY: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Shadow Opacity: {data.shadowOpacity || "30"}%</Label>
                  <Slider
                    value={[parseInt(data.shadowOpacity || "30")]}
                    onValueChange={(value) => onChange({ ...data, shadowOpacity: value[0].toString() })}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Contact Container Styling */}
          <Collapsible open={!collapsedSections.containerStyling}>
            <div 
              className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 cursor-pointer"
              onClick={() => toggleSection("containerStyling")}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-purple-300">Contact Container Styling</h4>
                <i className={`fas ${collapsedSections.containerStyling ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
              </div>
            </div>
            <CollapsibleContent>
              <div className="bg-purple-900/30 border-x border-b border-purple-600/30 rounded-b-lg p-4 -mt-1 space-y-3">
                <div>
                  <Label className="text-white">Background Color</Label>
                  <Input
                    type="text"
                    value={data.containerBackground || "transparent"}
                    onChange={(e) => onChange({ ...data, containerBackground: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="transparent or #color"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white">Border Color</Label>
                    <Input
                      type="text"
                      value={data.containerBorderColor || "transparent"}
                      onChange={(e) => onChange({ ...data, containerBorderColor: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="transparent or #color"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Border Width (px)</Label>
                    <Input
                      type="number"
                      value={data.containerBorderWidth || "0"}
                      onChange={(e) => onChange({ ...data, containerBorderWidth: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white">Border Radius (px)</Label>
                    <Input
                      type="number"
                      value={data.containerBorderRadius || "8"}
                      onChange={(e) => onChange({ ...data, containerBorderRadius: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Padding (px)</Label>
                    <Input
                      type="number"
                      value={data.containerPadding || "16"}
                      onChange={(e) => onChange({ ...data, containerPadding: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Gap Between Items (px)</Label>
                  <Input
                    type="number"
                    value={data.gap || "12"}
                    onChange={(e) => onChange({ ...data, gap: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableContainerStyling"
                    checked={data.enableContainerStyling || false}
                    onCheckedChange={(checked) => onChange({ ...data, enableContainerStyling: checked as boolean })}
                  />
                  <Label htmlFor="enableContainerStyling" className="text-white cursor-pointer">
                    Enable Container Styling
                  </Label>
                </div>
                <div>
                  <Label className="text-white">Container Width: {data.containerWidth || "100"}%</Label>
                  <Slider
                    value={[parseInt(data.containerWidth || "100")]}
                    onValueChange={(value) => onChange({ ...data, containerWidth: value[0].toString() })}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-white">Container Height (px, 0 = auto)</Label>
                  <Slider
                    value={[parseInt(data.containerHeight || "0")]}
                    onValueChange={(value) => onChange({ ...data, containerHeight: value[0].toString() })}
                    min={0}
                    max={500}
                    step={10}
                    className="mt-2"
                  />
                  <span className="text-sm text-gray-400">{data.containerHeight === "0" || !data.containerHeight ? "auto" : `${data.containerHeight}px`}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableContainerShadow"
                    checked={data.enableContainerShadow || false}
                    onCheckedChange={(checked) => onChange({ ...data, enableContainerShadow: checked as boolean })}
                  />
                  <Label htmlFor="enableContainerShadow" className="text-white cursor-pointer">
                    Enable Container Drop Shadow
                  </Label>
                </div>
                <div>
                  <Label className="text-white">Container Shadow Color</Label>
                  <Input
                    type="color"
                    value={data.containerShadowColor || "rgba(0,0,0,0.3)"}
                    onChange={(e) => onChange({ ...data, containerShadowColor: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label className="text-white">Container Shadow Opacity: {data.containerShadowOpacity || "30"}%</Label>
                  <Slider
                    value={[parseInt(data.containerShadowOpacity || "30")]}
                    onValueChange={(value) => onChange({ ...data, containerShadowOpacity: value[0].toString() })}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-white">Container Shadow Blur (px)</Label>
                  <Input
                    type="number"
                    value={data.containerShadowBlur || "10"}
                    onChange={(e) => onChange({ ...data, containerShadowBlur: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white">Container Shadow Offset X (px)</Label>
                    <Input
                      type="number"
                      value={data.containerShadowOffsetX || "0"}
                      onChange={(e) => onChange({ ...data, containerShadowOffsetX: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Container Shadow Offset Y (px)</Label>
                    <Input
                      type="number"
                      value={data.containerShadowOffsetY || "4"}
                      onChange={(e) => onChange({ ...data, containerShadowOffsetY: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
  );
}