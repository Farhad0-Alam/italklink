import { useState, useEffect } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin' | 'super_admin';
  planType: 'free' | 'pro' | 'enterprise';
  businessCardsCount: number;
  businessCardsLimit: number;
  subscriptionStatus: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalBusinessCards: number;
  totalTemplates: number;
  monthlyActiveUsers: number;
  weeklyClicks: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  totalLinks: number;
}

interface BusinessCard {
  id: string;
  fullName: string;
  title: string;
  company?: string;
  shareSlug?: string;
  viewCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// Admin Layout Component
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-orange-500 text-2xl font-bold">2TalkLink</div>
              <span className="text-slate-500 text-sm">Admin</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/admin" className={`text-sm font-medium hover:text-orange-500 ${location === '/admin' ? 'text-orange-500' : 'text-slate-600 dark:text-slate-400'}`}>
                Dashboard
              </Link>
              <Link href="/admin/users" className={`text-sm font-medium hover:text-orange-500 ${location === '/admin/users' ? 'text-orange-500' : 'text-slate-600 dark:text-slate-400'}`}>
                Users
              </Link>
              <Link href="/admin/templates" className={`text-sm font-medium hover:text-orange-500 ${location === '/admin/templates' ? 'text-orange-500' : 'text-slate-600 dark:text-slate-400'}`}>
                Templates
              </Link>
              <Link href="/admin/analytics" className={`text-sm font-medium hover:text-orange-500 ${location === '/admin/analytics' ? 'text-orange-500' : 'text-slate-600 dark:text-slate-400'}`}>
                Analytics
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                FA
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-slate-900 dark:text-white">Hi, Farhad</div>
                <div className="text-xs text-slate-500">Super Admin</div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

// Dashboard Overview Component
const AdminDashboard = () => {
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });
  
  const { data: recentCards } = useQuery<BusinessCard[]>({
    queryKey: ['/api/admin/recent-cards'],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Overall Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400">Platform overview and key metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <i className="fas fa-mouse-pointer text-white text-sm"></i>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-slate-900">{stats?.weeklyClicks || 9}</div>
                <div className="text-sm text-slate-600">Weekly Clicks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <i className="fas fa-eye text-white text-sm"></i>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-slate-900">{stats?.weeklyVisitors || 90}</div>
                <div className="text-sm text-slate-600">Weekly Visitor</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-pink-50 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                <i className="fas fa-users text-white text-sm"></i>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-slate-900">{stats?.monthlyVisitors || 113}</div>
                <div className="text-sm text-slate-600">Monthly Visitor</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <i className="fas fa-link text-white text-sm"></i>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-slate-900">{stats?.totalLinks || 74}</div>
                <div className="text-sm text-slate-600">All Created Links</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Links ({stats?.totalLinks || 74})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCards?.map((card, index) => (
              <div key={card.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {card.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{card.fullName}</div>
                    <div className="text-sm text-slate-500">
                      {card.shareSlug ? `2talklink.com/${card.shareSlug}` : 'No custom URL'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-slate-600">
                    <span className="text-orange-500">👁 Visitor ({card.viewCount})</span>
                    <span className="ml-4 text-green-500">👆 Clicks (0)</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    By: {card.user?.firstName} {card.user?.lastName}
                  </div>
                  <Button variant="outline" size="sm">
                    <i className="fas fa-edit text-xs"></i>
                  </Button>
                </div>
              </div>
            )) || (
              // Placeholder data
              <>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">R</div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">RoqehTap</div>
                      <div className="text-sm text-slate-500">2talklink.com/roqehtap</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-slate-600">
                      <span className="text-orange-500">👁 Visitor (3)</span>
                      <span className="ml-4 text-green-500">👆 Clicks (5)</span>
                    </div>
                    <div className="text-sm text-slate-500">By: Roqehtap</div>
                    <Button variant="outline" size="sm">
                      <i className="fas fa-edit text-xs"></i>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Users Management Component
const UsersManagement = () => {
  const [search, setSearch] = useState("");
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/admin/users', search],
  });

  const handleSuspendUser = (userId: string) => {
    // TODO: Implement suspend user
    console.log('Suspend user:', userId);
  };

  const handleDeleteUser = (userId: string) => {
    // TODO: Implement delete user
    console.log('Delete user:', userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users ({users?.length || 34})</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage all platform users</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <i className="fas fa-plus mr-2"></i>
          Add New User
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm"></i>
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">#SN.</th>
                  <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Name</th>
                  <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Email</th>
                  <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Registration Date</th>
                  <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Plan Validity</th>
                  <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user, index) => (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="p-4 text-slate-600 dark:text-slate-400">#{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="p-4">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Active
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                          Visit
                        </Button>
                        <Button variant="outline" size="sm" className="text-slate-600 border-slate-200 hover:bg-slate-50">
                          <i className="fas fa-edit text-xs"></i>
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteUser(user.id)}>
                          <i className="fas fa-trash text-xs"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) || (
                  // Placeholder data when no users loaded
                  Array.from({ length: 10 }, (_, index) => (
                    <tr key={index} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="p-4 text-slate-600 dark:text-slate-400">#{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            U
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">User {index + 1}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">user{index + 1}@example.com</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">21 Aug 2025 1:38 AM</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">21-Aug-2026</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Active
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                            Visit
                          </Button>
                          <Button variant="outline" size="sm" className="text-slate-600 border-slate-200 hover:bg-slate-50">
                            <i className="fas fa-edit text-xs"></i>
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                            <i className="fas fa-trash text-xs"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Rows per page: 10
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">1-10 of 34</span>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" disabled>
              <i className="fas fa-chevron-left text-xs"></i>
            </Button>
            <Button variant="outline" size="sm">
              <i className="fas fa-chevron-right text-xs"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Templates Management Component
const TemplatesManagement = () => {
  const templates = [
    { id: 1, name: "Template-8", category: "business", preview: "/api/placeholder/300/400", isActive: true },
    { id: 2, name: "Template-7", category: "creative", preview: "/api/placeholder/300/400", isActive: true },
    { id: 3, name: "Template-6", category: "minimal", preview: "/api/placeholder/300/400", isActive: true },
    { id: 4, name: "Template-5", category: "corporate", preview: "/api/placeholder/300/400", isActive: true },
    { id: 5, name: "Theme-4", category: "modern", preview: "/api/placeholder/300/400", isActive: true },
    { id: 6, name: "Theme-3", category: "elegant", preview: "/api/placeholder/300/400", isActive: true },
    { id: 7, name: "Theme-2", category: "professional", preview: "/api/placeholder/300/400", isActive: true },
    { id: 8, name: "Theme-1", category: "classic", preview: "/api/placeholder/300/400", isActive: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Templates ({templates.length})</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage business card templates</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <i className="fas fa-plus mr-2"></i>
          Add New
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm"></i>
          <Input placeholder="Search..." className="pl-10" />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-shadow relative">
            <div className="aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-t-lg relative overflow-hidden">
              {/* Template preview placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl text-slate-400">
                  <i className="fas fa-id-card"></i>
                </div>
              </div>
              
              {/* Actions overlay */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <i className="fas fa-eye text-xs"></i>
                  </Button>
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <i className="fas fa-edit text-xs"></i>
                  </Button>
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                    <i className="fas fa-trash text-xs"></i>
                  </Button>
                </div>
              </div>

              {/* Status indicator */}
              <div className="absolute top-2 left-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-slate-500 capitalize">{template.category}</p>
                </div>
                <Button variant="outline" size="sm">
                  <i className="fas fa-ellipsis-v text-xs"></i>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Main Admin Component
export default function Admin() {
  const [location] = useLocation();

  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/users" component={UsersManagement} />
        <Route path="/admin/templates" component={TemplatesManagement} />
        <Route>
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Page Not Found</h2>
            <Link href="/admin">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </Route>
      </Switch>
    </AdminLayout>
  );
}