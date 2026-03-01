/** Item da tabela OutageTable */
export interface UrlItem {
  id: string;
  userId: string;
  url: string;
  status: "up" | "down";
  lastChecked: string;
  /** ISO timestamp da última notificação enviada (outage ou recovery) */
  lastNotifiedAt?: string;
}

/** Item da tabela UsersTable */
export interface UserItem {
  userId: string;
  telegramChatId: string;
  createdAt: string;
}

/** Mensagem publicada no SNS quando um outage ou recovery é detectado */
export interface OutageAlert {
  type: "outage" | "recovery";
  url: string;
  userId: string;
  timestamp: string;
}

/** Payload do webhook do Telegram */
export interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
  };
}
