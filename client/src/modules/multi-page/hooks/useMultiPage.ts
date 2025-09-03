import { useState, useCallback } from 'react';
import { MenuItemConfig, PageConfig, MenuStyle } from '../types';

export function useMultiPage() {
  const [pages, setPages] = useState<PageConfig[]>([]);
  const [menu, setMenu] = useState<MenuItemConfig[]>([]);

  const addPage = useCallback((page: PageConfig) => {
    setPages(prev => [...prev, page]);
  }, []);

  const removePage = useCallback((key: string) => {
    setPages(prev => prev.filter(p => p.key !== key));
    setMenu(prev => prev.filter(m => m.type !== 'internal' || m.path !== key));
  }, []);

  const updatePage = useCallback((key: string, updates: Partial<PageConfig>) => {
    setPages(prev => prev.map(p => p.key === key ? { ...p, ...updates } : p));
  }, []);

  const addMenuItem = useCallback((menuItem: MenuItemConfig) => {
    setMenu(prev => [...prev, menuItem]);
  }, []);

  const removeMenuItem = useCallback((id: string) => {
    setMenu(prev => prev.filter(m => m.id !== id));
  }, []);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItemConfig>) => {
    setMenu(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const updateMenuStyle = useCallback((style: Partial<MenuStyle>) => {
    setMenu(prev => prev.map(m => ({ ...m, style: { ...m.style, ...style } })));
  }, []);

  const getDefaultPages = useCallback((): PageConfig[] => [
    { key: 'overview', path: '', label: 'Home', visible: true },
    { key: 'about', path: 'about', label: 'About', visible: true },
    { key: 'services', path: 'services', label: 'Services', visible: false },
    { key: 'gallery', path: 'gallery', label: 'Gallery', visible: false },
    { key: 'contact', path: 'contact', label: 'Contact', visible: true },
  ], []);

  const getDefaultMenuStyle = useCallback((): MenuStyle => ({
    variant: 'tabs',
    orientation: 'horizontal',
    radius: 'lg',
    size: 'md',
    gap: 8,
    weightActive: 600,
    weight: 400,
    underlineActive: true,
    shadow: false,
    sticky: true,
    mobileCollapse: true,
    bg: 'transparent',
    fg: '#0f172a',
    fgActive: '#111827',
    border: 'rgba(0,0,0,0.08)'
  }), []);

  return {
    pages,
    menu,
    addPage,
    removePage,
    updatePage,
    addMenuItem,
    removeMenuItem,
    updateMenuItem,
    updateMenuStyle,
    getDefaultPages,
    getDefaultMenuStyle,
    setPages,
    setMenu,
  };
}