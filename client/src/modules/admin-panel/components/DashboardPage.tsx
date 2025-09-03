import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ExternalLink, Copy, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';

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
  // Current time for greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : 
                  currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Fetch metrics data
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ['/api/admin/metrics/summary'],
    initialData: {
      weeklyClicks: 10,
      weeklyVisitor: 2,
      monthlyVisitor: 118
    }
  });

  // Fetch links data
  const { data: links = [], isLoading: linksLoading } = useQuery<LinkItem[]>({
    queryKey: ['/api/admin/links'],
    initialData: []
  });

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  const handleViewLink = (url: string) => {
    window.open(url, '_blank');
  };

  const MetricCard = ({ title, value, description }: { title: string; value: number; description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {greeting} Abdur
        </h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard 
          title="Weekly Clicks" 
          value={metrics?.weeklyClicks || 0} 
          description="Clicks in the last 7 days" 
        />
        <MetricCard 
          title="Weekly Visitor" 
          value={metrics?.weeklyVisitor || 0} 
          description="Visitors in the last 7 days" 
        />
        <MetricCard 
          title="Monthly Visitor" 
          value={metrics?.monthlyVisitor || 0} 
          description="Visitors in the last 30 days" 
        />
      </div>

      {/* All Links Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Links ({links.length})</span>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardTitle>
          <CardDescription>
            All public business card links on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linksLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {links.slice(0, 10).map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                        {link.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{link.title}</p>
                      <p className="text-xs text-gray-500">{link.ownerName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {link.visitorCount} visitors
                        </Badge>
                        <Badge variant="outline" className="text-xs">
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