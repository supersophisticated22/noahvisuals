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
  // internal origin (localhost) behind a reverse proxy on live. Headers may be
  // comma-separated behind multiple proxies, so take the first value only.
  const h = await headers();
  const first = (v: string | null) => v?.split(",")[0]?.trim() || undefined;
  const host = first(h.get("x-forwarded-host")) ?? first(h.get("host")) ?? url.host;
  const proto = first(h.get("x-forwarded-proto")) ?? url.protocol.replace(":", "");

  // Only allow same-origin relative redirects.
  const dest = to.startsWith("/") ? to : "/";
  let target: URL;
  try {
    target = new URL(dest, `${proto}://${host}`);
  } catch {
    target = new URL(dest, url.origin);
  }
  return NextResponse.redirect(target);
}
