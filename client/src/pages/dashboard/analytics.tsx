import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  Calendar as CalendarIcon, TrendingUp, TrendingDown, Users, DollarSign,
  Clock, CheckCircle, XCircle, AlertCircle, Download, Filter,
  BarChart3, PieChart as PieChartIcon, Activity, Eye
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

// Color palette for charts
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface AnalyticsPageProps {
  className?: string;
}

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type PeriodType = '7d' | '30d' | '90d' | '6m' | '1y' | 'custom';

export default function Analytics({ className }: AnalyticsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('30d');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  
  // Fetch analytics data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['analytics', 'dashboard', selectedPeriod, selectedEventType, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedEventType && { eventTypeId: selectedEventType }),
        ...(selectedPeriod === 'custom' && dateRange.from && dateRange.to && {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        })
      });
      const response = await fetch(`/api/analytics/dashboard?${params}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });

  const { data: bookingTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['analytics', 'booking-trends', selectedPeriod, selectedEventType, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        granularity: 'day',
        period: selectedPeriod,
        ...(selectedEventType && { eventTypeId: selectedEventType }),
        ...(selectedPeriod === 'custom' && dateRange.from && dateRange.to && {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        })
      });
      const response = await fetch(`/api/analytics/booking-trends?${params}`);
      if (!response.ok) throw new Error('Failed to fetch booking trends');
      return response.json();
    },
    refetchInterval: 60000,
  });

  const { data: popularTimes, isLoading: popularTimesLoading } = useQuery({
    queryKey: ['analytics', 'popular-times', selectedPeriod, selectedEventType, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedEventType && { eventTypeId: selectedEventType }),
        ...(selectedPeriod === 'custom' && dateRange.from && dateRange.to && {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        })
      });
      const response = await fetch(`/api/analytics/popular-times?${params}`);
      if (!response.ok) throw new Error('Failed to fetch popular times');
      return response.json();
    },
    refetchInterval: 60000,
  });

  const { data: conversionData, isLoading: conversionLoading } = useQuery({
    queryKey: ['analytics', 'conversion-rates', selectedPeriod, selectedEventType, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedEventType && { eventTypeId: selectedEventType }),
        ...(selectedPeriod === 'custom' && dateRange.from && dateRange.to && {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        })
      });
      const response = await fetch(`/api/analytics/conversion-rates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch conversion data');
      return response.json();
    },
    refetchInterval: 60000,
  });

  const { data: noShowData, isLoading: noShowLoading } = useQuery({
    queryKey: ['analytics', 'no-shows', selectedPeriod, selectedEventType, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedEventType && { eventTypeId: selectedEventType }),
        ...(selectedPeriod === 'custom' && dateRange.from && dateRange.to && {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        })
      });
      const response = await fetch(`/api/analytics/no-shows?${params}`);
      if (!response.ok) throw new Error('Failed to fetch no-show data');
      return response.json();
    },
    refetchInterval: 60000,
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics', 'revenue', selectedPeriod, selectedEventType, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedEventType && { eventTypeId: selectedEventType }),
        ...(selectedPeriod === 'custom' && dateRange.from && dateRange.to && {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        })
      });
      const response = await fetch(`/api/analytics/revenue?${params}`);
      if (!response.ok) throw new Error('Failed to fetch revenue data');
      return response.json();
    },
    refetchInterval: 60000,
  });

  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ['analytics', 'customers', selectedPeriod, selectedEventType, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedEventType && { eventTypeId: selectedEventType }),
        ...(selectedPeriod === 'custom' && dateRange.from && dateRange.to && {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        })
      });
      const response = await fetch(`/api/analytics/customers?${params}`);
      if (!response.ok) throw new Error('Failed to fetch customer data');
      return response.json();
    },
    refetchInterval: 60000,
  });

  const handleExport = async (type: string, format: string = 'json') => {
    try {
      const params = new URLSearchParams({
        type,
        format,
        period: selectedPeriod,
        ...(selectedEventType && { eventTypeId: selectedEventType }),
        ...(selectedPeriod === 'custom' && dateRange.from && dateRange.to && {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        })
      });
      
      const response = await fetch(`/api/analytics/export?${params}`);
      if (!response.ok) throw new Error('Export failed');
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `analytics-${type}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `analytics-${type}-${format(new Date(), 'yyyy-MM-dd')}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getPeriodLabel = (period: PeriodType) => {
    switch (period) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '6m': return 'Last 6 months';
      case '1y': return 'Last year';
      case 'custom': return 'Custom range';
      default: return 'Last 30 days';
    }
  };

  const isLoading = dashboardLoading || trendsLoading || popularTimesLoading || 
    conversionLoading || noShowLoading || revenueLoading || customerLoading;

  return (
    <div className={cn("container mx-auto py-6 space-y-6", className)}>
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-analytics-title">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your appointment scheduling performance
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
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

          <Button variant="outline" size="sm" onClick={() => handleExport('bookings', 'csv')} data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="card-total-bookings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-bookings">
                {dashboardData.overview.totalBookings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.overview.confirmedBookings} confirmed
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-conversion-rate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-conversion-rate">
                {dashboardData.rates.conversionRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Views to bookings
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-no-show-rate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No-show Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-no-show-rate">
                {dashboardData.rates.noShowRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.overview.noShowBookings} no-shows
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-revenue">
                ${(dashboardData.revenue.totalRevenue / 100).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.revenue.paidBookings} paid bookings
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-6 w-full">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">Trends</TabsTrigger>
          <TabsTrigger value="times" data-testid="tab-times">Popular Times</TabsTrigger>
          <TabsTrigger value="conversion" data-testid="tab-conversion">Conversion</TabsTrigger>
          <TabsTrigger value="noshows" data-testid="tab-noshows">No-shows</TabsTrigger>
          <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card data-testid="card-recent-activity">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest appointment bookings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData?.recentActivity?.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">{activity.attendeeName}</p>
                        <p className="text-xs text-muted-foreground">{activity.eventTypeName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        activity.status === 'confirmed' ? 'default' :
                        activity.status === 'completed' ? 'secondary' :
                        activity.status === 'cancelled' ? 'destructive' : 'outline'
                      }>
                        {activity.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.startTime), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Popular Times Preview */}
            <Card data-testid="card-popular-times-preview">
              <CardHeader>
                <CardTitle>Popular Booking Times</CardTitle>
                <CardDescription>Most requested time slots</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.popularTimes?.slice(0, 5).map((time: any, index: number) => (
                    <div key={time.hour} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{time.hour}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ 
                              width: `${(time.count / (dashboardData.popularTimes[0]?.count || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {time.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Booking Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card data-testid="card-booking-trends">
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
              <CardDescription>Daily booking volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={bookingTrends?.trends || []}>
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
                      dataKey="totalBookings" 
                      stackId="1"
                      stroke="#0088FE" 
                      fill="#0088FE" 
                      name="Total Bookings"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="confirmedBookings" 
                      stackId="2"
                      stroke="#00C49F" 
                      fill="#00C49F" 
                      name="Confirmed"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cancelledBookings" 
                      stackId="3"
                      stroke="#FF8042" 
                      fill="#FF8042" 
                      name="Cancelled"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Type Breakdown */}
            <Card data-testid="card-event-type-breakdown">
              <CardHeader>
                <CardTitle>Event Type Distribution</CardTitle>
                <CardDescription>Bookings by event type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bookingTrends?.eventTypeBreakdown || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalBookings"
                    >
                      {bookingTrends?.eventTypeBreakdown?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card data-testid="card-performance-metrics">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Confirmation Rate</span>
                  <span className="text-sm font-medium">{dashboardData?.rates.confirmationRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cancellation Rate</span>
                  <span className="text-sm font-medium">{dashboardData?.rates.cancellationRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">No-show Rate</span>
                  <span className="text-sm font-medium">{dashboardData?.rates.noShowRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Revenue/Booking</span>
                  <span className="text-sm font-medium">
                    ${(dashboardData?.revenue.avgRevenuePerBooking / 100 || 0).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Popular Times Tab */}
        <TabsContent value="times" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="card-hourly-distribution">
              <CardHeader>
                <CardTitle>Hourly Distribution</CardTitle>
                <CardDescription>Booking frequency by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                {popularTimesLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={popularTimes?.hourlyDistribution || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0088FE" name="Total Bookings" />
                      <Bar dataKey="confirmedCount" fill="#00C49F" name="Confirmed" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-day-distribution">
              <CardHeader>
                <CardTitle>Day of Week Distribution</CardTitle>
                <CardDescription>Booking frequency by day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={popularTimes?.dayOfWeekDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FFBB28" name="Total Bookings" />
                    <Bar dataKey="confirmedCount" fill="#00C49F" name="Confirmed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-peak-times">
            <CardHeader>
              <CardTitle>Peak Booking Times</CardTitle>
              <CardDescription>Most popular specific time slots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {popularTimes?.peakTimes?.slice(0, 5).map((time: any, index: number) => (
                  <div key={time.timeSlot} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{time.timeSlot}</div>
                    <div className="text-sm text-muted-foreground">{time.count} bookings</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="card-conversion-funnel">
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Booking conversion by event type</CardDescription>
              </CardHeader>
              <CardContent>
                {conversionLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversionData?.conversionMetrics?.slice(0, 5).map((metric: any) => (
                      <div key={metric.eventTypeId} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{metric.eventTypeName}</h4>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-lg">{metric.views}</div>
                            <div className="text-muted-foreground">Views</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg">{metric.bookings}</div>
                            <div className="text-muted-foreground">Bookings</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg">{metric.confirmed}</div>
                            <div className="text-muted-foreground">Confirmed</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg text-primary">
                              {metric.overallConversionRate.toFixed(1)}%
                            </div>
                            <div className="text-muted-foreground">Conversion</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-conversion-trends">
              <CardHeader>
                <CardTitle>Daily Conversion Trends</CardTitle>
                <CardDescription>Conversion rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={conversionData?.dailyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value as string), 'MMM dd, yyyy')}
                      formatter={(value: number, name: string) => [
                        name === 'conversionRate' ? `${value.toFixed(1)}%` : value,
                        name === 'conversionRate' ? 'Conversion Rate' : name
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversionRate" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      name="Conversion Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* No-shows Tab */}
        <TabsContent value="noshows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card data-testid="card-noshow-overview">
              <CardHeader>
                <CardTitle>No-show Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-destructive">
                    {noShowData?.overview.noShowRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">No-show Rate</div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Appointments</span>
                    <span className="text-sm font-medium">
                      {noShowData?.overview.totalAppointments}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">No-shows</span>
                    <span className="text-sm font-medium text-destructive">
                      {noShowData?.overview.noShowAppointments}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Completed</span>
                    <span className="text-sm font-medium text-green-600">
                      {noShowData?.overview.completedAppointments}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-noshow-trends" className="lg:col-span-2">
              <CardHeader>
                <CardTitle>No-show Trends</CardTitle>
                <CardDescription>Daily no-show rates</CardDescription>
              </CardHeader>
              <CardContent>
                {noShowLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={noShowData?.trends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => format(new Date(value as string), 'MMM dd, yyyy')}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'No-show Rate']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="noShowRate" 
                        stroke="#FF8042" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="card-noshow-by-event-type">
              <CardHeader>
                <CardTitle>No-shows by Event Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {noShowData?.eventTypeBreakdown?.map((eventType: any) => (
                    <div key={eventType.eventTypeId} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{eventType.eventTypeName}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {eventType.noShowCount}/{eventType.totalAppointments}
                        </span>
                        <Badge variant={eventType.noShowRate > 20 ? 'destructive' : 'secondary'}>
                          {eventType.noShowRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-noshow-by-time">
              <CardHeader>
                <CardTitle>No-shows by Time</CardTitle>
                <CardDescription>No-show patterns by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={noShowData?.timePatterns || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'No-show Rate']} />
                    <Bar dataKey="noShowRate" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card data-testid="card-revenue-overview">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ${((revenueData?.overview.totalRevenue || 0) / 100).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Paid Bookings</span>
                    <span className="text-sm font-medium">
                      {revenueData?.overview.paidBookings}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg per Booking</span>
                    <span className="text-sm font-medium">
                      ${((revenueData?.overview.avgRevenuePerBooking || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Refunds</span>
                    <span className="text-sm font-medium text-red-600">
                      ${((revenueData?.overview.refundedAmount || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Success</span>
                    <span className="text-sm font-medium text-green-600">
                      {revenueData?.paymentStats.successRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-revenue-trends" className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={revenueData?.dailyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                      />
                      <YAxis tickFormatter={(value) => `$${(value / 100).toFixed(0)}`} />
                      <Tooltip 
                        labelFormatter={(value) => format(new Date(value as string), 'MMM dd, yyyy')}
                        formatter={(value: number, name: string) => [
                          `$${(value / 100).toFixed(2)}`,
                          name === 'revenue' ? 'Revenue' : name === 'refunds' ? 'Refunds' : 'Net Revenue'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stackId="1"
                        stroke="#00C49F" 
                        fill="#00C49F" 
                        name="Revenue"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="refunds" 
                        stackId="2"
                        stroke="#FF8042" 
                        fill="#FF8042" 
                        name="Refunds"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-revenue-by-event-type">
            <CardHeader>
              <CardTitle>Revenue by Event Type</CardTitle>
              <CardDescription>Performance by event type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData?.eventTypeBreakdown?.map((eventType: any) => (
                  <div key={eventType.eventTypeId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{eventType.eventTypeName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {eventType.bookingsCount} bookings
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        ${((eventType.totalRevenue || 0) / 100).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${((eventType.avgPrice || 0) / 100).toFixed(2)} avg
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