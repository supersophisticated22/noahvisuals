import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Kept in sync with lib/auth.ts (AUTH_COOKIE). Inlined here so the proxy stays
// free of the `server-only` / bcrypt imports that lib/auth.ts pulls in.
const AUTH_COOKIE = "nv_admin";

async function isAuthed(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login endpoint must stay open so users can authenticate.
  if (pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const authed = await isAuthed(token);
  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin page — bounce to login, remembering where they were headed.
  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/admin") loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
