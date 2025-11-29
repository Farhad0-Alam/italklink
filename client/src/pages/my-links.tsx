import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Edit, BarChart3, Trash2, Copy, ExternalLink, Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import NotifyCardButton from "@/components/NotifyCardButton";
import NotifyAllCardsButton from "@/components/NotifyAllCardsButton";

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

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  planType: 'free' | 'paid';
}

export default function MyLinks() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: businessCards = [], isLoading: cardsLoading } = useQuery<BusinessCard[]>({
    queryKey: ['/api/business-cards'],
    staleTime: 0,
    refetchOnWindowFocus: true,
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

  const duplicateCardMutation = useMutation({
    mutationFn: (id: string) => apiRequest('POST', `/api/business-cards/${id}/duplicate`),
    onSuccess: () => {
      toast({
        title: "Card duplicated",
        description: "Your business card has been duplicated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards'] });
    },
    onError: (error: any) => {
      toast({
        title: "Duplication failed",
        description: error.message || "Failed to duplicate business card.",
        variant: "destructive",
      });
    },
  });

  const copyUrl = async (card: BusinessCard) => {
    const slug = card.shareSlug || card.fullName.toLowerCase().replace(/\s+/g, '-');
    const url = `${window.location.origin}/${slug}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "URL copied!",
      description: "Share URL has been copied to clipboard.",
    });
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(businessCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCards = businessCards.slice(startIndex, startIndex + itemsPerPage);

  // Show loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block w-64 fixed h-screen">
        <DashboardSidebar 
          user={user}
          businessCardsCount={businessCards.length}
          onLogout={() => setLocation('/')}
        />
      </div>

      {/* Mobile Sidebar in Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 md:hidden">
          <DashboardSidebar 
            user={user}
            businessCardsCount={businessCards.length}
            onLogout={() => setLocation('/')}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 w-full md:w-auto overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Talk Links</h1>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>

        {/* Page Content */}
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Talk Links</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage all your digital business card links in one place
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <NotifyAllCardsButton totalCards={businessCards.length} />
                <Button className="bg-orange-500 hover:bg-orange-600 text-white flex-1 sm:flex-initial" asChild>
                  <Link href="/templates" data-testid="button-create-new-link">
                    <i className="fas fa-plus mr-2"></i>
                    Create New Link
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {cardsLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your links...</p>
            </div>
          ) : businessCards.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-link text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No links created yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Create your first digital business card link to start sharing your professional profile.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                <Link href="/templates" data-testid="button-create-first-link">
                  <i className="fas fa-plus mr-2"></i>
                  Create Your First Link
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {paginatedCards.map((card) => (
                  <div key={card.id} className="px-4 sm:px-6 py-5 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                            <AvatarImage 
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${card.fullName}`} 
                              alt={card.fullName} 
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                              {card.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{card.fullName}</h3>
                            <i className="fas fa-edit text-orange-500 text-sm flex-shrink-0"></i>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-sm text-gray-600 truncate flex-1">
                              {window.location.origin}/{card.shareSlug || card.fullName.toLowerCase().replace(/\s+/g, '-')}
                            </p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => copyUrl(card)}
                                title="Copy link"
                                data-testid={`button-copy-${card.id}`}
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => {
                                  const slug = card.shareSlug || card.fullName.toLowerCase().replace(/\s+/g, '-');
                                  window.open(`${window.location.origin}/${slug}`, '_blank');
                                }}
                                title="Open in new tab"
                                data-testid={`button-open-${card.id}`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-sm text-gray-500 flex items-center">
                              <i className="fas fa-eye mr-2 text-orange-500"></i>
                              Visitor ({card.viewCount})
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <i className="fas fa-mouse-pointer mr-2 text-green-500"></i>
                              Clicks (0)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-3 lg:flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-orange-500 border-orange-200 hover:bg-orange-50 flex-1 sm:flex-initial"
                          asChild
                        >
                          <Link href={`/card-editor/${card.id}`} data-testid={`button-edit-${card.id}`}>
                            <Edit className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Edit</span>
                          </Link>
                        </Button>
                        
                        <NotifyCardButton 
                          cardId={card.id}
                          cardTitle={card.fullName}
                        />
                        
                        <div className="flex items-center gap-1">
                          <Switch 
                            checked={card.isPublic} 
                            onCheckedChange={(checked) => 
                              toggleCardStatus.mutate({ id: card.id, isPublic: checked })
                            }
                            className="data-[state=checked]:bg-green-500"
                            data-testid={`switch-status-${card.id}`}
                          />
                          <span className="text-xs text-gray-500 hidden lg:inline ml-1">
                            {card.isPublic ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-orange-600 transition-colors"
                          onClick={() => setLocation(`/card-analytics?cardId=${card.id}`)}
                          data-testid={`button-analytics-${card.id}`}
                          title="View Analytics"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-blue-600"
                          onClick={() => duplicateCardMutation.mutate(card.id)}
                          disabled={duplicateCardMutation.isPending}
                          data-testid={`button-duplicate-${card.id}`}
                          title="Duplicate"
                        >
                          {duplicateCardMutation.isPending ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-600"
                          onClick={() => deleteCardMutation.mutate(card.id)}
                          disabled={deleteCardMutation.isPending}
                          data-testid={`button-delete-${card.id}`}
                          title="Delete"
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
              
              {totalPages > 1 && (
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
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
