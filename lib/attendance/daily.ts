import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { localDayBoundsUtc } from "@/lib/week";
import { pairEntries, type SimpleEntry } from "./pairing";

export interface DailyEntry extends SimpleEntry {
  id: string;
  isManual: boolean;
}

export interface DailySummary {
  entries: DailyEntry[];
  totalHours: number;
  totalMinutes: number;
  nextType: "in" | "out";
  hasOpenEntry: boolean;
  openSince: string | null;
}

/** Marcas y total del día calendario (America/Montevideo) para un empleado (RF-05, RF-13). */
export async function getDailySummary(
  supabase: SupabaseClient<Database>,
  employeeId: string,
  reference: Date = new Date()
): Promise<DailySummary> {
  const { start, end } = localDayBoundsUtc(reference);

  const { data } = await supabase
    .from("time_entries")
    .select("id, type, occurred_at, is_manual")
    .eq("employee_id", employeeId)
    .gte("occurred_at", start.toISOString())
    .lte("occurred_at", end.toISOString())
    .order("occurred_at", { ascending: true });

  const entries: DailyEntry[] = (data ?? []).map((e) => ({
    id: e.id,
    type: e.type,
    occurredAt: e.occurred_at,
    isManual: e.is_manual,
  }));

  const pairing = pairEntries(entries);

  return {
    entries,
    totalHours: Math.round((pairing.totalMinutes / 60) * 100) / 100,
    totalMinutes: pairing.totalMinutes,
    nextType: pairing.nextType,
    hasOpenEntry: pairing.hasOpenEntry,
    openSince: pairing.openSince,
  };
}
