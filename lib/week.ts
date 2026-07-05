import { toZonedTime } from "date-fns-tz";
import { addDays, format, parseISO, startOfWeek } from "date-fns";

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
