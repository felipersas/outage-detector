import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";

/**
 * GET /api/urls → proxies to API Gateway GET /urls
 */
export async function GET() {
  return proxyToBackend({ path: "/urls" });
}

/**
 * POST /api/urls → proxies to API Gateway POST /urls
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyToBackend({ method: "POST", path: "/urls", body });
}
