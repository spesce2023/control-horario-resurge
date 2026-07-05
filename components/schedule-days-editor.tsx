"use client";

import { useState, useTransition } from "react";
import { WEEKDAY_LABELS } from "@/lib/week";
import { computeTotalHours } from "@/lib/schedule";
import type { ScheduleDay } from "@/lib/supabase/types";

interface DayState {
  enabled: boolean;
  start: string;
  end: string;
}

function toDayStates(days: ScheduleDay[]): DayState[] {
  return Array.from({ length: 7 }, (_, i) => {
    const weekday = i + 1;
    const found = days.find((d) => d.weekday === weekday);
    return found
      ? { enabled: true, start: found.start, end: found.end }
      : { enabled: false, start: "09:00", end: "17:00" };
  });
}

export function ScheduleDaysEditor({
  initialDays,
  onSave,
  saveLabel,
}: {
  initialDays: ScheduleDay[];
  onSave: (days: ScheduleDay[]) => Promise<{ error?: string } | void>;
  saveLabel: string;
}) {
  const [days, setDays] = useState<DayState[]>(toDayStates(initialDays));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentDays: ScheduleDay[] = days
    .map((d, i) => ({ weekday: i + 1, start: d.start, end: d.end, enabled: d.enabled }))
    .filter((d) => d.enabled)
    .map(({ weekday, start, end }) => ({ weekday, start, end }));

  const totalHours = computeTotalHours(currentDays);

  function update(i: number, patch: Partial<DayState>) {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await onSave(currentDays);
      setMessage(result?.error ?? `Guardado. Total sugerido: ${totalHours}h.`);
    });
  }

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-neutral-600">{message}</p>}

      <div className="space-y-2">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={label} className="flex flex-wrap items-center gap-3">
            <label className="flex w-28 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={days[i].enabled}
                onChange={(e) => update(i, { enabled: e.target.checked })}
              />
              {label}
            </label>
            <input
              type="time"
              disabled={!days[i].enabled}
              value={days[i].start}
              onChange={(e) => update(i, { start: e.target.value })}
              className="rounded-md border border-neutral-300 px-2 py-1 text-sm disabled:opacity-40"
            />
            <span className="text-sm text-neutral-400">a</span>
            <input
              type="time"
              disabled={!days[i].enabled}
              value={days[i].end}
              onChange={(e) => update(i, { end: e.target.value })}
              className="rounded-md border border-neutral-300 px-2 py-1 text-sm disabled:opacity-40"
            />
          </div>
        ))}
      </div>

      <p className="text-sm font-medium">Total sugerido: {totalHours}h/semana</p>

      <button
        type="button"
        disabled={isPending}
        onClick={handleSave}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Guardando…" : saveLabel}
      </button>
    </div>
  );
}
