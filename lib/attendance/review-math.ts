import { pairEntries, type SimpleEntry } from "./pairing";

export interface ReviewEntry extends SimpleEntry {
  id: string;
  employeeId: string;
  source: "qr" | "manual";
  isManual: boolean;
  notes: string | null;
}

export interface DayGroup {
  employeeId: string;
  dateISO: string;
  entries: ReviewEntry[];
  totalHours: number;
  pendingReview: boolean;
}

/**
 * Agrupa marcas por empleado y día calendario, y marca "pendiente de
 * revisión" (RF-11) los días ya pasados que quedaron con una entrada sin
 * salida (regla de negocio 1).
 */
export function groupByEmployeeAndDay(
  entries: ReviewEntry[],
  dateOf: (occurredAt: string) => string,
  todayISO: string
): DayGroup[] {
  const groups = new Map<string, ReviewEntry[]>();

  for (const entry of entries) {
    const dateISO = dateOf(entry.occurredAt);
    const key = `${entry.employeeId}__${dateISO}`;
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  const result: DayGroup[] = [];
  Array.from(groups.entries()).forEach(([key, groupEntries]) => {
    const [employeeId, dateISO] = key.split("__");
    const sorted = [...groupEntries].sort(
      (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
    );
    const pairing = pairEntries(sorted);
    result.push({
      employeeId,
      dateISO,
      entries: sorted,
      totalHours: Math.round((pairing.totalMinutes / 60) * 100) / 100,
      pendingReview: pairing.hasOpenEntry && dateISO < todayISO,
    });
  });

  result.sort((a, b) => {
    if (a.dateISO !== b.dateISO) return a.dateISO < b.dateISO ? 1 : -1;
    return a.employeeId.localeCompare(b.employeeId);
  });

  return result;
}
