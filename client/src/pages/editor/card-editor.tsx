import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BusinessCardComponent } from "@/components/business-card";
import { PagePreview } from "@/components/page-preview";
import { FormBuilder } from "@/components/form-builder";
import { AutoSaveIndicator } from "@/components/AutoSaveIndicator";
import { useAutoSave } from "@/contexts/AutoSaveContext";
import { ElementEditorTabs, EditorTabId } from "@/components/ElementEditorTabs";
import { ContactContentPanel, ContactDesignPanel, ContactSettingsPanel } from "@/components/ContactEditorPanels";
import { ElementsPanel } from "@/components/ElementsPanel";
import { StructurePanel } from "@/components/StructurePanel";
import { getElementEditor } from "@/elements/registry";
import { Copy, Share2, ArrowLeft, Eye, Globe, ChevronUp, ChevronDown, Settings, Layers, Palette, EyeOff, X, Edit2, Type, Phone, Mail, Globe as GlobeIcon, MapPin, MessageSquare, Link as LinkIcon, Image, Plus, Sliders, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import type { BusinessCard, PageElement } from "@shared/schema";

interface CardEditorParams {
  id?: string;
}

interface BlockElement {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  data: any;
}

export default function CardEditor() {
  const { toast } = useToast();
  const params = useParams() as CardEditorParams;
  const [, setLocation] = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);

  const [editorDrawerOpen, setEditorDrawerOpen] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState("content");
  const [blockEditorTab, setBlockEditorTab] = useState<EditorTabId>("content");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockElement | null>(null);
  const [editorMode, setEditorMode] = useState<"full" | "block">("full");
  const [sidebarView, setSidebarView] = useState<"elements" | "editor" | "structure" | "settings">("elements");

  const hasHydratedRef = useRef(false);
  const isDirtyRef = useRef(false);
  const [isDirty, setIsDirty] = useState(false);

  const {
    saveNow,
    publishNow,
    setCardId: setAutoSaveCardId,
    status: autoSaveStatus,
    lastSavedCard,
    isPublished,
  } = useAutoSave();

  const markDirty = () => {
    isDirtyRef.current = true;
    setIsDirty(true);
  };

  const clearDirty = () => {
    isDirtyRef.current = false;
    setIsDirty(false);
  };

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  useEffect(() => {
    if (userError && !userLoading) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create or edit business cards.",
        variant: "destructive",
      });
      setLocation("/login");
    }
  }, [userError, userLoading, setLocation, toast]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Warn user before leaving with unsaved changes (like Elementor Pro)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const selectedTemplateId = urlParams.get("template");
  const customUrlFromTemplate = urlParams.get("url");

  let profileElementIdCounter = 0;

  const createProfileElement = () => {
    profileElementIdCounter++;
    const uniqueId =
      typeof crypto !== "undefined" && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : `profile-${Date.now()}-${profileElementIdCounter}-${Math.random()
            .toString(36)
            .substring(2, 11)}`;

    return {
      id: uniqueId,
      type: "profile" as const,
      order: 0,
      visible: true,
      data: {
        enabled: true,
        showCoverImage: true,
        showProfilePhoto: true,
        showLogo: true,
        showName: true,
        showTitle: true,
        showCompany: true,
        fullName: "",
        title: "",
        company: "",
        profilePhoto: null,
        coverImage: null,
        brandColor: "#22c55e",
        accentColor: "#16a34a",
        profileImageStyles: {
          visible: true,
          size: 120,
          shape: "circle",
          borderWidth: 3,
          borderColor: "#22c55e",
          animation: "none",
          useBrandColor: true,
          animationColors: { start: "#22c55e", end: "#16a34a" },
          shadow: 0,
          opacity: 100,
        },
        coverImageStyles: {
          height: 200,
          borderWidth: 0,
          borderColor: "#22c55e",
          animation: "none",
          profilePositionX: 50,
          profilePositionY: 100,
          shapeDividerTop: {
            enabled: false,
            preset: "wave",
            color: "#ffffff",
            width: 100,
            height: 60,
            invert: false,
          },
          shapeDividerBottom: {
            enabled: false,
            preset: "wave",
            color: "#ffffff",
            width: 100,
            height: 60,
            invert: false,
          },
        },
        sectionStyles: {
          basicInfo: {
            nameColor: "#ffffff",
            nameFont: "Inter",
            nameFontSize: 24,
            nameFontWeight: "700",
            nameTextStyle: "normal",
            nameSpacing: 8,
            namePositionX: 0,
            namePositionY: 0,
            titleColor: "#4b5563",
            titleFont: "Inter",
            titleFontSize: 14,
            titleFontWeight: "400",
            titleTextStyle: "normal",
            titleSpacing: 8,
            titlePositionX: 0,
            titlePositionY: 0,
            companyColor: "#6b7280",
            companyFont: "Inter",
            companyFontSize: 14,
            companyFontWeight: "400",
            companyTextStyle: "normal",
            companySpacing: 8,
            companyPositionX: 0,
            companyPositionY: 0,
            textGroupHorizontal: 0,
            textGroupVertical: 0,
          },
        },
      },
    };
  };

  const initialProfileElement = createProfileElement();
  const homePageProfileElement = createProfileElement();

  const [cardData, setCardData] = useState<BusinessCard>({
    fullName: "",
    title: "",
    template: "minimal" as const,
    customContacts: [],
    pageElements: [initialProfileElement],
    customSocials: [],
    galleryImages: [],
    availableIcons: [],
    company: "",
    about: "",
    phone: "",
    email: "",
    website: "",
    location: "",
    brandColor: "#22c55e",
    accentColor: "#16a34a",
    font: "inter",
    elementSpacing: 16,
    individualElementSpacing: {},
    pages: [
      {
        id: "home",
        key: "home",
        path: "",
        label: "Home",
        visible: true,
        elements: [homePageProfileElement],
      },
    ] as any,
  });

  const [shareUrl, setShareUrl] = useState("");
  const [currentPageId, setCurrentPageId] = useState<string>("home");
  const [customUrlSlug, setCustomUrlSlug] = useState<string>(customUrlFromTemplate || "");
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (params.id) {
      setAutoSaveCardId(params.id);
    }
  }, [params.id, setAutoSaveCardId]);

  const updateShareUrl = (card: any) => {
    if (card.customUrl) {
      setShareUrl(`${window.location.origin}/${card.customUrl}`);
    } else if (card.shareSlug) {
      setShareUrl(`${window.location.origin}/${card.shareSlug}`);
    } else if (card.id) {
      setShareUrl(`${window.location.origin}/card/${card.id}`);
    }
  };

  const getCurrentPageData = () => {
    const pages = (cardData as any).pages || [];
    const page = pages.find((p: any) => p.id === currentPageId);
    if (page) {
      return {
        id: page.id,
        label: page.label,
        elements: page.elements || [],
      };
    }
    return (cardData as any).currentSelectedPage;
  };

  const handleNavigatePage = (pageId: string) => {
    setCurrentPageId(pageId);
    const pages = (cardData as any).pages || [];
    const targetPage = pages.find((p: any) => p.id === pageId);
    if (targetPage) {
      const isHome = pageId === "home" || targetPage.key === "home";
      setCardData((prev) => ({
        ...prev,
        currentPreviewMode: isHome ? "card" : "page",
        currentSelectedPage: isHome
          ? undefined
          : {
              id: targetPage.id,
              label: targetPage.label,
              elements: targetPage.elements || [],
            },
      }));
    }
  };

  const handleBackToCard = () => {
    setCurrentPageId("home");
    setCardData((prev) => ({
      ...prev,
      currentPreviewMode: "card",
      currentSelectedPage: undefined,
    }));
  };

  // Function to handle block selection from preview
  const handleBlockSelect = (block: BlockElement) => {
    setSelectedBlock(block);
    setEditorMode("block");
    setEditorDrawerOpen(true);
    setSidebarView("editor");
    setBlockEditorTab("content");
  };

  // Function to go back to elements panel (clear selection)
  const handleBackToElements = () => {
    setSelectedBlock(null);
    setEditorMode("full");
    setSidebarView("elements");
  };

  // Function to add new element to the card
  const handleAddElement = (element: PageElement) => {
    const updatedPageElements = [...cardData.pageElements, element];
    const updatedPages = cardData.pages.map((page: any) => {
      if (page.id === "home") {
        return {
          ...page,
          elements: [...page.elements, element]
        };
      }
      return page;
    });

    const updatedCardData = {
      ...cardData,
      pageElements: updatedPageElements,
      pages: updatedPages
    };

    setCardData(updatedCardData as any);

    // Mark as dirty (manual save on Publish)
    if (user && hasHydratedRef.current) {
      markDirty();
    }

    // Select the newly added element
    handleBlockSelect(element as BlockElement);
  };

  // Function to toggle element visibility (updates root-level visible property)
  const handleToggleVisibility = (elementId: string, visible: boolean) => {
    const updatedPageElements = cardData.pageElements.map((element: any) => {
      if (element.id === elementId) {
        return { ...element, visible };
      }
      return element;
    });

    const updatedPages = cardData.pages.map((page: any) => {
      if (page.id === "home") {
        return {
          ...page,
          elements: page.elements.map((element: any) => {
            if (element.id === elementId) {
              return { ...element, visible };
            }
            return element;
          })
        };
      }
      return page;
    });

    const updatedCardData = {
      ...cardData,
      pageElements: updatedPageElements,
      pages: updatedPages
    };

    setCardData(updatedCardData as any);

    // Mark as dirty (manual save on Publish)
    if (user && hasHydratedRef.current) {
      markDirty();
    }
  };

  // Function to reorder elements (drag-drop)
  const handleReorderElements = (newOrder: string[]) => {
    // Use component state currentPageId for consistent page targeting
    const activePageId = currentPageId || "home";
    
    // Create a map of new orders for visible elements
    const orderMap = new Map<string, number>();
    newOrder.forEach((id, index) => {
      orderMap.set(id, index);
    });
    
    // Get max order from visible elements
    const maxVisibleOrder = newOrder.length;

    // Update pages array with new order values
    let updatedCurrentPage: any = null;
    const updatedPages = cardData.pages.map((page: any) => {
      if (page.id === activePageId) {
        // Update all elements: visible get new order, hidden get normalized order after visible
        let hiddenOffset = 0;
        const updatedElements = page.elements.map((element: any) => {
          if (orderMap.has(element.id)) {
            return { ...element, order: orderMap.get(element.id) };
          } else {
            // Hidden element - place after all visible elements
            const order = maxVisibleOrder + hiddenOffset;
            hiddenOffset++;
            return { ...element, order };
          }
        });
        
        updatedCurrentPage = {
          ...page,
          elements: updatedElements.sort((a: any, b: any) => a.order - b.order)
        };
        return updatedCurrentPage;
      }
      return page;
    });

    // Create a set of element IDs that belong to the active page for efficient lookup
    const activePageElementIds = new Set(updatedCurrentPage?.elements?.map((el: any) => el.id) || []);
    
    // Create a map of updated elements from the active page for quick lookup
    const updatedElementsMap = new Map<string, any>();
    (updatedCurrentPage?.elements || []).forEach((el: any) => {
      updatedElementsMap.set(el.id, el);
    });
    
    // Update pageElements surgically: only update active page elements, preserve others
    const updatedPageElements = cardData.pageElements.map((element: any) => {
      if (activePageElementIds.has(element.id)) {
        // Replace with updated version from the active page
        return updatedElementsMap.get(element.id) || element;
      }
      return element; // Preserve elements from other pages unchanged
    });

    const updatedCardData = {
      ...cardData,
      pageElements: updatedPageElements,
      pages: updatedPages,
      // Only update currentSelectedPage for non-home pages to avoid breaking card view
      ...(activePageId !== "home" && updatedCurrentPage 
        ? { currentSelectedPage: updatedCurrentPage } 
        : {})
    };

    setCardData(updatedCardData as any);

    // Mark as dirty (manual save on Publish)
    if (user && hasHydratedRef.current) {
      markDirty();
    }
  };

  // Function to update a specific block
  const updateBlockData = (blockId: string, updatedData: any) => {
    // Update in pageElements
    const updatedPageElements = cardData.pageElements.map((element: any) => {
      if (element.id === blockId) {
        return {
          ...element,
          data: {
            ...element.data,
            ...updatedData
          }
        };
      }
      return element;
    });

    // Update in pages (for home page)
    const updatedPages = cardData.pages.map((page: any) => {
      if (page.id === "home") {
        return {
          ...page,
          elements: page.elements.map((element: any) => {
            if (element.id === blockId) {
              return {
                ...element,
                data: {
                  ...element.data,
                  ...updatedData
                }
              };
            }
            return element;
          })
        };
      }
      return page;
    });

    const updatedCardData = {
      ...cardData,
      pageElements: updatedPageElements,
      pages: updatedPages
    };

    setCardData(updatedCardData as any);

    // Mark as dirty (manual save on Publish)
    if (user && hasHydratedRef.current) {
      markDirty();
    }
  };

  // Function to get block icon based on type
  const getBlockIcon = (type: string) => {
    switch (type) {
      case "profile": return <Edit2 className="w-3.5 h-3.5" />;
      case "heading": return <Type className="w-3.5 h-3.5" />;
      case "contactSection": return <Phone className="w-3.5 h-3.5" />;
      case "socialSection": return <GlobeIcon className="w-3.5 h-3.5" />;
      case "phone": return <Phone className="w-3.5 h-3.5" />;
      case "email": return <Mail className="w-3.5 h-3.5" />;
      case "website": return <GlobeIcon className="w-3.5 h-3.5" />;
      case "location": return <MapPin className="w-3.5 h-3.5" />;
      case "about": return <MessageSquare className="w-3.5 h-3.5" />;
      case "gallery": return <Image className="w-3.5 h-3.5" />;
      case "link": return <LinkIcon className="w-3.5 h-3.5" />;
      default: return <Edit2 className="w-3.5 h-3.5" />;
    }
  };

  // Function to get block title based on type and data
  const getBlockTitle = (block: BlockElement) => {
    switch (block.type) {
      case "profile":
        return block.data?.fullName ? block.data.fullName : "Profile";
      case "heading":
        return block.data?.text ? block.data.text.substring(0, 20) + (block.data.text.length > 20 ? "..." : "") : "Heading";
      case "contactSection":
        return "Contacts";
      case "phone":
        return block.data?.value ? `Phone` : "Phone";
      case "email":
        return block.data?.value ? `Email` : "Email";
      case "website":
        return block.data?.value ? `Website` : "Website";
      default:
        return `${block.type.charAt(0).toUpperCase() + block.type.slice(1)}`;
    }
  };

  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
    enabled: !!selectedTemplateId,
    staleTime: 1000 * 60 * 10,
  });

  const { data: existingCard, isLoading } = useQuery({
    queryKey: ["/api/business-cards", params.id],
    queryFn: async () => {
      if (!params.id) return null;
      return await apiRequest("GET", `/api/business-cards/${params.id}`);
    },
    enabled: !!params.id,
  });

  useEffect(() => {
    if (selectedTemplateId && templates && !existingCard) {
      const selectedTemplate = (templates as any[]).find((t: any) => t.id === selectedTemplateId);
      if (selectedTemplate) {
        const newCardData = {
          ...cardData,
          template: selectedTemplate.id,
          fullName: selectedTemplate.defaultName || cardData.fullName,
          title: selectedTemplate.defaultTitle || cardData.title,
          brandColor: selectedTemplate.brandColor || cardData.brandColor,
          accentColor: selectedTemplate.accentColor || cardData.accentColor,
          backgroundColor: selectedTemplate.backgroundColor || (cardData as any).backgroundColor,
          textColor: selectedTemplate.textColor || (cardData as any).textColor,
          font: selectedTemplate.font || cardData.font,
        };
        setCardData(newCardData);
        hasHydratedRef.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplateId, templates, existingCard]);

  useEffect(() => {
    if (existingCard) {
      console.log('[CardEditor] Hydrating from existing card:', existingCard.id);

      let homePageElements = existingCard.pageElements || [];
      const additionalPages = existingCard.pages || [];

      const hasProfileElement = homePageElements.some((el: any) => el.type === "profile");
      if (!hasProfileElement && existingCard.profileSectionEnabled !== false) {
        const profileElement = { ...createProfileElement(), order: -1 };
        homePageElements = [profileElement, ...homePageElements];
        homePageElements = homePageElements.map((el: any, idx: number) => ({ ...el, order: idx }));
      }

      const allPages = [
        {
          id: "home",
          key: "home",
          path: "",
          label: "Home",
          visible: true,
          elements: homePageElements.map((el: any) => ({ ...el })),
        },
        ...additionalPages.map((page: any) => ({
          id: page.id,
          key: page.key || page.id,
          path: page.path,
          label: page.label,
          visible: page.visible !== false,
          elements: (page.elements || []).map((el: any) => ({ ...el })),
        })),
      ];

      const convertedCard = {
        ...existingCard,
        pageElements: homePageElements.map((el: any) => ({ ...el })),
        pages: allPages,
      };

      setCardData((prev) => ({
        ...(convertedCard as any),
        currentPreviewMode: prev.currentPreviewMode || "card",
        currentSelectedPage: prev.currentSelectedPage,
      }));

      updateShareUrl(existingCard);
      hasHydratedRef.current = true;
    }
  }, [existingCard]);

  useEffect(() => {
    if (lastSavedCard) {
      updateShareUrl(lastSavedCard);
      if (!params.id && lastSavedCard.id) {
        setAutoSaveCardId(lastSavedCard.id);
      }
    }
  }, [lastSavedCard, params.id, setAutoSaveCardId]);

  const triggerSave = useCallback(
    async (dataOverride?: any) => {
      if (!user) {
        toast({
          title: "Not logged in",
          description: "Please log in to save your card.",
          variant: "destructive",
        });
        return;
      }

      const dataToSave = dataOverride || cardData;

      if (!params.id && !customUrlSlug && !dataToSave.fullName && !dataToSave.title) {
        toast({
          title: "Cannot save",
          description: "Please provide either a custom URL or name and title.",
          variant: "destructive",
        });
        return;
      }

      try {
        await saveNow(dataToSave, customUrlSlug);
        clearDirty();
        toast({
          title: "Saved successfully",
          description: "Your card has been saved.",
        });
      } catch (error) {
        console.error('Save error:', error);
        toast({
          title: "Save failed",
          description: "Could not save your card. Please try again.",
          variant: "destructive",
        });
      }
    },
    [user, params.id, customUrlSlug, cardData, saveNow, toast]
  );

  // Publish card (saves and publishes like Elementor Pro)
  const handlePublish = useCallback(async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to publish your card.",
        variant: "destructive",
      });
      return;
    }

    const dataToSave = cardData;

    // Validate for new cards
    if (!params.id && !customUrlSlug && !dataToSave.fullName && !dataToSave.title) {
      toast({
        title: "Cannot publish",
        description: "Please provide either a custom URL or name and title.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      // Save all changes first, then publish (like Elementor Pro)
      await saveNow(dataToSave, customUrlSlug);
      await publishNow(dataToSave, customUrlSlug);
      
      // Clear dirty state after successful save and publish
      clearDirty();
      
      toast({
        title: "Published successfully!",
        description: "Your card is now live and can be shared publicly.",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Publish error:', error);
      toast({
        title: "Publish failed",
        description: error.message || "Could not publish your card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  }, [user, params.id, customUrlSlug, cardData, saveNow, publishNow, toast]);

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "URL copied to clipboard.",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (shareUrl && navigator.share) {
      navigator.share({
        title: `${cardData.fullName} - Business Card`,
        url: shareUrl,
      });
    } else {
      copyShareUrl();
    }
  };

  const toggleEditorDrawer = () => {
    setEditorDrawerOpen(!editorDrawerOpen);
    // Reset to full editor when closing
    if (editorDrawerOpen) {
      setEditorMode("full");
      setSelectedBlock(null);
    }
  };

  const handleBackToFullEditor = () => {
    setEditorMode("full");
    setSelectedBlock(null);
    setActiveEditorTab("content");
  };

  const editorTabs = [
    { id: "content", label: "Content", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "design", label: "Design", icon: <Palette className="w-3.5 h-3.5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-2">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center space-x-2 flex-1">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 text-xs p-1">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Link>
              <div className="text-sm font-semibold text-gray-900 truncate">CARD EDITOR</div>
              <div className="text-xs text-gray-500 min-w-[60px]">
                <AutoSaveIndicator isDirty={isDirty} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {shareUrl && (
                <div className="hidden md:flex items-center space-x-2 bg-gray-50 rounded px-2 py-1">
                  <div className="text-xs text-gray-700 truncate max-w-[80px]">{shareUrl}</div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      onClick={copyShareUrl}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded px-1.5 h-5"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.open(shareUrl, '_blank')}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded px-1.5 h-5"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Publish Button - Top Right like Elementor */}
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className={`
                  hidden md:flex items-center px-3 py-1 rounded font-medium text-sm h-7
                  ${isPublished && !isDirty
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                  }
                  ${isPublishing ? "opacity-70 cursor-not-allowed" : ""}
                `}
              >
                {isPublishing ? (
                  <>
                    <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1.5"></div>
                    Publishing...
                  </>
                ) : isPublished ? (
                  <>
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                    Published
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile URL Bar - Compact */}
        {shareUrl && (
          <div className="fixed top-10 left-0 right-0 bg-white border-b border-gray-200 px-2 py-1 z-10">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-700 truncate flex-1 mr-1">{shareUrl}</div>
              <div className="flex items-center space-x-0.5">
                <Button
                  size="sm"
                  onClick={copyShareUrl}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded px-1.5 h-5"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.open(shareUrl, '_blank')}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded px-1.5 h-5"
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Preview - Full height with minimal spacing */}
        <div className="h-[calc(100vh-6rem)] bg-white overflow-hidden">
          {/* Mobile Status Bar - Compact */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gray-900 flex items-center justify-between px-2 z-20">
            <div className="text-white text-[8px]">12:29 AM</div>
            <div className="flex items-center space-x-0.5">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
            </div>
          </div>

          {/* Mobile Preview Content - No extra padding */}
          <div className="h-full overflow-y-auto pt-4">
            {(cardData as any).currentPreviewMode === "page" && getCurrentPageData() ? (
              <PagePreview
                pageData={getCurrentPageData()}
                cardData={cardData}
                elementSpacing={(cardData as any).elementSpacing || 16}
                individualElementSpacing={(cardData as any).individualElementSpacing || {}}
                onNavigatePage={handleNavigatePage}
                onBackToCard={handleBackToCard}
                hideBackButton={true}
                fullFrame={true}
                ultraCompact={true}
                isEditing={true}
                onReorderElements={handleReorderElements}
                onSelectElement={(element) => handleBlockSelect(element as BlockElement)}
                selectedElementId={selectedBlock?.id}
              />
            ) : (
              <BusinessCardComponent
                data={cardData}
                isMobilePreview={true}
                showViewButton={false}
                onNavigatePage={handleNavigatePage}
                showInternalShareButton={false}
                fullFrame={true}
                ultraCompact={true}
                onBlockSelect={handleBlockSelect}
              />
            )}
          </div>
        </div>

        {/* Mobile Editor Drawer - Compact */}
        <div className={`
          fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 rounded-t-lg shadow-lg
          transition-transform duration-300 ease-in-out z-30
          ${editorDrawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-2.5rem)]'}
        `}>
          {/* Compact Drawer Handle */}
          <div 
            className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white rounded-t-lg cursor-pointer"
            onClick={toggleEditorDrawer}
          >
            <div className="flex items-center space-x-1">
              {editorMode === "block" && selectedBlock ? (
                <>
                  <div className="p-1 bg-orange-50 rounded">
                    {getBlockIcon(selectedBlock.type)}
                  </div>
                  <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">
                    {getBlockTitle(selectedBlock)}
                  </span>
                </>
              ) : (
                <span className="text-xs font-medium text-gray-700">Close Editor</span>
              )}
            </div>
            <div className="flex items-center">
              {editorMode === "block" && selectedBlock && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBackToFullEditor();
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 mr-1"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
              {editorDrawerOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
              )}
            </div>
          </div>

          {/* Editor Tabs - Sticky for mobile scrolling */}
          <div className="sticky top-0 z-10 bg-white">
            {editorMode === "full" ? (
              <div className="flex border-b border-gray-200 bg-gray-50">
                {editorTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveEditorTab(tab.id)}
                    className={`
                      flex-1 flex flex-col items-center justify-center py-2.5 px-1 touch-manipulation
                      ${activeEditorTab === tab.id 
                        ? 'bg-white text-orange-500 border-b-2 border-orange-500' 
                        : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                      }
                    `}
                  >
                    <div className="mb-0.5">{tab.icon}</div>
                    <span className="text-[10px] font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <ElementEditorTabs
                activeTab={blockEditorTab}
                onTabChange={setBlockEditorTab}
                compact={true}
                className="border-b border-gray-200"
              />
            )}
          </div>

          {/* Editor Content - Compact */}
          <div className={`${editorMode === "block" ? 'h-[45vh]' : 'h-[50vh]'} overflow-y-auto`}>
            <div className="p-3">
              {editorMode === "block" && selectedBlock ? (
                // Block-specific editor with tabs - consistent panel rendering
                <div className="space-y-3">
                  {/* Contact Section Editor - separate panels for each tab */}
                  {selectedBlock.type === "contactSection" && (
                    <>
                      {blockEditorTab === "content" && (
                        <ContactContentPanel
                          data={selectedBlock.data || {}}
                          onChange={(data) => updateBlockData(selectedBlock.id, data)}
                        />
                      )}
                      {blockEditorTab === "design" && (
                        <ContactDesignPanel
                          data={selectedBlock.data || {}}
                          onChange={(data) => updateBlockData(selectedBlock.id, data)}
                        />
                      )}
                      {blockEditorTab === "settings" && (
                        <ContactSettingsPanel
                          data={selectedBlock.data || {}}
                          onChange={(data) => updateBlockData(selectedBlock.id, data)}
                        />
                      )}
                    </>
                  )}

                  {/* Dynamic Element Editor from Registry (Mobile) */}
                  {selectedBlock.type !== "contactSection" && (() => {
                    const EditorComponent = getElementEditor(selectedBlock.type);
                    if (EditorComponent) {
                      return (
                        <EditorComponent
                          element={selectedBlock}
                          onUpdate={(updatedElement: any) => {
                            updateBlockData(selectedBlock.id, updatedElement.data);
                          }}
                          cardData={cardData}
                        />
                      );
                    }
                    return (
                      <div className="text-center py-4">
                        <div className="text-gray-400 mb-1">
                          {getBlockIcon(selectedBlock.type)}
                        </div>
                        <p className="text-xs text-gray-600">No editor available</p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                // Compact FormBuilder for full editor
                <FormBuilder
                  cardData={cardData}
                  onDataChange={(data) => {
                    const updated = {
                      ...(data as any),
                      currentPreviewMode: (cardData as any).currentPreviewMode,
                      currentSelectedPage: (cardData as any).currentSelectedPage,
                    };

                    setCardData(updated as any);

                    // Mark as dirty (manual save on Publish)
                    if (user && hasHydratedRef.current) {
                      markDirty();
                    }
                  }}
                  onSave={triggerSave}
                  onGenerateQR={() => {}}
                  onNavigationChange={handleNavigatePage}
                  compact={true}
                  fullFrame={true}
                  ultraCompact={true}
                  mobile={true}
                  superCompact={true}
                />
              )}
            </div>
          </div>

          {/* Mobile Publish Button - Fixed at bottom */}
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-2">
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className={`
                w-full py-2 rounded font-medium text-sm
                ${isPublished && !isDirty
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "bg-orange-500 hover:bg-orange-600 text-white"
                }
                ${isPublishing ? "opacity-70 cursor-not-allowed" : ""}
              `}
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full mr-1.5"></div>
                  Publishing...
                </>
              ) : isPublished ? (
                <>
                  <Globe className="w-3.5 h-3.5 mr-1.5" />
                  Published
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 mr-1.5" />
                  Publish Card
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Elementor Pro Style */}
      <div className="hidden md:flex h-[calc(100vh-40px)]">
        {/* Left Sidebar - Elementor Style */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Toolbar */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-1">
              {/* Add Element Button */}
              <Button
                variant={sidebarView === "elements" ? "default" : "ghost"}
                size="sm"
                onClick={() => { setSidebarView("elements"); setSelectedBlock(null); }}
                className={`h-8 w-8 p-0 ${sidebarView === "elements" ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}`}
                title="Add Element"
              >
                <Plus className="w-4 h-4" />
              </Button>
              
              {/* Settings/Editor Button */}
              <Button
                variant={sidebarView === "editor" && selectedBlock ? "default" : "ghost"}
                size="sm"
                onClick={() => { if (selectedBlock) setSidebarView("editor"); }}
                disabled={!selectedBlock}
                className={`h-8 w-8 p-0 ${sidebarView === "editor" && selectedBlock ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}`}
                title="Edit Element"
              >
                <Sliders className="w-4 h-4" />
              </Button>
              
              {/* Structure/Navigator Button */}
              <Button
                variant={sidebarView === "structure" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSidebarView("structure")}
                className={`h-8 w-8 p-0 ${sidebarView === "structure" ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}`}
                title="Structure / Navigator"
              >
                <Layers className="w-4 h-4" />
              </Button>
              
              {/* Global Settings Button */}
              <Button
                variant={sidebarView === "settings" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSidebarView("settings")}
                className={`h-8 w-8 p-0 ${sidebarView === "settings" ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}`}
                title="Card Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-xs text-gray-500">
              <AutoSaveIndicator isDirty={isDirty} />
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            {sidebarView === "elements" && (
              <ElementsPanel onAddElement={handleAddElement} />
            )}

            {sidebarView === "structure" && (
              <StructurePanel
                elements={getCurrentPageData()?.elements || cardData.pageElements || []}
                selectedElementId={selectedBlock?.id}
                onSelectElement={(element) => handleBlockSelect(element as BlockElement)}
                onToggleVisibility={handleToggleVisibility}
                onReorderElements={handleReorderElements}
                onClose={() => setSidebarView("elements")}
              />
            )}

            {sidebarView === "editor" && selectedBlock && (
              <div className="h-full flex flex-col">
                {/* Editor Header with Back Button */}
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToElements}
                      className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                      Back
                    </Button>
                    <span className="text-xs text-gray-500">Edit {getBlockTitle(selectedBlock)}</span>
                  </div>
                </div>

                {/* Element Editor Tabs */}
                <ElementEditorTabs
                  activeTab={blockEditorTab}
                  onTabChange={setBlockEditorTab}
                  className="border-b border-gray-200"
                />

                {/* Element Editor Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-3">
                  {/* Contact Section Editor */}
                  {selectedBlock.type === "contactSection" && (
                    <>
                      {blockEditorTab === "content" && (
                        <ContactContentPanel
                          data={selectedBlock.data || {}}
                          onChange={(data) => updateBlockData(selectedBlock.id, data)}
                        />
                      )}
                      {blockEditorTab === "design" && (
                        <ContactDesignPanel
                          data={selectedBlock.data || {}}
                          onChange={(data) => updateBlockData(selectedBlock.id, data)}
                        />
                      )}
                      {blockEditorTab === "settings" && (
                        <ContactSettingsPanel
                          data={selectedBlock.data || {}}
                          onChange={(data) => updateBlockData(selectedBlock.id, data)}
                        />
                      )}
                    </>
                  )}

                  {/* Dynamic Element Editor from Registry */}
                  {selectedBlock.type !== "contactSection" && (() => {
                    const EditorComponent = getElementEditor(selectedBlock.type);
                    if (EditorComponent) {
                      return (
                        <EditorComponent
                          element={selectedBlock}
                          onUpdate={(updatedElement: any) => {
                            updateBlockData(selectedBlock.id, updatedElement.data);
                          }}
                          cardData={cardData}
                        />
                      );
                    }
                    return (
                      <div className="text-center py-6">
                        <div className="text-gray-400 mb-2">
                          {getBlockIcon(selectedBlock.type)}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">No editor available for this element</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {sidebarView === "settings" && (
              <div className="h-full flex flex-col">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Card Settings</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <FormBuilder
                    cardData={cardData}
                    onDataChange={(data) => {
                      const updated = {
                        ...(data as any),
                        currentPreviewMode: (cardData as any).currentPreviewMode,
                        currentSelectedPage: (cardData as any).currentSelectedPage,
                      };

                      setCardData(updated as any);

                      // Mark as dirty (manual save on Publish)
                      if (user && hasHydratedRef.current) {
                        markDirty();
                      }
                    }}
                    onSave={triggerSave}
                    onGenerateQR={() => {}}
                    onNavigationChange={handleNavigatePage}
                    compact={true}
                    fullFrame={true}
                    ultraCompact={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 bg-gray-100 p-4 overflow-auto">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {(cardData as any).currentPreviewMode === "page" && getCurrentPageData() ? (
                <PagePreview
                  pageData={getCurrentPageData()}
                  cardData={cardData}
                  elementSpacing={(cardData as any).elementSpacing || 16}
                  individualElementSpacing={(cardData as any).individualElementSpacing || {}}
                  onNavigatePage={handleNavigatePage}
                  onBackToCard={handleBackToCard}
                  hideBackButton={true}
                  fullFrame={true}
                  ultraCompact={true}
                  isEditing={true}
                  onReorderElements={handleReorderElements}
                  onSelectElement={(element) => handleBlockSelect(element as BlockElement)}
                  selectedElementId={selectedBlock?.id}
                />
              ) : (
                <BusinessCardComponent
                  data={cardData}
                  isMobilePreview={true}
                  showViewButton={false}
                  onNavigatePage={handleNavigatePage}
                  showInternalShareButton={false}
                  onBlockSelect={handleBlockSelect}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}