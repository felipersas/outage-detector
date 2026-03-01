import { PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { randomUUID } from "crypto";
import { Resource } from "sst";
import { docClient } from "../infra/ddb";
import { getUserId } from "../lib/auth";
import { badRequest, unauthorized, success, serverError } from "../lib/response";

/**
 * POST /urls — Creates a new monitored URL for the authenticated user.
 *
 * Body: { url: string }
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

  const { url } = JSON.parse(event.body);

  if (!url) {
    return badRequest("url is required");
  }

  try {
    new URL(url);
  } catch {
    return badRequest("Invalid URL format");
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: Resource.OutageTable.name,
        Item: {
          id: randomUUID(),
          userId,
          url,
          status: "up",
          lastChecked: new Date().toISOString(),
        },
      }),
    );

    return success({ message: "URL created successfully!" });
  } catch (err) {
    console.error("Failed to create URL:", err);
    return serverError("Failed to create URL");
  }
};