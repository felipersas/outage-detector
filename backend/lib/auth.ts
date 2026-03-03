import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { unauthorized } from "./response";

/**
 * JWT claims decoded by API Gateway V2 JWT authorizer.
 * Available when a route is protected with `auth.jwt`.
 */
export interface JWTClaims {
  sub: string;
  email?: string;
  "cognito:username"?: string;
  token_use?: string;
  [key: string]: unknown;
}

/**
 * Extended API Gateway V2 request context with JWT authorizer.
 */
interface JWTAuthorizerContext {
  jwt: {
    claims: JWTClaims;
  };
}

/**
 * Extended API Gateway V2 request context.
 */
interface APIGatewayRequestContextV2 {
  authorizer?: JWTAuthorizerContext;
}

/**
 * Typed handler function that receives the authenticated userId.
 */
export type AuthenticatedHandler<T extends ApiResponse> = (
  event: APIGatewayProxyEventV2,
  userId: string,
) => Promise<T>;

/**
 * API response type (imported from response.ts to avoid circular dependency).
 */
export interface ApiResponse {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}

/**
 * Wraps a Lambda handler with JWT authentication.
 * Extracts the userId from the JWT claims and passes it to the handler.
 *
 * @param handler - The handler function that receives the event and userId
 * @returns A Lambda handler that authenticates before calling the inner handler
 *
 * @example
 * ```ts
 * export const handler = withAuth(async (event, userId) => {
 *   // Handler logic with authenticated userId
 *   return success({ data: "..." });
 * });
 * ```
 */
export function withAuth<T extends ApiResponse>(
  handler: AuthenticatedHandler<T>,
): (event: APIGatewayProxyEventV2) => Promise<T> {
  return async (event: APIGatewayProxyEventV2): Promise<T> => {
    try {
      const userId = getUserId(event);
      return await handler(event, userId);
    } catch {
      return unauthorized() as T;
    }
  };
}

/**
 * Extracts the authenticated user's ID (Cognito `sub`) from the
 * API Gateway V2 JWT authorizer context.
 *
 * @param event - The API Gateway event
 * @returns The user ID from the JWT claims
 * @throws {Error} If JWT claims are missing or invalid
 */
export function getUserId(event: APIGatewayProxyEventV2): string {
  const claims = getClaims(event);
  return claims.sub;
}

/**
 * Extracts all JWT claims from the API Gateway V2 authorizer context.
 *
 * @param event - The API Gateway event
 * @returns The JWT claims
 * @throws {Error} If JWT claims are missing or invalid
 */
export function getClaims(event: APIGatewayProxyEventV2): JWTClaims {
  const authorizer = (event.requestContext as APIGatewayRequestContextV2)?.authorizer;
  const claims = authorizer?.jwt?.claims;

  if (!claims?.sub) {
    throw new Error("Unauthorized: missing JWT claims");
  }

  return claims;
}
