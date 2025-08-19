import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  planType: 'free' | 'pro' | 'enterprise';
  businessCardsCount: number;
  businessCardsLimit: number;
  createdAt: string;
  stats?: {
    totalBusinessCards: number;
    totalViews: number;
    planType: string;
    businessCardsLimit: number;
  };
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
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Fetch user's business cards
  const { data: businessCards = [], isLoading: cardsLoading } = useQuery<BusinessCard[]>({
    queryKey: ['/api/business-cards'],
    enabled: !!user,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/logout'),
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      queryClient.clear();
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "Something went wrong while logging out.",
        variant: "destructive",
      });
    },
  });

  // Delete business card mutation
  const deleteCardMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/business-cards/${id}`),
    onSuccess: () => {
      toast({
        title: "Business card deleted",
        description: "Your business card has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete business card.",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && (userError || !user)) {
      toast({
        title: "Authentication required",
        description: "Please log in to access your dashboard.",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [user, userLoading, userError, setLocation, toast]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-talklink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'pro': return 'bg-blue-100 text-blue-700';
      case 'enterprise': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanFeatures = (planType: string) => {
    switch (planType) {
      case 'pro': return ['Unlimited Cards', 'Analytics', 'Custom Branding', 'Priority Support'];
      case 'enterprise': return ['Everything in Pro', 'Team Features', 'API Access', 'White-label'];
      default: return ['1 Business Card', 'Basic Templates', 'QR Code Generation'];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-talklink-500 to-talklink-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-address-card text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold text-slate-900">CardFlow</span>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/builder">
                  <i className="fas fa-plus mr-2"></i>
                  New Card
                </Link>
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                  <AvatarFallback>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-sign-out-alt mr-2"></i>
                  )}
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user.firstName || 'User'}!
          </h1>
          <p className="text-slate-600">
            Manage your digital business cards and track your networking success.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-talklink-100 rounded-lg">
                  <i className="fas fa-address-card text-talklink-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Business Cards</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {businessCards.length}/{user.businessCardsLimit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <i className="fas fa-eye text-blue-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Views</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {businessCards.reduce((sum, card) => sum + card.viewCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <i className="fas fa-share-alt text-green-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Active Cards</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {businessCards.filter(card => card.isPublic).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <i className="fas fa-crown text-purple-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Plan</p>
                  <Badge className={getPlanBadgeColor(user.planType)}>
                    {user.planType.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cards" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cards">My Cards</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Business Cards Tab */}
          <TabsContent value="cards" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Your Business Cards</h2>
              <Button asChild>
                <Link href="/builder">
                  <i className="fas fa-plus mr-2"></i>
                  Create New Card
                </Link>
              </Button>
            </div>

            {cardsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-talklink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">Loading your cards...</p>
              </div>
            ) : businessCards.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-address-card text-slate-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No business cards yet</h3>
                  <p className="text-slate-600 mb-6">
                    Create your first digital business card to get started networking.
                  </p>
                  <Button asChild>
                    <Link href="/builder">
                      <i className="fas fa-plus mr-2"></i>
                      Create Your First Card
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessCards.map((card) => (
                  <Card key={card.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{card.fullName}</CardTitle>
                          <CardDescription>{card.title}</CardDescription>
                          {card.company && (
                            <p className="text-sm text-slate-500">{card.company}</p>
                          )}
                        </div>
                        <Badge variant={card.isPublic ? "default" : "secondary"}>
                          {card.isPublic ? "Public" : "Draft"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span className="flex items-center">
                          <i className="fas fa-eye mr-1"></i>
                          {card.viewCount} views
                        </span>
                        <span>
                          {new Date(card.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/builder?id=${card.id}`}>
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                          </Link>
                        </Button>
                        {card.shareSlug && (
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/share/${card.shareSlug}`}>
                              <i className="fas fa-external-link-alt mr-1"></i>
                              View
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteCardMutation.mutate(card.id)}
                          disabled={deleteCardMutation.isPending}
                        >
                          {deleteCardMutation.isPending ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-trash"></i>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your account details and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                    <AvatarFallback className="text-lg">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-slate-600">{user.email}</p>
                    <p className="text-sm text-slate-500">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Current Plan: {user.planType.toUpperCase()}</h4>
                  <ul className="space-y-2">
                    {getPlanFeatures(user.planType).map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-slate-600">
                        <i className="fas fa-check text-talklink-500 mr-2"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {user.planType === 'free' && (
                    <div className="mt-4">
                      <Button asChild>
                        <Link href="/#pricing">
                          <i className="fas fa-crown mr-2"></i>
                          Upgrade Plan
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Usage</CardTitle>
                <CardDescription>
                  Manage your subscription and view usage statistics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Business Cards</h4>
                    <p className="text-2xl font-bold text-talklink-600">
                      {businessCards.length}
                    </p>
                    <p className="text-sm text-slate-600">
                      of {user.businessCardsLimit} included
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Total Views</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {businessCards.reduce((sum, card) => sum + card.viewCount, 0)}
                    </p>
                    <p className="text-sm text-slate-600">all time</p>
                  </div>
                </div>
                
                {user.planType === 'free' && (
                  <div className="border rounded-lg p-6 bg-talklink-50">
                    <h4 className="font-semibold text-talklink-900 mb-2">
                      Ready to unlock more features?
                    </h4>
                    <p className="text-talklink-700 mb-4">
                      Upgrade to Pro for unlimited cards, advanced analytics, and custom branding.
                    </p>
                    <Button asChild>
                      <Link href="/#pricing">
                        View Pricing Plans
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}