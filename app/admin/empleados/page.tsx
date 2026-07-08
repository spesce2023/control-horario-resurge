import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmployeesList } from "./employees-list";

export default async function EmployeesPage() {
  const supabase = createClient();

  const { data: employees } = await supabase
    .from("employees")
    .select("id, weekly_hours_target, active")
    .order("created_at", { ascending: true });

  const ids = (employees ?? []).map((e) => e.id);
  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("id, username, full_name").in("id", ids)
    : { data: [] as { id: string; username: string; full_name: string }[] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const rows = (employees ?? []).map((e) => {
    const profile = profileById.get(e.id);
    return {
      id: e.id,
      fullName: profile?.full_name ?? "(sin nombre)",
      username: profile?.username ?? "",
      weeklyHoursTarget: e.weekly_hours_target,
      active: e.active,
    };
  });

  const activeCount = rows.filter((r) => r.active).length;
  const inactiveCount = rows.length - activeCount;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-[19px] font-semibold text-olive">Empleados</h1>
          <p className="text-[11.5px] text-secondary">
            {activeCount} activos · {inactiveCount} inactivo{inactiveCount === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/empleados/nuevo"
          className="hidden rounded-lg bg-sage px-4 py-2.5 text-center text-[12.5px] font-bold text-white sm:inline-block"
        >
          + Nuevo empleado
        </Link>
      </div>

      <Link
        href="/admin/empleados/nuevo"
        className="block rounded-lg bg-sage px-4 py-3 text-center text-[13px] font-bold text-white sm:hidden"
      >
        + Nuevo empleado
      </Link>

      <EmployeesList rows={rows} />
    </div>
  );
}
