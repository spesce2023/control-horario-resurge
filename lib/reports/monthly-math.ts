import { addDays, endOfMonth, format, parseISO, startOfMonth, startOfWeek } from "date-fns";

/**
 * Semanas (lunes) que se asignan al mes YYYY-MM: cada semana pertenece al
 * mes en el que empieza (su lunes), para evitar contar una misma semana en
 * dos reportes distintos cuando cruza fin de mes.
 */
export function weeksStartingInMonth(month: string): string[] {
  const first = startOfMonth(parseISO(`${month}-01`));
  const last = endOfMonth(first);

  const weeks: string[] = [];
  let cursor = startOfWeek(first, { weekStartsOn: 1 });

  while (cursor <= last) {
    if (cursor >= first) {
      weeks.push(format(cursor, "yyyy-MM-dd"));
    }
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
