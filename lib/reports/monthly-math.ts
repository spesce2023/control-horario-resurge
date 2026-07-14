import { addDays, endOfMonth, format, parseISO, startOfMonth, startOfWeek } from "date-fns";

/**
 * Semanas (lunes) que se incluyen en el reporte del mes YYYY-MM: toda semana
 * que se superpone con el mes, aunque empiece el lunes anterior (cuando el
 * 1° no cae en lunes). Esa semana "límite" puede aparecer también en el
 * reporte del mes anterior — es intencional: cada semana queda etiquetada
 * con sus fechas exactas, así que no hay ambigüedad, y evita que las horas
 * de la semana en curso desaparezcan de un reporte pedido a mitad de mes.
 */
export function weeksOverlappingMonth(month: string): string[] {
  const first = startOfMonth(parseISO(`${month}-01`));
  const last = endOfMonth(first);

  const weeks: string[] = [];
  let cursor = startOfWeek(first, { weekStartsOn: 1 });

  while (cursor <= last) {
    weeks.push(format(cursor, "yyyy-MM-dd"));
    cursor = addDays(cursor, 7);
  }

  return weeks;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface Liquidacion {
  horasNormales: number;
  horasExtra: number;
  pagoNormal: number;
  pagoExtra: number;
  total: number;
}

/**
 * Liquidación del mes: las horas extra son las que se trabajan por encima
 * de las horas de CONTRATO del empleado (no de las horas pactadas, que
 * pueden ser menores o mayores que el contrato y solo se usan para el
 * saldo semanal). Si las horas trabajadas no superan las de contrato, se
 * pagan todas a valor simple; el excedente sobre el contrato se paga al
 * doble.
 */
export function computeLiquidacion(params: {
  contractHours: number;
  trabajadas: number;
  hourlyRate: number;
}): Liquidacion {
  const { contractHours, trabajadas, hourlyRate } = params;
  const horasNormales = Math.min(trabajadas, contractHours);
  const horasExtra = Math.max(trabajadas - contractHours, 0);
  const pagoNormal = round2(horasNormales * hourlyRate);
  const pagoExtra = round2(horasExtra * hourlyRate * 2);

  return {
    horasNormales: round2(horasNormales),
    horasExtra: round2(horasExtra),
    pagoNormal,
    pagoExtra,
    total: round2(pagoNormal + pagoExtra),
  };
}

interface TimeEntryLike {
  type: "in" | "out";
  occurredAt: string;
}

/** Hora de la primera entrada del día (entries debe venir ordenado ascendente). */
export function firstInTime(entries: TimeEntryLike[]): string | null {
  return entries.find((e) => e.type === "in")?.occurredAt ?? null;
}

/** Hora de la última salida del día (entries debe venir ordenado ascendente). */
export function lastOutTime(entries: TimeEntryLike[]): string | null {
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].type === "out") return entries[i].occurredAt;
  }
  return null;
}

const INVALID_SHEET_CHARS = /[:\\/?*[\]]/g;

/** Nombre de hoja de Excel válido (máx. 31 caracteres, sin caracteres especiales) y único dentro del set dado. */
export function uniqueSheetName(
  name: string,
  fallback: string,
  used: Set<string>
): string {
  const cleaned = name.replace(INVALID_SHEET_CHARS, "").trim();
  const base = (cleaned || fallback).slice(0, 31);

  let candidate = base;
  let i = 2;
  while (used.has(candidate)) {
    candidate = `${base.slice(0, 28)} ${i}`;
    i++;
  }
  used.add(candidate);
  return candidate;
}
