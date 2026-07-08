import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveSchedule } from "@/lib/schedule";
import { addDaysISO, currentWeekStartISO, formatDateDisplay, weekEndISO } from "@/lib/week";
import { WeeklyScheduleEditor } from "./weekly-schedule-editor";
import { DefaultScheduleEditor } from "./default-schedule-editor";
import { MobileScheduleTabs } from "./mobile-schedule-tabs";

function BlockCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <p className={subtitle ? "text-[13px] font-bold text-sage-dark" : "mb-3 text-[13px] font-bold text-sage-dark"}>
        {title}
      </p>
      {subtitle && <p className="mb-3 mt-0.5 text-[11px] text-secondary">{subtitle}</p>}
      {children}
    </div>
  );
}

function WeekNav({
  weekStart,
  prevWeek,
  nextWeek,
}: {
  weekStart: string;
  prevWeek: string;
  nextWeek: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[9px] bg-sage-bg px-3 py-2.5 text-[12px]">
      <Link href={`?week=${prevWeek}`} className="font-bold text-sage-dark">
        ← <span className="hidden sm:inline">Semana anterior</span>
      </Link>
      <span className="font-bold text-olive">
        <span className="hidden sm:inline">
          Semana del {formatDateDisplay(weekStart)} al {formatDateDisplay(weekEndISO(weekStart))}
        </span>
        <span className="sm:hidden">
          {formatDateDisplay(weekStart)} al {formatDateDisplay(weekEndISO(weekStart))}
        </span>
      </span>
      <Link href={`?week=${nextWeek}`} className="font-bold text-sage-dark">
        <span className="hidden sm:inline">Semana siguiente</span> →
      </Link>
    </div>
  );
}

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

  const weekBlock = (
    <BlockCard title="Horario de esta semana">
      <WeeklyScheduleEditor employeeId={params.id} weekStart={weekStart} initialDays={days} />
    </BlockCard>
  );

  const defaultBlock = (
    <BlockCard
      title="Horario por defecto"
      subtitle="Base que se usa al configurar nuevas semanas"
    >
      <DefaultScheduleEditor employeeId={params.id} initialDays={employee.default_schedule} />
    </BlockCard>
  );

  const weekNav = <WeekNav weekStart={weekStart} prevWeek={prevWeek} nextWeek={nextWeek} />;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <p className="text-[11px] text-secondary">
          <Link href="/admin/empleados" className="underline">
            Empleados
          </Link>
          <span className="hidden sm:inline"> / {profile?.full_name}</span>
        </p>
        <h1 className="font-serif text-[19px] font-semibold text-olive">Horario semanal</h1>
        <p className="mt-0.5 text-[12px] text-secondary">
          Horas semanales pactadas: {employee.weekly_hours_target}h
        </p>
      </div>

      <div className="hidden md:block">{weekNav}</div>

      <MobileScheduleTabs weekNav={weekNav} weekBlock={weekBlock} defaultBlock={defaultBlock} />
    </div>
  );
}
