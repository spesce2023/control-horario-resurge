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
