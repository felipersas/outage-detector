import type { APIGatewayProxyEventV2 } from "aws-lambda";

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
 * Extracts the authenticated user's ID (Cognito `sub`) from the
 * API Gateway V2 JWT authorizer context.
 *
 * @throws {Error} If JWT claims are missing or invalid.
 */
export function getUserId(event: APIGatewayProxyEventV2): string {
  const claims = getClaims(event);
  return claims.sub;
}

/**
 * Extracts all JWT claims from the API Gateway V2 authorizer context.
 */
export function getClaims(event: APIGatewayProxyEventV2): JWTClaims {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authorizer = (event.requestContext as any)?.authorizer;
  const claims = authorizer?.jwt?.claims as JWTClaims | undefined;

  if (!claims?.sub) {
    throw new Error("Unauthorized: missing JWT claims");
  }

  return claims;
}
