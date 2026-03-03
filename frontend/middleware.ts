import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/auth"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Converts base64url to base64 (replaces - with + and _ with /).
 * Pads with = if necessary to make length a multiple of 4.
 */
function base64UrlToBase64(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return base64;
}

/**
 * Decodes a JWT payload (header.payload.signature) without verification.
 * Returns null if the token is invalid.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payloadB64 = base64UrlToBase64(parts[1]);
    const payload = JSON.parse(atob(payloadB64));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired.
 */
function isTokenExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp;
  return typeof exp === "number" && exp * 1000 < Date.now();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const idToken = request.cookies.get("id_token")?.value;

  if (!idToken) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  const payload = decodeJwtPayload(idToken);

  if (!payload || isTokenExpired(payload)) {
    const response = NextResponse.redirect(
      new URL("/auth/signin", request.url),
    );
    response.cookies.delete("id_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
