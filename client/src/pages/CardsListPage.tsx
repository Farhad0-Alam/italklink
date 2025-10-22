import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  QrCode,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { defaultCardData } from "@/lib/card-data";

interface BusinessCard {
  id: string;
  fullName: string;
  title: string;
  company?: string;
  profilePhoto?: string;
  shareSlug?: string;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function CardsListPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);

  const { data: cards = [], isLoading } = useQuery<BusinessCard[]>({
    queryKey: ['/api/business-cards'],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const createCardMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/business-cards', {
        ...defaultCardData,
        fullName: "New Business Card",
        title: "Professional",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards'] });
      toast({
        title: "Card created successfully!",
        description: "Start customizing your new business card",
      });
      navigate(`/cards/${data.id}/edit`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create card",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      return apiRequest('DELETE', `/api/business-cards/${cardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards'] });
      toast({
        title: "Card deleted successfully",
      });
      setDeleteCardId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete card",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const duplicateCardMutation = useMutation({
    mutationFn: async (card: BusinessCard) => {
      const { id, createdAt, updatedAt, shareSlug, ...cardData } = card;
      return apiRequest('POST', '/api/business-cards', {
        ...cardData,
        fullName: `${card.fullName} (Copy)`,
        shareSlug: undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards'] });
      toast({
        title: "Card duplicated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to duplicate card",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = (card: BusinessCard) => {
    const url = `${window.location.origin}/${card.shareSlug || card.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied to clipboard!",
      description: url,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-talklink-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Business Cards</h1>
            <p className="text-slate-400">
              Create and manage your digital business cards
            </p>
          </div>
          <Button
            onClick={() => createCardMutation.mutate()}
            disabled={createCardMutation.isPending}
            className="bg-talklink-500 hover:bg-talklink-600 text-white"
            data-testid="button-create-card"
          >
            <Plus className="w-4 h-4 mr-2" />
            {createCardMutation.isPending ? "Creating..." : "Create New Card"}
          </Button>
        </div>

        {/* Cards Grid */}
        {cards.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <div className="text-slate-400 mb-4">
                <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No business cards yet</p>
                <p className="text-sm">Create your first card to get started</p>
              </div>
              <Button
                onClick={() => createCardMutation.mutate()}
                disabled={createCardMutation.isPending}
                className="bg-talklink-500 hover:bg-talklink-600 text-white mt-4"
                data-testid="button-create-first-card"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Card
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card 
                key={card.id} 
                className="bg-slate-800 border-slate-700 hover:border-talklink-500 transition-all"
                data-testid={`card-item-${card.id}`}
              >
                <CardContent className="p-6">
                  {/* Card Preview */}
                  <div className="bg-slate-700 rounded-lg p-4 mb-4 min-h-[120px] flex flex-col items-center justify-center">
                    {card.profilePhoto ? (
                      <img
                        src={card.profilePhoto}
                        alt={card.fullName}
                        className="w-16 h-16 rounded-full object-cover mb-2"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-talklink-500 flex items-center justify-center mb-2">
                        <span className="text-2xl font-bold text-white">
                          {card.fullName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <h3 className="font-semibold text-white text-center" data-testid={`text-card-name-${card.id}`}>
                      {card.fullName}
                    </h3>
                    <p className="text-sm text-slate-400 text-center">{card.title}</p>
                    {card.company && (
                      <p className="text-xs text-slate-500 text-center">{card.company}</p>
                    )}
                  </div>

                  {/* Card Stats */}
                  <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {card.viewCount || 0} views
                    </span>
                    <span>
                      Updated {new Date(card.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link href={`/cards/${card.id}/edit`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-slate-600 hover:border-talklink-500 hover:bg-slate-700"
                        data-testid={`button-edit-${card.id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-slate-600 hover:border-talklink-500 hover:bg-slate-700"
                          data-testid={`button-more-${card.id}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem
                          onClick={() => handleCopyLink(card)}
                          className="text-slate-300 hover:bg-slate-700"
                          data-testid={`button-copy-link-${card.id}`}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => duplicateCardMutation.mutate(card)}
                          className="text-slate-300 hover:bg-slate-700"
                          data-testid={`button-duplicate-${card.id}`}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteCardId(card.id)}
                          className="text-red-400 hover:bg-slate-700"
                          data-testid={`button-delete-${card.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCardId} onOpenChange={() => setDeleteCardId(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Business Card</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete this business card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              data-testid="button-cancel-delete"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCardId && deleteCardMutation.mutate(deleteCardId)}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-confirm-delete"
            >
              {deleteCardMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
