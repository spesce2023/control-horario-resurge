import { format } from "date-fns";
import { ReportsForm } from "./reports-form";

export default function ReportsPage() {
  const defaultMonth = format(new Date(), "yyyy-MM");

  return (
    <div className="mx-auto max-w-3xl space-y-1">
      <h1 className="font-serif text-[21px] font-semibold text-olive">Reportes mensuales</h1>
      <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-secondary">
        Descargá un Excel listo para liquidación de haberes, con el detalle de cada empleado y un
        consolidado del local. Elegí el mes y el reporte que necesites.
      </p>

      <ReportsForm defaultMonth={defaultMonth} />
    </div>
  );
}
