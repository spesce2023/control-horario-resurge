import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureQrToken } from "@/lib/qr";
import { buildQrPosterPdf } from "@/lib/qr-poster";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const token = await ensureQrToken();
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const pdfBytes = await buildQrPosterPdf({ markToken: token.token, appUrl });

  return new NextResponse(pdfBytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="reloj-resurge.pdf"`,
    },
  });
}
