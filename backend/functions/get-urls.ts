import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { Resource } from "sst";
import { docClient } from "../infra/ddb";
import { getUserId } from "../lib/auth";
import { ensureUserExists } from "../lib/user";
import { unauthorized, success, serverError } from "../lib/response";
import type { UrlItem } from "../lib/types";

/**
 * GET /urls — Returns all monitored URLs for the authenticated user.
 */
export const handler = async (event: APIGatewayProxyEventV2) => {
  let userId: string;

  try {
    userId = getUserId(event);
  } catch {
    return unauthorized();
  }

  // Ensure user exists in UsersTable before proceeding
  await ensureUserExists(userId);

  try {
    const items = await queryAllByUser(userId);

    return success({ urls: items });
  } catch (err) {
    console.error("Failed to fetch URLs:", err);
    return serverError("Failed to fetch URLs");
  }
};

async function queryAllByUser(userId: string): Promise<UrlItem[]> {
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

    items.push(...((result.Items as UrlItem[]) ?? []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}
