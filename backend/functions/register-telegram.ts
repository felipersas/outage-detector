import { PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { Resource } from "sst";
import { docClient } from "../infra/ddb";
import { getUserId } from "../lib/auth";
import { badRequest, unauthorized, success, serverError } from "../lib/response";

/**
 * POST /register-telegram — Links a Telegram chat ID to the authenticated user.
 *
 * Body: { telegramChatId: string }
 * Auth: Cognito JWT (userId extracted from `sub` claim)
 */
export const handler = async (event: APIGatewayProxyEventV2) => {
  let userId: string;

  try {
    userId = getUserId(event);
  } catch {
    return unauthorized();
  }

  if (!event.body) {
    return badRequest("Missing request body");
  }

  const { telegramChatId } = JSON.parse(event.body);

  if (!telegramChatId) {
    return badRequest("telegramChatId is required");
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: Resource.UsersTable.name,
        Item: {
          userId,
          telegramChatId: String(telegramChatId),
          createdAt: new Date().toISOString(),
        },
      }),
    );

    return success({ message: "Telegram chat ID registered successfully" });
  } catch (err) {
    console.error("Failed to register telegram:", err);
    return serverError("Failed to register Telegram");
  }
};
