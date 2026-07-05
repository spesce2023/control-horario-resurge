export interface SimpleEntry {
  type: "in" | "out";
  occurredAt: string; // ISO
}

export interface PairingResult {
  totalMinutes: number;
  hasOpenEntry: boolean;
  nextType: "in" | "out";
  openSince: string | null;
}

/**
 * Empareja tramos entrada/salida en orden cronológico y suma los minutos de
 * los pares cerrados (regla de negocio 1 y 7: una entrada sin salida queda
 * "abierta" y no se contabiliza hasta que se cierre o se corrija).
 */
export function pairEntries(entries: SimpleEntry[]): PairingResult {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  let totalMinutes = 0;
  let openStart: string | null = null;

  for (const entry of sorted) {
    if (entry.type === "in") {
      openStart = entry.occurredAt;
    } else if (entry.type === "out" && openStart) {
      totalMinutes +=
        (new Date(entry.occurredAt).getTime() - new Date(openStart).getTime()) / 60000;
      openStart = null;
    }
  }

  const last = sorted[sorted.length - 1];
  const nextType: "in" | "out" = !last || last.type === "out" ? "in" : "out";

  return {
    totalMinutes: Math.round(totalMinutes * 100) / 100,
    hasOpenEntry: openStart !== null,
    nextType,
    openSince: openStart,
  };
}
