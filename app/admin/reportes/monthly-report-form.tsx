"use client";

import { useState } from "react";

export function MonthlyReportForm({
  defaultMonth,
  children,
}: {
  defaultMonth: string;
  children?: React.ReactNode;
}) {
  const [month, setMonth] = useState(defaultMonth);

  return (
    <div>
      <div className="mb-5">
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

      {children}

      <a
        href={`/api/reports/monthly?month=${month}`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sage px-4 py-2.5 text-[13px] font-bold text-white hover:bg-sage-dark sm:w-auto"
      >
        ⬇ Descargar reporte (.xlsx)
      </a>
    </div>
  );
}
