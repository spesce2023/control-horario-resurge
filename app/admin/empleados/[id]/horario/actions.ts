"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { logAudit } from "@/lib/audit";
import { computeTotalHours } from "@/lib/schedule";
import type { ScheduleDay } from "@/lib/supabase/types";

export async function saveWeeklySchedule(
  employeeId: string,
  weekStart: string,
  days: ScheduleDay[]
): Promise<{ error?: string; totalHours?: number }> {
  const admin = createAdminClient();
  const totalHours = computeTotalHours(days);

  const { data: existing } = await admin
    .from("weekly_schedules")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("week_start", weekStart)
    .maybeSingle();

  const { error } = await admin.from("weekly_schedules").upsert(
    {
      employee_id: employeeId,
      week_start: weekStart,
      days,
      total_hours: totalHours,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "employee_id,week_start" }
  );

  if (error) {
    return { error: `No se pudo guardar el horario: ${error.message}` };
  }

  const actorId = await getCurrentUserId();
  await logAudit({
    actorId,
    action: existing ? "update" : "create",
    entity: "weekly_schedule",
    entityId: existing?.id ?? null,
    oldValue: existing,
    newValue: { employeeId, weekStart, days, totalHours },
  });

  revalidatePath(`/admin/empleados/${employeeId}/horario`);
  return { totalHours };
}

export async function saveDefaultSchedule(
  employeeId: string,
  days: ScheduleDay[]
): Promise<{ error?: string; totalHours?: number }> {
  const admin = createAdminClient();
  const totalHours = computeTotalHours(days);

  const { data: before } = await admin
    .from("employees")
    .select("default_schedule")
    .eq("id", employeeId)
    .single();

  const { error } = await admin
    .from("employees")
    .update({ default_schedule: days, updated_at: new Date().toISOString() })
    .eq("id", employeeId);

  if (error) {
    return { error: `No se pudo guardar el horario por defecto: ${error.message}` };
  }

  const actorId = await getCurrentUserId();
  await logAudit({
    actorId,
    action: "update",
    entity: "employee_default_schedule",
    entityId: employeeId,
    oldValue: before?.default_schedule,
    newValue: days,
  });

  revalidatePath(`/admin/empleados/${employeeId}/horario`);
  return { totalHours };
}
