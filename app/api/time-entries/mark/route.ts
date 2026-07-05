import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registerMark } from "@/lib/attendance/mark";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "No autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const scanned = typeof body?.scanned === "string" ? body.scanned : "";

  if (!scanned) {
    return NextResponse.json(
      { ok: false, error: "Código QR inválido." },
      { status: 400 }
    );
  }

  const result = await registerMark(user.id, scanned);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
