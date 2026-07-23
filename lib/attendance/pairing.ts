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
 * Trunca un timestamp al minuto exacto (descarta segundos/milisegundos).
 * Como la hora que se le muestra al usuario (entrada/salida) también se
 * redondea a HH:mm, calcular con el timestamp completo hacía que "horas
 * trabajadas" no coincidiera con la resta a simple vista de esas dos horas
 * (ej. 07:51:05 a 16:01:43 daba 8.18h en vez de los 8.17h esperables de
 * "16:01 − 07:51"). Truncar acá alinea el cálculo con lo que se ve en
 * pantalla.
 */
function truncateToMinuteMs(isoTimestamp: string): number {
  const ms = new Date(isoTimestamp).getTime();
  return Math.floor(ms / 60000) * 60000;
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
        (truncateToMinuteMs(entry.occurredAt) - truncateToMinuteMs(openStart)) / 60000;
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
