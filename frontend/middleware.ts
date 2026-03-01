import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/auth"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
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

  try {
    const [, payloadB64] = idToken.split(".");
    const payload = JSON.parse(atob(payloadB64));

    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
      const response = NextResponse.redirect(
        new URL("/auth/signin", request.url),
      );
      response.cookies.delete("id_token");
      response.cookies.delete("refresh_token");
      return response;
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
