import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Calendar as CalendarIcon, TrendingUp, Eye, MousePointerClick, Users,
  Monitor, Smartphone, Tablet, Download, Globe, MapPin, ArrowLeft
} from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

const ORANGE_COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

interface CardAnalyticsProps {
  className?: string;
}

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type PeriodType = '7d' | '30d' | '90d' | '6m' | '1y' | 'custom';

export default function CardAnalytics({ className }: CardAnalyticsProps) {
  const [location] = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('30d');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedCard, setSelectedCard] = useState<string>('');
  
  // Read cardId from URL query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cardIdFromUrl = params.get('cardId');
    if (cardIdFromUrl) {
      setSelectedCard(cardIdFromUrl);
    }
  }, []);
  
  // Fetch user's business cards for the selector
  const { data: businessCards = [] } = useQuery({
    queryKey: ['/api/business-cards'],
    queryFn: async () => {
      const response = await fetch('/api/business-cards');
      if (!response.ok) throw new Error('Failed to fetch business cards');
      return response.json();
    },
  });
  
  // Fetch card analytics dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['card-analytics', 'dashboard', selectedPeriod, selectedCard, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedCard && { cardId: selectedCard }),
        ...(selectedPeriod === 'custom' && dateRange.from && dateRange.to && {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        })
      });
      const response = await fetch(`/api/analytics/cards/dashboard?${params}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    refetchInterval: 60000,
  });

  // Fetch trends data
  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['card-analytics', 'trends', selectedPeriod, selectedCard, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: selectedPeriod,
        granularity: 'day',
        ...(selectedCard && { cardId: selectedCard }),
        ...(selectedPeriod === 'custom' && dateRange.from && dateRange.to && {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        })
      });
      const response = await fetch(`/api/analytics/cards/trends?${params}`);
      if (!response.ok) throw new Error('Failed to fetch trends data');
      return response.json();
    },
    refetchInterval: 60000,
  });

  // Fetch card performance data
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['card-analytics', 'performance', selectedPeriod, selectedCard, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedCard && { cardId: selectedCard }),
        ...(selectedPeriod === 'custom' && dateRange.from && dateRange.to && {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        })
      });
      const response = await fetch(`/api/analytics/cards/performance?${params}`);
      if (!response.ok) throw new Error('Failed to fetch performance data');
      return response.json();
    },
    refetchInterval: 60000,
  });

  const isLoading = dashboardLoading || trendsLoading || performanceLoading;

  return (
    <div className={cn("container mx-auto py-6 space-y-6", className)}>
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950" data-testid="button-back-dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent" data-testid="text-card-analytics-title">
            Card Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your digital business card performance and visitor engagement
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedCard || 'all'} onValueChange={(value) => setSelectedCard(value === 'all' ? '' : value)} data-testid="select-card">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Cards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cards</SelectItem>
              {businessCards.map((card: any) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.fullName || 'Untitled Card'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedPeriod} onValueChange={(value: PeriodType) => setSelectedPeriod(value)} data-testid="select-period">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {selectedPeriod === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal" data-testid="button-date-range">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange as any}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="card-total-views" className="border-orange-200 dark:border-orange-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-total-views">
                {dashboardData.overview.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Card page visits
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-unique-visitors" className="border-orange-200 dark:border-orange-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-unique-visitors">
                {dashboardData.overview.uniqueVisitors.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Distinct visitors
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-clicks" className="border-orange-200 dark:border-orange-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-total-clicks">
                {dashboardData.overview.totalClicks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Button interactions
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-ctr" className="border-orange-200 dark:border-orange-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-ctr">
                {dashboardData.overview.clickThroughRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Engagement rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
          <TabsTrigger value="overview" data-testid="tab-overview" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Trends
          </TabsTrigger>
          <TabsTrigger value="devices" data-testid="tab-devices" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Devices
          </TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Click Actions */}
            <Card data-testid="card-top-actions">
              <CardHeader>
                <CardTitle>Top Click Actions</CardTitle>
                <CardDescription>Most clicked buttons and links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData?.clicksByAction?.slice(0, 5).map((action: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: ORANGE_COLORS[index % ORANGE_COLORS.length] }}></div>
                      <div>
                        <p className="text-sm font-medium">{action.label}</p>
                        <p className="text-xs text-muted-foreground capitalize">{action.action}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-orange-600">{action.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Locations */}
            <Card data-testid="card-top-locations">
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
                <CardDescription>Where your visitors are from</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData?.topLocations?.slice(0, 5).map((location: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">{location.country}</p>
                        {location.city && <p className="text-xs text-muted-foreground">{location.city}</p>}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-orange-600">{location.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6 mt-6">
          <Card data-testid="card-trends-chart">
            <CardHeader>
              <CardTitle>Views & Clicks Trends</CardTitle>
              <CardDescription>Daily view and click patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={trendsData?.trends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value as string), 'MMM dd, yyyy')}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stackId="1"
                      stroke="#f97316" 
                      fill="#f97316" 
                      name="Views"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stackId="2"
                      stroke="#fb923c" 
                      fill="#fb923c" 
                      name="Clicks"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="card-device-breakdown">
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Visitor device types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.deviceBreakdown || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {dashboardData?.deviceBreakdown?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={ORANGE_COLORS[index % ORANGE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-device-stats">
              <CardHeader>
                <CardTitle>Device Statistics</CardTitle>
                <CardDescription>Detailed device metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData?.deviceBreakdown?.map((device: any, index: number) => {
                  const Icon = device.device === 'mobile' ? Smartphone : 
                               device.device === 'tablet' ? Tablet : Monitor;
                  const total = dashboardData.deviceBreakdown.reduce((sum: number, d: any) => sum + d.count, 0);
                  const percentage = ((device.count / total) * 100).toFixed(1);
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium capitalize">{device.device}</p>
                          <p className="text-xs text-muted-foreground">{percentage}% of traffic</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-orange-600">{device.count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          <Card data-testid="card-card-performance">
            <CardHeader>
              <CardTitle>Card Performance</CardTitle>
              <CardDescription>Individual card metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData?.cards?.map((card: any) => (
                  <div key={card.cardId} className="border border-orange-200 dark:border-orange-900 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-orange-600">{card.cardTitle}</h4>
                        <p className="text-xs text-muted-foreground">Lead Score: {card.avgLeadScore}</p>
                      </div>
                      <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                        {card.clickThroughRate}% CTR
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Views</p>
                        <p className="text-lg font-bold text-orange-600">{card.totalViews}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Clicks</p>
                        <p className="text-lg font-bold text-orange-600">{card.totalClicks}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Visitors</p>
                        <p className="text-lg font-bold text-orange-600">{card.uniqueVisitors}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
