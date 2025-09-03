import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MoreHorizontal, Edit, BarChart3, Trash2, Copy, ExternalLink, DollarSign, Users, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ContactSupportModal } from "@/components/contact-support-modal";
import { DashboardLayout } from "@/components/DashboardLayout";

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

interface AffiliateProfile {
  id: string;
  code: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  stats: {
    totalEarnings: number;
    pendingEarnings: number;
    totalClicks: number;
    totalConversions: number;
  };
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [showContactModal, setShowContactModal] = useState(false);

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const { data: businessCards = [], isLoading: cardsLoading } = useQuery<BusinessCard[]>({
    queryKey: ['/api/business-cards'],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: affiliate } = useQuery<AffiliateProfile>({
    queryKey: ['/api/affiliate/me'],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

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

  const copyUrl = async (shareSlug: string) => {
    const url = `${window.location.origin}/share/${shareSlug}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "URL copied!",
      description: "Share URL has been copied to clipboard.",
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const itemsPerPage = 10;
  const totalPages = Math.ceil(businessCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCards = businessCards.slice(startIndex, startIndex + itemsPerPage);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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

          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <DollarSign className="text-emerald-600 text-xl h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-gray-900">
                    ${affiliate ? (affiliate.stats.totalEarnings / 100).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-sm text-gray-600">Affiliate Earnings</p>
                </div>
              </div>
              {affiliate && (
                <div className="mt-3 text-xs text-gray-500">
                  +${(affiliate.stats.pendingEarnings / 100).toFixed(2)} pending
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Affiliate Program Section */}
        {!affiliate ? (
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg shadow-sm border border-emerald-200 mb-8">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <Users className="text-emerald-600 h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Join Our Affiliate Program</h3>
                    <p className="text-gray-600">Earn commissions by promoting our platform. Get up to 30% commission on every referral!</p>
                  </div>
                </div>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" asChild>
                  <Link href="/affiliate" data-testid="button-join-affiliate">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Join Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
                Affiliate Dashboard
              </h2>
              <Badge className={`${
                affiliate.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                affiliate.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                'bg-red-100 text-red-800 border-red-200'
              }`}>
                {affiliate.status}
              </Badge>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{affiliate.stats.totalClicks}</div>
                  <div className="text-sm text-gray-600">Total Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{affiliate.stats.totalConversions}</div>
                  <div className="text-sm text-gray-600">Conversions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">${(affiliate.stats.totalEarnings / 100).toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Earnings</div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600">Affiliate Code:</p>
                  <code className="font-mono text-sm bg-white px-2 py-1 rounded border">{affiliate.code}</code>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/affiliate" data-testid="button-affiliate-dashboard">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Full Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Business Cards Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Business Cards</h2>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
              <Link href="/templates" data-testid="button-create-card">
                <i className="fas fa-plus mr-2"></i>
                Create New Card
              </Link>
            </Button>
          </div>

          {cardsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your cards...</p>
            </div>
          ) : businessCards.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-id-card text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No business cards yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first digital business card to get started.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                <Link href="/templates">
                  <i className="fas fa-plus mr-2"></i>
                  Create Your First Card
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedCards.map((card) => (
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
                          <Badge variant={card.isPublic ? "default" : "secondary"}>
                            {card.isPublic ? "Public" : "Private"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{card.title}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            <BarChart3 className="w-4 h-4 inline mr-1" />
                            {card.viewCount} views
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/card-editor?id=${card.id}`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyUrl(card.shareSlug || card.id.slice(0, 8))}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`/share/${card.shareSlug || card.id.slice(0, 8)}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteCardMutation.mutate(card.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, businessCards.length)} of {businessCards.length} results
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Support Modal */}
      <ContactSupportModal
        open={showContactModal}
        onOpenChange={setShowContactModal}
      />
    </DashboardLayout>
  );
}