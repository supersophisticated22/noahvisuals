import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

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

  // Build public origin from proxy-forwarded headers — request.url is the
  // internal origin (localhost) behind a reverse proxy on live.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? url.host;
  const proto = h.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const origin = `${proto}://${host}`;

  // Only allow same-origin relative redirects.
  const dest = to.startsWith("/") ? to : "/";
  return NextResponse.redirect(new URL(dest, origin));
}
