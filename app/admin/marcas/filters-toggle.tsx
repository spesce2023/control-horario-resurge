"use client";

import { useState } from "react";

export function FiltersToggle({
  summary,
  children,
}: {
  summary: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mb-2.5 flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-[12px] font-semibold text-olive md:hidden"
      >
        <span>🔍 Filtros — {summary}</span>
        <span>{open ? "▾" : "▸"}</span>
      </button>
      <div className={`${open ? "block" : "hidden"} md:block`}>{children}</div>
    </div>
  );
}
