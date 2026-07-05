import { format } from "date-fns";
import { MonthlyReportForm } from "./monthly-report-form";

export default function ReportsPage() {
  const defaultMonth = format(new Date(), "yyyy-MM");

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Reporte mensual</h1>
      <p className="max-w-lg text-sm text-neutral-500">
        Descargá un Excel con horas trabajadas, saldos semanales y ajustes de
        cada empleado (y un consolidado de todos), listo para liquidación de
        haberes.
      </p>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <MonthlyReportForm defaultMonth={defaultMonth} />
      </div>
    </div>
  );
}
