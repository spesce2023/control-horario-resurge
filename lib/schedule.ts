import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ScheduleDay } from "@/lib/supabase/types";

export function dayHours(day: ScheduleDay): number {
  const [sh, sm] = day.start.split(":").map(Number);
  const [eh, em] = day.end.split(":").map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm)) / 60;
}

export function computeTotalHours(days: ScheduleDay[]): number {
  return days.reduce((sum, day) => sum + dayHours(day), 0);
}

export interface EffectiveSchedule {
  days: ScheduleDay[];
  totalHours: number;
  isOverride: boolean;
}

/**
 * Horario vigente para una semana: si el dueño ya lo definió puntualmente
 * (weekly_schedules), se usa ese; si no, se usa el horario por defecto del
 * empleado (RF-08/RF-09) solo a modo informativo, sin persistirlo.
 */
export async function getEffectiveSchedule(
  supabase: SupabaseClient<Database>,
  employeeId: string,
  weekStart: string
): Promise<EffectiveSchedule> {
  const { data: schedule } = await supabase
    .from("weekly_schedules")
    .select("days, total_hours")
    .eq("employee_id", employeeId)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (schedule) {
    return { days: schedule.days, totalHours: schedule.total_hours, isOverride: true };
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("default_schedule")
    .eq("id", employeeId)
    .single();

  const days = employee?.default_schedule ?? [];
  return { days, totalHours: computeTotalHours(days), isOverride: false };
}
