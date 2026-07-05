import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { localDateISO, currentDateISO } from "@/lib/week";
import { groupByEmployeeAndDay, type DayGroup, type ReviewEntry } from "./review-math";

export async function getMarksInRange(
  supabase: SupabaseClient<Database>,
  params: { employeeId?: string; fromUtc: Date; toUtc: Date }
): Promise<DayGroup[]> {
  let query = supabase
    .from("time_entries")
    .select("id, employee_id, type, occurred_at, source, is_manual, notes")
    .gte("occurred_at", params.fromUtc.toISOString())
    .lte("occurred_at", params.toUtc.toISOString())
    .order("occurred_at", { ascending: true });

  if (params.employeeId) {
    query = query.eq("employee_id", params.employeeId);
  }

  const { data } = await query;

  const entries: ReviewEntry[] = (data ?? []).map((e) => ({
    id: e.id,
    employeeId: e.employee_id,
    type: e.type,
    occurredAt: e.occurred_at,
    source: e.source,
    isManual: e.is_manual,
    notes: e.notes,
  }));

  return groupByEmployeeAndDay(entries, localDateISO, currentDateISO());
}
