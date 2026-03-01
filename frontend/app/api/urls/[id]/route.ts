import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";

/**
 * DELETE /api/urls/[id] → proxies to API Gateway DELETE /urls/{id}
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend({ method: "DELETE", path: `/urls/${id}` });
}
