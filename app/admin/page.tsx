import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { getMarksInRange } from "@/lib/attendance/review";
import {
  addDaysISO,
  currentWeekStartISO,
  localDayBoundsUtc,
  localRangeBoundsUtc,
  todayInTz,
  weekEndISO,
} from "@/lib/week";

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default async function AdminHome() {
  const supabase = createClient();

  const { data: employees } = await supabase.from("employees").select("active");
  const activeCount = (employees ?? []).filter((e) => e.active).length;

  const { start: todayStart, end: todayEnd } = localDayBoundsUtc();
  const { count: marksToday } = await supabase
    .from("time_entries")
    .select("id", { count: "exact", head: true })
    .gte("occurred_at", todayStart.toISOString())
    .lte("occurred_at", todayEnd.toISOString());

  const weekStart = currentWeekStartISO();
  const weekEnd = weekEndISO(weekStart);
  // Ventana de 2 semanas hacia atrás para detectar jornadas abiertas (RF-11)
  // que hayan quedado sin resolver de semanas anteriores, no solo la actual.
  const lookbackStart = addDaysISO(weekStart, -13);
  const { start: rangeStart, end: rangeEnd } = localRangeBoundsUtc(lookbackStart, weekEnd);
  const groups = await getMarksInRange(supabase, { fromUtc: rangeStart, toUtc: rangeEnd });

  const pendingCount = groups.filter((g) => g.pendingReview).length;
  const weekHours = groups
    .filter((g) => g.dateISO >= weekStart && g.dateISO <= weekEnd)
    .reduce((sum, g) => sum + g.totalHours, 0);

  const todayLabel = capitalize(format(todayInTz(), "EEEE d 'de' MMMM", { locale: es }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-[22px] font-semibold text-olive">Panel del dueño</h1>
        <p className="text-[12.5px] text-secondary">{todayLabel}</p>
      </div>

      {pendingCount > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#E0BE9C] bg-terracotta-bg p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-terracotta text-[13px] font-bold text-white">
              !
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#7A3E17]">
                {pendingCount} {pendingCount === 1 ? "marca pendiente" : "marcas pendientes"} de
                revisión
              </p>
              <p className="mt-0.5 text-[11px] text-[#8A5A32]">Jornadas sin marca de salida</p>
            </div>
          </div>
          <Link
            href="/admin/marcas?pending=1"
            prefetch={false}
            className="w-full whitespace-nowrap rounded-lg bg-terracotta px-3 py-2 text-center text-xs font-bold text-white sm:w-auto"
          >
            Revisar ahora →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Empleados activos" value={String(activeCount)} />
        <StatCard label="Marcas hoy" value={String(marksToday ?? 0)} />
        <StatCard
          label="Pendientes de revisión"
          value={String(pendingCount)}
          accent={pendingCount > 0}
        />
        <StatCard label="Horas trabajadas (semana)" value={`${Math.round(weekHours)}h`} />
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:hidden">
        <QuickLink href="/admin/empleados" icon="👥" label="Empleados" />
        <QuickLink href="/admin/marcas" icon="🕒" label="Marcas" />
        <QuickLink href="/admin/ajustes" icon="⚖️" label="Ajustes" />
        <QuickLink href="/admin/qr" icon="▦" label="QR" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[10px] border border-border bg-card p-3.5">
      <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-secondary">
        {label}
      </div>
      <div
        className={`font-serif text-[20px] font-semibold md:text-[26px] ${
          accent ? "text-terracotta" : "text-olive"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="flex items-center gap-2 rounded-[10px] border border-border bg-card px-3 py-3.5 text-[12.5px] font-semibold text-olive"
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </Link>
  );
}
