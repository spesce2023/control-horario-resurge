import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveSchedule } from "@/lib/schedule";
import { addDaysISO, currentWeekStartISO, formatDateDisplay, weekEndISO } from "@/lib/week";
import { WeeklyScheduleEditor } from "./weekly-schedule-editor";
import { DefaultScheduleEditor } from "./default-schedule-editor";

export default async function EmployeeSchedulePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { week?: string };
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
    .select("full_name")
    .eq("id", params.id)
    .single();

  const weekStart = searchParams.week ?? currentWeekStartISO();
  const { days } = await getEffectiveSchedule(supabase, params.id, weekStart);

  const prevWeek = addDaysISO(weekStart, -7);
  const nextWeek = addDaysISO(weekStart, 7);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/empleados/${params.id}`} className="text-sm underline">
          &larr; {profile?.full_name}
        </Link>
        <h1 className="mt-1 text-lg font-semibold">Horario semanal</h1>
        <p className="text-sm text-neutral-500">
          Horas semanales pactadas: {employee.weekly_hours_target}h.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between text-sm">
          <Link href={`?week=${prevWeek}`} className="underline">
            &larr; Semana anterior
          </Link>
          <span className="font-medium">
            Semana del {formatDateDisplay(weekStart)} al {formatDateDisplay(weekEndISO(weekStart))}
          </span>
          <Link href={`?week=${nextWeek}`} className="underline">
            Semana siguiente &rarr;
          </Link>
        </div>
        <WeeklyScheduleEditor employeeId={params.id} weekStart={weekStart} initialDays={days} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold">
          Horario por defecto (base para configurar nuevas semanas)
        </h2>
        <DefaultScheduleEditor employeeId={params.id} initialDays={employee.default_schedule} />
      </div>
    </div>
  );
}
