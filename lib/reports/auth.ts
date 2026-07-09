import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Valida sesión + rol dueño y el parámetro `month` (YYYY-MM) para los endpoints de reportes. */
export async function requireOwnerAndMonth(
  request: Request
): Promise<{ month: string } | { error: string; status: number }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado.", status: 401 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") {
    return { error: "No autorizado.", status: 403 };
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return { error: "Parámetro 'month' inválido (formato esperado: YYYY-MM).", status: 400 };
  }

  return { month };
}
