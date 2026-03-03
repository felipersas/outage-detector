import type { SNSEvent } from "aws-lambda";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { docClient } from "../infra/ddb";
import { TelegramClient } from "../lib/telegram";
import type { OutageAlert, UserItem } from "../lib/types";

const MESSAGES: Record<OutageAlert["type"], (alert: OutageAlert) => string> = {
  outage: (a) =>
    `[ALERT] Outage Detected\n\nURL: ${a.url}\nTime: ${a.timestamp}`,
  recovery: (a) =>
    `[RECOVERY] Service Recovered\n\nURL: ${a.url}\nTime: ${a.timestamp}`,
};

/**
 * Type guard to validate if an item is a UserItem.
 */
function isValidUserItem(item: unknown): item is UserItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "userId" in item &&
    "telegramChatId" in item
  );
}

/**
 * SNS event handler for outage/recovery notifications.
 * Sends Telegram messages to users when outages are detected or services recover.
 *
 * @param event - SNS event containing outage/recovery alerts
 */
export const handler = async (event: SNSEvent): Promise<void> => {
  for (const record of event.Records) {
    const alert: OutageAlert = JSON.parse(record.Sns.Message);

    const { Item } = await docClient.send(
      new GetCommand({
        TableName: Resource.UsersTable.name,
        Key: { userId: alert.userId },
      }),
    );

    const user = isValidUserItem(Item) ? Item : undefined;

    if (!user?.telegramChatId) {
      continue;
    }

    const formatMessage = MESSAGES[alert.type];
    const text = formatMessage(alert);

    await TelegramClient.sendMessage(user.telegramChatId, text, { parseMode: "Markdown" });
  }
};