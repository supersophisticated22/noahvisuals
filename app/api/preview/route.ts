import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Toggles the `cms_preview` cookie so the public site reads draft/ content.
// Guarded by proxy.ts (admin-only). ?v=1 enables, ?v=0 disables.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const enable = url.searchParams.get("v") !== "0";
  const to = url.searchParams.get("to") || "/";

  const store = await cookies();
  if (enable) {
    store.set("cms_preview", "true", { path: "/", httpOnly: false, sameSite: "lax" });
  } else {
    store.delete("cms_preview");
  }

  // Only allow same-origin relative redirects.
  const dest = to.startsWith("/") ? to : "/";
  return NextResponse.redirect(new URL(dest, request.url));
}
