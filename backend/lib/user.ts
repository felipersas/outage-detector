import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { docClient } from "../infra/ddb";

/**
 * Ensures a user exists in the UsersTable.
 * Creates an empty user record if it doesn't exist yet.
 * This is called lazily when the user performs their first action.
 *
 * @param userId - The Cognito user ID (sub claim)
 */
export async function ensureUserExists(userId: string): Promise<void> {
  // Check if user already exists
  const { Item } = await docClient.send(
    new GetCommand({
      TableName: Resource.UsersTable.name,
      Key: { userId },
    }),
  );

  // If user exists, nothing to do
  if (Item) {
    return;
  }

  // Create empty user record
  await docClient.send(
    new PutCommand({
      TableName: Resource.UsersTable.name,
      Item: {
        userId,
        createdAt: new Date().toISOString(),
        // telegramChatId will be added later via register-telegram
      },
    }),
  );
}
