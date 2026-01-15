import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
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
  style: {
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
  };
}

interface MenuElementProps {
  baseUrl: string;
  items: MenuItem[];
  onTrack?: (eventName: string, payload: any) => void;
}

export function MenuElement({ baseUrl, items, onTrack }: MenuElementProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Filter and sort visible items
  const visibleItems = items
    .filter(item => item.visible)
    .sort((a, b) => a.order - b.order);

  if (visibleItems.length === 0) return null;

  // Get style config (use first item's style as global config)
  const style = visibleItems[0]?.style || {};

  // Check if current location matches item
  const isActiveItem = (item: MenuItem) => {
    if (item.type === 'external') return false;
    const itemPath = item.path ? `${baseUrl}/${item.path}` : baseUrl;
    return location === itemPath;
  };

  // Handle click tracking
  const handleItemClick = (item: MenuItem) => {
    onTrack?.('menu_click', {
      itemId: item.id,
      type: item.type,
      path: item.path,
      href: item.href,
    });

    if (style.mobileCollapse) {
      setMobileOpen(false);
    }
  };

  // Style classes based on configuration
  const getMenuClasses = () => {
    const classes = [
      'navigation-menu',
      style.orientation === 'vertical' ? 'flex-col' : 'flex-row',
      style.sticky ? 'sticky top-0 z-50' : '',
      style.shadow ? 'shadow-md' : '',
    ];

    // Radius
    const radiusMap = {
      none: 'rounded-none',
      sm: 'rounded-sm', 
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl'
    };
    classes.push(radiusMap[style.radius] || 'rounded-lg');

    return cn(classes);
  };

  const getItemClasses = (item: MenuItem, isActive: boolean) => {
    const classes = [];
    
    // Base styling
    const sizeMap = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-base', 
      lg: 'px-4 py-3 text-lg'
    };
    classes.push(sizeMap[style.size] || 'px-3 py-2');

    // Variant styling
    if (style.variant === 'tabs') {
      classes.push('border-b-2 border-transparent');
      if (isActive) {
        classes.push('border-current font-semibold');
      }
    } else if (style.variant === 'pills') {
      classes.push('rounded-full');
      if (isActive) {
        classes.push('font-semibold');
      }
    } else if (style.variant === 'underline') {
      if (isActive && style.underlineActive) {
        classes.push('underline decoration-2 font-semibold');
      }
    } else if (style.variant === 'ghost') {
      if (isActive) {
        classes.push('opacity-100 font-medium');
      } else {
        classes.push('opacity-70');
      }
    }

    // Colors
    const textColor = isActive ? style.fgActive : style.fg;
    const bgColor = isActive && style.variant === 'pills' ? style.fgActive : style.bg;

    return cn(classes);
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = isActiveItem(item);
    const itemClasses = getItemClasses(item, isActive);
    
    const content = (
      <span className="flex items-center gap-2">
        {item.icon && <span>{item.icon}</span>}
        {item.label}
      </span>
    );

    if (item.type === 'external') {
      return (
        <a
          key={item.id}
          href={item.href}
          target={item.target || '_blank'}
          rel={item.rel || 'noopener noreferrer'}
          className={itemClasses}
          onClick={() => handleItemClick(item)}
          data-testid={`menu-external-${item.id}`}
          style={{
            color: isActive ? style.fgActive : style.fg,
            backgroundColor: isActive && style.variant === 'pills' ? style.fgActive + '20' : style.bg,
            fontWeight: isActive ? style.weightActive : style.weight,
          }}
        >
          {content}
        </a>
      );
    }

    const linkPath = item.path ? `${baseUrl}/${item.path}` : baseUrl;
    return (
      <Link
        key={item.id}
        href={linkPath}
        className={itemClasses}
        onClick={() => handleItemClick(item)}
        data-testid={`menu-internal-${item.id}`}
        style={{
          color: isActive ? style.fgActive : style.fg,
          backgroundColor: isActive && style.variant === 'pills' ? style.fgActive + '20' : style.bg,
          fontWeight: isActive ? style.weightActive : style.weight,
        }}
      >
        {content}
      </Link>
    );
  };

  // Mobile menu toggle
  const MobileMenu = () => (
    <div className="md:hidden">
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="p-2"
        data-testid="menu-mobile-toggle"
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border rounded-lg p-4">
          <nav className="flex flex-col gap-2">
            {visibleItems.map(renderMenuItem)}
          </nav>
        </div>
      )}
    </div>
  );

  // Desktop menu
  const DesktopMenu = () => (
    <nav 
      className={cn(
        'hidden md:flex',
        style.orientation === 'vertical' ? 'flex-col' : 'flex-row'
      )}
      style={{ gap: style.gap || 8 }}
      data-testid="menu-desktop"
      role="navigation"
      aria-label="Page navigation"
    >
      {visibleItems.map(renderMenuItem)}
    </nav>
  );

  return (
    <div 
      className={getMenuClasses()}
      style={{ 
        backgroundColor: style.bg,
        borderColor: style.border 
      }}
      data-testid="menu-element"
    >
      {style.mobileCollapse ? (
        <>
          <MobileMenu />
          <DesktopMenu />
        </>
      ) : (
        <nav 
          className={cn(
            'flex',
            style.orientation === 'vertical' ? 'flex-col' : 'flex-row'
          )}
          style={{ gap: style.gap || 8 }}
          data-testid="menu-nav"
          role="navigation"
          aria-label="Page navigation"
        >
          {visibleItems.map(renderMenuItem)}
        </nav>
      )}
    </div>
  );
}