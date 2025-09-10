import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCRMStats, useActivities } from "../hooks/useCRM";
import { Users, Target, CheckSquare, TrendingUp, DollarSign, Clock, AlertCircle, Activity } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export function CRMStats() {
  const { data: stats, isLoading: statsLoading } = useCRMStats();
  const { data: recentActivities = [], isLoading: activitiesLoading } = useActivities({ limit: 5 });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const mockStats = {
    totalContacts: 156,
    totalDeals: 23,
    totalDealValue: 125000,
    wonDeals: 8,
    wonDealValue: 45000,
    lostDeals: 3,
    lostDealValue: 12000,
    averageDealSize: 5435,
    conversionRate: 34.8,
    activeTasks: 12,
    overdueTasks: 3,
    leadScoreDistribution: {
      low: 45,
      medium: 67,
      high: 44
    },
    dealsByStage: [
      { stageName: "Qualified", count: 5, value: 25000 },
      { stageName: "Proposal", count: 8, value: 42000 },
      { stageName: "Negotiation", count: 4, value: 28000 },
      { stageName: "Closing", count: 6, value: 30000 }
    ],
    monthlyMetrics: [
      { month: "Jan", newContacts: 23, newDeals: 5, wonDeals: 2, revenue: 12000 },
      { month: "Feb", newContacts: 31, newDeals: 8, wonDeals: 3, revenue: 18500 },
      { month: "Mar", newContacts: 28, newDeals: 6, wonDeals: 4, revenue: 22000 },
    ]
  };

  const currentStats = stats || mockStats;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow" data-testid="card-total-contacts">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{currentStats.totalContacts}</p>
                <p className="text-sm text-gray-600">Total Contacts</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+12%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow" data-testid="card-active-deals">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{currentStats.totalDeals}</p>
                <p className="text-sm text-gray-600">Active Deals</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Value: </span>
              <span className="font-medium ml-1">${(currentStats.totalDealValue / 1000).toFixed(0)}k</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow" data-testid="card-conversion-rate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{currentStats.conversionRate}%</p>
                <p className="text-sm text-gray-600">Conversion Rate</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={currentStats.conversionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow" data-testid="card-revenue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">${(currentStats.wonDealValue / 1000).toFixed(0)}k</p>
                <p className="text-sm text-gray-600">Revenue Won</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Avg Deal: </span>
              <span className="font-medium ml-1">${currentStats.averageDealSize.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Health */}
        <Card className="lg:col-span-2" data-testid="card-pipeline-health">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Pipeline Health
            </CardTitle>
            <CardDescription>Deals breakdown by pipeline stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentStats.dealsByStage.map((stage, index) => (
                <div key={stage.stageName} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" style={{ 
                      backgroundColor: `hsl(${220 + index * 30}, 70%, 50%)` 
                    }}></div>
                    <div>
                      <p className="font-medium text-gray-900">{stage.stageName}</p>
                      <p className="text-sm text-gray-500">{stage.count} deals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${(stage.value / 1000).toFixed(0)}k</p>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="h-2 rounded-full bg-blue-500" 
                        style={{ 
                          width: `${(stage.value / currentStats.totalDealValue) * 100}%`,
                          backgroundColor: `hsl(${220 + index * 30}, 70%, 50%)` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks Overview */}
        <Card data-testid="card-tasks-overview">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckSquare className="h-5 w-5 mr-2 text-green-600" />
              Tasks Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-2xl font-bold text-green-700">{currentStats.activeTasks}</p>
                  <p className="text-sm text-green-600">Active Tasks</p>
                </div>
                <CheckSquare className="h-8 w-8 text-green-600" />
              </div>
              
              {currentStats.overdueTasks > 0 && (
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-2xl font-bold text-red-700">{currentStats.overdueTasks}</p>
                    <p className="text-sm text-red-600">Overdue Tasks</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              )}

              <Button variant="outline" className="w-full" data-testid="button-view-all-tasks">
                <Clock className="h-4 w-4 mr-2" />
                View All Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Score Distribution and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-lead-distribution">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Lead Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">Low ({currentStats.leadScoreDistribution.low})</span>
                </div>
                <div className="flex-1 mx-3">
                  <Progress value={(currentStats.leadScoreDistribution.low / currentStats.totalContacts) * 100} className="h-2" />
                </div>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStats.leadScoreDistribution.low / currentStats.totalContacts) * 100)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium">Medium ({currentStats.leadScoreDistribution.medium})</span>
                </div>
                <div className="flex-1 mx-3">
                  <Progress value={(currentStats.leadScoreDistribution.medium / currentStats.totalContacts) * 100} className="h-2" />
                </div>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStats.leadScoreDistribution.medium / currentStats.totalContacts) * 100)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">High ({currentStats.leadScoreDistribution.high})</span>
                </div>
                <div className="flex-1 mx-3">
                  <Progress value={(currentStats.leadScoreDistribution.high / currentStats.totalContacts) * 100} className="h-2" />
                </div>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStats.leadScoreDistribution.high / currentStats.totalContacts) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-recent-activities">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-indigo-600" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-3">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type.includes('deal') ? 'bg-blue-500' :
                      activity.type.includes('contact') ? 'bg-green-500' :
                      activity.type.includes('task') ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No recent activities</p>
                <p className="text-gray-400 text-xs mt-1">Activity will appear here as you use the CRM</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}