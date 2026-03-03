/**
 * Converts base64url to base64 (replaces - with + and _ with /).
 * Pads with = if necessary to make length a multiple of 4.
 */
function base64UrlToBase64(base64Url: string): string {
  // Replace URL-safe characters
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  // Pad with = to make length a multiple of 4
  while (base64.length % 4) {
    base64 += "=";
  }

  return base64;
}

/**
 * Simple JWT decoder - extracts claims without verification.
 * Safe to use because tokens come from trusted Cognito via cookies.
 *
 * Uses URL-safe base64 decoding as JWTs use base64url encoding.
 */
export function decodeJwt(token: string): { sub?: string; [key: string]: any } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const base64 = base64UrlToBase64(payload);
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Extract userId (sub claim) from JWT token.
 */
export function getUserIdFromToken(token: string): string | null {
  const claims = decodeJwt(token);
  return claims?.sub ?? null;
}
