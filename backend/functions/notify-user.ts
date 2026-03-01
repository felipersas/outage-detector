import type { SNSEvent } from "aws-lambda";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { docClient } from "../infra/ddb";
import { TelegramClient } from "../lib/telegram";
import type { OutageAlert, UserItem } from "../lib/types";

const MESSAGES: Record<OutageAlert["type"], (alert: OutageAlert) => string> = {
  outage: (a) =>
    `🚨 *Outage Detected*\n\nURL: ${a.url}\nTime: ${a.timestamp}`,
  recovery: (a) =>
    `✅ *Service Recovered*\n\nURL: ${a.url}\nTime: ${a.timestamp}`,
};

export const handler = async (event: SNSEvent): Promise<void> => {
  for (const record of event.Records) {
    const alert: OutageAlert = JSON.parse(record.Sns.Message);

    const { Item } = await docClient.send(
      new GetCommand({
        TableName: Resource.UsersTable.name,
        Key: { userId: alert.userId },
      }),
    );

    const user = Item as UserItem | undefined;

    if (!user?.telegramChatId) {
      continue;
    }

    const formatMessage = MESSAGES[alert.type];
    const text = formatMessage(alert);

    await TelegramClient.sendMessage(user.telegramChatId, text, { parseMode: "Markdown" });
  }
};