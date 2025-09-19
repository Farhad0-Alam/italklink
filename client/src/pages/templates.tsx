import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, X, ArrowLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  description?: string;
  category: string;
  previewImage: string;
  backgroundColor: string;
  textColor: string;
  templateData?: any;
}


export default function Templates() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [customUrl, setCustomUrl] = useState("");

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Fetch templates from API with fallback
  const { data: apiTemplates, isLoading: templatesLoading, isError: templatesError } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });

  // Fallback templates in case API fails or returns no templates
  const fallbackTemplates: Template[] = [
    {
      id: "tangeria",
      name: "Tangeria Theme",
      category: "Modern",
      previewImage: "",
      backgroundColor: "#10B981",
      textColor: "#FFFFFF"
    },
    {
      id: "theme1",
      name: "Professional Blue", 
      category: "Professional",
      previewImage: "",
      backgroundColor: "#1E3A8A",
      textColor: "#FFFFFF"
    },
    {
      id: "theme2",
      name: "Dark Theme",
      category: "Dark",
      previewImage: "",
      backgroundColor: "#1F2937",
      textColor: "#FFFFFF"
    },
    {
      id: "theme3",
      name: "Warm Orange",
      category: "Warm",
      previewImage: "",
      backgroundColor: "#F97316", 
      textColor: "#FFFFFF"
    },
    {
      id: "theme4",
      name: "Ocean Blue",
      category: "Blue",
      previewImage: "",
      backgroundColor: "#0891B2",
      textColor: "#FFFFFF"
    }
  ];

  // Use API templates if available, otherwise fallback
  const templates = apiTemplates && apiTemplates.length > 0 ? apiTemplates : fallbackTemplates;

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

  if (userLoading || templatesLoading) {
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

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setShowUrlModal(true);
  };

  const handleTemplatePreview = (template: Template) => {
    // Open template preview in new window
    window.open(`/template-preview/${template.id}`, '_blank', 'width=1200,height=800');
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      const params = new URLSearchParams();
      params.set('template', selectedTemplate.id);
      if (customUrl.trim()) {
        params.set('url', customUrl.trim());
      }
      console.log('Template selection - redirecting to:', `/card-editor?${params.toString()}`);
      console.log('Selected template:', selectedTemplate);
      setLocation(`/card-editor?${params.toString()}`);
    }
  };

  const renderTemplatePreview = (template: Template) => {
    // For database templates, use the previewImage if available
    if (template.previewImage) {
      return (
        <img 
          src={template.previewImage} 
          alt={template.name}
          className="w-full h-full object-cover"
        />
      );
    }

    // Fallback for hardcoded templates
    switch (template.id) {
      case "tangeria":
        return (
          <div className="w-full h-full relative bg-emerald-500 rounded-lg overflow-hidden">
            <div className="absolute top-4 left-4">
              <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-white p-4">
              <h3 className="font-bold text-gray-800">Nancy Martin</h3>
              <p className="text-sm text-gray-600">Your Title Goes Here</p>
              <div className="flex space-x-1 mt-2">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="w-6 h-6 bg-orange-400 rounded"></div>
                ))}
              </div>
              <div className="mt-2 space-y-1">
                <div className="h-6 bg-orange-400 rounded text-xs flex items-center justify-center text-white">Call Now To Book Service</div>
                <div className="h-6 bg-orange-400 rounded text-xs flex items-center justify-center text-white">Save In Your Contacts</div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div 
            className="w-full h-full flex flex-col items-center justify-center rounded-lg p-4"
            style={{ backgroundColor: template.backgroundColor || "#22c55e" }}
          >
            <div className="text-center text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="font-bold text-lg">
                  {template.name?.[0] || "T"}
                </span>
              </div>
              <h3 className="font-bold text-sm mb-1">Sample Name</h3>
              <p className="text-xs opacity-75 mb-3">Professional Title</p>
              
              <div className="flex justify-center space-x-1 mb-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-6 h-6 bg-white/30 rounded flex items-center justify-center">
                    <i className="fas fa-phone text-xs"></i>
                  </div>
                ))}
              </div>
              
              <div className="text-xs opacity-75 space-y-1">
                <div>Company Name</div>
                <div>email@example.com</div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation('/dashboard')}
                className="flex items-center space-x-2 hover:bg-gray-100"
                data-testid="button-back-dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
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
              className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              data-testid={`template-${template.id}`}
            >
              <CardContent className="p-0">
                {/* Template Preview */}
                <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                  {renderTemplatePreview(template)}
                </div>
                
                {/* Template Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 text-sm mb-3">{template.name}</h3>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplatePreview(template);
                      }}
                      data-testid={`button-preview-${template.id}`}
                    >
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateSelect(template);
                      }}
                      data-testid={`button-select-${template.id}`}
                    >
                      Select
                    </Button>
                  </div>
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

      {/* Custom URL Modal */}
      <Dialog open={showUrlModal} onOpenChange={setShowUrlModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-700">
                Create New 2TalkLink
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUrlModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-gray-500">
              Enter Your URL Below to Continue
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-100 text-gray-600 text-sm">
                https://2talklink.com/
              </div>
              <Input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Your URL"
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                data-testid="input-custom-url"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button 
              onClick={handleContinue}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full"
              data-testid="button-continue"
            >
              Continue
              <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}