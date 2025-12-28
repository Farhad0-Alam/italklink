import React, { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from "react";
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
}

const AutoSaveContext = createContext<AutoSaveContextType | null>(null);

interface AutoSaveProviderProps {
  children: ReactNode;
}

/**
 * Sanitize card data for API submission
 * Removes server-managed fields and editor-only fields
 */
function sanitizeCardForSave(input: any): Partial<BusinessCard> {
  // Deep clone to avoid mutating react state objects
  const data = structuredClone ? structuredClone(input) : JSON.parse(JSON.stringify(input));

  // Remove ALL server-managed fields
  const serverFields = [
    'id', 'userId', 'createdAt', 'updatedAt', 'deletedAt',
    'shareSlug', 'slug', 'views', 'analytics', 'lastViewedAt',
    'lastSaved', 'lastSavedAt', 'published'
  ];

  serverFields.forEach(field => {
    delete data[field];
  });

  // Remove editor-only UI state fields
  const uiFields = [
    'currentPreviewMode', 'currentSelectedPage'
  ];

  uiFields.forEach(field => {
    delete data[field];
  });

  // Ensure arrays exist to prevent null errors
  if (!data.customContacts) data.customContacts = [];
  if (!data.customSocials) data.customSocials = [];
  if (!data.galleryImages) data.galleryImages = [];
  if (!data.availableIcons) data.availableIcons = [];
  if (!data.pages) data.pages = [];
  if (!data.pageElements) data.pageElements = [];

  // Process pages: ensure home page is properly structured
  if (Array.isArray(data.pages)) {
    data.pages = data.pages.map((page: any) => {
      // Ensure each page has required fields
      const cleanPage = {
        id: page.id || `page-${Date.now()}`,
        key: page.key || page.id || `page-${Date.now()}`,
        path: page.path || '',
        label: page.label || 'Untitled Page',
        visible: page.visible !== false,
        elements: Array.isArray(page.elements) ? page.elements : []
      };
      return cleanPage;
    });
  }

  // Ensure pageElements is always an array
  if (!Array.isArray(data.pageElements)) {
    data.pageElements = [];
  }

  return data;
}

function isCreatePayloadValid(data: any, customUrlSlug?: string): boolean {
  // For creation, we need either customUrl or fullName + title
  if (customUrlSlug && String(customUrlSlug).trim().length > 0) return true;

  const fullNameOk = !!String(data?.fullName || "").trim();
  const titleOk = !!String(data?.title || "").trim();
  return fullNameOk && titleOk;
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
  const saveAttemptRef = useRef(0);

  const saveMutation = useMutation({
    mutationFn: async ({
      data,
      customUrlSlug,
      currentCardId,
    }: {
      data: BusinessCard;
      customUrlSlug?: string;
      currentCardId: string | null;
    }) => {
      saveAttemptRef.current += 1;
      const attempt = saveAttemptRef.current;

      console.log(`[AutoSave] Save attempt ${attempt}`, {
        currentCardId,
        hasCustomUrl: !!customUrlSlug,
        dataKeys: Object.keys(data)
      });

      const cleaned = sanitizeCardForSave(data);

      // Attach customUrl if provided
      const dataToSave: any = {
        ...cleaned,
      };

      if (customUrlSlug) {
        dataToSave.customUrl = customUrlSlug.trim();
      }

      // Validate create requirements (prevents 400 spam)
      if (!currentCardId && !isCreatePayloadValid(dataToSave, customUrlSlug)) {
        console.log('[AutoSave] Create validation failed - missing required fields');
        throw new Error('{"message":"Please provide either a custom URL or name and title."}');
      }

      // Prepare the final payload
      const finalData = {
        ...dataToSave,
        // Ensure we always send these as arrays (not null/undefined)
        customContacts: dataToSave.customContacts || [],
        customSocials: dataToSave.customSocials || [],
        galleryImages: dataToSave.galleryImages || [],
        availableIcons: dataToSave.availableIcons || [],
        pages: Array.isArray(dataToSave.pages) ? dataToSave.pages : [],
        pageElements: Array.isArray(dataToSave.pageElements) ? dataToSave.pageElements : []
      };

      console.log(`[AutoSave] Attempt ${attempt} - Sending to API`, {
        method: currentCardId ? 'PUT' : 'POST',
        url: currentCardId ? `/api/business-cards/${currentCardId}` : '/api/business-cards',
        hasPages: finalData.pages.length,
        hasPageElements: finalData.pageElements.length
      });

      const result = currentCardId
        ? await apiRequest("PUT", `/api/business-cards/${currentCardId}`, finalData)
        : await apiRequest("POST", "/api/business-cards", finalData);

      console.log(`[AutoSave] Attempt ${attempt} - Success`, {
        newCardId: result?.id,
        hasShareSlug: !!result?.shareSlug
      });

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

      // Update queries
      queryClient.invalidateQueries({ queryKey: ["/api/business-cards"] });
      if (savedCard?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/business-cards", savedCard.id] });
      }

      // Update URL if this was a create operation
      if (!cardId && savedCard?.id) {
        setCardId(savedCard.id);
        // Update browser URL without reload
        window.history.replaceState(null, "", `/card-editor/${savedCard.id}`);
      }

      // If more changes came in while saving, save again
      if (pendingDataRef.current) {
        const pending = pendingDataRef.current;
        pendingDataRef.current = null;
        console.log('[AutoSave] More changes pending, saving again...');
        setTimeout(() => queueSave(pending.data, pending.customUrlSlug), 300);
        return;
      }

      // Auto-reset saved => idle after delay
      setTimeout(() => {
        if (status === "saved") {
          setStatus("idle");
        }
      }, 2000);
    },

    onError: (err: any) => {
      isSavingRef.current = false;
      console.error('[AutoSave] Error:', err);

      const msg = String(err?.message || "Failed to save");
      const isMissingFields = msg.includes("Please provide either a custom URL or name and title");

      if (isMissingFields) {
        setStatus("dirty"); // Keep as dirty but don't show error
        setError(null);
        return;
      }

      setStatus("error");
      setError(msg);

      // Retry after delay if we have pending data
      setTimeout(() => {
        if (pendingDataRef.current) {
          const pending = pendingDataRef.current;
          pendingDataRef.current = null;
          console.log('[AutoSave] Retrying after error...');
          queueSave(pending.data, pending.customUrlSlug);
        }
      }, 3000);
    },
  });

  const runDebouncedSave = useCallback(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const pending = pendingDataRef.current;
      if (!pending) {
        console.log('[AutoSave] No pending data, skipping save');
        return;
      }

      // If already saving, keep the pending data for later
      if (isSavingRef.current) {
        console.log('[AutoSave] Already saving, queuing for later');
        return;
      }

      // For new cards, validate required fields
      const cleaned = sanitizeCardForSave(pending.data);
      if (!cardId && !isCreatePayloadValid(cleaned, pending.customUrlSlug)) {
        console.log('[AutoSave] Invalid create payload, skipping');
        setStatus("dirty");
        return;
      }

      // Clear pending data before saving
      const dataToSave = { ...pending };
      pendingDataRef.current = null;

      try {
        await saveMutation.mutateAsync({
          data: dataToSave.data,
          customUrlSlug: dataToSave.customUrlSlug,
          currentCardId: cardId,
        });
      } catch (error) {
        console.error('[AutoSave] Debounced save failed:', error);
      }
    }, 1200); // Increased debounce time
  }, [cardId, saveMutation]);

  const queueSave = useCallback(
    (data: BusinessCard, customUrlSlug?: string) => {
      // Always update pending data with latest
      pendingDataRef.current = { data, customUrlSlug };

      // Update status if not already saving
      if (status !== "saving") {
        setStatus("dirty");
      }

      // Start debounced save
      runDebouncedSave();
    },
    [status, runDebouncedSave]
  );

  const saveNow = useCallback(
    async (data: BusinessCard, customUrlSlug?: string) => {
      console.log('[AutoSave] Manual save triggered');

      // Cancel any pending debounced save
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // If already saving, queue this data for after current save
      if (isSavingRef.current) {
        console.log('[AutoSave] Already saving, queuing manual save');
        pendingDataRef.current = { data, customUrlSlug };
        setStatus("dirty");
        return;
      }

      // Validate for new cards
      const cleaned = sanitizeCardForSave(data);
      if (!cardId && !isCreatePayloadValid(cleaned, customUrlSlug)) {
        console.log('[AutoSave] Manual save validation failed');
        setStatus("dirty");
        return;
      }

      // Clear any pending data
      pendingDataRef.current = null;

      try {
        await saveMutation.mutateAsync({
          data,
          customUrlSlug,
          currentCardId: cardId,
        });
      } catch (error) {
        console.error('[AutoSave] Manual save failed:', error);
        throw error;
      }
    },
    [cardId, saveMutation]
  );

  const forceSave = useCallback(async () => {
    const pending = pendingDataRef.current;
    if (pending) {
      await saveNow(pending.data, pending.customUrlSlug);
    } else {
      console.log('[AutoSave] No pending data to force save');
    }
  }, [saveNow]);

  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    pendingDataRef.current = null;
    isSavingRef.current = false;
    saveAttemptRef.current = 0;
    setStatus("idle");
    setError(null);
    setCardId(null);
    setLastSavedCard(null);
    setLastSaved(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <AutoSaveContext.Provider
      value={{
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
      }}
    >
      {children}
    </AutoSaveContext.Provider>
  );
}

export function useAutoSave() {
  const context = useContext(AutoSaveContext);
  if (!context) throw new Error("useAutoSave must be used within an AutoSaveProvider");
  return context;
}