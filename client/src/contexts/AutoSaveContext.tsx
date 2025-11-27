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
  forceSave: () => Promise<void>;
  reset: () => void;
}

const AutoSaveContext = createContext<AutoSaveContextType | null>(null);

const DEBOUNCE_DELAY = 1500;

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
      
      let pageElementsToSave = (dataToSave.pageElements || []) as any[];
      
      if (pageElementsToSave.length === 0) {
        const allElements: any[] = [];
        const pages = (dataToSave as any).pages || [];
        if (Array.isArray(pages)) {
          pages.forEach((page: any) => {
            if (Array.isArray(page.elements)) {
              allElements.push(...page.elements);
            }
          });
        }
        pageElementsToSave = allElements;
      }
      
      const finalData = {
        ...dataToSave,
        pageElements: pageElementsToSave,
        pages: null,
        menu: null,
        currentPreviewMode: undefined,
        currentSelectedPage: undefined
      };
      
      console.log('[AutoSave] Saving card with', finalData.pageElements?.length || 0, 'elements');
      
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

  const queueSave = useCallback((data: BusinessCard, customUrlSlug?: string) => {
    pendingDataRef.current = { data, customUrlSlug };
    setStatus("dirty");
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (isSavingRef.current) {
        return;
      }
      
      const pending = pendingDataRef.current;
      if (pending) {
        pendingDataRef.current = null;
        saveMutation.mutate({ 
          data: pending.data, 
          customUrlSlug: pending.customUrlSlug,
          currentCardId: cardId
        });
      }
    }, DEBOUNCE_DELAY);
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
      forceSave,
      reset,
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
