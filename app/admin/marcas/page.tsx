import { createClient } from "@/lib/supabase/server";
import { getMarksInRange } from "@/lib/attendance/review";
import {
  currentWeekStartISO,
  weekEndISO,
  localRangeBoundsUtc,
  toLocalTime,
  toLocalInputValue,
} from "@/lib/week";
import { EntryRow } from "./entry-row";
import { AddEntryForm } from "./add-entry-form";

export default async function MarksPage({
  searchParams,
}: {
  searchParams: { employeeId?: string; from?: string; to?: string };
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

  const from = searchParams.from ?? currentWeekStartISO();
  const to = searchParams.to ?? weekEndISO(from);
  const employeeId = searchParams.employeeId || undefined;

  const { start, end } = localRangeBoundsUtc(from, to);
  const groups = await getMarksInRange(supabase, { employeeId, fromUtc: start, toUtc: end });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Marcas</h1>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-sm"
      >
        <div>
          <label className="block text-xs text-neutral-500">Empleado</label>
          <select
            name="employeeId"
            defaultValue={employeeId ?? ""}
            className="rounded-md border border-neutral-300 px-2 py-1.5"
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
          <label className="block text-xs text-neutral-500">Desde</label>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="rounded-md border border-neutral-300 px-2 py-1.5"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500">Hasta</label>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="rounded-md border border-neutral-300 px-2 py-1.5"
          />
        </div>
        <button type="submit" className="rounded-md bg-neutral-900 px-4 py-1.5 text-white">
          Filtrar
        </button>
      </form>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold">Agregar marca manual (RF-12)</h2>
        <AddEntryForm employees={employees} />
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-neutral-500">No hay marcas en este rango.</p>
      )}

      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={`${group.employeeId}-${group.dateISO}`}
            className="rounded-xl border border-neutral-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">
                  {nameById.get(group.employeeId) ?? group.employeeId}{" "}
                  <span className="text-neutral-400">— {group.dateISO}</span>
                </p>
                {group.pendingReview && (
                  <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                    ⚠ Pendiente de revisión
                  </span>
                )}
              </div>
              <p className="text-sm font-medium">{group.totalHours}h</p>
            </div>

            <ul className="mt-2 divide-y divide-neutral-100 text-sm">
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
