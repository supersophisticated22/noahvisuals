import { NextResponse } from "next/server";
import { changeAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { currentPass?: string; newPass?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const { currentPass, newPass } = body;
  if (!currentPass || !newPass) {
    return NextResponse.json(
      { error: "Huidig en nieuw wachtwoord zijn verplicht" },
      { status: 400 },
    );
  }
  if (newPass.length < 8) {
    return NextResponse.json(
      { error: "Nieuw wachtwoord moet minstens 8 tekens zijn" },
      { status: 400 },
    );
  }

  const ok = await changeAdminPassword(currentPass, newPass);
  if (!ok) {
    return NextResponse.json(
      { error: "Huidig wachtwoord is onjuist" },
      { status: 401 },
    );
  }
  return NextResponse.json({ ok: true });
}
