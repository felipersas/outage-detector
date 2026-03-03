import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { Resource } from "sst";
import { docClient } from "../infra/ddb";
import { withAuth } from "../lib/auth";
import { ensureUserExists } from "../lib/user";
import { success, serverError } from "../lib/response";
import type { UrlItem } from "../lib/types";

/**
 * GET /urls — Returns all monitored URLs for the authenticated user.
 */
export const handler = withAuth(async (
  _event: APIGatewayProxyEventV2,
  userId: string,
) => {
  // Ensure user exists in UsersTable before proceeding
  await ensureUserExists(userId);

  try {
    const items = await queryAllByUser(userId);

    return success({ urls: items });
  } catch (err) {
    console.error("Failed to fetch URLs:", err);
    return serverError("Failed to fetch URLs");
  }
});

/**
 * Queries all URLs for a user with a maximum limit to prevent large responses.
 *
 * @param userId - The user ID to query URLs for
 * @param maxItems - Maximum number of URLs to return (default: 100)
 * @returns Array of URL items owned by the user
 */
async function queryAllByUser(
  userId: string,
  maxItems = 100,
): Promise<UrlItem[]> {
  const items: UrlItem[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await docClient.send(
      new QueryCommand({
        TableName: Resource.OutageTable.name,
        IndexName: "byUser",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
        ExclusiveStartKey: lastKey,
      }),
    );

    const pageItems = (result.Items as UrlItem[]) ?? [];
    items.push(...pageItems.slice(0, maxItems - items.length));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey && items.length < maxItems);

  return items;
}
