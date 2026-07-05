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

/** Devuelve el QR activo, generando el primero si el local todavía no tiene ninguno. */
export async function ensureQrToken() {
  const existing = await getActiveQrToken();
  if (existing) return existing;
  return regenerateQrToken(null);
}

/** Invalida el QR actual (si existe) y genera uno nuevo (RF-18, regla 11). */
export async function regenerateQrToken(actorId: string | null) {
  const admin = createAdminClient();

  const { data: current } = await admin
    .from("qr_tokens")
    .select("*")
    .eq("active", true)
    .maybeSingle();

  if (current) {
    await admin.from("qr_tokens").update({ active: false }).eq("id", current.id);
  }

  const { data: created, error } = await admin
    .from("qr_tokens")
    .insert({ created_by: actorId })
    .select()
    .single();

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
