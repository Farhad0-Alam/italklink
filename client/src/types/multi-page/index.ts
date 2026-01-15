export interface MenuItemConfig {
  id: string;
  type: 'internal' | 'external';
  label: string;
  path?: string; // for internal routes
  href?: string; // for external links
  target?: '_self' | '_blank';
  rel?: string;
  icon?: string;
  order: number;
  visible: boolean;
  style: MenuStyle;
}

export interface MenuStyle {
  variant: 'tabs' | 'pills' | 'underline' | 'ghost';
  orientation: 'horizontal' | 'vertical';
  radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  size: 'sm' | 'md' | 'lg';
  gap: number;
  weightActive: number;
  weight: number;
  underlineActive: boolean;
  shadow: boolean;
  sticky: boolean;
  mobileCollapse: boolean;
  bg: string;
  fg: string;
  fgActive: string;
  border: string;
}

export interface PageConfig {
  key: string;
  path: string;
  label: string;
  visible: boolean;
}

export interface MultiPageProps {
  baseUrl: string;
  menu: MenuItemConfig[];
  pages: PageConfig[];
  onTrack?: (eventName: string, payload: any) => void;
}

export interface MultiPageConfig {
  enabled: boolean;
  defaultPages: PageConfig[];
  defaultMenuStyle: MenuStyle;
  settings?: Record<string, any>;
}