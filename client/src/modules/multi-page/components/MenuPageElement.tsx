import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, GripVertical } from 'lucide-react';

interface MenuElementData {
  title: string;
  items: Array<{
    id: string;
    type: 'internal' | 'external';
    label: string;
    path?: string;
    href?: string;
    target?: '_self' | '_blank';
    visible: boolean;
    order: number;
  }>;
  style: {
    variant: 'tabs' | 'pills' | 'underline' | 'ghost';
    orientation: 'horizontal' | 'vertical';
    radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    size: 'sm' | 'md' | 'lg';
    bg: string;
    fg: string;
    fgActive: string;
    sticky: boolean;
    mobileCollapse: boolean;
  };
}

interface MenuPageElementProps {
  data: MenuElementData;
  isEditing: boolean;
  onChange: (data: MenuElementData) => void;
  availablePages?: Array<{
    id: string;
    label: string;
    path: string;
  }>;
}

export function MenuPageElement({ data, isEditing, onChange, availablePages = [] }: MenuPageElementProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const updateData = (updates: Partial<MenuElementData>) => {
    onChange({ ...data, ...updates });
  };

  const updateStyle = (styleUpdates: Partial<MenuElementData['style']>) => {
    updateData({ style: { ...data.style, ...styleUpdates } });
  };

  const addMenuItem = () => {
    const newItem = {
      id: `menu-${Date.now()}`,
      type: 'internal' as const,
      label: 'New Page',
      path: 'new-page',
      visible: true,
      order: data.items.length,
    };
    updateData({ items: [...data.items, newItem] });
  };

  const updateMenuItem = (id: string, updates: any) => {
    const updatedItems = data.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    updateData({ items: updatedItems });
  };

  const removeMenuItem = (id: string) => {
    const updatedItems = data.items.filter(item => item.id !== id);
    updateData({ items: updatedItems });
  };

  const renderMenuPreview = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const menuClasses = [
      'relative bg-white rounded-lg shadow-sm border overflow-hidden',
      data.style.sticky ? 'sticky top-0 z-40' : '',
    ].join(' ');

    const desktopMenuClasses = [
      'hidden md:flex gap-2 p-4',
      data.style.orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
    ].join(' ');

    const itemClasses = [
      'px-3 py-2 transition-all duration-200 cursor-pointer hover:opacity-80',
      data.style.variant === 'pills' ? 'rounded-full' : '',
      data.style.variant === 'tabs' ? 'border-b-2 border-transparent hover:border-current' : '',
      data.style.variant === 'underline' ? 'border-b-2 border-transparent hover:border-current' : '',
      data.style.variant === 'ghost' ? 'hover:bg-gray-100' : '',
      data.style.size === 'sm' ? 'text-sm px-2 py-1' : '',
      data.style.size === 'lg' ? 'text-lg px-4 py-3' : '',
    ].join(' ');

    const visibleItems = data.items
      .filter(item => item.visible)
      .sort((a, b) => a.order - b.order);

    return (
      <div className={menuClasses}>
        {/* Desktop Menu */}
        <div className={desktopMenuClasses}>
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className={itemClasses}
              style={{
                backgroundColor: data.style.bg,
                color: data.style.fg,
                borderRadius: data.style.radius === 'none' ? 0 : 
                  data.style.radius === 'sm' ? '4px' :
                  data.style.radius === 'md' ? '6px' :
                  data.style.radius === 'lg' ? '8px' :
                  data.style.radius === 'xl' ? '12px' : '16px',
              }}
            >
              {item.label}
              {item.type === 'external' && <span className="ml-1 text-xs opacity-70">↗</span>}
            </div>
          ))}
        </div>

        {/* Mobile Menu */}
        {data.style.mobileCollapse && (
          <>
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center justify-between p-4">
              <span className="font-medium" style={{ color: data.style.fg }}>
                {data.title}
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: data.style.bg,
                  color: data.style.fg,
                }}
              >
                <div className={`w-5 h-5 relative transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}>
                  {isMobileMenuOpen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </div>
              </button>
            </div>

            {/* Mobile Dropdown */}
            <div className={`md:hidden transition-all duration-300 ease-in-out border-t ${
              isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            }`}>
              <div className="p-2 space-y-1">
                {visibleItems.map((item) => (
                  <div
                    key={item.id}
                    className={`block px-4 py-3 text-left transition-all duration-200 cursor-pointer hover:bg-gray-50 rounded-lg`}
                    style={{ color: data.style.fg }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.type === 'external' && (
                        <span className="ml-2 text-xs opacity-70">↗</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Non-collapsible mobile menu */}
        {!data.style.mobileCollapse && (
          <div className="md:hidden p-4">
            <div className="space-y-2">
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className={itemClasses}
                  style={{
                    backgroundColor: data.style.bg,
                    color: data.style.fg,
                    borderRadius: data.style.radius === 'none' ? 0 : 
                      data.style.radius === 'sm' ? '4px' :
                      data.style.radius === 'md' ? '6px' :
                      data.style.radius === 'lg' ? '8px' :
                      data.style.radius === 'xl' ? '12px' : '16px',
                  }}
                >
                  {item.label}
                  {item.type === 'external' && <span className="ml-1 text-xs opacity-70">↗</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isEditing) {
    return (
      <div className="space-y-4" data-testid="menu-element-preview">
        <h3 className="text-lg font-semibold">{data.title}</h3>
        {renderMenuPreview()}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border" data-testid="menu-element-editor">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Menu Title</label>
        <Input
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Navigation Menu"
          data-testid="input-menu-title"
        />
      </div>

      {/* Style Controls */}
      <div className="space-y-4">
        <h4 className="font-semibold">Style Settings</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Variant</label>
            <Select value={data.style.variant} onValueChange={(value: any) => updateStyle({ variant: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tabs">Tabs</SelectItem>
                <SelectItem value="pills">Pills</SelectItem>
                <SelectItem value="underline">Underline</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Size</label>
            <Select value={data.style.size} onValueChange={(value: any) => updateStyle({ size: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Orientation</label>
            <Select value={data.style.orientation} onValueChange={(value: any) => updateStyle({ orientation: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Border Radius</label>
            <Select value={data.style.radius} onValueChange={(value: any) => updateStyle({ radius: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">Extra Large</SelectItem>
                <SelectItem value="2xl">2X Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={data.style.sticky}
              onCheckedChange={(checked) => updateStyle({ sticky: checked })}
              data-testid="switch-sticky"
            />
            <label className="text-sm font-medium">Sticky Menu</label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={data.style.mobileCollapse}
              onCheckedChange={(checked) => updateStyle({ mobileCollapse: checked })}
              data-testid="switch-mobile-collapse"
            />
            <label className="text-sm font-medium">Mobile Collapse</label>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Menu Items</h4>
          <Button onClick={addMenuItem} size="sm" data-testid="button-add-menu-item">
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>

        <div className="space-y-2">
          {data.items.map((item, index) => (
            <div key={item.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <Input
                  value={item.label}
                  onChange={(e) => updateMenuItem(item.id, { label: e.target.value })}
                  placeholder="Menu label"
                  className="flex-1"
                  data-testid={`input-menu-label-${index}`}
                />
                <Select 
                  value={item.type} 
                  onValueChange={(value: any) => updateMenuItem(item.id, { type: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeMenuItem(item.id)}
                  data-testid={`button-remove-menu-item-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {item.type === 'internal' ? (
                  availablePages.length > 0 ? (
                    <Select
                      value={item.path || ''}
                      onValueChange={(value) => updateMenuItem(item.id, { path: value })}
                    >
                      <SelectTrigger className="flex-1" data-testid={`select-menu-page-${index}`}>
                        <SelectValue placeholder="Select a page" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePages.map((page) => (
                          <SelectItem key={page.id} value={page.path}>
                            {page.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={item.path || ''}
                      onChange={(e) => updateMenuItem(item.id, { path: e.target.value })}
                      placeholder="page-path (e.g., about, services)"
                      className="flex-1"
                      data-testid={`input-menu-path-${index}`}
                    />
                  )
                ) : (
                  <Input
                    value={item.href || ''}
                    onChange={(e) => updateMenuItem(item.id, { href: e.target.value })}
                    placeholder="https://example.com"
                    className="flex-1"
                    data-testid={`input-menu-href-${index}`}
                  />
                )}
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.visible}
                    onCheckedChange={(checked) => updateMenuItem(item.id, { visible: checked })}
                    data-testid={`switch-menu-visible-${index}`}
                  />
                  <label className="text-sm">Visible</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <h4 className="font-semibold">Preview</h4>
        {renderMenuPreview()}
      </div>
    </div>
  );
}