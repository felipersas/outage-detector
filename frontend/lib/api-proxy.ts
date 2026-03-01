import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.API_URL;

/**
 * Reads the `id_token` cookie and returns it, or `null` if absent.
 */
async function getAuthToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get("id_token")?.value ?? null;
}

interface ProxyOptions {
  /** HTTP method (default: GET) */
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Request body – will be JSON-stringified */
  body?: unknown;
  /** Extra path appended to `API_URL` (e.g. `/urls` or `/urls/abc`) */
  path: string;
}

/**
 * Proxies a request from a Next.js API route to the backend API Gateway.
 *
 * - Reads the `id_token` cookie and forwards it as `Authorization: Bearer …`
 * - Returns a `NextResponse` with the upstream status code and body.
 */
export async function proxyToBackend({ method = "GET", body, path }: ProxyOptions) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
