import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LockedFeature } from '@/components/LockedFeature';
import { MoreHorizontal, ExternalLink, Copy, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import AdminBroadcastButton from '@/components/AdminBroadcastButton';
import { useAuth } from '@/hooks/useAuth';

interface DashboardMetrics {
  weeklyClicks: number;
  weeklyVisitor: number;
  monthlyVisitor: number;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  ownerName: string;
  visitorCount: number;
  clicksCount: number;
  initials: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  
  // Current time for greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : 
                  currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Fetch metrics data
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/admin/metrics/summary'],
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  // Fetch links data
  const { data: links = [], isLoading: linksLoading } = useQuery<LinkItem[]>({
    queryKey: ['/api/admin/links'],
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  const handleViewLink = (url: string) => {
    window.open(url, '_blank');
  };

  const MetricCard = ({ title, value, description, isLoading }: { title: string; value: number; description: string; isLoading?: boolean }) => (
    <Card className="border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
        <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</CardTitle>
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-7 sm:h-8 w-20 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg"></div>
            <div className="h-2 sm:h-3 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Premium Greeting Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {greeting}, Abdur 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Platform metrics & overview</p>
        </div>
        <AdminBroadcastButton />
      </div>

      {/* Premium Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        <MetricCard 
          title="Weekly Clicks" 
          value={metrics?.weeklyClicks || 0} 
          description="Clicks in the last 7 days" 
          isLoading={metricsLoading}
        />
        <MetricCard 
          title="Weekly Visitor" 
          value={metrics?.weeklyVisitor || 0} 
          description="Visitors in the last 7 days" 
          isLoading={metricsLoading}
        />
        <MetricCard 
          title="Monthly Visitor" 
          value={metrics?.monthlyVisitor || 0} 
          description="Visitors in the last 30 days" 
          isLoading={metricsLoading}
        />
      </div>

      {/* CRM Module Card - with lock overlay if not available */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LockedFeature feature="analytics" premium={true} showOverlay={!isAdmin}>
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
              <CardDescription>View detailed visitor stats and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Open Analytics</Button>
            </CardContent>
          </Card>
        </LockedFeature>

        <LockedFeature feature="crm" premium={true} showOverlay={!isAdmin}>
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">CRM & Lead Management</CardTitle>
              <CardDescription>Manage contacts and track leads</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Open CRM</Button>
            </CardContent>
          </Card>
        </LockedFeature>

        <LockedFeature feature="appointments" premium={true} showOverlay={!isAdmin}>
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Appointment Booking</CardTitle>
              <CardDescription>Manage calendars and schedule meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Open Appointments</Button>
            </CardContent>
          </Card>
        </LockedFeature>

        <LockedFeature feature="nfc" premium={true} showOverlay={!isAdmin}>
          <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">NFC Management</CardTitle>
              <CardDescription>Manage NFC tags and digital cards</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">Open NFC</Button>
            </CardContent>
          </Card>
        </LockedFeature>
      </div>

      {/* All Links Section - Premium Design */}
      <Card className="border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 shadow-md overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">All Links <span className="text-blue-600 dark:text-blue-400">({links.length})</span></span>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg w-full sm:w-auto" size="sm">
              View All
            </Button>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            All public business card links on the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          {linksLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 sm:space-x-4 animate-pulse">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                  <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {links.slice(0, 10).map((link) => (
                <div key={link.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700/50 dark:hover:to-gray-700/30 transition-all duration-200">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <Avatar className="h-8 sm:h-10 w-8 sm:w-10 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs sm:text-sm font-semibold">
                        {link.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{link.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{link.ownerName}</p>
                      <div className="flex items-center space-x-1 sm:space-x-2 mt-0.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {link.visitorCount} visitors
                        </Badge>
                        <Badge variant="outline" className="text-xs px-2 py-0.5 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                          {link.clicksCount} clicks
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewLink(link.url)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyLink(link.url)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Analytics
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}