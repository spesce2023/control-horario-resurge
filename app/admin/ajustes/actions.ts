"use server";

import { z } from "zod";
import { format, parseISO } from "date-fns";
import { revalidatePath } from "next/cache";
import { mondayOf } from "@/lib/week";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().min(1, "Elegí una fecha."),
  hoursDelta: z.coerce.number().refine((v) => v !== 0, "El ajuste no puede ser 0."),
  concept: z.string().trim().min(1, "Ingresá un concepto."),
});

export async function createAdjustment(
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;
  const weekStart = format(mondayOf(parseISO(data.date)), "yyyy-MM-dd");

  const admin = createAdminClient();
  const { data: created, error } = await admin
    .from("hour_adjustments")
    .insert({
      employee_id: data.employeeId,
      week_start: weekStart,
      hours_delta: data.hoursDelta,
      concept: data.concept,
    })
    .select()
    .single();

  if (error || !created) {
    return { error: `No se pudo crear el ajuste: ${error?.message ?? "error desconocido"}` };
  }

  const actorId = await getCurrentUserId();
  await logAudit({
    actorId,
    action: "create",
    entity: "hour_adjustment",
    entityId: created.id,
    newValue: { ...data, weekStart },
  });

  revalidatePath("/admin/ajustes");
  return {};
}

export async function deleteAdjustment(id: string): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { data: before } = await admin
    .from("hour_adjustments")
    .select("*")
    .eq("id", id)
    .single();

  const { error } = await admin.from("hour_adjustments").delete().eq("id", id);
  if (error) {
    return { error: `No se pudo eliminar el ajuste: ${error.message}` };
  }

  const actorId = await getCurrentUserId();
  await logAudit({
    actorId,
    action: "delete",
    entity: "hour_adjustment",
    entityId: id,
    oldValue: before,
  });

  revalidatePath("/admin/ajustes");
  return {};
}
