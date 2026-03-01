import { Resource } from "sst";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

export class TelegramClient {
  private static getTelegramApiUrl(method: string): string {
    return `https://api.telegram.org/bot${Resource.TelegramBotToken.value}/${method}`;
  }

  static async callApi<T = unknown>(
    method: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(this.getTelegramApiUrl(method), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Telegram API ${method} failed (${response.status}): ${errorText}`,
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }

  static async sendMessage(
    chatId: string,
    text: string,
    options?: { parseMode?: "Markdown" | "MarkdownV2" | "HTML" },
  ): Promise<void> {
    await TelegramClient.callApi("sendMessage", {
      chat_id: chatId,
      text,
      ...(options?.parseMode && { parse_mode: options.parseMode }),
    });
  }
}
