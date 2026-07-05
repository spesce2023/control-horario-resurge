import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function EmployeesPage() {
  const supabase = createClient();

  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: true });

  const ids = (employees ?? []).map((e) => e.id);
  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("id, username, full_name, email").in("id", ids)
    : { data: [] as { id: string; username: string; full_name: string; email: string }[] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Empleados</h1>
        <Link
          href="/admin/empleados/nuevo"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Nuevo empleado
        </Link>
      </div>

      <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {(employees ?? []).map((employee) => {
          const profile = profileById.get(employee.id);
          return (
            <li key={employee.id}>
              <Link
                href={`/admin/empleados/${employee.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-neutral-50"
              >
                <div>
                  <p className="font-medium">
                    {profile?.full_name ?? "(sin nombre)"}{" "}
                    <span className="text-neutral-400">@{profile?.username}</span>
                    {!employee.active && (
                      <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-xs">
                        Inactivo
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {profile?.email} · {employee.weekly_hours_target}h/semana
                  </p>
                </div>
                <span className="text-sm underline">Editar</span>
              </Link>
            </li>
          );
        })}
        {employees?.length === 0 && (
          <li className="p-4 text-sm text-neutral-500">Todavía no hay empleados cargados.</li>
        )}
      </ul>
    </div>
  );
}
