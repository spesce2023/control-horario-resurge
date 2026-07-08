import { createClient } from "@/lib/supabase/server";
import { formatDateDisplay } from "@/lib/week";
import { AdjustmentForm } from "./adjustment-form";
import { DeleteAdjustmentButton } from "./delete-adjustment-button";

function HoursPill({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 font-serif text-[13px] font-semibold ${
        positive ? "bg-sage-bg text-sage-dark" : "bg-neg-bg text-neg-text"
      }`}
    >
      {positive ? "+" : ""}
      {value}h
    </span>
  );
}

export default async function AdjustmentsPage() {
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

  const { data: adjustments } = await supabase
    .from("hour_adjustments")
    .select("*")
    .order("week_start", { ascending: false });

  const rows = adjustments ?? [];

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-[19px] font-semibold text-olive">Ajustes manuales de horas</h1>

      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-sage-dark">
          Nuevo ajuste
        </p>
        <AdjustmentForm employees={employees} />
      </div>

      <div>
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-sage-dark">
          Historial de ajustes
        </p>

        {rows.length === 0 && (
          <p className="rounded-lg border border-border bg-card p-4 text-sm text-secondary">
            Todavía no hay ajustes cargados.
          </p>
        )}

        {rows.length > 0 && (
          <>
            {/* Desktop: tabla */}
            <table className="hidden w-full border-collapse overflow-hidden rounded-[10px] border border-border bg-card text-[12.5px] md:table">
              <thead>
                <tr>
                  {["Empleado", "Semana", "Concepto", "Horas", ""].map((h) => (
                    <th
                      key={h}
                      className="bg-sage-bg px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-sage-dark"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-3 py-2.5">{nameById.get(a.employee_id) ?? a.employee_id}</td>
                    <td className="px-3 py-2.5 text-secondary">{formatDateDisplay(a.week_start)}</td>
                    <td className="px-3 py-2.5">{a.concept}</td>
                    <td className="px-3 py-2.5">
                      <HoursPill value={a.hours_delta} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <DeleteAdjustmentButton id={a.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile: tarjetas */}
            <div className="space-y-2 md:hidden">
              {rows.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-2.5 rounded-[10px] border border-border bg-card p-3"
                >
                  <div>
                    <p className="text-[13px] font-bold text-olive">
                      {nameById.get(a.employee_id) ?? a.employee_id}
                    </p>
                    <p className="mt-0.5 text-[11px] text-secondary">
                      Semana del {formatDateDisplay(a.week_start)}
                    </p>
                    <p className="mt-1 text-[12px] italic text-olive">{a.concept}</p>
                  </div>
                  <div className="flex flex-none flex-col items-end gap-1.5">
                    <HoursPill value={a.hours_delta} />
                    <DeleteAdjustmentButton id={a.id} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
