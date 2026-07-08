import { format } from "date-fns";
import { MonthlyReportForm } from "./monthly-report-form";

const CONTENT_ITEMS = [
  "Horas trabajadas por empleado",
  "Saldos semanales (pactado vs. trabajado)",
  "Detalle diario (entrada, salida, horas)",
  "Ajustes manuales aplicados en el mes",
  "Liquidación mensual (horas extra pagadas al doble)",
  "Totales del mes + consolidado de todos los empleados",
];

export default function ReportsPage() {
  const defaultMonth = format(new Date(), "yyyy-MM");

  return (
    <div className="mx-auto max-w-xl space-y-1">
      <h1 className="font-serif text-[21px] font-semibold text-olive">Reporte mensual</h1>
      <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-secondary">
        Descargá un Excel listo para liquidación de haberes, con el detalle de cada empleado y un
        consolidado del local.
      </p>

      <div className="rounded-2xl border border-border bg-card p-5">
        <MonthlyReportForm defaultMonth={defaultMonth}>
          <ul className="mb-5 space-y-1.5">
            {CONTENT_ITEMS.map((item) => (
              <li key={item} className="relative pl-5 text-[12px] text-olive">
                <span className="absolute left-0 font-bold text-sage-dark">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </MonthlyReportForm>
      </div>
    </div>
  );
}
