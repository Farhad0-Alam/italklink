import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { BusinessCard } from "@shared/schema";

type AutoSaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

interface AutoSaveContextType {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  lastSavedCard: BusinessCard | null;
  error: string | null;
  cardId: string | null;
  setCardId: (id: string | null) => void;
  queueSave: (data: BusinessCard, customUrlSlug?: string) => void;
  saveNow: (data: BusinessCard, customUrlSlug?: string) => Promise<void>;
  forceSave: () => Promise<void>;
  reset: () => void;
  updatePendingData: (data: BusinessCard, customUrlSlug?: string) => void;
}

const AutoSaveContext = createContext<AutoSaveContextType | null>(null);

interface AutoSaveProviderProps {
  children: ReactNode;
}

export function AutoSaveProvider({ children }: AutoSaveProviderProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [lastSavedCard, setLastSavedCard] = useState<BusinessCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  
  const pendingDataRef = useRef<{ data: BusinessCard; customUrlSlug?: string } | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const saveMutation = useMutation({
    mutationFn: async ({ data, customUrlSlug, currentCardId }: { 
      data: BusinessCard; 
      customUrlSlug?: string;
      currentCardId: string | null;
    }) => {
      const dataToSave = {
        ...data,
        ...(customUrlSlug && { customUrl: customUrlSlug })
      };
      
      const pages = (dataToSave as any).pages || [];
      
      // Merge all elements from all pages into pageElements for backward compatibility
      // The first page (home) elements go to pageElements, additional pages are stored in pages array
      let pageElementsToSave = (dataToSave.pageElements || []) as any[];
      
      // If we have a home page with elements, use those as pageElements
      if (Array.isArray(pages)) {
        const homePage = pages.find((p: any) => p.key === 'home' || p.id === 'home');
        if (homePage?.elements && Array.isArray(homePage.elements) && homePage.elements.length > 0) {
          pageElementsToSave = homePage.elements;
        }
      }
      
      // Prepare pages array - keep only non-home pages with their elements for multi-page support
      const pagesToSave = Array.isArray(pages) 
        ? pages.filter((p: any) => p.key !== 'home' && p.id !== 'home').map((page: any) => ({
            id: page.id,
            key: page.key || page.id,
            path: page.path,
            label: page.label,
            visible: page.visible !== false,
            elements: page.elements || []
          }))
        : null;
      
      const finalData = {
        ...dataToSave,
        pageElements: pageElementsToSave,
        pages: pagesToSave && pagesToSave.length > 0 ? pagesToSave : null,
        menu: null,
      };
      
      console.log('[AutoSave] Saving card with', finalData.pageElements?.length || 0, 'home elements and', finalData.pages?.length || 0, 'additional pages');
      
      const result = currentCardId 
        ? await apiRequest('PUT', `/api/business-cards/${currentCardId}`, finalData)
        : await apiRequest('POST', '/api/business-cards', finalData);
      
      console.log('[AutoSave] Save successful, card:', result?.id || 'unknown');
      return result;
    },
    onMutate: () => {
      isSavingRef.current = true;
      setStatus("saving");
      setError(null);
    },
    onSuccess: (savedCard) => {
      isSavingRef.current = false;
      setStatus("saved");
      setLastSaved(new Date());
      setLastSavedCard(savedCard);
      setError(null);
      
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards'] });
      if (savedCard?.id) {
        queryClient.invalidateQueries({ queryKey: ['/api/business-cards', savedCard.id] });
      }
      
      if (!cardId && savedCard?.id) {
        setCardId(savedCard.id);
        window.history.replaceState(null, '', `/card-editor/${savedCard.id}`);
      }
      
      const resetTimer = setTimeout(() => {
        setStatus((current) => current === "saved" && !pendingDataRef.current ? "idle" : current);
      }, 2000);
      
      if (pendingDataRef.current) {
        clearTimeout(resetTimer);
        const pending = pendingDataRef.current;
        pendingDataRef.current = null;
        setTimeout(() => queueSave(pending.data, pending.customUrlSlug), 100);
      }
    },
    onError: (err: any) => {
      isSavingRef.current = false;
      setStatus("error");
      const errorMessage = err?.message || "Failed to save";
      setError(errorMessage);
      console.error('[AutoSave] Error:', errorMessage);
      
      setTimeout(() => {
        if (pendingDataRef.current) {
          const pending = pendingDataRef.current;
          pendingDataRef.current = null;
          queueSave(pending.data, pending.customUrlSlug);
        }
      }, 3000);
    },
  });

  const updatePendingData = useCallback((data: BusinessCard, customUrlSlug?: string) => {
    pendingDataRef.current = { data, customUrlSlug };
    if (status !== "saving") {
      setStatus("dirty");
    }
  }, [status]);

  const queueSave = useCallback((data: BusinessCard, customUrlSlug?: string) => {
    pendingDataRef.current = { data, customUrlSlug };
    if (status !== "saving") {
      setStatus("dirty");
    }
  }, [status]);

  const saveNow = useCallback(async (data: BusinessCard, customUrlSlug?: string) => {
    console.log('[AutoSave] saveNow called with', data?.pageElements?.length || 0, 'elements, cardId:', cardId);
    if (isSavingRef.current) {
      console.log('[AutoSave] Already saving, queuing data');
      pendingDataRef.current = { data, customUrlSlug };
      return;
    }
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    pendingDataRef.current = null;
    console.log('[AutoSave] Executing save mutation...');
    await saveMutation.mutateAsync({ 
      data, 
      customUrlSlug,
      currentCardId: cardId
    });
  }, [cardId, saveMutation]);

  const forceSave = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    const pending = pendingDataRef.current;
    if (pending && !isSavingRef.current) {
      pendingDataRef.current = null;
      await saveMutation.mutateAsync({ 
        data: pending.data, 
        customUrlSlug: pending.customUrlSlug,
        currentCardId: cardId
      });
    }
  }, [cardId, saveMutation]);

  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    pendingDataRef.current = null;
    setStatus("idle");
    setError(null);
    setCardId(null);
    setLastSavedCard(null);
  }, []);

  return (
    <AutoSaveContext.Provider value={{
      status,
      lastSaved,
      lastSavedCard,
      error,
      cardId,
      setCardId,
      queueSave,
      saveNow,
      forceSave,
      reset,
      updatePendingData,
    }}>
      {children}
    </AutoSaveContext.Provider>
  );
}

export function useAutoSave() {
  const context = useContext(AutoSaveContext);
  if (!context) {
    throw new Error("useAutoSave must be used within an AutoSaveProvider");
  }
  return context;
}
