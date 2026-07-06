import { createClient } from "@/lib/supabase/server";
import { formatDateDisplay } from "@/lib/week";
import { AdjustmentForm } from "./adjustment-form";
import { DeleteAdjustmentButton } from "./delete-adjustment-button";

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

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Ajustes manuales de horas</h1>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold">Nuevo ajuste</h2>
        <AdjustmentForm employees={employees} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white">
        <ul className="divide-y divide-neutral-100 text-sm">
          {(adjustments ?? []).map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">
                  {nameById.get(a.employee_id) ?? a.employee_id}{" "}
                  <span className="text-neutral-400">
                    — semana del {formatDateDisplay(a.week_start)}
                  </span>
                </p>
                <p className="text-neutral-600">{a.concept}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`font-medium ${a.hours_delta < 0 ? "text-red-600" : "text-green-700"}`}
                >
                  {a.hours_delta > 0 ? "+" : ""}
                  {a.hours_delta}h
                </span>
                <DeleteAdjustmentButton id={a.id} />
              </div>
            </li>
          ))}
          {(adjustments ?? []).length === 0 && (
            <li className="p-4 text-neutral-500">Todavía no hay ajustes cargados.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
