"use client";

import { useState } from "react";
import { WEEKDAY_LABELS } from "@/lib/week";
import { computeTotalHours } from "@/lib/schedule";
import type { ScheduleDay } from "@/lib/supabase/types";

interface DayState {
  enabled: boolean;
  start: string;
  end: string;
}

const INITIAL_DAYS: DayState[] = Array.from({ length: 7 }, () => ({
  enabled: false,
  start: "09:00",
  end: "17:00",
}));

export function DefaultScheduleFields() {
  const [days, setDays] = useState<DayState[]>(INITIAL_DAYS);

  const currentDays: ScheduleDay[] = days
    .map((d, i) => ({ weekday: i + 1, start: d.start, end: d.end, enabled: d.enabled }))
    .filter((d) => d.enabled)
    .map(({ weekday, start, end }) => ({ weekday, start, end }));

  const totalHours = computeTotalHours(currentDays);

  function update(i: number, patch: Partial<DayState>) {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  return (
    <div>
      <input type="hidden" name="defaultSchedule" value={JSON.stringify(currentDays)} />

      <div>
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className="flex items-center gap-3 border-b border-border py-1.5 last:border-b-0"
          >
            <input
              type="checkbox"
              checked={days[i].enabled}
              onChange={(e) => update(i, { enabled: e.target.checked })}
              className="h-4 w-4 flex-none accent-sage"
            />
            <span
              className={`w-[72px] flex-none text-[12.5px] font-bold ${
                days[i].enabled ? "text-olive" : "font-medium text-secondary"
              }`}
            >
              {label}
            </span>
            <input
              type="time"
              disabled={!days[i].enabled}
              value={days[i].start}
              onChange={(e) => update(i, { start: e.target.value })}
              className="w-[84px] rounded-md border border-border bg-white px-2 py-1.5 text-[12px] text-olive disabled:bg-[#F1ECE0] disabled:text-[#B8AF9E]"
            />
            <span className="text-[11px] text-secondary">a</span>
            <input
              type="time"
              disabled={!days[i].enabled}
              value={days[i].end}
              onChange={(e) => update(i, { end: e.target.value })}
              className="w-[84px] rounded-md border border-border bg-white px-2 py-1.5 text-[12px] text-olive disabled:bg-[#F1ECE0] disabled:text-[#B8AF9E]"
            />
          </div>
        ))}
      </div>

      <p className="mt-2 text-[12px] font-semibold text-olive">
        Total configurado: {totalHours}h/semana
      </p>
    </div>
  );
}
