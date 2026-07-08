import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import { getEffectiveSchedule } from "@/lib/schedule";
import { getDailySummary } from "@/lib/attendance/daily";
import { getWeeklyBalance } from "@/lib/attendance/balance";
import {
  currentWeekStartISO,
  formatDateDisplay,
  formatHoursMinutes,
  toLocalTime,
  weekEndISO,
} from "@/lib/week";
import { ScheduleChips } from "@/components/schedule-chips";

export default async function EmployeeHome() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", user!.id)
    .single();

  const { data: employee } = await supabase
    .from("employees")
    .select("weekly_hours_target")
    .eq("id", user!.id)
    .single();

  const weekStart = currentWeekStartISO();
  const weekEnd = weekEndISO(weekStart);
  const weekRangeLabel = `${formatDateDisplay(weekStart)} al ${formatDateDisplay(weekEnd)}`;

  const { days } = await getEffectiveSchedule(supabase, user!.id, weekStart);
  const daily = await getDailySummary(supabase, user!.id);
  const balance = await getWeeklyBalance(
    supabase,
    user!.id,
    weekStart,
    employee?.weekly_hours_target ?? 0
  );

  const isEntrada = daily.nextType === "in";

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-8 pt-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[19px] font-semibold text-olive">
            Hola, {profile?.full_name ?? profile?.username}
          </h1>
          <p className="text-[11.5px] text-secondary">@{profile?.username}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-[12px] text-secondary underline">
            Salir
          </button>
        </form>
      </header>

      <section className="mb-3.5 rounded-2xl border border-border bg-card p-[18px]">
        <Link
          href="/marcar"
          className={`mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-[18px] text-[15px] font-bold text-white ${
            isEntrada ? "bg-sage" : "bg-sage-dark"
          }`}
        >
          {isEntrada ? "→ Marcar entrada" : "← Marcar salida"}
        </Link>

        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-sage-dark">
          Marcas de hoy
        </p>

        {daily.entries.length === 0 ? (
          <p className="py-1 text-[12px] italic text-secondary">Todavía no marcaste hoy.</p>
        ) : (
          <ul>
            {daily.entries.map((entry, i) => (
              <li
                key={entry.id}
                className={`flex justify-between py-1.5 text-[12.5px] ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <span className="text-olive">{entry.type === "in" ? "Entrada" : "Salida"}</span>
                <span className="text-secondary">
                  {toLocalTime(entry.occurredAt)}
                  {entry.isManual && <span className="ml-2 text-[11px]">(corregida)</span>}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-2 border-t border-border pt-2 font-serif text-[15px] font-semibold text-olive">
          Total hoy: {formatHoursMinutes(daily.totalMinutes)}
          {daily.hasOpenEntry && <span className="text-[13px] font-normal"> (en curso)</span>}
        </p>
      </section>

      <section className="mb-3.5 rounded-2xl border border-border bg-card p-[18px]">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-sage-dark">
          Saldo semanal — {weekRangeLabel}
        </p>
        <dl className="text-[12.5px]">
          <div className="flex justify-between py-1.5">
            <dt>Horas pactadas</dt>
            <dd>{balance.pactadas}h</dd>
          </div>
          <div className="flex justify-between py-1.5">
            <dt>Horas trabajadas</dt>
            <dd>{formatHoursMinutes(balance.trabajadas * 60)}</dd>
          </div>
          {balance.ajustes !== 0 && (
            <div className="flex justify-between py-1.5">
              <dt>Ajustes</dt>
              <dd className={balance.ajustes > 0 ? "font-bold text-sage-dark" : "font-bold text-neg-text"}>
                {balance.ajustes > 0 ? "+" : ""}
                {balance.ajustes}h
              </dd>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-border pt-2.5 font-bold">
            <dt>Saldo</dt>
            <dd className={balance.saldo < 0 ? "text-neg-text" : "text-sage-dark"}>
              {balance.saldo > 0 ? "+" : ""}
              {balance.saldo}h
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-border bg-card p-[18px]">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-sage-dark">
          Horario acordado — {weekRangeLabel}
        </p>

        {days.length === 0 ? (
          <p className="text-[12px] italic text-secondary">
            Todavía no hay un horario cargado para esta semana.
          </p>
        ) : (
          <ScheduleChips days={days} />
        )}

        <p className="mt-2.5 text-[11px] text-secondary">
          Solo informativo: no valida ni alerta desvíos respecto a tus marcas.
        </p>
      </section>
    </main>
  );
}
