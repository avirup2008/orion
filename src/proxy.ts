import { NextRequest, NextResponse } from "next/server";

/**
 * Auth proxy (Next.js 16 convention — renamed from middleware).
 * If ORION_PASSWORD is set, require the orion_session cookie.
 * If not set, allow all requests through (open access).
 *
 * API routes get 401 JSON; page routes get redirected to /login.
 */
export function proxy(req: NextRequest) {
  const envPassword = process.env.ORION_PASSWORD;

  // If no password configured, skip auth entirely
  if (!envPassword) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  // Allow login page and auth API through
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const session = req.cookies.get("orion_session");

  if (!session || session.value !== "authenticated") {
    // API routes: return 401 JSON (don't redirect — breaks POST/SSE)
    if (pathname.startsWith("/api/")) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Page routes: redirect to login
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
