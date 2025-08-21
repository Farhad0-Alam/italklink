import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MoreHorizontal, Edit, BarChart3, Trash2, Copy, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(businessCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCards = businessCards.slice(startIndex, startIndex + itemsPerPage);

  const toggleCardStatus = useMutation({
    mutationFn: ({ id, isPublic }: { id: string, isPublic: boolean }) => 
      apiRequest('PATCH', `/api/business-cards/${id}`, { isPublic }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards'] });
      toast({
        title: "Card updated",
        description: "Card status updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update card status.",
        variant: "destructive",
      });
    },
  });

  const copyUrl = async (shareSlug: string) => {
    const url = `${window.location.origin}/share/${shareSlug}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "URL copied!",
      description: "Share URL has been copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="text-2xl font-bold">
                  <span className="text-blue-600">2talk</span>
                  <span className="text-orange-500">Link</span>
                </div>
              </Link>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/dashboard" className="text-gray-900 font-medium hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                  My Links
                </Link>
                <Link href="/templates" className="text-gray-500 hover:text-gray-700">
                  Templates
                </Link>
                <Link href="/pricing" className="text-gray-500 hover:text-gray-700">
                  Pricing
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                  <AvatarFallback className="bg-orange-500 text-white">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-700">Hi {user.firstName}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <i className="fas fa-chevron-down"></i>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                      {logoutMutation.isPending ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-sign-out-alt mr-2"></i>
                      )}
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <i className="fas fa-mouse-pointer text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Weekly Clicks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <i className="fas fa-eye text-orange-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Weekly Visitor</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-pink-100 rounded-full">
                  <i className="fas fa-users text-pink-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {businessCards.reduce((sum, card) => sum + card.viewCount, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Monthly Visitor</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <i className="fas fa-link text-purple-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {businessCards.length}
                  </p>
                  <p className="text-sm text-gray-600">Created Links</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Newly Created Links Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Newly Created Links</h2>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
              <Link href="/builder" data-testid="button-create-link">
                <i className="fas fa-plus mr-2"></i>
                Create New Link
              </Link>
            </Button>
          </div>

          {cardsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your links...</p>
            </div>
          ) : businessCards.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-link text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No links created yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first digital business card link to get started.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                <Link href="/builder">
                  <i className="fas fa-plus mr-2"></i>
                  Create Your First Link
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedCards.map((card, index) => (
                <div key={card.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${card.fullName}`} alt={card.fullName} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {card.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">{card.fullName}</h3>
                          <i className="fas fa-edit text-orange-500 text-sm"></i>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-600">
                            {card.shareSlug ? `https://2talklink.com/${card.shareSlug}` : `https://2talklink.com/${card.id.slice(0, 8)}`}
                          </p>
                          <i className="fas fa-copy text-gray-400 text-xs cursor-pointer hover:text-gray-600"></i>
                          <i className="fas fa-external-link-alt text-gray-400 text-xs cursor-pointer hover:text-gray-600"></i>
                        </div>
                        <div className="flex items-center space-x-6 mt-2">
                          <span className="text-sm text-gray-500">
                            <i className="fas fa-eye mr-1 text-orange-500"></i>
                            Visitor ({card.viewCount})
                          </span>
                          <span className="text-sm text-gray-500">
                            <i className="fas fa-mouse-pointer mr-1 text-green-500"></i>
                            Clicks (0)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-orange-500 border-orange-200 hover:bg-orange-50"
                        asChild
                      >
                        <Link href={`/builder?id=${card.id}`} data-testid={`button-edit-${card.id}`}>
                          Edit
                        </Link>
                      </Button>
                      
                      <Switch 
                        checked={card.isPublic} 
                        onCheckedChange={(checked) => 
                          toggleCardStatus.mutate({ id: card.id, isPublic: checked })
                        }
                        className="data-[state=checked]:bg-green-500"
                        data-testid={`switch-status-${card.id}`}
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-blue-600"
                        data-testid={`button-stats-${card.id}`}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-600"
                        onClick={() => deleteCardMutation.mutate(card.id)}
                        disabled={deleteCardMutation.isPending}
                        data-testid={`button-delete-${card.id}`}
                      >
                        {deleteCardMutation.isPending ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {businessCards.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-orange-500 hover:bg-orange-600" : ""}
                    data-testid={`button-page-${page}`}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}