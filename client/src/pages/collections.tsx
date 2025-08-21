import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Search, 
  Grid, 
  List, 
  Plus, 
  Eye, 
  Heart, 
  Share2, 
  Filter,
  User,
  Calendar,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
// import CreateCollectionModal from '@/components/create-collection-modal';

interface TemplateCollection {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  shareSlug: string | null;
  templateCount: number;
  viewCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  };
}

interface CollectionsResponse {
  collections: TemplateCollection[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function Collections() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('explore');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch collections
  const { data: collectionsData, isLoading: collectionsLoading } = useQuery({
    queryKey: ['/api/collections', { search: searchTerm, sort: sortBy, page }],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey as [string, { search: string; sort: string; page: number }];
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search as string);
      if (params.sort) searchParams.append('sort', params.sort as string);
      if (params.page) searchParams.append('page', String(params.page));
      return await apiRequest(`/api/collections?${searchParams.toString()}`) as unknown as CollectionsResponse;
    },
  });

  // Fetch user's collections
  const { data: myCollections, isLoading: myCollectionsLoading } = useQuery<TemplateCollection[]>({
    queryKey: ['/api/collections/my'],
    enabled: activeTab === 'my',
  });

  const collectionsDataTyped = collectionsData as CollectionsResponse | undefined;
  const collections: TemplateCollection[] = collectionsDataTyped?.collections || [];
  const pagination = collectionsDataTyped?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const CollectionCard = ({ collection, isOwner = false }: { collection: TemplateCollection; isOwner?: boolean }): JSX.Element => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {collection.name}
          </CardTitle>
          <div className="flex items-center space-x-1 text-muted-foreground">
            {collection.isPublic ? (
              <Eye className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
        </div>
        {collection.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {collection.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Layers className="h-4 w-4" />
              <span>{collection.templateCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{collection.viewCount}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(collection.createdAt)}</span>
          </div>
        </div>

        {!isOwner && (
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              {collection.creator.profileImageUrl ? (
                <AvatarImage src={collection.creator.profileImageUrl} />
              ) : (
                <AvatarFallback className="text-xs">
                  {collection.creator.firstName?.[0]}{collection.creator.lastName?.[0]}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {collection.creator.firstName} {collection.creator.lastName}
            </span>
          </div>
        )}

        {collection.tags && collection.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {collection.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {collection.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{collection.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link href={`/collections/${collection.id}`}>
            <Button variant="outline" size="sm" className="flex-1 mr-2">
              View Collection
            </Button>
          </Link>
          {collection.shareSlug && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                const url = `${window.location.origin}/collections/shared/${collection.shareSlug}`;
                navigator.clipboard.writeText(url);
                toast({
                  title: "Link copied!",
                  description: "Collection share link copied to clipboard",
                });
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Template Collections</h1>
            <p className="text-muted-foreground mt-1">
              Discover curated sets of business card templates created by the community
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Collection</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="templates">Most Templates</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="my">My Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-6">
          {collectionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-10 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-muted p-6">
                  <Layers className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">No collections found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Be the first to create a collection!'}
                  </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Collection
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {collections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-6">
          {myCollectionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-10 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !myCollections || (myCollections as TemplateCollection[]).length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-muted p-6">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">No collections yet</h3>
                  <p className="text-muted-foreground">
                    Create your first template collection to get started.
                  </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Collection
                </Button>
              </div>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {(myCollections as TemplateCollection[]).map((collection: TemplateCollection) => (
                <CollectionCard key={collection.id} collection={collection} isOwner={true} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Collection Modal */}
      {/* TODO: Implement CreateCollectionModal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full m-4">
            <h2 className="text-lg font-semibold mb-4">Create Collection</h2>
            <p className="text-muted-foreground mb-4">
              Collection creation feature is being implemented.
            </p>
            <Button onClick={() => setShowCreateModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}