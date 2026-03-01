import { cookies } from "next/headers";
import type { AuthTokens } from "./cognito";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/**
 * Store authentication tokens as httpOnly cookies.
 */
export async function setSession(tokens: AuthTokens) {
  const jar = await cookies();

  jar.set("id_token", tokens.idToken, {
    ...COOKIE_OPTIONS,
    maxAge: tokens.expiresIn,
  });

  jar.set("refresh_token", tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

/**
 * Read the id_token from cookies.
 */
export async function getIdToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get("id_token")?.value;
}

/**
 * Read the refresh_token from cookies.
 */
export async function getRefreshToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get("refresh_token")?.value;
}

/**
 * Clear all authentication cookies (sign out).
 */
export async function clearSession() {
  const jar = await cookies();
  jar.delete("id_token");
  jar.delete("refresh_token");
}
