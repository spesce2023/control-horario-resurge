import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveQrToken, parseQrPayload } from "@/lib/qr";
import { getDailySummary } from "./daily";

export type MarkResult =
  | { ok: true; type: "in" | "out"; occurredAt: string }
  | { ok: false; error: string };

/** Valida el QR escaneado y registra la marca de entrada/salida (RF-03, RF-04). */
export async function registerMark(
  employeeId: string,
  scanned: string
): Promise<MarkResult> {
  const token = parseQrPayload(scanned.trim());
  if (!token) {
    return { ok: false, error: "El código escaneado no es el QR del local." };
  }

  const activeToken = await getActiveQrToken();
  if (!activeToken || activeToken.token !== token) {
    return {
      ok: false,
      error: "Este QR ya no es válido. Pedile al dueño el QR vigente.",
    };
  }

  const admin = createAdminClient();
  const { nextType } = await getDailySummary(admin, employeeId);
  const occurredAt = new Date().toISOString();

  const { error } = await admin.from("time_entries").insert({
    employee_id: employeeId,
    type: nextType,
    occurred_at: occurredAt,
    source: "qr",
    qr_token_id: activeToken.id,
  });

  if (error) {
    return { ok: false, error: "No se pudo registrar la marca. Probá de nuevo." };
  }

  return { ok: true, type: nextType, occurredAt };
}
