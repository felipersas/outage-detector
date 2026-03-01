import { PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { Resource } from "sst";
import { docClient } from "../infra/ddb";
import { TelegramClient } from "../lib/telegram";
import type { TelegramUpdate } from "../lib/types";
import { badRequest, success } from "../lib/response";

export const handler = async (event: APIGatewayProxyEventV2) => {
  if (!event.body) {
    return badRequest("Missing body");
  }

  const update: TelegramUpdate = JSON.parse(event.body);
  const message = update.message;

  if (!message) {
    return success({ ok: true, message: "No message" });
  }

  const chatId = String(message.chat.id);
  const text = message.text ?? "";

  // expects "/start <userId>" via deep link
  if (text.startsWith("/start ")) {
    const userId = text.split(" ")[1];

    if (userId) {
      await docClient.send(
        new PutCommand({
          TableName: Resource.UsersTable.name,
          Item: {
            userId,
            telegramChatId: chatId,
            createdAt: new Date().toISOString(),
          },
        }),
      );

      await TelegramClient.sendMessage(
        chatId,
        "✅ Notifications enabled! You will be notified when an outage is detected.",
      );

      return success({ ok: true });
    }
  }

  // in case of any other message, prompt user to enable notifications
  await TelegramClient.sendMessage(
    chatId,
    'type "/start <your_user_id>" to enable outage notifications. You can find your user ID in the app settings.',
  );

  return success({ ok: true });
};
