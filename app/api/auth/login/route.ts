import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, signToken, verifyCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { user?: string; pass?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const { user, pass } = body;
  if (!user || !pass) {
    return NextResponse.json(
      { error: "Gebruikersnaam en wachtwoord zijn verplicht" },
      { status: 400 },
    );
  }

  const ok = await verifyCredentials(user, pass);
  if (!ok) {
    return NextResponse.json(
      { error: "Onjuiste gebruikersnaam of wachtwoord" },
      { status: 401 },
    );
  }

  const token = await signToken({ user });
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true });
}
