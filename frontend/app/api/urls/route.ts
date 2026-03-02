import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";
import { createUrlRequestSchema } from "@/lib/schemas";
import { ZodError } from "zod";

/**
 * GET /api/urls → proxies to API Gateway GET /urls
 */
export async function GET() {
  return proxyToBackend({ path: "/urls" });
}

/**
 * POST /api/urls → proxies to API Gateway POST /urls
 * Validates request body with zod schema before proxying
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedBody = createUrlRequestSchema.parse(body);

    return proxyToBackend({ method: "POST", path: "/urls", body: validatedBody });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    return Response.json(
      { error: "Invalid request" },
      { status: 400 },
    );
  }
}
