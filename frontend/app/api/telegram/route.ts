import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";

/**
 * POST /api/telegram → proxies to API Gateway POST /register-telegram
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyToBackend({ method: "POST", path: "/register-telegram", body });
}
