import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import { getEffectiveSchedule } from "@/lib/schedule";
import { currentWeekStartISO, weekEndISO, WEEKDAY_LABELS } from "@/lib/week";

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

  const weekStart = currentWeekStartISO();
  const { days, totalHours } = await getEffectiveSchedule(supabase, user!.id, weekStart);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">
            Hola, {profile?.full_name ?? profile?.username}
          </h1>
          <p className="text-sm text-neutral-500">@{profile?.username}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm text-neutral-500 underline">
            Salir
          </button>
        </form>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-neutral-500">
        El marcado de entrada/salida, las marcas del día y el saldo semanal se
        agregan en el próximo paso.
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-sm font-semibold">
          Horario acordado — semana del {weekStart} al {weekEndISO(weekStart)}
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          Solo informativo: no valida ni alerta desvíos respecto a tus marcas.
        </p>

        {days.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            Todavía no hay un horario cargado para esta semana.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100 text-sm">
            {days
              .slice()
              .sort((a, b) => a.weekday - b.weekday)
              .map((d) => (
                <li key={d.weekday} className="flex justify-between py-1.5">
                  <span>{WEEKDAY_LABELS[d.weekday - 1]}</span>
                  <span className="text-neutral-600">
                    {d.start} a {d.end}
                  </span>
                </li>
              ))}
          </ul>
        )}

        <p className="mt-3 text-sm font-medium">Total: {totalHours}h/semana</p>
      </section>
    </main>
  );
}
