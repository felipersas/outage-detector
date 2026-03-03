/** Item from the OutageTable */
export interface UrlItem {
  id: string;
  userId: string;
  url: string;
  status: "up" | "down";
  lastChecked: string;
  /** ISO timestamp of the last notification sent (outage or recovery) */
  lastNotifiedAt?: string;
}

/** Item from the UsersTable */
export interface UserItem {
  userId: string;
  telegramChatId: string;
  createdAt: string;
}

/** Message published to SNS when an outage or recovery is detected */
export interface OutageAlert {
  type: "outage" | "recovery";
  url: string;
  userId: string;
  timestamp: string;
}

/** Telegram webhook payload */
export interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
  };
}
