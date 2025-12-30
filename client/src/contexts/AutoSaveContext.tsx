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
  setupClickBasedAutoSave: () => void;
  disableClickBasedAutoSave: () => void;
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
  const data = structuredClone ? structuredClone(input) : JSON.parse(JSON.stringify(input));

  const serverFields = [
    'id', 'userId', 'createdAt', 'updatedAt', 'deletedAt',
    'shareSlug', 'slug', 'views', 'analytics', 'lastViewedAt',
    'lastSaved', 'lastSavedAt', 'published'
  ];

  serverFields.forEach(field => {
    delete data[field];
  });

  const uiFields = [
    'currentPreviewMode', 'currentSelectedPage'
  ];

  uiFields.forEach(field => {
    delete data[field];
  });

  if (!data.customContacts) data.customContacts = [];
  if (!data.customSocials) data.customSocials = [];
  if (!data.galleryImages) data.galleryImages = [];
  if (!data.availableIcons) data.availableIcons = [];
  if (!data.pages) data.pages = [];
  if (!data.pageElements) data.pageElements = [];

  if (Array.isArray(data.pages)) {
    data.pages = data.pages.map((page: any) => {
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

  if (!Array.isArray(data.pageElements)) {
    data.pageElements = [];
  }

  return data;
}

function isCreatePayloadValid(data: any, customUrlSlug?: string): boolean {
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
  const clickListenerActiveRef = useRef(false);
  const clickSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const statusRef = useRef<AutoSaveStatus>("idle");

  // Keep statusRef in sync with status state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Forward declaration for forceSave (will be defined later)
  const forceSaveRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // Function to handle document clicks for auto-save
  const handleDocumentClick = useCallback((e: MouseEvent) => {
    if (statusRef.current !== 'dirty' || isSavingRef.current) return;

    const target = e.target as HTMLElement;
    
    const ignoreTags = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'];
    const tagName = target.tagName.toUpperCase();
    
    if (ignoreTags.includes(tagName)) return;
    
    const ignoreClasses = ['ignore-click-save', 'no-auto-save'];
    const hasIgnoreClass = ignoreClasses.some(className => 
      target.classList.contains(className) || 
      target.closest(`.${className}`)
    );
    
    if (hasIgnoreClass) return;

    if (target.closest('.modal, .dialog, .popup, [role="dialog"]')) return;

    if (pendingDataRef.current) {
      console.log('[AutoSave] Click detected, triggering auto-save');
      
      if (clickSaveTimerRef.current) {
        clearTimeout(clickSaveTimerRef.current);
      }
      
      clickSaveTimerRef.current = setTimeout(async () => {
        try {
          await forceSaveRef.current();
        } catch (error) {
          console.error('[AutoSave] Click-based save failed:', error);
        }
      }, 300);
    }
  }, []);

  // Function to handle input blur for auto-save
  const handleInputBlur = useCallback((e: FocusEvent) => {
    if (statusRef.current !== 'dirty' || isSavingRef.current) return;

    const target = e.target as HTMLElement;
    const tagName = target.tagName.toUpperCase();
    
    const editableTags = ['INPUT', 'TEXTAREA', 'SELECT'];
    const isContentEditable = target.getAttribute('contenteditable') === 'true';
    
    if ((editableTags.includes(tagName) || isContentEditable) && pendingDataRef.current) {
      console.log('[AutoSave] Input blur detected, triggering auto-save');
      
      setTimeout(async () => {
        if (pendingDataRef.current && statusRef.current === 'dirty' && !isSavingRef.current) {
          try {
            await forceSaveRef.current();
          } catch (error) {
            console.error('[AutoSave] Blur-based save failed:', error);
          }
        }
      }, 500);
    }
  }, []);

  // Setup click-based auto-save
  const setupClickBasedAutoSave = useCallback(() => {
    if (clickListenerActiveRef.current) return;
    
    console.log('[AutoSave] Setting up click-based auto-save');
    
    document.addEventListener('click', handleDocumentClick, true);
    document.addEventListener('blur', handleInputBlur, true);
    
    clickListenerActiveRef.current = true;
  }, [handleDocumentClick, handleInputBlur]);

  // Disable click-based auto-save
  const disableClickBasedAutoSave = useCallback(() => {
    if (!clickListenerActiveRef.current) return;
    
    console.log('[AutoSave] Disabling click-based auto-save');
    
    document.removeEventListener('click', handleDocumentClick, true);
    document.removeEventListener('blur', handleInputBlur, true);
    
    clickListenerActiveRef.current = false;
  }, [handleDocumentClick, handleInputBlur]);

  // Set up click-based auto-save when component mounts
  useEffect(() => {
    setupClickBasedAutoSave();
    
    return () => {
      disableClickBasedAutoSave();
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      if (clickSaveTimerRef.current) {
        clearTimeout(clickSaveTimerRef.current);
      }
    };
  }, [setupClickBasedAutoSave, disableClickBasedAutoSave]);

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

      const dataToSave: any = {
        ...cleaned,
      };

      if (customUrlSlug) {
        dataToSave.customUrl = customUrlSlug.trim();
      }

      if (!currentCardId && !isCreatePayloadValid(dataToSave, customUrlSlug)) {
        console.log('[AutoSave] Create validation failed - missing required fields');
        throw new Error('{"message":"Please provide either a custom URL or name and title."}');
      }

      const finalData = {
        ...dataToSave,
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
      document.documentElement.classList.add('auto-saving');
      document.documentElement.classList.remove('has-unsaved-changes');
    },

    onSuccess: (savedCard) => {
      isSavingRef.current = false;
      setStatus("saved");
      setLastSaved(new Date());
      setLastSavedCard(savedCard);
      setError(null);
      document.documentElement.classList.remove('auto-saving');
      document.documentElement.classList.add('auto-saved');

      queryClient.invalidateQueries({ queryKey: ["/api/business-cards"] });
      if (savedCard?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/business-cards", savedCard.id] });
      }

      if (!cardId && savedCard?.id) {
        setCardId(savedCard.id);
        window.history.replaceState(null, "", `/card-editor/${savedCard.id}`);
      }

      if (pendingDataRef.current) {
        const pending = pendingDataRef.current;
        pendingDataRef.current = null;
        console.log('[AutoSave] More changes pending, saving again...');
        setTimeout(() => queueSave(pending.data, pending.customUrlSlug), 300);
        return;
      }

      setTimeout(() => {
        setStatus((currentStatus) => currentStatus === "saved" ? "idle" : currentStatus);
        document.documentElement.classList.remove('auto-saved');
      }, 2000);
    },

    onError: (err: any) => {
      isSavingRef.current = false;
      console.error('[AutoSave] Error:', err);
      document.documentElement.classList.remove('auto-saving');
      document.documentElement.classList.add('auto-save-error');

      const msg = String(err?.message || "Failed to save");
      const isMissingFields = msg.includes("Please provide either a custom URL or name and title");

      if (isMissingFields) {
        setStatus("dirty");
        setError(null);
        document.documentElement.classList.remove('auto-save-error');
        document.documentElement.classList.add('has-unsaved-changes');
        return;
      }

      setStatus("error");
      setError(msg);

      setTimeout(() => {
        document.documentElement.classList.remove('auto-save-error');
        if (pendingDataRef.current) {
          const pending = pendingDataRef.current;
          pendingDataRef.current = null;
          console.log('[AutoSave] Retrying after error...');
          queueSave(pending.data, pending.customUrlSlug);
        } else if (statusRef.current === 'dirty' || statusRef.current === 'error') {
          document.documentElement.classList.add('has-unsaved-changes');
        }
      }, 3000);
    },
  });

  const runDebouncedSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const pending = pendingDataRef.current;
      if (!pending) {
        console.log('[AutoSave] No pending data, skipping save');
        return;
      }

      if (isSavingRef.current) {
        console.log('[AutoSave] Already saving, queuing for later');
        return;
      }

      const cleaned = sanitizeCardForSave(pending.data);
      if (!cardId && !isCreatePayloadValid(cleaned, pending.customUrlSlug)) {
        console.log('[AutoSave] Invalid create payload, skipping');
        setStatus("dirty");
        return;
      }

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
    }, 1200);
  }, [cardId, saveMutation]);

  const queueSave = useCallback(
    (data: BusinessCard, customUrlSlug?: string) => {
      pendingDataRef.current = { data, customUrlSlug };

      if (statusRef.current !== "saving") {
        setStatus("dirty");
        document.documentElement.classList.add('has-unsaved-changes');
      }

      runDebouncedSave();
    },
    [runDebouncedSave]
  );

  const saveNow = useCallback(
    async (data: BusinessCard, customUrlSlug?: string) => {
      console.log('[AutoSave] Manual save triggered');

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (isSavingRef.current) {
        console.log('[AutoSave] Already saving, queuing manual save');
        pendingDataRef.current = { data, customUrlSlug };
        setStatus("dirty");
        return;
      }

      const cleaned = sanitizeCardForSave(data);
      if (!cardId && !isCreatePayloadValid(cleaned, customUrlSlug)) {
        console.log('[AutoSave] Manual save validation failed');
        setStatus("dirty");
        return;
      }

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

  // Update the ref so event handlers can access the latest forceSave
  useEffect(() => {
    forceSaveRef.current = forceSave;
  }, [forceSave]);

  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    if (clickSaveTimerRef.current) {
      clearTimeout(clickSaveTimerRef.current);
      clickSaveTimerRef.current = null;
    }
    
    pendingDataRef.current = null;
    isSavingRef.current = false;
    saveAttemptRef.current = 0;
    setStatus("idle");
    setError(null);
    setCardId(null);
    setLastSavedCard(null);
    setLastSaved(null);
    
    document.documentElement.classList.remove(
      'has-unsaved-changes',
      'auto-saving',
      'auto-saved',
      'auto-save-error'
    );
  }, []);

  // Add visual indicator for unsaved changes in document title
  useEffect(() => {
    const originalTitle = document.title.replace(/^\*/, '');
    if (status === 'dirty') {
      document.title = '*' + originalTitle;
    } else {
      document.title = originalTitle;
    }
  }, [status]);

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
        setupClickBasedAutoSave,
        disableClickBasedAutoSave,
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
