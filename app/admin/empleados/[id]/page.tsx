import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateDisplay } from "@/lib/week";
import type { ScheduleDay } from "@/lib/supabase/types";
import { EditEmployeeForm } from "./edit-employee-form";

const WEEKDAY_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function ScheduleChips({ days }: { days: ScheduleDay[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {WEEKDAY_SHORT.map((label, i) => {
        const weekday = i + 1;
        const day = days.find((d) => d.weekday === weekday);
        return (
          <span
            key={weekday}
            className={`rounded-md px-2 py-1 text-[10.5px] font-semibold ${
              day ? "bg-sage-bg text-sage-dark" : "bg-[#EEEAE0] text-[#B8AF9E]"
            }`}
          >
            {day ? `${label} ${day.start}-${day.end}` : label}
          </span>
        );
      })}
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <div
      className={`relative h-5 w-[38px] flex-none rounded-full transition-colors ${
        active ? "bg-sage" : "bg-[#D8D2C4]"
      }`}
    >
      <div
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          active ? "right-0.5" : "left-0.5"
        }`}
      />
    </div>
  );
}

export default async function EditEmployeePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!employee) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, email")
    .eq("id", params.id)
    .single();

  const { data: welcomeEvents } = await supabase
    .from("audit_log")
    .select("action, created_at")
    .eq("entity", "employee")
    .eq("entity_id", params.id)
    .in("action", ["create", "resend_invite"])
    .order("created_at", { ascending: false })
    .limit(1);

  const lastWelcome = welcomeEvents?.[0];
  const welcomeNote = lastWelcome
    ? `✓ Correo de bienvenida enviado el ${formatDateDisplay(lastWelcome.created_at.slice(0, 10))}`
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="font-serif text-[19px] font-semibold text-olive">{profile?.full_name}</h1>
        <p className="text-[12px] text-secondary">@{profile?.username}</p>
        <Link
          href={`/admin/empleados/${employee.id}/horario`}
          className="mt-1.5 inline-block text-[12.5px] font-semibold text-sage-dark underline"
        >
          Ver / editar horario semanal
        </Link>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
        <span className="text-[12.5px] font-semibold text-olive">
          Empleado {employee.active ? "activo" : "inactivo"}
        </span>
        <StatusPill active={employee.active} />
      </div>

      <EditEmployeeForm
        key={employee.id}
        employeeId={employee.id}
        active={employee.active}
        welcomeNote={welcomeNote}
        scheduleChips={<ScheduleChips days={employee.default_schedule} />}
        defaultValues={{
          fullName: profile?.full_name ?? "",
          email: profile?.email ?? "",
          username: profile?.username ?? "",
          cedula: employee.cedula,
          phone: employee.phone,
          mutualista: employee.mutualista,
          emergencyContact: employee.emergency_contact,
          weeklyHoursTarget: employee.weekly_hours_target,
          hourlyRate: employee.hourly_rate,
        }}
      />
    </div>
  );
}
