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
  variant = "primary",
}: {
  initialDays: ScheduleDay[];
  onSave: (days: ScheduleDay[]) => Promise<{ error?: string } | void>;
  saveLabel: string;
  variant?: "primary" | "secondary";
}) {
  const [days, setDays] = useState<DayState[]>(toDayStates(initialDays));
  const [openIndex, setOpenIndex] = useState<Set<number>>(new Set());
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

  function toggleOpen(i: number) {
    setOpenIndex((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await onSave(currentDays);
      setMessage(result?.error ?? `Guardado. Total sugerido: ${totalHours}h.`);
    });
  }

  const buttonClass =
    variant === "primary"
      ? "bg-sage text-white hover:bg-sage-dark"
      : "border border-border bg-white text-olive";

  return (
    <div>
      {message && <p className="mb-3 text-[12px] text-secondary">{message}</p>}

      {/* Desktop: filas horizontales */}
      <div className="hidden md:block">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-3 border-b border-border py-2 last:border-b-0">
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

      {/* Mobile: acordeón colapsable por día */}
      <div className="space-y-1.5 md:hidden">
        {WEEKDAY_LABELS.map((label, i) => {
          const isOpen = openIndex.has(i);
          return (
            <div key={label} className="overflow-hidden rounded-[10px] border border-border bg-white">
              <button
                type="button"
                onClick={() => toggleOpen(i)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left"
              >
                <span
                  className={`text-[13px] font-bold ${
                    days[i].enabled ? "text-olive" : "font-semibold text-secondary"
                  }`}
                >
                  {label}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-secondary">
                  {days[i].enabled ? `${days[i].start}–${days[i].end}` : "Libre"}
                  <span>{isOpen ? "▾" : "▸"}</span>
                </span>
              </button>
              {isOpen && (
                <div className="flex items-center gap-2 border-t border-border bg-card px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={days[i].enabled}
                    onChange={(e) => update(i, { enabled: e.target.checked })}
                    className="h-4 w-4 flex-none accent-sage"
                  />
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
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3.5 flex flex-col gap-3 border-t border-border pt-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-secondary">
            Total sugerido
          </div>
          <div className="font-serif text-[16px] font-semibold text-olive">
            {totalHours}h/semana
          </div>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className={`w-full rounded-lg px-4 py-2.5 text-[12.5px] font-bold disabled:opacity-50 sm:w-auto ${buttonClass}`}
        >
          {isPending ? "Guardando…" : saveLabel}
        </button>
      </div>
    </div>
  );
}
