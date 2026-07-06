import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/set-password";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Sin 'code': el proyecto está usando el flujo implícito de Supabase Auth,
  // donde los tokens viajan en el fragmento de la URL (#access_token=...),
  // invisible para el servidor. Redirigimos a `next` sin indicar fragmento
  // propio: el navegador conserva el fragmento original de la request y el
  // cliente de Supabase del lado del browser (detectSessionInUrl) lo procesa
  // ahí para establecer la sesión.
  return NextResponse.redirect(`${origin}${next}`);
}
