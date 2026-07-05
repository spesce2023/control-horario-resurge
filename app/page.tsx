import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

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
    </main>
  );
}
