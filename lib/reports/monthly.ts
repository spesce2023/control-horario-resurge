import "server-only";
import ExcelJS from "exceljs";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWeeklyBalance } from "@/lib/attendance/balance";
import { formatDateDisplay, weekEndISO } from "@/lib/week";
import { uniqueSheetName, weeksOverlappingMonth } from "./monthly-math";

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
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Reporte mensual (Excel): consolidado + una hoja por empleado (RF-16). */
export async function buildMonthlyWorkbook(month: string): Promise<ExcelJS.Workbook> {
  const admin = createAdminClient();
  const weeks = weeksOverlappingMonth(month);

  const { data: employeeRows } = await admin
    .from("employees")
    .select("id, weekly_hours_target")
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

    const totals: EmployeeTotals = { pactadas: 0, trabajadas: 0, ajustes: 0, saldo: 0 };

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

    const roundedTotals: EmployeeTotals = {
      pactadas: round2(totals.pactadas),
      trabajadas: round2(totals.trabajadas),
      ajustes: round2(totals.ajustes),
      saldo: round2(totals.saldo),
    };
    totalsByEmployee.set(employee.id, roundedTotals);

    const totalRow = sheet.addRow({ week: "Total del mes", ...roundedTotals });
    totalRow.font = { bold: true };
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
      ...totals,
    });
    row.font = { bold: true };
  }

  return workbook;
}
