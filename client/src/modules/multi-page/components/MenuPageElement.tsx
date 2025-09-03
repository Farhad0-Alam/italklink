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
    position: 'default' | 'header' | 'footer' | 'floating-top-right' | 'floating-top-left' | 'sidebar-left' | 'sidebar-right';
    fixed: boolean;
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
  onNavigate?: (pageId: string) => void;
}

export function MenuPageElement({ data, isEditing, onChange, availablePages = [], onNavigate }: MenuPageElementProps) {
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

  const handleMenuItemClick = (item: any) => {
    if (item.type === 'internal' && item.path && onNavigate) {
      // Find the page by path and navigate to its ID
      const targetPage = availablePages.find(page => page.path === item.path);
      if (targetPage) {
        onNavigate(targetPage.id);
      }
    } else if (item.type === 'external' && item.href) {
      // Open external links in new tab
      window.open(item.href, item.target || '_blank');
    }
  };

  const renderMenuPreview = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const visibleItems = data.items
      .filter(item => item.visible)
      .sort((a, b) => a.order - b.order);

    // Position-based wrapper classes - relative to card container, not full page
    const getWrapperClasses = () => {
      const baseClasses = 'bg-white shadow-sm border overflow-hidden';
      const positioning = data.style.fixed ? 'absolute z-50' : 'relative'; // Use absolute instead of fixed for card container
      
      switch (data.style.position) {
        case 'header':
          return `${baseClasses} ${positioning} top-0 left-0 right-0 ${data.style.sticky ? 'sticky' : ''}`;
        case 'footer':
          return `${baseClasses} ${positioning} bottom-0 left-0 right-0`;
        case 'floating-top-right':
          return `${baseClasses} ${positioning} top-2 right-2 rounded-lg shadow-lg max-w-xs`;
        case 'floating-top-left':
          return `${baseClasses} ${positioning} top-2 left-2 rounded-lg shadow-lg max-w-xs`;
        case 'sidebar-left':
          return `${baseClasses} ${positioning} top-0 left-0 bottom-0 w-48`;
        case 'sidebar-right':
          return `${baseClasses} ${positioning} top-0 right-0 bottom-0 w-48`;
        default:
          return `${baseClasses} rounded-lg`;
      }
    };

    const itemClasses = [
      'px-3 py-2 transition-all duration-200 cursor-pointer hover:opacity-80',
      data.style.variant === 'pills' ? 'rounded-full' : '',
      data.style.variant === 'tabs' ? 'border-b-2 border-transparent hover:border-current' : '',
      data.style.variant === 'underline' ? 'border-b-2 border-transparent hover:border-current' : '',
      data.style.variant === 'ghost' ? 'hover:bg-gray-100' : '',
      data.style.size === 'sm' ? 'text-sm px-2 py-1' : '',
      data.style.size === 'lg' ? 'text-lg px-4 py-3' : '',
    ].join(' ');

    // Floating hamburger menu (top right corner style)
    if (data.style.position === 'floating-top-right' || data.style.position === 'floating-top-left') {
      return (
        <div className={getWrapperClasses()}>
          {/* Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-3 transition-colors hover:bg-gray-50"
            style={{
              backgroundColor: data.style.bg,
              color: data.style.fg,
            }}
          >
            <div className="w-6 h-6 relative">
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </div>
          </button>

          {/* Dropdown Menu */}
          <div className={`absolute ${data.style.position === 'floating-top-right' ? 'right-0' : 'left-0'} top-full mt-2 w-48 bg-white rounded-lg shadow-lg border transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}>
            <div className="py-2">
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="block px-4 py-3 text-left transition-all duration-200 cursor-pointer hover:bg-gray-50"
                  style={{ color: data.style.fg }}
                  onClick={() => handleMenuItemClick(item)}
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
        </div>
      );
    }

    // Sidebar menu
    if (data.style.position === 'sidebar-left' || data.style.position === 'sidebar-right') {
      return (
        <div className={getWrapperClasses()}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h3 className="font-semibold" style={{ color: data.style.fg }}>
                {data.title}
              </h3>
            </div>
            <div className="flex-1 py-4">
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="block px-4 py-3 text-left transition-all duration-200 cursor-pointer hover:bg-gray-50"
                  style={{ color: data.style.fg }}
                  onClick={() => handleMenuItemClick(item)}
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
        </div>
      );
    }

    // Header/Footer/Default menu styles
    const getMenuClasses = () => {
      if (data.style.position === 'header') {
        return 'flex items-center justify-between p-4';
      }
      if (data.style.position === 'footer') {
        return 'flex items-center justify-center p-4';
      }
      return data.style.orientation === 'vertical' ? 'flex flex-col gap-2 p-4' : 'flex flex-row flex-wrap gap-2 p-4';
    };

    return (
      <div className={getWrapperClasses()}>
        {/* Header style with brand area */}
        {data.style.position === 'header' && (
          <div className="flex items-center justify-between p-4">
            <div className="font-semibold" style={{ color: data.style.fg }}>
              {data.title}
            </div>
            <div className="hidden md:flex gap-2">
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className={itemClasses}
                  onClick={() => handleMenuItemClick(item)}
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
            {/* Mobile hamburger for header */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ color: data.style.fg }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}

        {/* Footer style */}
        {data.style.position === 'footer' && (
          <div className="flex items-center justify-center p-4 gap-4">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className={itemClasses}
                onClick={() => handleMenuItemClick(item)}
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
        )}

        {/* Default menu style */}
        {data.style.position === 'default' && (
          <div className={getMenuClasses()}>
            {/* Desktop Menu */}
            <div className={`hidden md:flex gap-2 ${data.style.orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'}`}>
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className={itemClasses}
                  onClick={() => handleMenuItemClick(item)}
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

            {/* Mobile Menu for default style */}
            {data.style.mobileCollapse && (
              <>
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                <div className={`md:hidden transition-all duration-300 ease-in-out border-t ${
                  isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="p-2 space-y-1">
                    {visibleItems.map((item) => (
                      <div
                        key={item.id}
                        className="block px-4 py-3 text-left transition-all duration-200 cursor-pointer hover:bg-gray-50 rounded-lg"
                        style={{ color: data.style.fg }}
                        onClick={() => handleMenuItemClick(item)}
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
          </div>
        )}

        {/* Mobile dropdown for header */}
        {data.style.position === 'header' && isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="py-2">
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="block px-4 py-3 text-left transition-all duration-200 cursor-pointer hover:bg-gray-50"
                  style={{ color: data.style.fg }}
                  onClick={() => handleMenuItemClick(item)}
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

        {/* Hide positioning controls in builder, only show in card view */}
        {!isEditing && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Menu Position</label>
              <Select value={data.style.position || 'default'} onValueChange={(value: any) => updateStyle({ position: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="header">Modern Header</SelectItem>
                  <SelectItem value="footer">Footer Menu</SelectItem>
                  <SelectItem value="floating-top-right">Floating Top Right (Hamburger)</SelectItem>
                  <SelectItem value="floating-top-left">Floating Top Left</SelectItem>
                  <SelectItem value="sidebar-left">Sidebar Left</SelectItem>
                  <SelectItem value="sidebar-right">Sidebar Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={data.style.fixed || false}
                  onCheckedChange={(checked) => updateStyle({ fixed: checked })}
                  data-testid="switch-fixed"
                />
                <label className="text-sm font-medium">Fixed Position</label>
              </div>

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
          </>
        )}
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