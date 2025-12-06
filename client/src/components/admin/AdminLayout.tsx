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
    title: 'Affiliates',
    href: '/admin/affiliates',
    icon: UserPlus,
  },
  {
    title: 'Products',
    href: '/admin/shop',
    icon: Package,
    group: 'Shop Management',
  },
  {
    title: 'Commissions',
    href: '/admin/shop/commission',
    icon: Percent,
    group: 'Shop Management',
  },
  {
    title: 'Reviews',
    href: '/admin/reviews',
    icon: Star,
    group: 'Shop Management',
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
    <div className="flex items-center justify-center space-x-1 overflow-x-auto scrollbar-hide py-1">
      {sidebarNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        const isGrouped = (item as any).group === 'Shop Management';
        
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
            className={`
              group relative inline-flex items-center gap-1.5 px-3 py-2 
              text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap 
              transition-all duration-200 ease-in-out cursor-pointer
              ${isActive 
                ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md' 
                : isGrouped
                ? 'text-green-700 dark:text-green-300 hover:bg-green-50/50 dark:hover:bg-green-950/30 border border-green-200/40 dark:border-green-800/40'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }
            `}
          >
            <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 flex-shrink-0 ${
              isActive ? 'text-white' : 'group-hover:scale-110'
            }`} />
            <span>{item.title}</span>
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
                <div className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center">
                  <svg viewBox="0 0 1000 1000" className="w-7 sm:w-8 h-7 sm:h-8">
                    <path fill="#FFFFFF" d="M817.9,999.9H182.1C81.8,999.9-0.2,917.8-0.2,817.5v-635C-0.2,82.2,81.8,0.1,182.1,0.1h635.7c100.3,0,182.4,82.1,182.4,182.4v635C1000.2,917.8,918.2,999.9,817.9,999.9z"/>
                    <path fill="none" stroke="#16A34A" strokeWidth="70" strokeMiterlimit="10" d="M315,857c-116.4-65.3-195-189.8-195-332.7C120,313.7,290.7,143,501.3,143c210.6,0,381.2,170.7,381.2,381.2c0,82.3-26.7,166.9-77.1,232.3c-47.2,61.2-124.5,112.4-204.8,97.6c-27.8-5.1-55-17.9-74.7-38.6c-17.8-18.8-26.3-42.5-27.2-68V437"/>
                    <path fill="#16A34A" d="M498.5,402L498.5,402c-24.6,0-44.5-19.9-44.5-44.5v0c0-24.6,19.9-44.5,44.5-44.5h0c24.6,0,44.5,19.9,44.5,44.5v0C543,382.1,523.1,402,498.5,402z"/>
                  </svg>
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
                        admin@italklink.com
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
                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">iT</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                          iTalkLink
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
                            <div key={item.href} className="space-y-1">
                              <button
                                onClick={() => setExpandedSection(isExpanded ? null : item.title)}
                                className={`
                                  w-full group flex items-center justify-between gap-3 px-4 py-3 
                                  rounded-xl font-medium transition-all duration-200
                                  ${isExpanded 
                                    ? 'bg-gradient-to-r from-green-50 to-green-50/50 dark:from-green-950/30 dark:to-orange-950/10 border border-green-200/60 dark:border-green-800/40' 
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                  }
                                `}
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className={`w-5 h-5 transition-all ${isExpanded ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'} group-hover:scale-110`} />
                                  <span className={isExpanded ? 'text-green-900 dark:text-green-100 font-semibold' : ''}>{item.title}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-all duration-300 ${isExpanded ? 'rotate-180 text-green-600 dark:text-green-400' : 'text-gray-500'}`} />
                              </button>
                              {isExpanded && (
                                <div className="px-2 py-1 space-y-0.5 bg-gradient-to-b from-orange-50/40 to-transparent dark:from-green-950/10 rounded-lg">
                                  {(item as any).submenu.map((subitem: any) => {
                                    const SubIcon = subitem.icon;
                                    const isSubActive = location === subitem.href;
                                    return (
                                      <Link
                                        key={subitem.href}
                                        href={subitem.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`
                                          group flex items-center gap-3 px-3 py-2.5 
                                          rounded-lg font-medium transition-all duration-200
                                          ${isSubActive 
                                            ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md shadow-green-600/25' 
                                            : 'text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-700/30'
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
                                ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg shadow-green-600/30' 
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