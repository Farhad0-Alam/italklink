import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
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
}

interface Template {
  id: string;
  name: string;
  category: string;
  previewImage: string;
  backgroundColor: string;
  textColor: string;
}

const templates: Template[] = [
  {
    id: "euphoria",
    name: "Euphoria Theme",
    category: "Business",
    previewImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=400&fit=crop",
    backgroundColor: "#8B5CF6",
    textColor: "#FFFFFF"
  },
  {
    id: "freedom",
    name: "Freedom Theme", 
    category: "Creative",
    previewImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=400&fit=crop",
    backgroundColor: "#10B981",
    textColor: "#FFFFFF"
  },
  {
    id: "venus",
    name: "Venus Theme",
    category: "Professional",
    previewImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop", 
    backgroundColor: "#F59E0B",
    textColor: "#FFFFFF"
  },
  {
    id: "arcturus",
    name: "Arcturus Theme",
    category: "Modern",
    previewImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    backgroundColor: "#1F2937",
    textColor: "#FFFFFF"
  },
  {
    id: "inca",
    name: "Inca Theme",
    category: "Warm",
    previewImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=400&fit=crop",
    backgroundColor: "#F97316", 
    textColor: "#FFFFFF"
  },
  {
    id: "flannel",
    name: "Flannel Theme",
    category: "Classic",
    previewImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=400&fit=crop",
    backgroundColor: "#374151",
    textColor: "#FFFFFF"
  },
  {
    id: "scarlet",
    name: "Scarlet Theme", 
    category: "Bold",
    previewImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop",
    backgroundColor: "#DC2626",
    textColor: "#FFFFFF"
  },
  {
    id: "thalassa",
    name: "Thalassa Theme",
    category: "Ocean",
    previewImage: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=300&h=400&fit=crop",
    backgroundColor: "#0891B2",
    textColor: "#FFFFFF"
  },
  {
    id: "ipanema",
    name: "Ipanema Theme",
    category: "Beach",
    previewImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop",
    backgroundColor: "#06B6D4",
    textColor: "#FFFFFF"
  },
  {
    id: "dingo",
    name: "Dingo Theme",
    category: "Vibrant",
    previewImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=400&fit=crop",
    backgroundColor: "#A855F7",
    textColor: "#FFFFFF"
  }
];

export default function Templates() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  useEffect(() => {
    if (!userLoading && (userError || !user)) {
      toast({
        title: "Authentication required",
        description: "Please log in to access templates.",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [user, userLoading, userError, setLocation, toast]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const categories = ["All", ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = (templateId: string) => {
    setLocation(`/builder?template=${templateId}`);
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
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                  Dashboard
                </Link>
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                  My Links
                </Link>
                <Link href="/templates" className="text-gray-900 font-medium hover:text-blue-600">
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
                    <DropdownMenuItem>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <i className="fas fa-sign-out-alt mr-2"></i>
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Templates ({filteredTemplates.length})
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search"
              />
            </div>
            
            {/* Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="button-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter By
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categories.map((category) => (
                  <DropdownMenuItem 
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    data-testid={`filter-${category.toLowerCase()}`}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTemplateSelect(template.id)}
              data-testid={`template-${template.id}`}
            >
              <CardContent className="p-0">
                {/* Template Preview */}
                <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                  <div 
                    className="w-full h-full flex flex-col items-center justify-center text-white"
                    style={{ backgroundColor: template.backgroundColor }}
                  >
                    {/* Mock Business Card Preview */}
                    <div className="w-32 h-20 bg-white/20 rounded-lg backdrop-blur-sm p-3 mb-4">
                      <div className="w-6 h-6 bg-white/30 rounded-full mb-2"></div>
                      <div className="space-y-1">
                        <div className="h-2 bg-white/60 rounded w-20"></div>
                        <div className="h-1.5 bg-white/40 rounded w-16"></div>
                        <div className="h-1.5 bg-white/40 rounded w-12"></div>
                      </div>
                    </div>
                    
                    {/* Social Icons */}
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-4 h-4 bg-white/30 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Template Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 text-sm">{template.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{template.category}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-search text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter to find more templates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}