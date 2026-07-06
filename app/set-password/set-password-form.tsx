"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type SessionState = "checking" | "ready" | "missing";

export function SetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const router = useRouter();

  const [supabase] = useState(() => createClient());

  useEffect(() => {
    async function init() {
      const { data: existing } = await supabase.auth.getSession();
      if (existing.session) {
        setSessionState("ready");
        return;
      }

      // El cliente de @supabase/ssr fuerza flowType "pkce" y por eso su
      // detección automática de sesión en la URL solo busca "?code=". Este
      // proyecto de Supabase usa el flujo implícito para los enlaces de
      // invitación/recuperación, con los tokens en el fragmento
      // (#access_token=...&refresh_token=...), así que lo parseamos a mano.
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        if (!setSessionError) {
          setSessionState("ready");
          return;
        }
      }

      setSessionState("missing");
    }

    init();
  }, [supabase]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(
        "No se pudo guardar la contraseña. El enlace puede haber vencido; pedile al dueño que te reenvíe la invitación."
      );
      return;
    }

    router.replace("/");
    router.refresh();
  }

  if (sessionState === "missing") {
    return (
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Enlace inválido o vencido</h1>
        <p className="text-sm text-neutral-500">
          Pedile al dueño que te reenvíe la invitación desde el panel de empleados.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <h1 className="text-lg font-semibold">Definí tu contraseña</h1>
      <p className="text-sm text-neutral-500">
        Esta contraseña es personal: el dueño no puede verla ni definirla por vos.
      </p>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Nueva contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-3 text-base"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium">
          Repetir contraseña
        </label>
        <input
          id="confirm"
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-3 text-base"
        />
      </div>

      <button
        type="submit"
        disabled={loading || sessionState === "checking"}
        className="w-full rounded-md bg-neutral-900 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
