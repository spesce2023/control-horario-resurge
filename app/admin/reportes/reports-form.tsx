"use client";

import { useState } from "react";

const WEEKLY_ITEMS = [
  "Horas trabajadas por empleado (por semana)",
  "Saldos semanales (pactado vs. trabajado)",
  "Ajustes manuales aplicados en el mes",
  "Liquidación mensual (horas extra pagadas al doble)",
  "Totales del mes + consolidado de todos los empleados",
];

const DAILY_ITEMS = [
  "Detalle diario: entrada, salida y horas trabajadas",
  "Horas trabajadas por empleado (por día)",
  "Liquidación mensual (horas extra pagadas al doble)",
  "Totales del mes + consolidado de todos los empleados",
];

export function ReportsForm({ defaultMonth }: { defaultMonth: string }) {
  const [month, setMonth] = useState(defaultMonth);

  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="month"
          className="mb-1 block text-[10.5px] font-bold uppercase tracking-wide text-secondary"
        >
          Mes
        </label>
        <input
          id="month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full max-w-[220px] rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-olive outline-none focus:border-sage focus:ring-2 focus:ring-sage-bg"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ReportCard
          title="Reporte semanal"
          items={WEEKLY_ITEMS}
          href={`/api/reports/weekly?month=${month}`}
        />
        <ReportCard
          title="Reporte diario"
          items={DAILY_ITEMS}
          href={`/api/reports/daily?month=${month}`}
        />
      </div>
    </div>
  );
}

function ReportCard({
  title,
  items,
  href,
}: {
  title: string;
  items: string[];
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-3 font-serif text-[15px] font-semibold text-olive">{title}</p>
      <ul className="mb-5 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="relative pl-5 text-[12px] text-olive">
            <span className="absolute left-0 font-bold text-sage-dark">✓</span>
            {item}
          </li>
        ))}
      </ul>
      <a
        href={href}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sage px-4 py-2.5 text-[13px] font-bold text-white hover:bg-sage-dark"
      >
        ⬇ Descargar (.xlsx)
      </a>
    </div>
  );
}
