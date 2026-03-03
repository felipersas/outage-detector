import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { Resource } from "sst";
import { docClient } from "../infra/ddb";
import { withAuth } from "../lib/auth";
import { badRequest, success, serverError } from "../lib/response";

/**
 * DELETE /urls/{id} — Removes a monitored URL for the authenticated user.
 *
 * The composite key (id + userId) ensures users can only delete their own URLs.
 */
export const handler = withAuth(async (
  event: APIGatewayProxyEventV2,
  userId: string,
) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return badRequest("URL id is required");
  }

  try {
    await docClient.send(
      new DeleteCommand({
        TableName: Resource.OutageTable.name,
        Key: { id, userId },
      }),
    );

    return success({ message: "URL deleted successfully" });
  } catch (err) {
    console.error("Failed to delete URL:", err);
    return serverError("Failed to delete URL");
  }
});
