import "server-only";
import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";

export const QR_PREFIX = "CTRL-HORARIO:";

export function qrPayload(token: string): string {
  return `${QR_PREFIX}${token}`;
}

export function parseQrPayload(scanned: string): string | null {
  if (!scanned.startsWith(QR_PREFIX)) return null;
  return scanned.slice(QR_PREFIX.length);
}

export async function qrImageDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(qrPayload(token), { margin: 1, width: 320 });
}

export async function getActiveQrToken() {
  const admin = createAdminClient();
  const { data } = await admin.from("qr_tokens").select("*").eq("active", true).maybeSingle();
  return data;
}

/**
 * Devuelve el QR activo, generando el primero si el local todavía no tiene
 * ninguno. A diferencia de regenerateQrToken, esta función NUNCA desactiva
 * un token existente: se llama en cada visita a /admin/qr (incluida la
 * precarga en segundo plano de Next.js al mostrar el link del menú), así
 * que tiene que ser segura ante múltiples llamadas concurrentes sin pisar
 * el token que otra llamada paralela acaba de crear.
 */
export async function ensureQrToken() {
  const existing = await getActiveQrToken();
  if (existing) return existing;

  const admin = createAdminClient();
  const { data: created, error } = await admin
    .from("qr_tokens")
    .insert({ created_by: null })
    .select()
    .single();

  if (error) {
    // Carrera: otra visita concurrente ya creó el primer token entre el
    // chequeo de arriba y este intento de inserción. No es un error real
    // ni corresponde desactivar nada: devolvemos el que quedó activo.
    const active = await getActiveQrToken();
    if (active) return active;
    throw new Error(error.message ?? "No se pudo generar el QR.");
  }

  if (!created) {
    throw new Error("No se pudo generar el QR.");
  }

  await logAudit({
    actorId: null,
    action: "create",
    entity: "qr_token",
    entityId: created.id,
    newValue: { id: created.id },
  });

  return created;
}

/**
 * Invalida el QR actual (si existe) y genera uno nuevo (RF-18, regla 11).
 * Acción explícita del dueño (botón "Regenerar QR"). Se ejecuta como una
 * única función de Postgres (desactivar + insertar en la misma
 * transacción): así ninguna otra consulta concurrente (por ejemplo
 * ensureQrToken corriendo por una precarga de página) puede observar un
 * instante intermedio con cero tokens activos, que era la causa real de
 * una condición de carrera en RF-18.
 */
export async function regenerateQrToken(actorId: string | null) {
  const admin = createAdminClient();

  const { data: current } = await admin
    .from("qr_tokens")
    .select("*")
    .eq("active", true)
    .maybeSingle();

  const { data: created, error } = await admin.rpc("regenerate_qr_token", {
    p_actor_id: actorId,
  });

  if (error || !created) {
    throw new Error(error?.message ?? "No se pudo generar el QR.");
  }

  await logAudit({
    actorId,
    action: current ? "regenerate" : "create",
    entity: "qr_token",
    entityId: created.id,
    oldValue: current ? { id: current.id } : null,
    newValue: { id: created.id },
  });

  return created;
}
