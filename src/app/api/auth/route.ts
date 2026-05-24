import { NextRequest, NextResponse } from "next/server";

/**
 * Simple password auth gate.
 * Checks ORION_PASSWORD env var. If not set, auth is disabled (open access).
 * Sets an httpOnly cookie on success.
 */

export async function POST(req: NextRequest) {
  const envPassword = process.env.ORION_PASSWORD;

  // If no password configured, auth is effectively disabled
  if (!envPassword) {
    return NextResponse.json({ ok: true, message: "Auth not configured" });
  }

  try {
    const { password } = await req.json();

    if (!password || password !== envPassword) {
      return NextResponse.json(
        { ok: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    // Set session cookie (24h expiry)
    const response = NextResponse.json({ ok: true });
    response.cookies.set("orion_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}

/**
 * DELETE: Logout — clears the session cookie.
 */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("orion_session");
  return response;
}
