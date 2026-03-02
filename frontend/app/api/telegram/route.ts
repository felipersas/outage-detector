import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";
import { registerTelegramRequestSchema } from "@/lib/schemas";
import { ZodError } from "zod";

/**
 * POST /api/telegram → proxies to API Gateway POST /register-telegram
 * Validates request body with zod schema before proxying
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedBody = registerTelegramRequestSchema.parse(body);

    return proxyToBackend({
      method: "POST",
      path: "/register-telegram",
      body: validatedBody,
    });
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
