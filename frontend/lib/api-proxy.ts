import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.API_URL;

if (!API_URL) {
  throw new Error("API_URL environment variable is not defined");
}

/**
 * Request timeout in milliseconds.
 */
const FETCH_TIMEOUT = 10000;

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
 * Creates a timeout promise that rejects after the specified duration.
 */
function createTimeout(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
  });
}

/**
 * Safely parses a response body as JSON.
 * Returns the parsed data or null if parsing fails.
 */
async function safeParseJson(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return null;
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Proxies a request from a Next.js API route to the backend API Gateway.
 *
 * Features:
 * - Reads the `id_token` cookie and forwards it as `Authorization: Bearer …`
 * - 10-second timeout for all requests
 * - Returns a `NextResponse` with the upstream status code and body
 * - Handles non-JSON responses gracefully
 * - Provides meaningful error messages
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

  let res: Response;

  try {
    // Use Promise.race to implement timeout
    res = await Promise.race([
      fetch(`${API_URL}${path}`, {
        method,
        headers,
        ...(body !== undefined && { body: JSON.stringify(body) }),
      }),
      createTimeout(FETCH_TIMEOUT),
    ]) as Response;
  } catch (error) {
    if (error instanceof Error && error.message === "Request timeout") {
      return NextResponse.json({ error: "Request timeout" }, { status: 408 });
    }
    return NextResponse.json({ error: "Network error" }, { status: 503 });
  }

  const data = await safeParseJson(res);

  return NextResponse.json(
    data ?? { error: res.statusText || "Unknown error" },
    { status: res.status },
  );
}
