"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { fromZonedTime } from "date-fns-tz";
import { TIME_ZONE } from "@/lib/week";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { logAudit } from "@/lib/audit";

function toUtcISO(localDateTime: string): string {
  return fromZonedTime(localDateTime, TIME_ZONE).toISOString();
}

const createSchema = z.object({
  employeeId: z.string().uuid(),
  type: z.enum(["in", "out"]),
  occurredAt: z.string().min(1, "Ingresá fecha y hora."),
  notes: z.string().optional(),
});

export async function createManualEntry(
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;
  const admin = createAdminClient();

  const { data: created, error } = await admin
    .from("time_entries")
    .insert({
      employee_id: data.employeeId,
      type: data.type,
      occurred_at: toUtcISO(data.occurredAt),
      source: "manual",
      is_manual: true,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error || !created) {
    return { error: `No se pudo crear la marca: ${error?.message ?? "error desconocido"}` };
  }

  const actorId = await getCurrentUserId();
  await logAudit({
    actorId,
    action: "create",
    entity: "time_entry",
    entityId: created.id,
    newValue: data,
  });

  revalidatePath("/admin/marcas");
  return {};
}

const updateSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["in", "out"]),
  occurredAt: z.string().min(1, "Ingresá fecha y hora."),
  notes: z.string().optional(),
});

export async function updateEntry(
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;
  const admin = createAdminClient();

  const { data: before } = await admin
    .from("time_entries")
    .select("*")
    .eq("id", data.id)
    .single();

  const { error } = await admin
    .from("time_entries")
    .update({
      type: data.type,
      occurred_at: toUtcISO(data.occurredAt),
      is_manual: true,
      notes: data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  if (error) {
    return { error: `No se pudo actualizar la marca: ${error.message}` };
  }

  const actorId = await getCurrentUserId();
  await logAudit({
    actorId,
    action: "update",
    entity: "time_entry",
    entityId: data.id,
    oldValue: before,
    newValue: data,
  });

  revalidatePath("/admin/marcas");
  return {};
}

export async function deleteEntry(id: string): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { data: before } = await admin
    .from("time_entries")
    .select("*")
    .eq("id", id)
    .single();

  const { error } = await admin.from("time_entries").delete().eq("id", id);
  if (error) {
    return { error: `No se pudo eliminar la marca: ${error.message}` };
  }

  const actorId = await getCurrentUserId();
  await logAudit({
    actorId,
    action: "delete",
    entity: "time_entry",
    entityId: id,
    oldValue: before,
  });

  revalidatePath("/admin/marcas");
  return {};
}
