import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMarksInRange } from "@/lib/attendance/review";
import {
  addDaysISO,
  currentDateISO,
  currentWeekStartISO,
  weekEndISO,
  formatDateDisplay,
  localRangeBoundsUtc,
  toLocalTime,
  toLocalInputValue,
} from "@/lib/week";
import { EntryRow } from "./entry-row";
import { AddEntryForm } from "./add-entry-form";
import { FiltersToggle } from "./filters-toggle";

export default async function MarksPage({
  searchParams,
}: {
  searchParams: { employeeId?: string; from?: string; to?: string; pending?: string };
}) {
  const supabase = createClient();

  const { data: employeeRows } = await supabase
    .from("employees")
    .select("id")
    .order("created_at", { ascending: true });
  const ids = (employeeRows ?? []).map((e) => e.id);

  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("id, full_name").in("id", ids)
    : { data: [] as { id: string; full_name: string }[] };

  const employees = ids.map((id) => ({
    id,
    name: profiles?.find((p) => p.id === id)?.full_name ?? id,
  }));
  const nameById = new Map(employees.map((e) => [e.id, e.name]));

  const pendingOnly = searchParams.pending === "1";
  const today = currentDateISO();
  const from = pendingOnly ? addDaysISO(today, -59) : searchParams.from ?? currentWeekStartISO();
  const to = pendingOnly ? today : searchParams.to ?? weekEndISO(from);
  const employeeId = searchParams.employeeId || undefined;

  const { start, end } = localRangeBoundsUtc(from, to);
  const allGroups = await getMarksInRange(supabase, { employeeId, fromUtc: start, toUtc: end });
  const groups = pendingOnly ? allGroups.filter((g) => g.pendingReview) : allGroups;

  const filtersSummary = `${nameById.get(employeeId ?? "") ?? "Todos"} · ${formatDateDisplay(
    from
  ).slice(0, 5)} al ${formatDateDisplay(to).slice(0, 5)}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-[19px] font-semibold text-olive">Marcas</h1>
        <AddEntryForm employees={employees} />
      </div>

      {pendingOnly && (
        <p className="rounded-lg bg-terracotta-bg px-3 py-2 text-[12px] text-[#7A3E17]">
          Mostrando solo marcas pendientes de revisión (últimos 60 días).{" "}
          <Link href="/admin/marcas" className="font-semibold underline">
            Ver todas las marcas
          </Link>
        </p>
      )}

      {!pendingOnly && (
        <FiltersToggle summary={filtersSummary}>
          <form
            method="get"
            className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3.5 text-[12px]"
          >
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-secondary">
                Empleado
              </label>
              <select
                name="employeeId"
                defaultValue={employeeId ?? ""}
                className="rounded-lg border border-border px-2.5 py-1.5 text-olive"
              >
                <option value="">Todos</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-secondary">
                Desde
              </label>
              <input
                type="date"
                name="from"
                defaultValue={from}
                className="rounded-lg border border-border px-2.5 py-1.5 text-olive"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-secondary">
                Hasta
              </label>
              <input
                type="date"
                name="to"
                defaultValue={to}
                className="rounded-lg border border-border px-2.5 py-1.5 text-olive"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg border border-border bg-white px-4 py-1.5 font-semibold text-olive"
            >
              Filtrar
            </button>
          </form>
        </FiltersToggle>
      )}

      {groups.length === 0 && (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-secondary">
          No hay marcas en este rango.
        </p>
      )}

      <div className="space-y-3">
        {groups.map((group) => (
          <div
            key={`${group.employeeId}-${group.dateISO}`}
            className={`rounded-xl border p-3.5 md:p-4 ${
              group.pendingReview ? "border-[#E0BE9C] bg-[#FFFBF6]" : "border-border bg-card"
            }`}
          >
            {group.pendingReview && (
              <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-terracotta-bg px-2.5 py-1 text-[10.5px] font-bold text-[#7A3E17]">
                ⚠ Pendiente de revisión
              </span>
            )}
            <div className="flex flex-wrap items-start justify-between gap-1.5">
              <div>
                <p className="text-[13.5px] font-bold text-olive">
                  {nameById.get(group.employeeId) ?? group.employeeId}
                </p>
                <p className="text-[11.5px] text-secondary">{formatDateDisplay(group.dateISO)}</p>
              </div>
              <p className="font-serif text-[17px] font-semibold text-olive">
                {group.totalHours}h
              </p>
            </div>

            <ul className="mt-2 divide-y divide-border text-[12.5px]">
              {group.entries.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  displayTime={toLocalTime(entry.occurredAt)}
                  localInputValue={toLocalInputValue(entry.occurredAt)}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
