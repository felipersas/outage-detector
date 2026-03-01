/**
 * Shared types used across frontend components.
 * Mirrors the backend UrlItem type.
 */
export interface UrlItem {
  id: string;
  userId: string;
  url: string;
  status: "up" | "down";
  lastChecked: string;
  lastNotifiedAt?: string;
}
