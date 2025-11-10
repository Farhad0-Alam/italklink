import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  iconColor?: string;
  iconSize?: string;
  hoverColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  textColor?: string;
  shadowColor?: string;
  shadowBlur?: string;
  shadowOffsetX?: string;
  shadowOffsetY?: string;
  containerBackground?: string;
  containerBorderColor?: string;
  containerBorderWidth?: string;
  containerBorderRadius?: string;
  containerPadding?: string;
  gap?: string;
}

interface ContactSectionEditorProps {
  data: ContactSectionData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContactSectionData) => void;
}

export function ContactSectionEditor({ data, isOpen, onClose, onSave }: ContactSectionEditorProps) {
  const [editData, setEditData] = useState<ContactSectionData>({
    contacts: data.contacts || [],
    iconColor: data.iconColor || "#9333ea",
    iconSize: data.iconSize || "20",
    hoverColor: data.hoverColor || "#a855f7",
    fontFamily: data.fontFamily || "inherit",
    fontSize: data.fontSize || "16",
    fontWeight: data.fontWeight || "400",
    textColor: data.textColor || "#ffffff",
    shadowColor: data.shadowColor || "rgba(0,0,0,0.3)",
    shadowBlur: data.shadowBlur || "0",
    shadowOffsetX: data.shadowOffsetX || "0",
    shadowOffsetY: data.shadowOffsetY || "0",
    containerBackground: data.containerBackground || "transparent",
    containerBorderColor: data.containerBorderColor || "transparent",
    containerBorderWidth: data.containerBorderWidth || "0",
    containerBorderRadius: data.containerBorderRadius || "8",
    containerPadding: data.containerPadding || "16",
    gap: data.gap || "12",
  });

  const [collapsedSections, setCollapsedSections] = useState({
    iconStyling: true,
    hoverColor: true,
    fontStyling: true,
    dropShadow: true,
    containerStyling: true,
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
      const contacts = editData.contacts || [];
      const oldIndex = contacts.findIndex((c) => c.id === active.id);
      const newIndex = contacts.findIndex((c) => c.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedContacts = arrayMove(contacts, oldIndex, newIndex);
        setEditData({ ...editData, contacts: reorderedContacts });
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
    setEditData({
      ...editData,
      contacts: [...(editData.contacts || []), newContact],
    });
  };

  const updateContact = (index: number, updates: Partial<Contact>) => {
    const contacts = [...(editData.contacts || [])];
    contacts[index] = { ...contacts[index], ...updates };
    setEditData({ ...editData, contacts });
  };

  const removeContact = (index: number) => {
    const contacts = (editData.contacts || []).filter((_, i) => i !== index);
    setEditData({ ...editData, contacts });
  };

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = () => {
    onSave(editData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Contact Section</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Custom Contact Methods */}
          <div className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 space-y-4">
            <h4 className="text-md font-medium text-purple-300">Custom Contact Methods</h4>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleContactDragEnd}
            >
              <SortableContext
                items={editData.contacts?.map(c => c.id) || []}
                strategy={verticalListSortingStrategy}
              >
                {editData.contacts?.map((contact, index) => (
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
                    value={editData.iconColor}
                    onChange={(e) => setEditData({ ...editData, iconColor: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label className="text-white">Icon Size (px)</Label>
                  <Input
                    type="number"
                    value={editData.iconSize}
                    onChange={(e) => setEditData({ ...editData, iconSize: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
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
              <div className="bg-purple-900/30 border-x border-b border-purple-600/30 rounded-b-lg p-4 -mt-1">
                <Label className="text-white">Hover Color</Label>
                <Input
                  type="color"
                  value={editData.hoverColor}
                  onChange={(e) => setEditData({ ...editData, hoverColor: e.target.value })}
                  className="bg-slate-700 border-slate-600"
                />
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
                    value={editData.fontFamily}
                    onValueChange={(value) => setEditData({ ...editData, fontFamily: value })}
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
                    value={editData.fontSize}
                    onChange={(e) => setEditData({ ...editData, fontSize: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Font Weight</Label>
                  <Select
                    value={editData.fontWeight}
                    onValueChange={(value) => setEditData({ ...editData, fontWeight: value })}
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
                  <Label className="text-white">Text Color</Label>
                  <Input
                    type="color"
                    value={editData.textColor}
                    onChange={(e) => setEditData({ ...editData, textColor: e.target.value })}
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
                    value={editData.shadowColor}
                    onChange={(e) => setEditData({ ...editData, shadowColor: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="rgba(0,0,0,0.3)"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-white">Blur (px)</Label>
                    <Input
                      type="number"
                      value={editData.shadowBlur}
                      onChange={(e) => setEditData({ ...editData, shadowBlur: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Offset X (px)</Label>
                    <Input
                      type="number"
                      value={editData.shadowOffsetX}
                      onChange={(e) => setEditData({ ...editData, shadowOffsetX: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Offset Y (px)</Label>
                    <Input
                      type="number"
                      value={editData.shadowOffsetY}
                      onChange={(e) => setEditData({ ...editData, shadowOffsetY: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
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
                    value={editData.containerBackground}
                    onChange={(e) => setEditData({ ...editData, containerBackground: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="transparent or #color"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white">Border Color</Label>
                    <Input
                      type="text"
                      value={editData.containerBorderColor}
                      onChange={(e) => setEditData({ ...editData, containerBorderColor: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="transparent or #color"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Border Width (px)</Label>
                    <Input
                      type="number"
                      value={editData.containerBorderWidth}
                      onChange={(e) => setEditData({ ...editData, containerBorderWidth: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white">Border Radius (px)</Label>
                    <Input
                      type="number"
                      value={editData.containerBorderRadius}
                      onChange={(e) => setEditData({ ...editData, containerBorderRadius: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Padding (px)</Label>
                    <Input
                      type="number"
                      value={editData.containerPadding}
                      onChange={(e) => setEditData({ ...editData, containerPadding: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Gap Between Items (px)</Label>
                  <Input
                    type="number"
                    value={editData.gap}
                    onChange={(e) => setEditData({ ...editData, gap: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}