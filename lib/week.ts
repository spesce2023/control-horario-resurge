import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { addDays, endOfDay, format, parseISO, startOfDay, startOfWeek } from "date-fns";

export const TIME_ZONE = "America/Montevideo";
export const WEEKDAY_LABELS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export function todayInTz(reference: Date = new Date()): Date {
  return toZonedTime(reference, TIME_ZONE);
}

export function mondayOf(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function currentWeekStartISO(reference: Date = new Date()): string {
  return format(mondayOf(todayInTz(reference)), "yyyy-MM-dd");
}

export function addDaysISO(dateISO: string, days: number): string {
  return format(addDays(parseISO(dateISO), days), "yyyy-MM-dd");
}

export function weekEndISO(weekStartISO: string): string {
  return addDaysISO(weekStartISO, 6);
}

/**
 * Límites (00:00 a 23:59:59.999) del día calendario en America/Montevideo
 * que corresponde a `reference`, expresados como instantes UTC — para
 * filtrar columnas timestamptz sin importar el huso del servidor.
 */
export function localDayBoundsUtc(reference: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const zonedNow = toZonedTime(reference, TIME_ZONE);
  const start = fromZonedTime(startOfDay(zonedNow), TIME_ZONE);
  const end = fromZonedTime(endOfDay(zonedNow), TIME_ZONE);
  return { start, end };
}

/**
 * Límites de la semana (lunes 00:00 a domingo 23:59:59.999) en
 * America/Montevideo para `weekStartISO`, como instantes UTC.
 */
export function localWeekBoundsUtc(weekStartISO: string): {
  start: Date;
  end: Date;
} {
  const start = fromZonedTime(`${weekStartISO}T00:00:00`, TIME_ZONE);
  const end = fromZonedTime(`${weekEndISO(weekStartISO)}T23:59:59.999`, TIME_ZONE);
  return { start, end };
}
