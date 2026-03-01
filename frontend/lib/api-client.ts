import apiClient from "./axios";
import type { UrlItem } from "./types";

// ─── URLs API ────────────────────────────────────────────────────────────────

export async function fetchUrls(): Promise<{ urls: UrlItem[] }> {
  const { data } = await apiClient.get<{ urls: UrlItem[] }>("/urls");
  return data;
}

export async function createUrl(url: string): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>("/urls", { url });
  return data;
}

export async function deleteUrl(id: string): Promise<void> {
  await apiClient.delete(`/urls/${id}`);
}

// ─── Telegram API ────────────────────────────────────────────────────────────

export async function registerTelegram(telegramChatId: string): Promise<void> {
  await apiClient.post("/telegram", { telegramChatId });
}
