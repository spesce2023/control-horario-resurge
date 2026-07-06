import { fromZonedTime, formatInTimeZone, toZonedTime } from "date-fns-tz";
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

export function currentDateISO(reference: Date = new Date()): string {
  return format(todayInTz(reference), "yyyy-MM-dd");
}

/** Fecha calendario (America/Montevideo) de un timestamp ISO. */
export function localDateISO(isoTimestamp: string): string {
  return format(toZonedTime(new Date(isoTimestamp), TIME_ZONE), "yyyy-MM-dd");
}

/** Valor para un <input type="datetime-local"> a partir de un timestamp ISO, en America/Montevideo. */
export function toLocalInputValue(isoTimestamp: string): string {
  return formatInTimeZone(new Date(isoTimestamp), TIME_ZONE, "yyyy-MM-dd'T'HH:mm");
}

/** Hora legible (HH:mm) en America/Montevideo a partir de un timestamp ISO. */
export function toLocalTime(isoTimestamp: string): string {
  return formatInTimeZone(new Date(isoTimestamp), TIME_ZONE, "HH:mm");
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

/** Formatea una fecha "yyyy-MM-dd" como "dd-MM-yyyy" para mostrar al usuario. */
export function formatDateDisplay(dateISO: string): string {
  const [year, month, day] = dateISO.split("-");
  return `${day}-${month}-${year}`;
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
  return localRangeBoundsUtc(weekStartISO, weekEndISO(weekStartISO));
}

/** Límites de un rango de fechas [fromISO, toISO] en America/Montevideo, como instantes UTC. */
export function localRangeBoundsUtc(
  fromISO: string,
  toISO: string
): {
  start: Date;
  end: Date;
} {
  const start = fromZonedTime(`${fromISO}T00:00:00`, TIME_ZONE);
  const end = fromZonedTime(`${toISO}T23:59:59.999`, TIME_ZONE);
  return { start, end };
}
