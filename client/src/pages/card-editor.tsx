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

  // Use a queue for pending saves instead of single ref
  const pendingQueueRef = useRef<Array<{ data: BusinessCard; customUrlSlug?: string }>>([]);
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

      // Process next item in queue if exists
      processNextInQueue();
    },

    onError: (err: any) => {
      isSavingRef.current = false;
      console.error('[AutoSave] Error:', err);

      const msg = String(err?.message || "Failed to save");
      const isMissingFields = msg.includes("Please provide either a custom URL or name and title");

      if (isMissingFields) {
        setStatus("dirty"); // Keep as dirty but don't show error
        setError(null);
        // Still try to process next in queue
        processNextInQueue();
        return;
      }

      setStatus("error");
      setError(msg);

      // Retry after delay
      setTimeout(() => {
        processNextInQueue();
      }, 3000);
    },
  });

  // Process the next item in the save queue
  const processNextInQueue = useCallback(() => {
    // If already saving, do nothing
    if (isSavingRef.current) return;

    // If queue is empty, return to idle
    if (pendingQueueRef.current.length === 0) {
      setStatus("idle");
      return;
    }

    // Take the next item from queue
    const nextItem = pendingQueueRef.current.shift();
    if (!nextItem) return;

    // Validate for new cards
    const cleaned = sanitizeCardForSave(nextItem.data);
    if (!cardId && !isCreatePayloadValid(cleaned, nextItem.customUrlSlug)) {
      console.log('[AutoSave] Invalid create payload, skipping');
      setStatus("dirty");
      // Try next item
      processNextInQueue();
      return;
    }

    // Save this item
    saveMutation.mutate({
      data: nextItem.data,
      customUrlSlug: nextItem.customUrlSlug,
      currentCardId: cardId,
    });
  }, [cardId, saveMutation]);

  // Start debounced queue processing
  const startDebouncedSave = useCallback(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      processNextInQueue();
    }, 1200); // Increased debounce time
  }, [processNextInQueue]);

  const queueSave = useCallback(
    (data: BusinessCard, customUrlSlug?: string) => {
      // Add to queue
      pendingQueueRef.current.push({ data, customUrlSlug });

      // Limit queue size to prevent memory issues
      if (pendingQueueRef.current.length > 10) {
        // Keep only the most recent 5 items
        pendingQueueRef.current = pendingQueueRef.current.slice(-5);
      }

      // Update status if not already saving/saved
      if (status !== "saving" && status !== "saved") {
        setStatus("dirty");
      }

      // Start debounced save
      startDebouncedSave();
    },
    [status, startDebouncedSave]
  );

  const saveNow = useCallback(
    async (data: BusinessCard, customUrlSlug?: string) => {
      console.log('[AutoSave] Manual save triggered');

      // Clear any pending debounced saves
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Clear queue for manual save (we want immediate save)
      pendingQueueRef.current = [];

      // If already saving, wait for it to finish then save manually
      if (isSavingRef.current) {
        console.log('[AutoSave] Already saving, will save after current');
        // Queue this save to happen after current
        pendingQueueRef.current.push({ data, customUrlSlug });
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
    // Clear any pending timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // If queue has items, save the most recent one
    if (pendingQueueRef.current.length > 0) {
      const mostRecent = pendingQueueRef.current[pendingQueueRef.current.length - 1];
      pendingQueueRef.current = [];
      await saveNow(mostRecent.data, mostRecent.customUrlSlug);
    } else {
      console.log('[AutoSave] No pending data to force save');
    }
  }, [saveNow]);

  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    pendingQueueRef.current = [];
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