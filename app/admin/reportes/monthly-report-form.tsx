"use client";

import { useState } from "react";

export function MonthlyReportForm({ defaultMonth }: { defaultMonth: string }) {
  const [month, setMonth] = useState(defaultMonth);

  return (
    <div className="flex flex-wrap items-end gap-3 text-sm">
      <div>
        <label htmlFor="month" className="block text-xs text-neutral-500">
          Mes
        </label>
        <input
          id="month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border border-neutral-300 px-2 py-1.5"
        />
      </div>
      <a
        href={`/api/reports/monthly?month=${month}`}
        className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white"
      >
        Descargar reporte (.xlsx)
      </a>
    </div>
  );
}
