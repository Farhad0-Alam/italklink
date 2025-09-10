import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, CheckSquare, Activity, BarChart3, Zap } from "lucide-react";
import { 
  CRMStats,
  ContactsManager,
  DealsManager,
  TasksManager,
  ActivitiesTimeline
} from "@/modules/crm";
import AutomationManager from "@/modules/crm/components/AutomationManager";

export default function CRM() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center" data-testid="text-crm-header">
                <BarChart3 className="h-6 w-6 mr-3 text-blue-600" />
                CRM Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">Manage your contacts, deals, and sales pipeline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit lg:grid-cols-6" data-testid="tabs-crm-navigation">
            <TabsTrigger value="overview" className="flex items-center space-x-2" data-testid="tab-overview">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center space-x-2" data-testid="tab-contacts">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center space-x-2" data-testid="tab-deals">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Deals</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center space-x-2" data-testid="tab-tasks">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center space-x-2" data-testid="tab-activities">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activities</span>
            </TabsTrigger>
            <TabsTrigger value="automations" className="flex items-center space-x-2" data-testid="tab-automations">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Automations</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <CRMStats />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <ContactsManager />
          </TabsContent>

          <TabsContent value="deals" className="space-y-6">
            <DealsManager />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TasksManager />
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <ActivitiesTimeline />
          </TabsContent>

          <TabsContent value="automations" className="space-y-6">
            <AutomationManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}