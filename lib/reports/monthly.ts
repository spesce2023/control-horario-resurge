import "server-only";
import ExcelJS from "exceljs";
import { endOfMonth, parseISO, format as formatDate } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getWeeklyBalance } from "@/lib/attendance/balance";
import { getMarksInRange } from "@/lib/attendance/review";
import { formatDateDisplay, localRangeBoundsUtc, toLocalTime, weekEndISO } from "@/lib/week";
import {
  computeLiquidacion,
  firstInTime,
  lastOutTime,
  round2,
  uniqueSheetName,
  weeksOverlappingMonth,
  type Liquidacion,
} from "./monthly-math";

const WEEKLY_COLUMNS = [
  { header: "Semana", key: "week", width: 20 },
  { header: "Pactadas (h)", key: "pactadas", width: 14 },
  { header: "Trabajadas (h)", key: "trabajadas", width: 16 },
  { header: "Ajustes (h)", key: "ajustes", width: 12 },
  { header: "Saldo (h)", key: "saldo", width: 12 },
];

const DAILY_COLUMNS = [
  { header: "Día", key: "day", width: 14 },
  { header: "Entrada", key: "entrada", width: 12 },
  { header: "Salida", key: "salida", width: 20 },
  { header: "Horas trabajadas", key: "horas", width: 18 },
];

interface EmployeeRow {
  id: string;
  weekly_hours_target: number;
  weekly_contract_hours: number;
  hourly_rate: number;
}

interface MonthTotals {
  pactadas: number;
  trabajadas: number;
  ajustes: number;
  saldo: number;
  contractHours: number;
  liquidacion: Liquidacion;
}

function monthBoundsISO(month: string): { startISO: string; endISO: string } {
  const first = parseISO(`${month}-01`);
  return {
    startISO: `${month}-01`,
    endISO: formatDate(endOfMonth(first), "yyyy-MM-dd"),
  };
}

async function loadEmployees(admin: SupabaseClient<Database>) {
  const { data: employeeRows } = await admin
    .from("employees")
    .select("id, weekly_hours_target, weekly_contract_hours, hourly_rate")
    .order("created_at", { ascending: true });
  const employees = employeeRows ?? [];

  const ids = employees.map((e) => e.id);
  const { data: profiles } = ids.length
    ? await admin.from("profiles").select("id, full_name").in("id", ids)
    : { data: [] as { id: string; full_name: string }[] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return { employees, nameById };
}

/** Totales del mes (pactadas/trabajadas/ajustes/saldo, sumados semana a semana) y liquidación — comunes a ambos reportes. */
async function computeEmployeeMonthTotals(
  admin: SupabaseClient<Database>,
  employee: EmployeeRow,
  weeks: string[]
): Promise<MonthTotals> {
  const totals = { pactadas: 0, trabajadas: 0, ajustes: 0, saldo: 0 };

  for (const weekStart of weeks) {
    const balance = await getWeeklyBalance(
      admin,
      employee.id,
      weekStart,
      employee.weekly_hours_target
    );
    totals.pactadas += balance.pactadas;
    totals.trabajadas += balance.trabajadas;
    totals.ajustes += balance.ajustes;
    totals.saldo += balance.saldo;
  }

  const roundedTotals = {
    pactadas: round2(totals.pactadas),
    trabajadas: round2(totals.trabajadas),
    ajustes: round2(totals.ajustes),
    saldo: round2(totals.saldo),
  };

  // Las horas de contrato son fijas por semana (no dependen de marcas ni
  // ajustes): se suman por la misma cantidad de semanas que pactadas, para
  // que ambos totales cubran exactamente el mismo período del reporte.
  const contractHours = round2(employee.weekly_contract_hours * weeks.length);

  const liquidacion = computeLiquidacion({
    contractHours,
    trabajadas: roundedTotals.trabajadas,
    hourlyRate: employee.hourly_rate,
  });

  return { ...roundedTotals, contractHours, liquidacion };
}

function addLiquidacionSection(
  sheet: ExcelJS.Worksheet,
  hourlyRate: number,
  contractHours: number,
  liquidacion: Liquidacion
) {
  sheet.addRow([]);
  const liqHeaderRow = sheet.addRow(["Liquidación del mes"]);
  liqHeaderRow.font = { bold: true };
  sheet.addRow(["Valor hora nominal ($)", hourlyRate]);
  sheet.addRow(["Horas de contrato del mes (h)", contractHours]);
  sheet.addRow(["Horas normales pagadas (h)", liquidacion.horasNormales]);
  sheet.addRow(["Horas extra pagadas al doble (h)", liquidacion.horasExtra]);
  sheet.addRow(["Pago horas normales ($)", liquidacion.pagoNormal]);
  sheet.addRow(["Pago horas extra ($)", liquidacion.pagoExtra]);
  const totalLiqRow = sheet.addRow(["Total liquidación ($)", liquidacion.total]);
  totalLiqRow.font = { bold: true };
}

function addConsolidatedTotalsBlock(
  sheet: ExcelJS.Worksheet,
  employees: EmployeeRow[],
  nameById: Map<string, string>,
  totalsByEmployee: Map<string, MonthTotals>
) {
  sheet.addRow([]);
  const header = sheet.addRow([
    "Totales del mes por empleado",
    "",
    "Pactadas (h)",
    "Trabajadas (h)",
    "Ajustes (h)",
    "Saldo (h)",
    "Horas contrato (h)",
    "Horas extra pagadas (h)",
    "Liquidación total ($)",
  ]);
  header.font = { bold: true };

  for (const employee of employees) {
    const totals = totalsByEmployee.get(employee.id);
    if (!totals) continue;
    const row = sheet.addRow([
      nameById.get(employee.id) ?? employee.id,
      "Total del mes",
      totals.pactadas,
      totals.trabajadas,
      totals.ajustes,
      totals.saldo,
      totals.contractHours,
      totals.liquidacion.horasExtra,
      totals.liquidacion.total,
    ]);
    row.font = { bold: true };
  }
}

/** Reporte semanal (Excel): consolidado + una hoja por empleado, con detalle por semana y liquidación del mes (RF-16). */
export async function buildWeeklyMonthlyWorkbook(month: string): Promise<ExcelJS.Workbook> {
  const admin = createAdminClient();
  const weeks = weeksOverlappingMonth(month);
  const { employees, nameById } = await loadEmployees(admin);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Control Horario Cafetería";
  workbook.created = new Date();

  const consolidated = workbook.addWorksheet("Consolidado");
  consolidated.columns = [
    { header: "Empleado", key: "employee", width: 28 },
    ...WEEKLY_COLUMNS,
    { header: "Horas contrato (h)", key: "contractHours", width: 18 },
    { header: "Horas extra pagadas (h)", key: "horasExtra", width: 20 },
    { header: "Liquidación total ($)", key: "liquidacionTotal", width: 20 },
  ];
  consolidated.getRow(1).font = { bold: true };

  const usedSheetNames = new Set<string>(["Consolidado"]);
  const totalsByEmployee = new Map<string, MonthTotals>();

  for (const employee of employees) {
    const employeeName = nameById.get(employee.id) ?? employee.id;
    const sheet = workbook.addWorksheet(uniqueSheetName(employeeName, employee.id, usedSheetNames));
    sheet.columns = WEEKLY_COLUMNS;
    sheet.getRow(1).font = { bold: true };

    for (const weekStart of weeks) {
      const balance = await getWeeklyBalance(
        admin,
        employee.id,
        weekStart,
        employee.weekly_hours_target
      );
      const weekLabel = `${formatDateDisplay(weekStart)} a ${formatDateDisplay(weekEndISO(weekStart))}`;

      consolidated.addRow({ employee: employeeName, week: weekLabel, ...balance });
      sheet.addRow({ week: weekLabel, ...balance });
    }

    const monthTotals = await computeEmployeeMonthTotals(admin, employee, weeks);
    totalsByEmployee.set(employee.id, monthTotals);

    const totalRow = sheet.addRow({
      week: "Total del mes",
      pactadas: monthTotals.pactadas,
      trabajadas: monthTotals.trabajadas,
      ajustes: monthTotals.ajustes,
      saldo: monthTotals.saldo,
    });
    totalRow.font = { bold: true };

    addLiquidacionSection(
      sheet,
      employee.hourly_rate,
      monthTotals.contractHours,
      monthTotals.liquidacion
    );
  }

  addConsolidatedTotalsBlockKeyed(consolidated, employees, nameById, totalsByEmployee);

  return workbook;
}

function addConsolidatedTotalsBlockKeyed(
  sheet: ExcelJS.Worksheet,
  employees: EmployeeRow[],
  nameById: Map<string, string>,
  totalsByEmployee: Map<string, MonthTotals>
) {
  sheet.addRow({});
  const totalsHeaderRow = sheet.addRow({ employee: "Totales del mes por empleado" });
  totalsHeaderRow.font = { bold: true };

  for (const employee of employees) {
    const totals = totalsByEmployee.get(employee.id);
    if (!totals) continue;
    const row = sheet.addRow({
      employee: nameById.get(employee.id) ?? employee.id,
      week: "Total del mes",
      pactadas: totals.pactadas,
      trabajadas: totals.trabajadas,
      ajustes: totals.ajustes,
      saldo: totals.saldo,
      contractHours: totals.contractHours,
      horasExtra: totals.liquidacion.horasExtra,
      liquidacionTotal: totals.liquidacion.total,
    });
    row.font = { bold: true };
  }
}

/** Reporte diario (Excel): consolidado + una hoja por empleado, con detalle día a día y liquidación del mes (RF-16). */
export async function buildDailyMonthlyWorkbook(month: string): Promise<ExcelJS.Workbook> {
  const admin = createAdminClient();
  const weeks = weeksOverlappingMonth(month);
  const { startISO, endISO } = monthBoundsISO(month);
  const { start: monthStartUtc, end: monthEndUtc } = localRangeBoundsUtc(startISO, endISO);
  const { employees, nameById } = await loadEmployees(admin);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Control Horario Cafetería";
  workbook.created = new Date();

  const consolidated = workbook.addWorksheet("Consolidado");
  consolidated.columns = [
    { header: "Empleado", key: "employee", width: 28 },
    ...DAILY_COLUMNS,
  ];
  consolidated.getRow(1).font = { bold: true };

  const usedSheetNames = new Set<string>(["Consolidado"]);
  const totalsByEmployee = new Map<string, MonthTotals>();

  for (const employee of employees) {
    const employeeName = nameById.get(employee.id) ?? employee.id;
    const sheet = workbook.addWorksheet(uniqueSheetName(employeeName, employee.id, usedSheetNames));
    sheet.columns = DAILY_COLUMNS;
    sheet.getRow(1).font = { bold: true };

    const days = await getMarksInRange(admin, {
      employeeId: employee.id,
      fromUtc: monthStartUtc,
      toUtc: monthEndUtc,
    });
    const daysAscending = [...days].sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));

    for (const day of daysAscending) {
      const entrada = firstInTime(day.entries);
      const salida = lastOutTime(day.entries);
      const salidaLabel = salida
        ? toLocalTime(salida)
        : day.pendingReview
          ? "Pendiente de revisión"
          : "-";

      consolidated.addRow({
        employee: employeeName,
        day: formatDateDisplay(day.dateISO),
        entrada: entrada ? toLocalTime(entrada) : "-",
        salida: salidaLabel,
        horas: day.totalHours,
      });
      sheet.addRow({
        day: formatDateDisplay(day.dateISO),
        entrada: entrada ? toLocalTime(entrada) : "-",
        salida: salidaLabel,
        horas: day.totalHours,
      });
    }

    const monthTotals = await computeEmployeeMonthTotals(admin, employee, weeks);
    totalsByEmployee.set(employee.id, monthTotals);

    addLiquidacionSection(
      sheet,
      employee.hourly_rate,
      monthTotals.contractHours,
      monthTotals.liquidacion
    );
  }

  addConsolidatedTotalsBlock(consolidated, employees, nameById, totalsByEmployee);

  return workbook;
}
