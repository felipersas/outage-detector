import { PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { randomUUID } from "crypto";
import { Resource } from "sst";
import { docClient } from "../infra/ddb";
import { withAuth } from "../lib/auth";
import { ensureUserExists } from "../lib/user";
import { badRequest, success, serverError } from "../lib/response";

/**
 * POST /urls — Creates a new monitored URL for the authenticated user.
 *
 * Body: { url: string }
 * Auth: Cognito JWT (userId extracted from `sub` claim)
 */
export const handler = withAuth(async (
  event: APIGatewayProxyEventV2,
  userId: string,
) => {
  // Ensure user exists in UsersTable before proceeding
  await ensureUserExists(userId);

  if (!event.body) {
    return badRequest("Missing request body");
  }

  const { url } = JSON.parse(event.body);

  if (!url) {
    return badRequest("url is required");
  }

  try {
    const parsed = new URL(url);

    // Only allow HTTP and HTTPS protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return badRequest("Only HTTP and HTTPS URLs are allowed");
    }

    // Prevent localhost and internal IP addresses
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]" ||
      hostname.startsWith("127.") ||
      hostname.startsWith("0.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("172.16.") ||
      hostname.startsWith("172.17.") ||
      hostname.startsWith("172.18.") ||
      hostname.startsWith("172.19.") ||
      hostname.startsWith("172.20.") ||
      hostname.startsWith("172.21.") ||
      hostname.startsWith("172.22.") ||
      hostname.startsWith("172.23.") ||
      hostname.startsWith("172.24.") ||
      hostname.startsWith("172.25.") ||
      hostname.startsWith("172.26.") ||
      hostname.startsWith("172.27.") ||
      hostname.startsWith("172.28.") ||
      hostname.startsWith("172.29.") ||
      hostname.startsWith("172.30.") ||
      hostname.startsWith("172.31.")
    ) {
      return badRequest("Internal IP addresses and localhost are not allowed");
    }
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
});
