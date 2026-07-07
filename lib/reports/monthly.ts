import "server-only";
import ExcelJS from "exceljs";
import { endOfMonth, parseISO, format as formatDate } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
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

const REPORT_COLUMNS = [
  { header: "Semana", key: "week", width: 20 },
  { header: "Pactadas (h)", key: "pactadas", width: 14 },
  { header: "Trabajadas (h)", key: "trabajadas", width: 16 },
  { header: "Ajustes (h)", key: "ajustes", width: 12 },
  { header: "Saldo (h)", key: "saldo", width: 12 },
];

interface EmployeeTotals {
  pactadas: number;
  trabajadas: number;
  ajustes: number;
  saldo: number;
  liquidacion: Liquidacion;
}

function monthBoundsISO(month: string): { startISO: string; endISO: string } {
  const first = parseISO(`${month}-01`);
  return {
    startISO: `${month}-01`,
    endISO: formatDate(endOfMonth(first), "yyyy-MM-dd"),
  };
}

/** Reporte mensual (Excel): consolidado + una hoja por empleado (RF-16). */
export async function buildMonthlyWorkbook(month: string): Promise<ExcelJS.Workbook> {
  const admin = createAdminClient();
  const weeks = weeksOverlappingMonth(month);
  const { startISO, endISO } = monthBoundsISO(month);
  const { start: monthStartUtc, end: monthEndUtc } = localRangeBoundsUtc(startISO, endISO);

  const { data: employeeRows } = await admin
    .from("employees")
    .select("id, weekly_hours_target, hourly_rate")
    .order("created_at", { ascending: true });
  const employees = employeeRows ?? [];

  const ids = employees.map((e) => e.id);
  const { data: profiles } = ids.length
    ? await admin.from("profiles").select("id, full_name").in("id", ids)
    : { data: [] as { id: string; full_name: string }[] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Control Horario Cafetería";
  workbook.created = new Date();

  const consolidated = workbook.addWorksheet("Consolidado");
  consolidated.columns = [
    { header: "Empleado", key: "employee", width: 28 },
    ...REPORT_COLUMNS,
    { header: "Horas extra pagadas (h)", key: "horasExtra", width: 20 },
    { header: "Liquidación total ($)", key: "liquidacionTotal", width: 20 },
  ];
  consolidated.getRow(1).font = { bold: true };

  const usedSheetNames = new Set<string>(["Consolidado"]);
  const totalsByEmployee = new Map<string, EmployeeTotals>();

  for (const employee of employees) {
    const employeeName = nameById.get(employee.id) ?? employee.id;
    const sheet = workbook.addWorksheet(
      uniqueSheetName(employeeName, employee.id, usedSheetNames)
    );
    sheet.columns = REPORT_COLUMNS;
    sheet.getRow(1).font = { bold: true };

    const totals = { pactadas: 0, trabajadas: 0, ajustes: 0, saldo: 0 };

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

    const totalRow = sheet.addRow({ week: "Total del mes", ...roundedTotals });
    totalRow.font = { bold: true };

    // Detalle diario (entrada, salida, horas trabajadas por día calendario).
    const days = await getMarksInRange(admin, {
      employeeId: employee.id,
      fromUtc: monthStartUtc,
      toUtc: monthEndUtc,
    });
    const daysAscending = [...days].sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));

    sheet.addRow([]);
    const dailyHeaderRow = sheet.addRow(["Detalle diario"]);
    dailyHeaderRow.font = { bold: true };
    const dailyColumnsRow = sheet.addRow(["Día", "Entrada", "Salida", "Horas trabajadas"]);
    dailyColumnsRow.font = { bold: true };

    for (const day of daysAscending) {
      const entrada = firstInTime(day.entries);
      const salida = lastOutTime(day.entries);
      sheet.addRow([
        formatDateDisplay(day.dateISO),
        entrada ? toLocalTime(entrada) : "-",
        salida ? toLocalTime(salida) : day.pendingReview ? "Pendiente de revisión" : "-",
        day.totalHours,
      ]);
    }

    // Liquidación del mes (pago simple hasta las horas pactadas, doble el excedente).
    const liquidacion = computeLiquidacion({
      pactadas: roundedTotals.pactadas,
      trabajadas: roundedTotals.trabajadas,
      hourlyRate: employee.hourly_rate,
    });

    sheet.addRow([]);
    const liqHeaderRow = sheet.addRow(["Liquidación del mes"]);
    liqHeaderRow.font = { bold: true };
    sheet.addRow(["Valor hora nominal ($)", employee.hourly_rate]);
    sheet.addRow(["Horas normales pagadas (h)", liquidacion.horasNormales]);
    sheet.addRow(["Horas extra pagadas al doble (h)", liquidacion.horasExtra]);
    sheet.addRow(["Pago horas normales ($)", liquidacion.pagoNormal]);
    sheet.addRow(["Pago horas extra ($)", liquidacion.pagoExtra]);
    const totalLiqRow = sheet.addRow(["Total liquidación ($)", liquidacion.total]);
    totalLiqRow.font = { bold: true };

    totalsByEmployee.set(employee.id, { ...roundedTotals, liquidacion });
  }

  consolidated.addRow({});
  const totalsHeaderRow = consolidated.addRow({ employee: "Totales del mes por empleado" });
  totalsHeaderRow.font = { bold: true };

  for (const employee of employees) {
    const totals = totalsByEmployee.get(employee.id);
    if (!totals) continue;
    const row = consolidated.addRow({
      employee: nameById.get(employee.id) ?? employee.id,
      week: "Total del mes",
      pactadas: totals.pactadas,
      trabajadas: totals.trabajadas,
      ajustes: totals.ajustes,
      saldo: totals.saldo,
      horasExtra: totals.liquidacion.horasExtra,
      liquidacionTotal: totals.liquidacion.total,
    });
    row.font = { bold: true };
  }

  return workbook;
}
