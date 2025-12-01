import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  Image,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  Layout,
  Ticket,
  UserPlus,
  TrendingUp,
  Palette,
  Layers,
  Percent,
  ShoppingCart,
  Package,
  Star,
  BarChart3,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Plans',
    href: '/admin/plans',
    icon: CreditCard,
  },
  {
    title: 'Coupons',
    href: '/admin/coupons',
    icon: Ticket,
  },
  {
    title: 'Templates',
    href: '/admin/templates',
    icon: Layout,
  },
  {
    title: 'Icons',
    href: '/admin/icons',
    icon: Palette,
  },
  {
    title: 'Elements',
    href: '/admin/elements',
    icon: Layers,
  },
  {
    title: 'Affiliates',
    href: '/admin/affiliates',
    icon: UserPlus,
  },
  {
    title: 'Shop Management',
    href: '/admin/shop',
    icon: ShoppingCart,
    submenu: [
      {
        title: 'Products',
        href: '/admin/shop',
        icon: Package,
      },
      {
        title: 'Commissions',
        href: '/admin/shop/commission',
        icon: Percent,
      },
      {
        title: 'Reviews',
        href: '/admin/reviews',
        icon: Star,
      },
    ],
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('Shop Management');

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      window.location.href = '/admin';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const HorizontalNavContent = () => (
    <div className="flex items-center justify-center space-x-2 overflow-x-auto scrollbar-hide py-1">
      {sidebarNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        const hasSubmenu = (item as any).submenu?.length > 0;
        
        if (hasSubmenu) {
          return (
            <div key={item.href} className="flex items-center gap-1">
              {(item as any).submenu.map((subitem: any) => {
                const SubIcon = subitem.icon;
                const isSubActive = location === subitem.href;
                return (
                  <Link 
                    key={subitem.href} 
                    href={subitem.href} 
                    data-testid={`nav-${subitem.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`
                      group relative flex items-center gap-2 px-4 py-2.5 
                      text-sm font-medium rounded-xl whitespace-nowrap 
                      transition-all duration-200 ease-in-out
                      ${isSubActive 
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <SubIcon className={`w-4 h-4 transition-transform duration-200 ${
                      isSubActive ? 'text-white' : 'group-hover:scale-110'
                    }`} />
                    <span className="hidden sm:inline">{subitem.title}</span>
                    {isSubActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-white rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        }
        
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
            className={`
              group relative flex items-center gap-2 px-4 py-2.5 
              text-sm font-medium rounded-xl whitespace-nowrap 
              transition-all duration-200 ease-in-out
              ${isActive 
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50'
              }
            `}
          >
            <Icon className={`w-4 h-4 transition-transform duration-200 ${
              isActive ? 'text-white' : 'group-hover:scale-110'
            }`} />
            <span className="hidden sm:inline">{item.title}</span>
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-white rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
      {/* Premium Modern Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            {/* Logo - Left (Mobile only) */}
            <div className="flex items-center lg:hidden flex-shrink-0">
              <Link href="/admin" className="flex items-center space-x-2">
                <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xs sm:text-sm">2T</span>
                </div>
              </Link>
            </div>

            {/* Center: Navigation (Desktop) */}
            <div className="hidden lg:flex flex-1 items-center justify-center">
              <HorizontalNavContent />
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-7 sm:h-8 w-7 sm:w-8 rounded-full p-0 hover:bg-blue-50 dark:hover:bg-gray-700/50">
                    <Avatar className="h-7 sm:h-8 w-7 sm:w-8">
                      <AvatarImage src="" alt="Admin" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs sm:text-sm font-bold">
                        AB
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">abdur321</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        admin@talkl.ink
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile menu button */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden h-9 w-9 hover:bg-blue-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                    data-testid="button-mobile-menu"
                  >
                    <Menu className="h-4 sm:h-5 w-4 sm:w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 sm:w-72">
                  <div className="h-full px-4 py-6 overflow-y-auto bg-white dark:bg-gray-800">
                    <div className="flex items-center mb-8 px-2">
                      <Link href="/admin" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">2T</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                          TalkLink
                        </span>
                      </Link>
                    </div>
                    <nav className="space-y-2">
                      {sidebarNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.href;
                        const hasSubmenu = (item as any).submenu?.length > 0;
                        const isExpanded = expandedSection === item.title;
                        
                        if (hasSubmenu) {
                          return (
                            <div key={item.href}>
                              <button
                                onClick={() => setExpandedSection(isExpanded ? null : item.title)}
                                className={`
                                  w-full group flex items-center justify-between gap-3 px-4 py-3 
                                  rounded-xl font-medium transition-all duration-200
                                  text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50
                                `}
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:scale-110" />
                                  <span>{item.title}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                              {isExpanded && (
                                <div className="pl-6 space-y-1">
                                  {(item as any).submenu.map((subitem: any) => {
                                    const SubIcon = subitem.icon;
                                    const isSubActive = location === subitem.href;
                                    return (
                                      <Link
                                        key={subitem.href}
                                        href={subitem.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`
                                          group flex items-center gap-3 px-4 py-2 
                                          rounded-lg font-medium transition-all duration-200
                                          ${isSubActive 
                                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                          }
                                        `}
                                      >
                                        <SubIcon className={`w-4 h-4 ${
                                          isSubActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                                        }`} />
                                        <span className={isSubActive ? 'text-white' : ''}>{subitem.title}</span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }
                        
                        return (
                          <Link 
                            key={item.href} 
                            href={item.href} 
                            onClick={() => setSidebarOpen(false)}
                            className={`
                              group flex items-center gap-3 px-4 py-3 
                              rounded-xl font-medium transition-all duration-200
                              ${isActive 
                                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' 
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                              }
                            `}
                          >
                            <Icon className={`w-5 h-5 transition-transform duration-200 ${
                              isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:scale-110'
                            }`} />
                            <span className={isActive ? 'text-white' : ''}>{item.title}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="py-4 sm:py-6 md:py-8">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}