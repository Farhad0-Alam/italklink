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
  updatePendingData: (data: BusinessCard, customUrlSlug?: string) => void;
}

const AutoSaveContext = createContext<AutoSaveContextType | null>(null);

interface AutoSaveProviderProps {
  children: ReactNode;
}

/**
 * IMPORTANT FIXES:
 * - Do NOT send server-managed fields (id, userId, createdAt, updatedAt, shareSlug, etc.)
 *   to avoid "value.toISOString is not a function" and duplicate share_slug errors.
 * - Only CREATE when: customUrl exists OR (fullName AND title exist)
 * - Debounced autosave to reduce spam + race conditions.
 */
function sanitizeCardForSave(input: any) {
  // Deep clone to avoid mutating react state objects
  const data = structuredClone ? structuredClone(input) : JSON.parse(JSON.stringify(input));

  // Remove server-managed / dangerous fields if present
  delete data.id;
  delete data.userId;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.deletedAt;
  delete data.shareSlug; // let server generate a unique one
  delete data.slug;      // if you have slug field separate
  delete data.views;
  delete data.analytics;
  delete data.lastViewedAt;
  delete data.lastSaved;
  delete data.lastSavedAt;

  // Remove editor-only fields
  delete data.currentPreviewMode;
  delete data.currentSelectedPage;

  return data;
}

function isCreatePayloadValid(data: any, customUrlSlug?: string) {
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
  const debounceTimerRef = useRef<any>(null);
  const isSavingRef = useRef(false);

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
      const cleaned = sanitizeCardForSave(data);

      // attach customUrl only if exists
      const dataToSave: any = {
        ...cleaned,
        ...(customUrlSlug && { customUrl: customUrlSlug }),
      };

      // pages handling (home => pageElements, others => pages)
      const pages = (dataToSave as any).pages || [];

      // Start from pageElements
      let pageElementsToSave = (dataToSave.pageElements || []) as any[];

      // If pages contains home, prefer its elements as home pageElements
      if (Array.isArray(pages)) {
        const homePage = pages.find((p: any) => p.key === "home" || p.id === "home");
        if (homePage?.elements && Array.isArray(homePage.elements) && homePage.elements.length > 0) {
          pageElementsToSave = homePage.elements;
        }
      }

      // Save only non-home pages in pages column
      const pagesToSave = Array.isArray(pages)
        ? pages
            .filter((p: any) => p.key !== "home" && p.id !== "home")
            .map((page: any) => ({
              id: page.id,
              key: page.key || page.id,
              path: page.path,
              label: page.label,
              visible: page.visible !== false,
              elements: page.elements || [],
            }))
        : null;

      // FINAL payload: no shareSlug, no createdAt/updatedAt, etc.
      const finalData: any = {
        ...dataToSave,
        pageElements: pageElementsToSave,
        pages: pagesToSave && pagesToSave.length > 0 ? pagesToSave : null,
        menu: null,
      };

      // Validate create requirements (prevents 400 spam)
      if (!currentCardId && !isCreatePayloadValid(finalData, customUrlSlug)) {
        // Throwing makes react-query go to onError but we keep it quiet-ish
        throw new Error('400: {"message":"Please provide either a custom URL or name and title."}');
      }

      const result = currentCardId
        ? await apiRequest("PUT", `/api/business-cards/${currentCardId}`, finalData)
        : await apiRequest("POST", "/api/business-cards", finalData);

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

      queryClient.invalidateQueries({ queryKey: ["/api/business-cards"] });
      if (savedCard?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/business-cards", savedCard.id] });
      }

      if (!cardId && savedCard?.id) {
        setCardId(savedCard.id);
        // keep user on same editor route
        window.history.replaceState(null, "", `/card-editor/${savedCard.id}`);
      }

      // If user changed something while saving, save again quickly
      if (pendingDataRef.current) {
        const pending = pendingDataRef.current;
        pendingDataRef.current = null;
        setTimeout(() => queueSave(pending.data, pending.customUrlSlug), 150);
        return;
      }

      // Auto-reset saved => idle
      setTimeout(() => {
        setStatus((current) => (current === "saved" ? "idle" : current));
      }, 1500);
    },

    onError: (err: any) => {
      isSavingRef.current = false;

      // If it's our "missing required fields" error, keep UI dirty but don't keep spamming error state
      const msg = String(err?.message || "Failed to save");
      const isMissingFields = msg.includes("Please provide either a custom URL or name and title");

      if (isMissingFields) {
        setStatus("dirty");
        setError(null);
        return;
      }

      setStatus("error");
      setError(msg);
      console.error("[AutoSave] Error:", msg);

      // Retry after small delay if new pending data exists
      setTimeout(() => {
        if (pendingDataRef.current) {
          const pending = pendingDataRef.current;
          pendingDataRef.current = null;
          queueSave(pending.data, pending.customUrlSlug);
        }
      }, 2000);
    },
  });

  const runDebouncedSave = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      const pending = pendingDataRef.current;
      if (!pending) return;

      // If saving already, just keep pending
      if (isSavingRef.current) return;

      // If creating, validate requirements before hitting API
      const cleaned = sanitizeCardForSave(pending.data);
      if (!cardId && !isCreatePayloadValid(cleaned, pending.customUrlSlug)) {
        setStatus("dirty");
        return;
      }

      pendingDataRef.current = null;
      await saveMutation.mutateAsync({
        data: pending.data,
        customUrlSlug: pending.customUrlSlug,
        currentCardId: cardId,
      });
    }, 900); // debounce delay
  }, [cardId, saveMutation]);

  const updatePendingData = useCallback(
    (data: BusinessCard, customUrlSlug?: string) => {
      pendingDataRef.current = { data, customUrlSlug };
      if (status !== "saving") setStatus("dirty");
      runDebouncedSave();
    },
    [status, runDebouncedSave]
  );

  const queueSave = useCallback(
    (data: BusinessCard, customUrlSlug?: string) => {
      pendingDataRef.current = { data, customUrlSlug };
      if (status !== "saving") setStatus("dirty");
      runDebouncedSave();
    },
    [status, runDebouncedSave]
  );

  const saveNow = useCallback(
    async (data: BusinessCard, customUrlSlug?: string) => {
      // Cancel debounce and save immediately with latest data
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // If already saving, just update pending (it will save after success)
      if (isSavingRef.current) {
        pendingDataRef.current = { data, customUrlSlug };
        setStatus("dirty");
        return;
      }

      // Validate create requirements
      const cleaned = sanitizeCardForSave(data);
      if (!cardId && !isCreatePayloadValid(cleaned, customUrlSlug)) {
        setStatus("dirty");
        return;
      }

      pendingDataRef.current = null;
      await saveMutation.mutateAsync({
        data,
        customUrlSlug,
        currentCardId: cardId,
      });
    },
    [cardId, saveMutation]
  );

  const forceSave = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const pending = pendingDataRef.current;
    if (!pending || isSavingRef.current) return;

    const cleaned = sanitizeCardForSave(pending.data);
    if (!cardId && !isCreatePayloadValid(cleaned, pending.customUrlSlug)) {
      setStatus("dirty");
      return;
    }

    pendingDataRef.current = null;
    await saveMutation.mutateAsync({
      data: pending.data,
      customUrlSlug: pending.customUrlSlug,
      currentCardId: cardId,
    });
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
    setLastSaved(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
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
        updatePendingData,
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
