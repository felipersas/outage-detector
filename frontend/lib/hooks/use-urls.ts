"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { fetchUrls, createUrl, deleteUrl, registerTelegram } from "@/lib/api-client";
import type { UrlItem } from "@/lib/types";

// ─── Configuration ───────────────────────────────────────────────────────────

/**
 * Default stale time for URL queries - 30 seconds.
 * Data is considered fresh for 30 seconds after fetching.
 */
const DEFAULT_STALE_TIME = 30000;

/**
 * Default GC time for URL queries - 5 minutes.
 * Cached data is garbage collected after 5 minutes of inactivity.
 */
const DEFAULT_GC_TIME = 300000;

/**
 * Number of retry attempts for failed requests.
 * Only retries on network errors, not 4xx status codes.
 */
const RETRY_COUNT = 3;

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const urlKeys = {
  all: ["urls"] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useUrls(options?: Omit<UseQueryOptions<UrlItem[]>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: urlKeys.all,
    queryFn: async (): Promise<UrlItem[]> => {
      const data = await fetchUrls();
      return data.urls;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
    retry: RETRY_COUNT,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    ...options,
  });
}

export function useCreateUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => createUrl(url),
    onSuccess: () => {
      // Invalidate and refetch to show updated data
      queryClient.invalidateQueries({ queryKey: urlKeys.all });
    },
  });
}

export function useDeleteUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUrl(id),
    onSuccess: () => {
      // Invalidate and refetch to show updated data
      queryClient.invalidateQueries({ queryKey: urlKeys.all });
    },
  });
}

// ─── Derived Data ────────────────────────────────────────────────────────────

export function useUrlStats() {
  const { data: urls = [], ...rest } = useUrls();

  const stats = {
    total: urls.length,
    up: urls.filter((u) => u.status === "up").length,
    down: urls.filter((u) => u.status === "down").length,
  };

  return { stats, urls, ...rest };
}

// ─── Telegram ────────────────────────────────────────────────────────────────

export function useRegisterTelegram() {
  return useMutation({
    mutationFn: (chatId: string) => registerTelegram(chatId),
  });
}
