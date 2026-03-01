"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchUrls, createUrl, deleteUrl, registerTelegram } from "@/lib/api-client";
import type { UrlItem } from "@/lib/types";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const urlKeys = {
  all: ["urls"] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useUrls() {
  return useQuery({
    queryKey: urlKeys.all,
    queryFn: async (): Promise<UrlItem[]> => {
      const data = await fetchUrls();
      return data.urls;
    },
  });
}

export function useCreateUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => createUrl(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: urlKeys.all });
    },
  });
}

export function useDeleteUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUrl(id),
    onSuccess: () => {
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
