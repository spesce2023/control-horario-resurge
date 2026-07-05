import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { localWeekBoundsUtc } from "@/lib/week";
import { pairEntries } from "./pairing";
import { computeBalance, type WeeklyBalance } from "./balance-math";

export type { WeeklyBalance };

/** Saldo semanal de un empleado a partir de sus marcas resueltas y ajustes manuales (RF-06, RF-14). */
export async function getWeeklyBalance(
  supabase: SupabaseClient<Database>,
  employeeId: string,
  weekStart: string,
  pactadas: number
): Promise<WeeklyBalance> {
  const { start, end } = localWeekBoundsUtc(weekStart);

  const { data: entries } = await supabase
    .from("time_entries")
    .select("type, occurred_at")
    .eq("employee_id", employeeId)
    .gte("occurred_at", start.toISOString())
    .lte("occurred_at", end.toISOString());

  const { totalMinutes } = pairEntries(
    (entries ?? []).map((e) => ({ type: e.type, occurredAt: e.occurred_at }))
  );

  const { data: adjustments } = await supabase
    .from("hour_adjustments")
    .select("hours_delta")
    .eq("employee_id", employeeId)
    .eq("week_start", weekStart);

  const ajustes = (adjustments ?? []).reduce((sum, a) => sum + a.hours_delta, 0);

  return computeBalance({ pactadas, trabajadasMinutes: totalMinutes, ajustes });
}
